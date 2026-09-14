# Pingava ⚡

**Next-Generation Synthetic Uptime, API Monitoring, and Observability Platform**

Pingava is an enterprise-grade synthetic monitoring and observability platform built with **React 19**, **Express 5**, and **TypeScript**. It combines real-time uptime monitoring, multi-region edge latency inspection, API contract drift detection, SSL certificate guardian, and server-side **Google Gemini AI** root-cause diagnostics.

---

## 🚀 Key Features

### 🔍 Synthetic Uptime & API Monitoring
- **Multi-Protocol Monitoring**: HTTP, HTTPS, REST APIs (GET, POST, PUT, PATCH, DELETE, HEAD) with custom headers, query parameters, authorization tokens, and request payloads.
- **Assertion Engine**: Response status code matching, response body regex/substring verification, and maximum latency thresholds.
- **SSL Certificate Guardian**: Automated TLS certificate validation, expiration warning timers, issuer verification, and cipher suite auditing.
- **Cron Heartbeat / Dead Man's Snitch**: Monitor background jobs, recurring scripts, and scheduled cron tasks with unique heartbeat ping endpoints.

### 🌐 Edge & Performance Observability
- **Multi-Region Global Edge Simulator**: Synthetically trace latency and HTTP waterfalls across 6 global edge regions (US East, US West, Europe Central, Singapore, Tokyo, Sydney).
- **Latency Anomaly Radar**: Statistical p50/p95 latency anomaly detection using moving historical windows to catch performance degradation before outages occur.
- **API Contract Drift Guardian**: Automatically record, diff, and alert on JSON response schema drift and breaking structural changes.

### 🤖 Gemini AI Diagnostics
- **Root Cause Analysis (RCA)**: Server-side Gemini AI (`gemini-3.6-flash`) evaluates failed HTTP checks, DNS errors, SSL faults, and timing anomalies to deliver actionable resolution steps within seconds.
- **Automated Incident Post-Mortems**: One-click AI generation of comprehensive incident summaries, impact assessments, timeline reconstruction, and preventative recommendations.

### 📢 Incident Management & Status Pages
- **Unified Incident Correlation**: Automatically correlate repeated failures into ongoing incidents with severity tagging, status updates, and resolution timelines.
- **Public & Branded Status Pages**: Customizable public status pages for end users with real-time component health and uptime percentages.
- **Multi-Channel Alerting**: Instant notifications via transactional emails (Brevo/SMTP with Nodemailer) and signed webhooks with HMAC-SHA256 signatures and exponential backoff retry.

### 🛡️ Enterprise Security & Self-Observability
- **Strict Role-Based Access Control (RBAC)**: Owner-exclusive access to internal telemetry, audit logs, and server diagnostics guarded by `OWNER_EMAIL`.
- **SSRF Defense**: Strict destination IP validation blocking loopback, private RFC-1918, link-local, and cloud metadata IP ranges.
- **Secure Authentication**: JWT sessions stored in signed, `HttpOnly`, `SameSite` cookies with CSRF token verification and Google OAuth 2.0 integration.
- **Live System Telemetry**: Internal health dashboard displaying memory usage, active event loop lag, DB connection pool health, and error distribution.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Lucide React, Custom Dark/Light Theme System |
| **Backend** | Node.js (v20/v22), Express 5, TypeScript (`tsx` / `esbuild`) |
| **Primary Database** | **Supabase PostgreSQL** (`pg` connection pool, high-availability schema) |
| **Fallback Database** | **Google Cloud Firestore** (Dual-write and automated failover support) |
| **AI Intelligence** | **Google Gemini API** (`@google/genai`, model `gemini-3.6-flash`) |
| **Email Delivery** | Nodemailer with Brevo (Sendinblue) SMTP relay |
| **Compute & Host** | **Google Cloud Run** (Serverless container runtime in `asia-southeast1`) |

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **npm**: v10+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/avinash217k/Pingava_google.git
cd Pingava_google
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and configure your credentials:
```bash
cp .env.example .env
```

Key environment variables to configure in `.env`:
```env
# Application
APP_ENV=development
PORT=3000
PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-secure-jwt-secret-at-least-32-chars
OWNER_EMAIL=your-email@example.com

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.6-flash

# Transactional Email (SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=alerts@pingava.com
```

### 3. Run the Development Server
```bash
npm run dev
```
The unified development server will launch at `http://localhost:3000`, running Vite HMR with the Express API.

---

## 🧪 Testing & Quality Assurance

Pingava includes an automated test suite verifying core monitoring workflows, RBAC guards, dual-write database operations, and API contract evaluation:

```bash
# Run the complete test suite (47 comprehensive tests)
npm test

# Run code linter
npm run lint
```

---

## 📦 Production Build & Run

To build the optimized static frontend and bundle the Express server for production:

```bash
# Compile Vite frontend to dist/ and bundle server to dist/server.cjs
npm run build

# Start production server
npm start
```

---

## ☁️ Cloud Deployment (Google Cloud Run)

Pingava is containerized and optimized for zero-downtime serverless deployments on **Google Cloud Run**.

### Deployment via Script
Run the automated deployment script:
```bash
./deploy.sh
```

### Manual Deployment via Google Cloud SDK
1. **Submit Build to Google Artifact Registry**:
   ```bash
   gcloud builds submit \
     --tag "asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/cloud-run-source-deploy/pingava:v1" \
     --project "YOUR_PROJECT_ID"
   ```

2. **Deploy Container to Cloud Run**:
   ```bash
   gcloud run deploy pingava \
     --image "asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/cloud-run-source-deploy/pingava:v1" \
     --region "asia-southeast1" \
     --project "YOUR_PROJECT_ID" \
     --port 3000 \
     --allow-unauthenticated
   ```

Refer to [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) and [service.yaml.example](service.yaml.example) for detailed infrastructure specifications, Knative configurations, and custom domain mapping.

---

## 📂 Project Structure

```text
├── public/                 # Static assets, favicons, sitemap, icons
├── src/                    # React 19 Frontend Application
│   ├── App.tsx             # Root router, state providers, and route guards
│   ├── OverviewDashboard.tsx # Monitoring overview, sparklines, and metric cards
│   ├── ModernLandingPage.tsx # High-conversion marketing and features landing
│   ├── PingavaObservability.tsx # Self-monitoring telemetry dashboard
│   ├── AdminPanel.tsx      # System administration, audit logs, and controls
│   ├── AddMonitor.tsx      # Interactive multi-step monitor configuration wizard
│   ├── IncidentManagement.tsx # Unified incident tracking and timeline
│   ├── StatusPages.tsx     # Public and subscriber status page manager
│   ├── SslCertificateGuardian.tsx # SSL status and certificate chain inspection
│   ├── LatencyAnomalyRadar.tsx # Statistical anomaly scoring radar
│   ├── ApiContractGuardian.tsx # Schema drift & payload validation
│   └── CronHeartbeatManager.tsx # Dead man's snitch cron heartbeats
├── tests/                  # Automated integration and unit test suite
│   └── system_test.ts      # 47 comprehensive automated tests
├── scripts/
│   └── supabase/           # PostgreSQL migration scripts & schema.sql
├── server.ts               # Express 5 application server & API routes
├── supabaseService.ts      # Supabase PostgreSQL database client & queries
├── firestoreService.ts     # Google Cloud Firestore persistence fallback
├── sslService.ts           # TLS/SSL certificate diagnostic engine
├── heartbeatService.ts     # Cron heartbeat ping tracker
├── webhookDispatcher.ts    # HMAC signed webhook delivery engine
├── emailService.ts         # Transactional email service (Nodemailer/Brevo)
├── observabilityService.ts # Internal telemetry collector & memory profiler
├── serverDiagnostics.ts    # Diagnostics, error logging, and self-health checks
├── Dockerfile              # Multi-stage production container build
├── DEPLOYMENT_GUIDE.md     # Production deployment and operational runbook
└── service.yaml.example    # Cloud Run deployment configuration template
```

---

## 📄 License

Proprietary. All rights reserved.
