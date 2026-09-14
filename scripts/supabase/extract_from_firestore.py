#!/usr/bin/env python3
"""
Pingava Firestore Data Extractor
Extracts all live collections from Firestore into typed, normalized JSON files for Supabase migration.
"""

import os
import sys
import json
import ssl
import urllib.request
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "extracted_data")
CONFIG_FILE = os.path.join(PROJECT_ROOT, "firebase-applet-config.json")

def decode_firestore_val(v):
    """Recursively converts Firestore REST API typed values to native Python types."""
    if not isinstance(v, dict):
        return v
    if "stringValue" in v:
        return v["stringValue"]
    if "integerValue" in v:
        return int(v["integerValue"])
    if "doubleValue" in v:
        return float(v["doubleValue"])
    if "booleanValue" in v:
        return v["booleanValue"]
    if "timestampValue" in v:
        return v["timestampValue"]
    if "nullValue" in v:
        return None
    if "arrayValue" in v:
        return [decode_firestore_val(x) for x in v["arrayValue"].get("values", [])]
    if "mapValue" in v:
        return {k: decode_firestore_val(sub_v) for k, sub_v in v["mapValue"].get("fields", {}).items()}
    return str(v)

def fetch_firestore_state():
    if not os.path.exists(CONFIG_FILE):
        raise FileNotFoundError(f"Configuration file not found: {CONFIG_FILE}")

    with open(CONFIG_FILE, "r") as f:
        cfg = json.load(f)

    project_id = cfg["projectId"]
    db_id = cfg.get("firestoreDatabaseId", "(default)")
    api_key = cfg["apiKey"]

    url = (
        f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/{db_id}"
        f"/documents/pingava_settings/global_state?key={api_key}"
    )

    print(f"📡 Fetching state from Firestore: {project_id} ({db_id})...")
    
    # Use unverified ssl context to ensure compatibility across macOS default Python installs
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, headers={"User-Agent": "Pingava-Supabase-Migrator/1.0"})
    with urllib.request.urlopen(req, context=ctx) as resp:
        raw = json.loads(resp.read().decode("utf-8"))

    if "fields" not in raw:
        raise ValueError("Firestore document has no 'fields' element.")

    state = {k: decode_firestore_val(v) for k, v in raw["fields"].items()}
    return state, raw.get("updateTime")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    state, update_time = fetch_firestore_state()

    print(f"✅ Loaded live Firestore state (Last updated in cloud: {update_time})")

    collections = {
        "users": state.get("users", []),
        "monitors": state.get("monitors", []),
        "checks": state.get("checks", []),
        "incidents": state.get("incidents", []),
        "unified_incidents": state.get("unifiedIncidents", []),
        "webhooks": state.get("webhooks", []),
        "status_page_config": state.get("statusPageConfig", {}),
        "status_subscribers": state.get("statusSubscribers", []),
        "alert_deliveries": state.get("alertDeliveries", []),
    }

    manifest = {
        "extracted_at": datetime.utcnow().isoformat() + "Z",
        "firestore_update_time": update_time,
        "counts": {}
    }

    print("\n--- Extracted Datasets ---")
    for name, data in collections.items():
        count = len(data) if isinstance(data, list) else (1 if data else 0)
        manifest["counts"][name] = count
        out_path = os.path.join(OUTPUT_DIR, f"{name}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  • {name:<22}: {count:>4} records -> {out_path}")

    with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print("\n🎉 Extraction complete! Files saved in scripts/supabase/extracted_data/")

if __name__ == "__main__":
    main()
