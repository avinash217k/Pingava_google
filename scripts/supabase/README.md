# Pingava -> Supabase (PostgreSQL) Migration Toolkit

This directory contains the production schema, SQL views, extraction, validation, and loading pipeline to migrate Pingava from Google Cloud Firestore (NoSQL) to Supabase (PostgreSQL).

## Architecture Overview

```
scripts/supabase/
├── schema.sql                 # PostgreSQL DDL (9 tables, indexes, and 5 analytical views)
├── extract_from_firestore.py  # Zero-dependency Firestore REST extractor
├── validate_schema.py         # Relational integrity, FK, and constraint validator
├── load_to_supabase.py        # Transactional, idempotent loader for Supabase
├── verify_migration.py        # Parity check and live SQL view test runner
├── extracted_data/            # Local JSON exports of live Firestore collections
└── README.md                  # Documentation and runbook
```

---

## Step-by-Step Runbook

### Step 1: Extract Live Data from Firestore (Local / Read-Only)
Extracts production Firestore documents without touching or modifying the live service:
```bash
.venv/bin/python3 scripts/supabase/extract_from_firestore.py
```

### Step 2: Validate Relational Integrity & Schema
Validates all foreign keys, timestamps, constraints, and detects any orphaned historical records:
```bash
.venv/bin/python3 scripts/supabase/validate_schema.py
```

### Step 3: Load Schema & Data into Supabase
Once you have your Supabase project URL or connection string:
```bash
# Using direct connection string
.venv/bin/python3 scripts/supabase/load_to_supabase.py \
  --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Or using environment variable:
export SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
.venv/bin/python3 scripts/supabase/load_to_supabase.py
```

### Step 4: Verify Data Parity & Inspect SQL Views
Certifies 100% record parity between Firestore and Supabase, and runs test queries across all 5 analytical views:
```bash
.venv/bin/python3 scripts/supabase/verify_migration.py \
  --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

## Built-In SQL Views for Easy Querying

1. **`v_active_monitors`**: Fleet overview with owner details, current latency, and uptime.
2. **`v_monitor_health_24h`**: 24-hour rolling metrics (p95 latency, average latency, availability %).
3. **`v_incident_summary`**: Incident tracking with Gemini AI diagnostic summaries and outage duration.
4. **`v_recent_check_failures`**: Real-time triage view for failing checks.
5. **`v_user_subscriptions`**: User account quotas and active monitor allocation.
