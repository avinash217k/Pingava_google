import type { ReactNode } from 'react'
import { PublicFooter, PublicHeader } from './MarketingPages'
import { PageMetadata } from './Seo'
import './LegalPages.css'

const CONTACT_EMAIL = 'connect@pingava.com'
const SUPPORT_EMAIL = 'support@pingava.com'

function LegalLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const canonicalPath = title === 'Terms of Service' ? '/terms' : '/privacy'
  return (
    <div className="legal-page">
      <PageMetadata title={`${title} | Pingava`} description={description} canonicalPath={canonicalPath} />
      <PublicHeader />
      <main>
        <header>
          <p>LEGAL &amp; COMPLIANCE</p>
          <h1>{title}</h1>
          <span>Last updated: September 15, 2026 &middot; Effective immediately</span>
        </header>
        <article>{children}</article>
      </main>
      <PublicFooter />
    </div>
  )
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Terms of Service governing access to and use of Pingava website synthetic uptime monitoring, API probe network, and status page hosting."
    >
      <section>
        <h2>1. Acceptance of Terms &amp; Eligibility</h2>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Customer,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Pingava (&ldquo;Pingava,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By creating an account, accessing our website at pingava.com, utilizing our developer APIs, or configuring synthetic monitors, you acknowledge that you have read, understood, and agree to be bound by these Terms.
        </p>
        <p>
          If you are entering into these Terms on behalf of an entity, organization, or company, you represent and warrant that you possess the requisite legal authority to bind that entity to these Terms. If you do not possess such authority, or if you do not agree with any provision herein, you must immediately refrain from accessing or using the service. You must be at least eighteen (18) years of age to establish an account or use Pingava.
        </p>
      </section>

      <section>
        <h2>2. Description of the Service</h2>
        <p>
          Pingava operates an external synthetic reliability and observability platform. The service provides:
        </p>
        <ul>
          <li><strong>Synthetic Uptime &amp; Latency Monitoring:</strong> Automated, recurring HTTP, HTTPS, and REST API network requests initiated from geographically distributed edge probe locations.</li>
          <li><strong>SSL/TLS Certificate Tracking:</strong> Automated inspection of TLS certificates, intermediate trust chains, cipher handshakes, and advance expiration warnings.</li>
          <li><strong>Passive Cron / Dead Man&rsquo;s Snitch:</strong> Inbound heartbeat endpoints for tracking background workers and recurring database jobs.</li>
          <li><strong>Incident Management &amp; Diagnostics:</strong> Failure confirmation algorithms, response timeline analytics, and AI-assisted root cause diagnostic summaries.</li>
          <li><strong>Public Status Communication:</strong> Hosted public and private status pages with optional subscriber notification broadcasts.</li>
        </ul>
      </section>

      <section>
        <h2>3. Customer Authorization &amp; Acceptable Use Policy (AUP)</h2>
        <div className="legal-callout">
          <p>
            <strong>Critical Customer Requirement:</strong> You must own, operate, or have express, documented legal authorization to monitor, ping, request, and inspect every website URL, IP address, hostname, or API endpoint configured in your Pingava account.
          </p>
        </div>
        <p>
          You explicitly represent, warrant, and covenant that your use of Pingava complies with all applicable international, federal, state, and local laws and regulations. You agree that you will not:
        </p>
        <ul>
          <li>Configure monitors directed against third-party endpoints, infrastructure, or services without verified ownership or written authorization from the system administrator.</li>
          <li>Use Pingava to launch, facilitate, or simulate Distributed Denial of Service (DDoS) attacks, brute-force attacks, vulnerability fuzzing, port scanning, or unauthorized security penetration tests.</li>
          <li>Configure check frequencies, payloads, or concurrent requests designed or reasonably likely to degrade, overwhelm, exhaust resources, or disrupt the operation of target systems.</li>
          <li>Attempt to reverse engineer, decompile, compromise, exploit, or intercept the network traffic, dispatcher infrastructure, or worker nodes operated by Pingava.</li>
          <li>Transmit, store, or configure monitors containing malicious software, viruses, trojans, worms, or unlawful materials.</li>
          <li>Abuse public status pages to send unsolicited bulk communications, spam, phishing links, or deceptive notices to subscribers.</li>
        </ul>
        <p>
          Pingava reserves the absolute right to immediately pause, disable, or delete any monitor, or terminate any customer account without prior notice, upon receiving an abuse report, network takedown notice, or if our telemetry indicates unauthorized probing activity.
        </p>
      </section>

      <section>
        <h2>4. Monitoring Methodology &amp; Technical Limitations</h2>
        <p>
          Pingava executes synthetic requests from external edge vantage points (including regions across North America, Europe, and Asia-Pacific). You acknowledge and understand the following operational characteristics:
        </p>
        <ul>
          <li><strong>Discrete Observations:</strong> Synthetic checks are sampled discrete measurements executed at configured intervals (e.g., every 15s, 30s, 60s, or 3m). Pingava does not provide uninterrupted stream tracing or internal application performance monitoring (APM).</li>
          <li><strong>Decentralized Internet Transit:</strong> Internet routing, Border Gateway Protocol (BGP) convergence, local Internet Service Provider (ISP) disruptions, and Content Delivery Network (CDN) edge cache variations mean that reachability from a Pingava probe may occasionally differ from an end-user&rsquo;s individual vantage point.</li>
          <li><strong>False Alarm Reduction:</strong> While Pingava implements consecutive failure verification rules and multi-region quorum consensus to filter transient routing blips, Pingava cannot warrant that alerts will never be subject to transient delays or false positives/negatives.</li>
          <li><strong>Not a Failover or Disaster Recovery Solution:</strong> Pingava is an observability, alert routing, and incident communication utility. Pingava is not an automated DNS failover service, a load balancer, or a disaster recovery platform. You remain solely responsible for your own operational resilience, backups, and redundancy architecture.</li>
        </ul>
      </section>

      <section>
        <h2>5. Alert Notifications &amp; Third-Party Delivery</h2>
        <p>
          Pingava routes outage and recovery alerts through various downstream transmission channels, including transactional email (SMTP), inbound webhooks, and third-party incident management platforms.
        </p>
        <p>
          You acknowledge that timely receipt of alerts depends upon third-party telecommunications networks, mail service providers, spam filtering heuristics, and customer endpoint availability. To the extent permitted by law, Pingava disclaims all liability for delayed, filtered, undelivered, or duplicate notifications. Pingava must not be deployed as the single fail-safe notification channel for life-safety, emergency response, or mission-critical medical systems.
        </p>
      </section>

      <section>
        <h2>6. Accounts, Credentials &amp; Workspace Security</h2>
        <p>
          When creating an account, you must provide accurate, current, and complete registration information. You are solely responsible for maintaining the confidentiality of your credentials, API keys, and workspace authentication tokens.
        </p>
        <p>
          You agree to accept responsibility for all activities conducted under your workspace account. You must notify our security team immediately at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> upon discovering or suspecting any unauthorized access, token compromise, or security incident involving your account.
        </p>
      </section>

      <section>
        <h2>7. Subscription Plans, Billing &amp; Refunds</h2>
        <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: 16 }}>
          <strong>Early Access Program Notice:</strong> During the current Public Early Access launch period, all platform capabilities are provided free of charge with no credit card required. Subscription fees, billing intervals, and payment methods describe our upcoming paid tiers and will become active once merchant payment processing is officially enabled.
        </div>
        <p>
          Pingava offers both free tiers (Developer / Early Access) and upcoming paid recurring subscription plans (Pro, Team, Enterprise).
        </p>
        <ul>
          <li><strong>Recurring Billing:</strong> Once merchant processing launches, paid subscriptions will be billed in advance on a recurring monthly or annual basis, commencing on the date you upgrade. Subscriptions automatically renew at the end of each billing interval unless canceled prior to the renewal date.</li>
          <li><strong>Plan Changes:</strong> Upgrades take effect immediately, with prorated adjustments applied automatically. Downgrades take effect at the conclusion of the active billing cycle.</li>
          <li><strong>Cancellation:</strong> You may cancel your subscription at any time directly through your workspace dashboard under Plan &amp; Early Access. Following cancellation, your account will remain active at the paid tier until the conclusion of the prepaid period, after which it will revert to the Developer tier.</li>
          <li><strong>Refund Policy:</strong> All fees paid to Pingava are non-refundable, except where mandatory consumer protection statutes require otherwise. We do not issue cash refunds, credits, or proration for partial months or unused monitoring allocations.</li>
          <li><strong>Taxes:</strong> Fees are exclusive of applicable national, state, or municipal sales taxes, goods and services taxes (GST), or value-added taxes (VAT), which will be charged where legally required.</li>
        </ul>
      </section>

      <section>
        <h2>8. Intellectual Property &amp; Customer Data</h2>
        <p>
          <strong>Pingava IP:</strong> Pingava, its underlying source code, probe dispatch algorithms, user interfaces, documentation, trade secrets, logos, and trademarks remain the sole and exclusive intellectual property of Pingava and its licensors. These Terms grant you a limited, revocable, non-exclusive, non-transferable license to access the service solely in accordance with your subscription tier.
        </p>
        <p>
          <strong>Customer Data:</strong> You retain all intellectual property rights and ownership over your endpoint configurations, custom HTTP headers, response assertion rules, and historical telemetry data (&ldquo;Customer Data&rdquo;). You grant Pingava a worldwide, royalty-free license to host, store, execute requests against, and process Customer Data strictly to the extent required to provide, secure, and operate the service.
        </p>
      </section>

      <section>
        <h2>9. AI Diagnostics &amp; Automated Post-Mortems</h2>
        <p>
          Certain Pingava tiers include AI-assisted root cause diagnostic summaries and automated post-mortem generation. These tools synthesize technical telemetry (such as HTTP response status codes, latency timelines, and sanitized error headers) into structured reports.
        </p>
        <p>
          You acknowledge that AI-generated diagnostic summaries are algorithmic analytical aids provided for convenience and situational awareness. They do not constitute formal systems engineering guarantees, professional architectural certifications, or legal warranties. You remain solely responsible for validating diagnostics before executing production remediations.
        </p>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <div className="legal-callout">
          <p>
            <strong>Important Legal Liability Cap:</strong> To the maximum extent permitted by applicable law, in no event shall Pingava, its founders, officers, directors, employees, affiliates, agents, or infrastructure providers be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages whatsoever.
          </p>
        </div>
        <p>
          This limitation applies to, without limitation, damages for loss of profits, lost revenue, lost business opportunity, goodwill, data corruption, work stoppage, or customer system downtime, whether arising under contract, tort (including negligence), strict liability, or any other legal theory, even if Pingava was advised of the possibility of such damages.
        </p>
        <p>
          To the maximum extent permitted by applicable law, Pingava&rsquo;s total aggregate liability arising out of or related to these Terms, the website, or the service shall not exceed the greater of:
        </p>
        <ul>
          <li>One Hundred United States Dollars ($100.00 USD); or</li>
          <li>The total fees actually paid by you to Pingava in the three (3) months immediately preceding the event giving rise to the claim.</li>
        </ul>
      </section>

      <section>
        <h2>11. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE, DOCUMENTATION, AND ALL CONTENT ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
        </p>
        <p>
          TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, PINGAVA DISCLAIMS ALL WARRANTIES, STATUTORY, EXPRESS, OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, SYSTEM INTEGRATION, AND NON-INFRINGEMENT. PINGAVA DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, ACCURATE, OR FREE OF HARMFUL COMPONENTS.
        </p>
      </section>

      <section>
        <h2>12. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Pingava, its founders, directors, officers, employees, and agents from and against any third-party claims, liabilities, losses, damages, judgments, penalties, costs, and expenses (including reasonable attorneys&rsquo; fees) arising out of or relating to:
        </p>
        <ul>
          <li>Your breach of these Terms or your violation of the Acceptable Use Policy;</li>
          <li>Your configuration of synthetic checks against any website, server, API, or network endpoint that you do not own or are not legally authorized to test;</li>
          <li>Any dispute between you and any third party regarding monitor execution or status communication; or</li>
          <li>Your violation of any applicable law, regulation, or third-party intellectual property or privacy right.</li>
        </ul>
      </section>

      <section>
        <h2>13. Term, Suspension &amp; Termination</h2>
        <p>
          These Terms remain in full effect while you access or use the service. You may terminate your account at any time through your workspace settings or by submitting a written request to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
        <p>
          Pingava reserves the right to immediately suspend or terminate your account, API access, or monitor execution, without liability, if:
        </p>
        <ul>
          <li>You materially breach any provision of these Terms or the Acceptable Use Policy;</li>
          <li>Your monitoring targets cause harm, disruption, or trigger abuse complaints from hosting providers;</li>
          <li>Payment for paid subscription fees fails or is disputed; or</li>
          <li>We are required to do so by court order, statutory regulation, or government agency.</li>
        </ul>
        <p>
          Provisions that by their nature should survive termination shall survive, including Section 3 (AUP), Section 8 (IP), Section 10 (Limitation of Liability), Section 11 (Warranty Disclaimer), Section 12 (Indemnification), and Section 15 (Governing Law).
        </p>
      </section>

      <section>
        <h2>14. Modifications to Terms &amp; Service</h2>
        <p>
          As our monitoring infrastructure, edge regions, and software evolve, we may modify these Terms periodically. When changes occur, we will revise the &ldquo;Last updated&rdquo; date at the top of this page.
        </p>
        <p>
          For material changes that adversely impact your rights, we will provide reasonable advance notice via email to your registered account address or via an in-app notice. Your continued access to or use of Pingava following the effective date of updated Terms constitutes your binding acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>15. Governing Law &amp; Dispute Resolution</h2>
        <p>
          These Terms and any dispute arising out of or related to your use of Pingava shall be governed by and construed in accordance with the laws applicable in the jurisdiction of Pingava&rsquo;s principal place of establishment, without giving effect to conflict-of-law principles.
        </p>
        <p>
          In the event of any controversy or dispute, the parties agree to first attempt in good faith to resolve the dispute informally by contacting <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> before initiating formal legal proceedings. Any legal action or proceeding arising under these Terms shall be instituted exclusively in the competent courts having jurisdiction over Pingava&rsquo;s principal place of business.
        </p>
      </section>

      <section>
        <h2>16. Contact &amp; Legal Notices</h2>
        <p>
          For legal inquiries, formal notices, or abuse and takedown reports, please contact our legal and compliance desk:
        </p>
        <ul>
          <li><strong>General Inquiries &amp; Legal Notices:</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
          <li><strong>Technical Support &amp; Security Disclosures:</strong> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
        </ul>
      </section>
    </LegalLayout>
  )
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How Pingava collects, processes, stores, and safeguards personal data, synthetic monitoring configurations, and operational telemetry."
    >
      <section>
        <h2>1. Introduction &amp; Controller Identity</h2>
        <p>
          This Privacy Policy (&ldquo;Policy&rdquo;) explains how Pingava (&ldquo;Pingava,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, processes, uses, retains, and discloses information when you visit pingava.com, create a customer workspace, deploy synthetic monitors, or interact with our hosted status pages.
        </p>
        <p>
          For the purposes of applicable data protection legislation (including the General Data Protection Regulation &ldquo;GDPR,&rdquo; UK GDPR, and the California Consumer Privacy Act as amended by the CPRA):
        </p>
        <ul>
          <li><strong>Pingava as Data Controller:</strong> We act as a Data Controller with respect to account registration data, contact inquiries, workspace settings, billing records, and website usage telemetry.</li>
          <li><strong>Pingava as Data Processor:</strong> We act as a Data Processor when executing synthetic requests against customer-configured target endpoints and managing subscriber notifications for your public status pages.</li>
        </ul>
        <p>
          If you have questions about this Policy or our data protection practices, please contact our Data Protection desk at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>
          We collect information across several categories depending on how you interact with our platform:
        </p>
        <h3>A. Account &amp; Authentication Information</h3>
        <p>
          When you register for a Pingava account, we collect your full name, email address, hashed credentials, and organization name. If you authenticate using Google Sign-In, we receive your Google user ID, name, email address, and profile picture URL as permitted by your Google account permissions.
        </p>
        <h3>B. Synthetic Target Configuration</h3>
        <p>
          To execute monitoring checks, you provide endpoint targets, including website URLs, REST API hostnames, IP addresses, HTTP methods (GET, POST, HEAD, etc.), custom request headers, assertion rules, JSON Path schemas, query parameters, and check intervals.
        </p>
        <div className="legal-callout">
          <p>
            <strong>Security Notice regarding Credentials:</strong> Synthetic monitoring targets are transmitted to automated probe dispatchers. Customers should never configure unencrypted production passwords, confidential API secrets, or private personal data inside plain GET URL strings or unencrypted payloads.
          </p>
        </div>
        <h3>C. Observability Telemetry &amp; Error Snippets</h3>
        <p>
          When our probes check your endpoints, we record operational telemetry: HTTP response codes, response latency timelines (DNS resolution, TCP connection, TLS handshake, TTFB), TLS certificate metadata (issuer, validity window, expiry timestamp), and, in the event of check failures, truncated response headers and error payload snippets captured solely to render incident diagnostics.
        </p>
        <h3>D. Status Page Subscriber Data</h3>
        <p>
          When you publish a public status page, your end users may voluntarily subscribe to receive email notifications regarding service health changes. We collect subscriber email addresses solely to deliver verified incident notifications and manage unsubscribes on your behalf.
        </p>
        <h3>E. Device, Technical &amp; Usage Telemetry</h3>
        <p>
          When navigating pingava.com or our dashboard, our servers automatically collect standard technical logs, including your IP address, browser type, operating system, referrer URL, pages visited, session duration, and feature interactions.
        </p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>
          We process personal data strictly for legitimate operational, contractual, and security purposes:
        </p>
        <ul>
          <li><strong>Service Delivery:</strong> Dispatching recurring synthetic HTTP/API checks, validating TLS certificates, recording response history, and generating uptime metrics.</li>
          <li><strong>Alert Dispatch:</strong> Sending confirmed outage, recovery, and certificate expiration alerts via email, webhooks, or configured notification channels.</li>
          <li><strong>Incident Diagnostics &amp; AI Summaries:</strong> Analyzing failure telemetry to synthesize automated post-mortems and diagnostic guidance for customer engineering teams.</li>
          <li><strong>Security &amp; Abuse Prevention:</strong> Verifying account authentication, detecting fraudulent sign-ups, enforcing Acceptable Use limits, and protecting our probe network from abuse.</li>
          <li><strong>Customer Communications:</strong> Responding to technical support inquiries submitted to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, providing operational notices, and delivering service updates.</li>
          <li><strong>Compliance:</strong> Fulfilling tax, legal, regulatory, and corporate accounting obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. Lawful Bases for Processing (GDPR &amp; UK GDPR)</h2>
        <p>
          Where European or United Kingdom data protection law applies, we process your personal data under the following legal bases:
        </p>
        <ul>
          <li><strong>Performance of a Contract (Art. 6(1)(b) GDPR):</strong> Processing necessary to provide the services requested, maintain your workspace, and bill for subscriptions.</li>
          <li><strong>Legitimate Interests (Art. 6(1)(f) GDPR):</strong> Processing necessary to secure our infrastructure, prevent network abuse, improve probe dispatch latency, and optimize platform reliability.</li>
          <li><strong>Compliance with Legal Obligations (Art. 6(1)(c) GDPR):</strong> Retaining financial transaction records, enforcing tax regulations, or complying with lawful court orders.</li>
          <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> Where you explicitly opt in to non-transactional marketing updates, or when status page subscribers confirm their email subscription. Consent may be withdrawn at any time.</li>
        </ul>
      </section>

      <section>
        <h2>5. AI Diagnostics &amp; Telemetry Privacy</h2>
        <p>
          Pingava utilizes artificial intelligence and machine learning models to analyze incident telemetry and produce root cause summaries and post-mortem drafts.
        </p>
        <ul>
          <li><strong>Telemetry-Only Processing:</strong> AI diagnostic processing is restricted to operational data: HTTP status codes, latency timelines, and sanitized response snippets captured during confirmed outages.</li>
          <li><strong>No Model Training on Customer Data:</strong> Pingava does not sell, license, or provide your confidential API configurations, assertion rules, or response payloads to third parties to train generalized public foundational AI models.</li>
        </ul>
      </section>

      <section>
        <h2>6. Subprocessors &amp; Service Providers</h2>
        <p>
          We never sell, rent, or trade your personal data. We disclose information only to vetted third-party service providers (&ldquo;Subprocessors&rdquo;) that assist us in operating our platform:
        </p>
        <ul>
          <li><strong>Cloud Hosting &amp; Compute:</strong> Google Cloud Platform (Cloud Run, Container Registry) for hosting application services and API endpoints.</li>
          <li><strong>Database &amp; Data Storage:</strong> Google Cloud Firestore / Firebase for encrypted configuration and metric persistence.</li>
          <li><strong>Identity &amp; Authentication:</strong> Google Identity Services for OAuth 2.0 authentication.</li>
          <li><strong>Transactional Email Relays:</strong> Dedicated transactional email delivery infrastructure for dispatching outage notifications, verification links, and inquiry receipts.</li>
          <li><strong>Product Analytics:</strong> Privacy-conscious product analytics (e.g., PostHog / Google Analytics) to identify navigation friction and improve user workflows.</li>
        </ul>
        <p>
          All Subprocessors are bound by data processing agreements requiring them to maintain strict confidentiality and robust security safeguards.
        </p>
      </section>

      <section>
        <h2>7. Data Security Safeguards</h2>
        <p>
          Pingava employs multi-layered administrative, physical, and technical safeguards designed to protect personal data and customer configurations:
        </p>
        <ul>
          <li><strong>Encryption in Transit:</strong> All web traffic, API transactions, and dashboard sessions are encrypted using modern Transport Layer Security (TLS 1.2 and TLS 1.3).</li>
          <li><strong>Encryption at Rest:</strong> Database storage, configurations, and metric archives are encrypted at rest using industry-standard AES-256 encryption.</li>
          <li><strong>Access Control:</strong> Administrative access to production clusters is strictly restricted via role-based access control (RBAC), multi-factor authentication (MFA), and audit logging.</li>
        </ul>
        <p>
          While we implement rigorous security measures, no digital transmission or cloud storage system is 100% impenetrable. We encourage customers to maintain robust credentials and notify us immediately of any suspected vulnerabilities.
        </p>
      </section>

      <section>
        <h2>8. International Data Transfers</h2>
        <p>
          Pingava operates a globally distributed synthetic probe network with vantage points in North America, Europe, and Asia-Pacific. Consequently, monitoring requests and telemetry may traverse and be processed on servers located outside your country of residence.
        </p>
        <p>
          When transferring personal data internationally from the European Economic Area (EEA), United Kingdom, or Switzerland, we ensure adequate protection through approved transfer mechanisms, including the European Commission&rsquo;s Standard Contractual Clauses (SCCs).
        </p>
      </section>

      <section>
        <h2>9. Data Retention &amp; Deletion Schedules</h2>
        <p>
          We retain personal data only as long as necessary to fulfill the operational purposes described in this Policy:
        </p>
        <ul>
          <li><strong>Account Data:</strong> Retained for the duration of your active workspace account.</li>
          <li><strong>Operational Telemetry &amp; Metrics:</strong> High-resolution response metrics and incident logs are retained according to your plan tier (e.g., 30 days for Developer, up to 1&ndash;2 years for paid tiers), after which they are aggregated or deleted.</li>
          <li><strong>Status Page Subscribers:</strong> Retained until the subscriber clicks &ldquo;Unsubscribe&rdquo; or the associated status page is removed.</li>
          <li><strong>Server Access Logs:</strong> Retained for up to ninety (90) days for operational debugging and security forensics.</li>
          <li><strong>Account Deletion:</strong> If you request account closure, we permanently purge your personal account data, monitor configurations, and custom credentials within thirty (30) days, retaining only minimal records required for legal, tax, or fraud-prevention obligations.</li>
        </ul>
      </section>

      <section>
        <h2>10. Your Data Protection Rights</h2>
        <p>
          Depending on your jurisdiction (including the EU, UK, and California), you possess specific statutory rights regarding your personal data:
        </p>
        <ul>
          <li><strong>Right of Access &amp; Portability:</strong> Request a copy of the personal data we maintain about you in a structured, machine-readable format.</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal records.</li>
          <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your personal data when it is no longer needed for its original purpose.</li>
          <li><strong>Right to Restriction &amp; Objection:</strong> Request that we restrict or cease processing your data under certain conditions.</li>
          <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw your consent at any time without affecting past processing.</li>
          <li><strong>Right to Non-Discrimination:</strong> We will never discriminate against you, deny services, or alter pricing for exercising your statutory privacy rights.</li>
        </ul>
        <p>
          To exercise any of these rights, please submit a verified request to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We respond to all verified requests within thirty (30) days.
        </p>
      </section>

      <section>
        <h2>11. Cookies &amp; Local Storage</h2>
        <p>
          We use cookies and browser local storage strictly for functional and security purposes:
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required to maintain authenticated sessions, secure forms against CSRF attacks, and manage active workspace contexts.</li>
          <li><strong>Preference Cookies:</strong> Storing interface preferences such as Dark/Light theme mode.</li>
          <li><strong>Analytics Cookies:</strong> Measuring aggregate traffic patterns to improve site reliability.</li>
        </ul>
        <p>
          You can configure your browser to block or alert you about cookies, but certain essential features (including dashboard sign-in) will not function without them.
        </p>
      </section>

      <section>
        <h2>12. Children&rsquo;s Privacy</h2>
        <p>
          Pingava is a professional synthetic monitoring and observability platform intended strictly for businesses, developers, and individuals aged eighteen (18) and older. We do not knowingly solicit or collect personal data from children under the age of sixteen (16). If we learn that a minor has provided us with personal data, we will promptly delete it.
        </p>
      </section>

      <section>
        <h2>13. Modifications to this Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect modifications in our technology, regulatory requirements, or business practices. We will notify you of any material changes by updating the date at the top of this Policy and, where practical, providing prominent notice via our dashboard or email.
        </p>
      </section>

      <section>
        <h2>14. Contacting Us &amp; Data Subject Inquiries</h2>
        <p>
          If you have questions, feedback, or wish to exercise your data subject rights, our data protection and reliability team is available to assist you:
        </p>
        <ul>
          <li><strong>Data Protection &amp; General Inquiries:</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
          <li><strong>Technical Support &amp; Security:</strong> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
        </ul>
      </section>
    </LegalLayout>
  )
}

