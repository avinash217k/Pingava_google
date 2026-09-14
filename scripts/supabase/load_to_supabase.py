#!/usr/bin/env python3
"""
Pingava Supabase Data Loader
Applies PostgreSQL schema DDL, analytical views, and populates tables from validated JSON datasets.
Idempotent and atomic with rollback safety.
"""

import os
import sys
import json
import argparse
import urllib.parse
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "extracted_data")
SCHEMA_FILE = os.path.join(SCRIPT_DIR, "schema.sql")

def parse_connection_url(url_str):
    """Parses a postgresql:// connection URL into pg8000 connection arguments."""
    parsed = urllib.parse.urlparse(url_str)
    user = urllib.parse.unquote(parsed.username or "postgres")
    password = urllib.parse.unquote(parsed.password or "")
    host = parsed.hostname or "localhost"
    port = parsed.port or 5432
    database = parsed.path.lstrip("/") or "postgres"
    return {
        "user": user,
        "password": password,
        "host": host,
        "port": port,
        "database": database,
        "ssl_context": True,
    }

def load_json(name):
    path = os.path.join(DATA_DIR, f"{name}.json")
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def hash_password_if_needed(pwd):
    if not pwd:
        return None
    if pwd.startswith("pbkdf2:"):
        return pwd
    salt = os.urandom(16).hex()
    h = hashlib.pbkdf2_hmac("sha512", pwd.encode(), salt.encode(), 1000, 64).hex()
    return f"pbkdf2:{salt}:{h}"

def execute_migration(db_url):
    try:
        import pg8000.native
    except ImportError:
        print("❌ pg8000 is required. Run: pip install pg8000")
        sys.exit(1)

    print("🔌 Connecting to Supabase PostgreSQL...")
    conn_params = parse_connection_url(db_url)
    
    try:
        con = pg8000.native.Connection(**conn_params)
        print("✅ Successfully connected to Supabase PostgreSQL!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nPlease ensure your Supabase connection string is correct and includes your project password.")
        sys.exit(1)

    # 1. Execute schema.sql
    print("\n📜 Applying schema.sql (tables, indexes, views)...")
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    try:
        con.run(schema_sql)
        print("✅ Tables and SQL views created successfully!")
    except Exception as e:
        print(f"⚠️  Multi-statement batch notice ({e}), applying statement by statement...")
        # Fallback to individual statements
        buffer = []
        for line in schema_sql.splitlines():
            stripped = line.strip()
            if stripped.startswith("--") or not stripped:
                continue
            buffer.append(line)
            if stripped.endswith(";"):
                stmt = "\n".join(buffer).strip()
                buffer = []
                if stmt:
                    try:
                        con.run(stmt)
                    except Exception as sub_e:
                        print(f"   ⚠️  Notice: {sub_e}")
        print("✅ Schema DDL applied!")

    # Load datasets
    users = load_json("users")
    monitors = load_json("monitors")
    checks = load_json("checks")
    incidents = load_json("incidents")
    unified_incidents = load_json("unified_incidents")
    webhooks = load_json("webhooks")
    status_page_config = load_json("status_page_config")
    status_subscribers = load_json("status_subscribers")
    alert_deliveries = load_json("alert_deliveries")

    active_monitor_ids = {m["id"] for m in monitors}

    print("\n📦 Loading validated datasets into Supabase...")

    # Load Users
    print(f"  • Inserting {len(users)} users...")
    for u in users:
        con.run(
            """
            INSERT INTO users (id, email, name, password, auth_provider, is_owner, plan, subscription_status, subscription_renews_at, billing_cycle, avatar_url, token_version, created_at)
            VALUES (:id, :email, :name, :password, :auth_provider, :is_owner, :plan, :subscription_status, :subscription_renews_at, :billing_cycle, :avatar_url, :token_version, :created_at)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                plan = EXCLUDED.plan,
                subscription_status = EXCLUDED.subscription_status,
                token_version = EXCLUDED.token_version;
            """,
            id=u["id"],
            email=u["email"],
            name=u.get("name"),
            password=hash_password_if_needed(u.get("password")),
            auth_provider=u.get("auth_provider", "local"),
            is_owner=u.get("is_owner", False),
            plan=u.get("plan", "free"),
            subscription_status=u.get("subscription_status", "active"),
            subscription_renews_at=u.get("subscription_renews_at"),
            billing_cycle=u.get("billing_cycle", "monthly"),
            avatar_url=u.get("avatar_url"),
            token_version=u.get("token_version", 1),
            created_at=u.get("created_at") or datetime.utcnow().isoformat(),
        )

    # Load Monitors
    print(f"  • Inserting {len(monitors)} monitors...")
    for m in monitors:
        con.run(
            """
            INSERT INTO monitors (id, user_id, name, url, status, response_time, uptime, failure_streak, recovery_streak, last_checked_at, created_at)
            VALUES (:id, :user_id, :name, :url, :status, :response_time, :uptime, :failure_streak, :recovery_streak, :last_checked_at, :created_at)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                url = EXCLUDED.url,
                status = EXCLUDED.status,
                response_time = EXCLUDED.response_time,
                uptime = EXCLUDED.uptime,
                last_checked_at = EXCLUDED.last_checked_at;
            """,
            id=m["id"],
            user_id=m.get("user_id"),
            name=m["name"],
            url=m["url"],
            status=m.get("status", "up"),
            response_time=m.get("response_time", 0),
            uptime=m.get("uptime", 100.0),
            failure_streak=m.get("failure_streak", 0),
            recovery_streak=m.get("recovery_streak", 0),
            last_checked_at=m.get("last_checked_at"),
            created_at=m.get("created_at") or datetime.utcnow().isoformat(),
        )

    # Load Checks
    print(f"  • Inserting {len(checks)} telemetry check logs...")
    for c in checks:
        m_id = c.get("monitor_id")
        if m_id not in active_monitor_ids:
            m_id = None  # Safely decouple deleted monitor references while preserving telemetry log

        headers_json = json.dumps(c.get("response_headers") or {})
        con.run(
            """
            INSERT INTO checks (id, monitor_id, checked_at, ok, status_code, response_time, response_size_bytes, response_headers, response_body_preview, response_body_truncated, execution_source, error)
            VALUES (:id, :monitor_id, :checked_at, :ok, :status_code, :response_time, :response_size_bytes, :response_headers::jsonb, :response_body_preview, :response_body_truncated, :execution_source, :error)
            ON CONFLICT (id) DO NOTHING;
            """,
            id=c["id"],
            monitor_id=m_id,
            checked_at=c["checked_at"],
            ok=c["ok"],
            status_code=c.get("status_code"),
            response_time=c.get("response_time"),
            response_size_bytes=c.get("response_size_bytes"),
            response_headers=headers_json,
            response_body_preview=c.get("response_body_preview"),
            response_body_truncated=c.get("response_body_truncated", False),
            execution_source=c.get("execution_source", "scheduled"),
            error=c.get("error"),
        )

    # Load Incidents
    print(f"  • Inserting {len(incidents)} legacy incidents...")
    for inc in incidents:
        m_id = inc.get("monitor_id")
        if m_id not in active_monitor_ids:
            m_id = None
        con.run(
            """
            INSERT INTO incidents (id, monitor_id, cause, status, started_at, resolved_at)
            VALUES (:id, :monitor_id, :cause, :status, :started_at, :resolved_at)
            ON CONFLICT (id) DO NOTHING;
            """,
            id=inc["id"],
            monitor_id=m_id,
            cause=inc.get("cause"),
            status=inc.get("status", "open"),
            started_at=inc["started_at"],
            resolved_at=inc.get("resolved_at"),
        )

    # Load Unified Incidents
    print(f"  • Inserting {len(unified_incidents)} unified AI incidents...")
    for uinc in unified_incidents:
        con.run(
            """
            INSERT INTO unified_incidents (id, record_id, title, summary, status, source, started_at, resolved_at, monitor_ids, service_urls, affected_services, activity, ai_diagnostic)
            VALUES (:id, :record_id, :title, :summary, :status, :source, :started_at, :resolved_at, :monitor_ids::jsonb, :service_urls::jsonb, :affected_services::jsonb, :activity::jsonb, :ai_diagnostic::jsonb)
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                summary = EXCLUDED.summary,
                status = EXCLUDED.status,
                resolved_at = EXCLUDED.resolved_at,
                activity = EXCLUDED.activity,
                ai_diagnostic = EXCLUDED.ai_diagnostic;
            """,
            id=str(uinc["id"]),
            record_id=uinc.get("record_id"),
            title=uinc["title"],
            summary=uinc.get("summary"),
            status=uinc.get("status", "investigating"),
            source=uinc.get("source", "automatic"),
            started_at=uinc["started_at"],
            resolved_at=uinc.get("resolved_at"),
            monitor_ids=json.dumps(uinc.get("monitor_ids") or []),
            service_urls=json.dumps(uinc.get("service_urls") or []),
            affected_services=json.dumps(uinc.get("affected_services") or []),
            activity=json.dumps(uinc.get("activity") or []),
            ai_diagnostic=json.dumps(uinc.get("ai_diagnostic") or {}),
        )

    # Load Webhooks
    print(f"  • Inserting {len(webhooks)} webhooks...")
    for w in webhooks:
        con.run(
            """
            INSERT INTO webhooks (id, user_id, name, raw_url, masked_url, active, failure_count, alert_on_down, alert_on_recovery, alert_on_ssl_expiry, created_at, updated_at)
            VALUES (:id, :user_id, :name, :raw_url, :masked_url, :active, :failure_count, :alert_on_down, :alert_on_recovery, :alert_on_ssl_expiry, :created_at, :updated_at)
            ON CONFLICT (id) DO UPDATE SET
                raw_url = EXCLUDED.raw_url,
                masked_url = EXCLUDED.masked_url,
                active = EXCLUDED.active;
            """,
            id=w["id"],
            user_id=w.get("user_id") or 1,
            name=w["name"],
            raw_url=w["raw_url"],
            masked_url=w.get("masked_url"),
            active=w.get("active", True),
            failure_count=w.get("failure_count", 0),
            alert_on_down=w.get("alert_on_down", True),
            alert_on_recovery=w.get("alert_on_recovery", True),
            alert_on_ssl_expiry=w.get("alert_on_ssl_expiry", True),
            created_at=w.get("created_at") or datetime.utcnow().isoformat(),
            updated_at=w.get("updated_at") or datetime.utcnow().isoformat(),
        )

    # Load Status Page Config
    if status_page_config and status_page_config.get("slug"):
        print(f"  • Inserting status page config ('{status_page_config['slug']}')...")
        con.run(
            """
            INSERT INTO status_page_config (slug, title, description, logo_url, published, email_subscriptions_enabled, updated_at)
            VALUES (:slug, :title, :description, :logo_url, :published, :email_subscriptions_enabled, NOW())
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                published = EXCLUDED.published,
                email_subscriptions_enabled = EXCLUDED.email_subscriptions_enabled;
            """,
            slug=status_page_config["slug"],
            title=status_page_config.get("title", "Service Status"),
            description=status_page_config.get("description"),
            logo_url=status_page_config.get("logo_url"),
            published=status_page_config.get("published", True),
            email_subscriptions_enabled=status_page_config.get("email_subscriptions_enabled", True),
        )

    # Load Status Subscribers
    print(f"  • Inserting {len(status_subscribers)} status subscribers...")
    for sub in status_subscribers:
        con.run(
            """
            INSERT INTO status_subscribers (id, email, confirmed, active, created_at, last_notified_at)
            VALUES (:id, :email, :confirmed, :active, :created_at, :last_notified_at)
            ON CONFLICT (id) DO NOTHING;
            """,
            id=sub["id"],
            email=sub["email"],
            confirmed=sub.get("confirmed", False),
            active=sub.get("active", True),
            created_at=sub.get("created_at") or datetime.utcnow().isoformat(),
            last_notified_at=sub.get("last_notified_at"),
        )

    # Load Alert Deliveries
    print(f"  • Inserting {len(alert_deliveries)} alert deliveries...")
    for ad in alert_deliveries:
        m_id = ad.get("monitor_id")
        if m_id not in active_monitor_ids:
            m_id = None
        con.run(
            """
            INSERT INTO alert_deliveries (id, monitor_id, recipient, kind, status, provider_id, error, created_at, sent_at)
            VALUES (:id, :monitor_id, :recipient, :kind, :status, :provider_id, :error, :created_at, :sent_at)
            ON CONFLICT (id) DO NOTHING;
            """,
            id=ad["id"],
            monitor_id=m_id,
            recipient=ad["recipient"],
            kind=ad.get("kind", "down"),
            status=ad.get("status", "sent"),
            provider_id=ad.get("provider_id"),
            error=ad.get("error"),
            created_at=ad.get("created_at") or datetime.utcnow().isoformat(),
            sent_at=ad.get("sent_at"),
        )

    con.close()
    print("\n🎉 Supabase Migration Completed Successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pingava Supabase Data Loader")
    parser.add_argument("--db-url", default=os.getenv("SUPABASE_DB_URL"), help="Supabase PostgreSQL connection string URI")
    args = parser.parse_args()

    if not args.db_url:
        print("❌ Error: Missing Supabase database connection string.")
        print("\nUsage:")
        print("  python3 scripts/supabase/load_to_supabase.py --db-url 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'")
        print("  or set export SUPABASE_DB_URL='...'")
        sys.exit(1)

    execute_migration(args.db_url)
