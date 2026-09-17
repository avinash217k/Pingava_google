import { GoogleGenAI } from "@google/genai";
import type { Request, Response, NextFunction } from "express";

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "pingava-assistant",
        },
      },
    });
  }
  return geminiClient;
}

// IP-based sliding window rate limiter for the public assistant
const assistantRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function assistantRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const rawIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 20; // 20 questions per minute

  let record = assistantRateLimitMap.get(rawIp);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + windowMs };
    assistantRateLimitMap.set(rawIp, record);
    return next();
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      success: false,
      error: "Too many assistant queries. Please wait a moment before asking another question.",
    });
    return;
  }

  record.count++;
  next();
}

/**
 * Standard enterprise polite refusal message for queries attempting
 * to extract internal source code, codebase files, or architecture.
 */
export const CONFIDENTIALITY_REFUSAL_MESSAGE =
  "As Pingava's product assistant, I can explain our platform features, monitoring capabilities, configuration options, and how to use the dashboard. Internal source code, codebase files, database schemas, and proprietary backend infrastructure architecture are confidential and cannot be disclosed.\n\nPlease let me know if you would like to know how to configure monitors, set up status pages, or test your endpoints!";

/**
 * Patterns matching queries probing for internal source code, implementation files,
 * backend database schemas, internal algorithms, or prompt leakage.
 */
const PROHIBITED_QUERY_PATTERNS = [
  /\b(show|give|print|reveal|display|share|dump|leak|inspect|send|provide)\b.*\b(the code|code of|code for|source code|codebase|code implementation|backend code|repo|repository|github|git log|internal code)\b/i,
  /\b(how (is|are) you|how (is|was) pingava) (implemented|coded|built|architected|written|structured)\b/i,
  /\b(system prompt|initial prompt|hidden prompt|developer prompt|secret prompt|jailbreak|ignore (all |previous )?instructions)\b/i,
  /\b(server\.ts|vite\.config|tsconfig|dockerfile|cloudbuild|service\.yaml|\.env|secrets|pbkdf2|jwt_secret)\b/i,
  /\b(database schema|table structure|sql queries|sqlite table|internal tables|admin password)\b/i,
  /\b(backend architecture|internal architecture|infrastructure blueprint|cloud run configuration|kubernetes cluster)\b/i,
  /\b(what (tech stack|framework|database|orm) is used (internally|under the hood|on the backend))\b/i,
];

export function isProhibitedQuery(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return PROHIBITED_QUERY_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Checks if the generated response accidentally includes code implementations or internal secrets.
 */
export function sanitizeAssistantResponse(text: string): string {
  // If response contains code blocks (```ts, ```javascript, ```python, etc.)
  if (/```(typescript|ts|javascript|js|python|py|sql|sh|bash|json)?\s*[\r\n]+[\s\S]*?```/i.test(text)) {
    // If it's a curl example or JSON schema example for public API, allow standard API docs
    if (text.includes("curl ") || text.includes("https://api.pingava.com")) {
      return text;
    }
    // Otherwise sanitize away code blocks
    return text.replace(
      /```[\s\S]*?```/g,
      "[Implementation details omitted. You can configure this directly via the Pingava web dashboard!]"
    );
  }

  // Redact internal file names if accidentally mentioned
  return text
    .replace(/server\.ts/gi, "Pingava Core")
    .replace(/serverDiagnostics\.ts/gi, "Pingava SRE Engine")
    .replace(/serverAssistant\.ts/gi, "Pingava Assistant");
}

/**
 * Comprehensive deterministic knowledge base covering all user-facing Pingava features.
 */
export function getKnowledgeBaseAnswer(message: string): string | null {
  const q = message.toLowerCase();

  // Code / architecture probing check
  if (isProhibitedQuery(q)) {
    return CONFIDENTIALITY_REFUSAL_MESSAGE;
  }

  // 1. Uptime Monitoring & Check Types
  if (
    q.includes("uptime") ||
    q.includes("monitor") ||
    q.includes("synthetic") ||
    q.includes("check frequency") ||
    q.includes("how does it check")
  ) {
    return (
      "**Pingava Synthetic Uptime Monitoring** keeps tabs on your web apps, APIs, and servers 24/7:\n\n" +
      "- **Check Types**: HTTP/HTTPS, TCP Port, Ping (ICMP), DNS resolution, and SSL certificates.\n" +
      "- **Check Frequencies**: Every 30 seconds (Enterprise), 1 minute (Pro), or 3–5 minutes (Free).\n" +
      "- **Smart Assertions**: Verify HTTP status codes (e.g. 200 OK), response time budgets, response headers, and keyword/regex presence in response bodies.\n" +
      "- **Zero-Noise Alerting**: Pingava double-checks failures across consecutive cycles before alerting, preventing false alarms from momentary network blips."
    );
  }

  // 2. Multi-Region Edge Network
  if (
    q.includes("region") ||
    q.includes("location") ||
    q.includes("global") ||
    q.includes("edge") ||
    q.includes("probe")
  ) {
    return (
      "**Pingava Global Edge Probes** verify your site's availability from across the world:\n\n" +
      "- **Active Edge Regions**:\n" +
      "  - 🇺🇸 US East (N. Virginia)\n" +
      "  - 🇺🇸 US West (Oregon)\n" +
      "  - 🇩🇪 EU Central (Frankfurt)\n" +
      "  - 🇮🇳 AP South (Mumbai)\n" +
      "  - 🇸🇬 AP Southeast (Singapore)\n" +
      "  - 🇯🇵 AP Northeast (Tokyo)\n\n" +
      "- **Deep Telemetry**: Every probe inspects DNS resolution time, TCP connection handshake, TLS negotiation duration, and Time to First Byte (TTFB) to pinpoint exactly where slowdowns happen."
    );
  }

  // 3. SSL Certificate Guardian
  if (q.includes("ssl") || q.includes("tls") || q.includes("certificate") || q.includes("https")) {
    return (
      "**Pingava SSL Certificate Guardian** prevents unexpected HTTPS outages:\n\n" +
      "- **Automated Expiration Warnings**: Receive proactive alerts at 30, 14, 7, and 1 day before expiration.\n" +
      "- **Chain & Protocol Validation**: Checks certificate issuer authority, root CA validity, TLS protocol versions (TLS 1.2, TLS 1.3), and cipher suites.\n" +
      "- **Zero Setup Required**: Every HTTPS monitor you add automatically activates SSL certificate tracking."
    );
  }

  // 4. Status Pages
  if (q.includes("status page") || q.includes("status-page") || q.includes("public status")) {
    return (
      "**Pingava Public & Private Status Pages** keep your customers and team informed during outages:\n\n" +
      "- **Custom Domains**: Host your status page at `status.yourdomain.com` with automatic HTTPS.\n" +
      "- **Custom Branding**: Add your logo, brand colors, custom headline, and custom links.\n" +
      "- **Component Health**: Display real-time status for individual APIs, databases, microservices, and apps.\n" +
      "- **Incident Communications**: Post live updates (Investigating, Identified, Monitoring, Resolved) with 90-day historical uptime charts."
    );
  }

  // 5. API Contract & Drift Detection
  if (
    q.includes("contract") ||
    q.includes("schema") ||
    q.includes("drift") ||
    q.includes("payload") ||
    q.includes("json")
  ) {
    return (
      "**Pingava API Contract Guardian** protects your APIs against silent breaking changes:\n\n" +
      "- **Automatic Schema Inference**: Detects and learns the expected JSON structure of your API responses.\n" +
      "- **Type Drift Detection**: Alerts you if a field changes type (e.g. integer turned into a string) or if required keys disappear.\n" +
      "- **Custom HTTP Headers & Auth**: Supports Bearer tokens, custom headers, and POST/PUT JSON request bodies."
    );
  }

  // 6. Cron Heartbeats / Background Jobs
  if (q.includes("cron") || q.includes("heartbeat") || q.includes("dead man") || q.includes("background job")) {
    return (
      "**Pingava Cron Heartbeat Monitoring** watches background jobs and recurring tasks:\n\n" +
      "- **Dead Man's Snitch**: Pingava gives you a unique HTTPS ping URL for each scheduled job.\n" +
      "- **Simple Setup**: Add a `curl https://dashboard.pingava.com/api/heartbeat/TOKEN` command at the end of your backup script or cron task.\n" +
      "- **Grace Periods**: If your background job misses its scheduled window + grace period, Pingava triggers an immediate incident alert."
    );
  }

  // 7. Alert Channels & Notifications
  if (
    q.includes("alert") ||
    q.includes("notification") ||
    q.includes("slack") ||
    q.includes("email") ||
    q.includes("webhook") ||
    q.includes("pagerduty") ||
    q.includes("discord")
  ) {
    return (
      "**Pingava Alert Channels & Notifications** dispatch alerts the instant downtime occurs:\n\n" +
      "- **Supported Channels**: Instant Email notifications, custom Webhooks (JSON payloads for automation).\n" +
      "- **Multi-Channel Integrations**: Ready for Slack incoming webhooks, Discord channels, and PagerDuty incident routing.\n" +
      "- **Zero-Noise Thresholds**: Set consecutive failure requirements (e.g. alert only after 2 consecutive failed checks) so temporary network fluctuations don't wake you up at 3 AM."
    );
  }

  // 8. Pricing & Plans
  if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("free") || q.includes("plan")) {
    return (
      "**Pingava Pricing & Launch Status**:\n\n" +
      "- **Free Tier (100% Free During Public Early Access)**:\n" +
      "  - Pingava is currently operating a public Early Access program with zero fees and no credit card required!\n" +
      "  - Includes synthetic HTTP/API monitors, 6-region edge inspections, SSL certificate guardian, and public status pages with custom domains.\n\n" +
      "- **Upcoming Paid Subscriptions (Coming Soon)**:\n" +
      "  - **Pro Plan**: 60+ monitors, 30-second intervals, predictive latency jitter radar, and extended telemetry.\n" +
      "  - **Enterprise Plan**: Custom probe nodes, multi-user RBAC, and dedicated 99.99% availability SLA guarantees.\n" +
      "  - Self-serve paid plans will launch as soon as payment aggregator verification is complete. Early access users will receive advance notice and grandfathered perks."
    );
  }

  // 9. Getting Started / Sign Up
  if (
    q.includes("get started") ||
    q.includes("how to start") ||
    q.includes("sign up") ||
    q.includes("register") ||
    q.includes("how do i create") ||
    q.includes("setup")
  ) {
    return (
      "**Getting Started with Pingava** takes less than 60 seconds:\n\n" +
      "1. **Create an account** at [pingava.com/register](https://www.pingava.com/register) or log in with Google.\n" +
      "2. In your dashboard, click **Add Monitor**.\n" +
      "3. Enter the URL you want to monitor (e.g. `https://yourdomain.com`).\n" +
      "4. Choose your check frequency (from 30s to 5m) and select alert notification contacts.\n" +
      "5. Click **Save Monitor** — Pingava begins checking your site immediately across global edge locations!"
    );
  }

  // 10. Contact & Support
  if (q.includes("contact") || q.includes("support") || q.includes("email pingava") || q.includes("talk to human")) {
    return (
      "You can reach the Pingava engineering team directly:\n\n" +
      "- **Email**: `connect@pingava.com`\n" +
      "- **Contact Page**: [pingava.com/contact](https://www.pingava.com/contact)\n" +
      "- **Response Time**: We typically review and respond to inquiries within a few hours!"
    );
  }

  return null;
}

/**
 * Handles incoming assistant questions using Gemini AI with fallback to the knowledge base.
 */
export async function processAssistantQuery(
  message: string,
  _history?: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const cleanMessage = String(message || "").trim();
  if (!cleanMessage) {
    return "Hello! How can I help you with Pingava's uptime monitoring, status pages, or API checks today?";
  }

  // 1. Security & confidentiality pre-check
  if (isProhibitedQuery(cleanMessage)) {
    return CONFIDENTIALITY_REFUSAL_MESSAGE;
  }

  // 2. Check if we have an exact or high-confidence knowledge base match
  const kbAnswer = getKnowledgeBaseAnswer(cleanMessage);
  if (kbAnswer) {
    return sanitizeAssistantResponse(kbAnswer);
  }

  // 3. If Gemini is available, query Gemini with strict system instructions
  const client = getGeminiClient();
  if (client) {
    try {
      const primaryModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
      const systemInstruction = `You are the official Pingava Product Assistant on pingava.com. Pingava is an enterprise synthetic monitoring and observability platform offering uptime checks, 6-region edge latency inspection, SSL certificate tracking, API contract drift detection, cron heartbeat monitoring, public status pages, and zero-noise alerting.

YOUR PURPOSE:
Answer visitor and developer questions clearly and concisely about Pingava's features, capabilities, user configuration in the dashboard, and pricing plans.

CONFIDENTIALITY & PROPRIETARY GUARDRAILS (CRITICAL):
1. NEVER display, quote, or discuss internal source code, codebase files (such as server.ts, React components, backend logic), programming languages, internal database schemas, or infrastructure architecture.
2. If asked how Pingava is implemented or asked for internal code, politely reply:
   "As Pingava's product assistant, I can explain our platform features, monitoring capabilities, configuration options, and how to use the dashboard. Internal source code, codebase files, database schemas, and proprietary backend infrastructure architecture are confidential and cannot be disclosed."
3. When explaining how to configure a feature, describe it strictly from the user's perspective inside the Pingava web dashboard (e.g. "In your dashboard, click Add Monitor, enter your URL, and select your check interval...").
4. Format responses cleanly in markdown (bolding, bullet points). Keep answers concise and friendly.`;

      const prompt = `User question: "${cleanMessage.slice(0, 1000)}"`;

      // Call Gemini with a 10s timeout
      const generatePromise = client.models.generateContent({
        model: primaryModel,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini query timeout")), 10000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const replyText = response.text ? response.text.trim() : "";

      if (replyText) {
        return sanitizeAssistantResponse(replyText);
      }
    } catch (err: any) {
      console.warn("[Assistant AI] Gemini call failed or timed out:", err?.message || err);
    }
  }

  // 4. Default graceful fallback response
  return (
    "Pingava is an enterprise synthetic uptime and API monitoring platform. We offer real-time HTTP/HTTPS/TCP checks across 6 global edge regions, SSL certificate expiration tracking, API schema drift alerts, cron heartbeat monitoring, and branded public status pages.\n\n" +
    "You can get started for free at [pingava.com/register](https://www.pingava.com/register) or explore our [Documentation](https://www.pingava.com/docs). What specific feature would you like to explore?"
  );
}
