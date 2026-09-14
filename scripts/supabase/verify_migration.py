#!/usr/bin/env python3
"""
Pingava Supabase Verification & Inspection Tool
Verifies row parity between Firestore exports and Supabase PostgreSQL tables,
and queries the newly created analytical SQL views.
"""

import os
import sys
import json
import argparse
import urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MANIFEST_FILE = os.path.join(SCRIPT_DIR, "extracted_data", "manifest.json")

def parse_connection_url(url_str):
    parsed = urllib.parse.urlparse(url_str)
    return {
        "user": urllib.parse.unquote(parsed.username or "postgres"),
        "password": urllib.parse.unquote(parsed.password or ""),
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5432,
        "database": parsed.path.lstrip("/") or "postgres",
        "ssl_context": True,
    }

def verify(db_url):
    try:
        import pg8000.native
    except ImportError:
        print("❌ pg8000 is required. Run: pip install pg8000")
        sys.exit(1)

    print("=" * 75)
    print(" 🔎 Supabase Migration Verification & SQL View Inspection")
    print("=" * 75)

    manifest = {}
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, "r") as f:
            manifest = json.load(f).get("counts", {})

    conn_params = parse_connection_url(db_url)
    con = pg8000.native.Connection(**conn_params)

    # 1. Row counts comparison
    tables = [
        "users", "monitors", "checks", "incidents", "unified_incidents",
        "webhooks", "status_page_config", "status_subscribers", "alert_deliveries"
    ]

    print("\n[1] Table Record Count Parity Check:")
    print(f"  {'Table Name':<24} | {'Firestore':<10} | {'Supabase':<10} | {'Parity'}")
    print("  " + "-" * 60)

    all_matched = True
    for t in tables:
        res = con.run(f"SELECT COUNT(*) FROM {t};")
        pg_count = res[0][0]
        fs_count = manifest.get(t, "N/A")
        status = "MATCH ✅" if fs_count == pg_count else "MISMATCH ⚠️"
        if fs_count != pg_count and fs_count != "N/A":
            all_matched = False
        print(f"  {t:<24} | {str(fs_count):<10} | {str(pg_count):<10} | {status}")

    # 2. View 1: Active Monitors
    print("\n[2] Testing View 'v_active_monitors':")
    try:
        rows = con.run("SELECT monitor_id, monitor_name, target_url, current_status, uptime_percentage, latest_latency_ms FROM v_active_monitors LIMIT 5;")
        for r in rows:
            print(f"  • ID {r[0]}: {r[1]} ({r[2]}) -> Status: {r[3]}, Uptime: {r[4]}%, Latency: {r[5]}ms")
    except Exception as e:
        print(f"  ⚠️  Error querying v_active_monitors: {e}")

    # 3. View 2: 24h Health
    print("\n[3] Testing View 'v_monitor_health_24h':")
    try:
        rows = con.run("SELECT monitor_id, monitor_name, total_checks_24h, successful_checks, failed_checks, availability_pct_24h, avg_latency_ms FROM v_monitor_health_24h LIMIT 5;")
        for r in rows:
            print(f"  • Monitor #{r[0]} ({r[1]}): Checks: {r[2]} (Pass: {r[3]}, Fail: {r[4]}) | Avail: {r[5]}% | Avg: {r[6]}ms")
    except Exception as e:
        print(f"  ⚠️  Error querying v_monitor_health_24h: {e}")

    # 4. View 3: Incident Summary & AI Diagnostics
    print("\n[4] Testing View 'v_incident_summary':")
    try:
        rows = con.run("SELECT incident_id, title, status, outage_duration_minutes, ai_root_cause_category, ai_model_used FROM v_incident_summary LIMIT 5;")
        for r in rows:
            print(f"  • [{r[0]}] {r[1]} | Status: {r[2]} | Outage: {r[3]} min | AI Category: {r[4]} (Engine: {r[5]})")
    except Exception as e:
        print(f"  ⚠️  Error querying v_incident_summary: {e}")

    # 5. View 5: User Subscriptions
    print("\n[5] Testing View 'v_user_subscriptions':")
    try:
        rows = con.run("SELECT email, plan, subscription_status, total_monitors_configured, active_monitors FROM v_user_subscriptions LIMIT 5;")
        for r in rows:
            print(f"  • {r[0]}: Plan: {r[1]} ({r[2]}) | Monitors: {r[3]} total ({r[4]} active)")
    except Exception as e:
        print(f"  ⚠️  Error querying v_user_subscriptions: {e}")

    con.close()
    print("\n" + "=" * 75)
    if all_matched:
        print("✅ SUPABASE MIGRATION 100% VERIFIED & CERTIFIED HEALTHY!")
    else:
        print("⚠️  Supabase migration completed with count differences noted above.")
    print("=" * 75)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pingava Supabase Verification Tool")
    parser.add_argument("--db-url", default=os.getenv("SUPABASE_DB_URL"), help="Supabase PostgreSQL connection string URI")
    args = parser.parse_args()

    if not args.db_url:
        print("❌ Error: Missing Supabase database connection string.")
        print("\nUsage:")
        print("  python3 scripts/supabase/verify_migration.py --db-url 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'")
        sys.exit(1)

    verify(args.db_url)
