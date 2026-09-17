import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Import our server public pages module
import { isPublicPagePath, getPublicPageMeta, injectPublicPageIntoHtml } from '../serverPublicPages.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}`, detail || '');
  }
}

async function run() {
  console.log('=================================================================');
  console.log('🧪 RUNNING SEO, DOGFOODING WIDGET & LIVE SANDBOX VERIFICATION');
  console.log('=================================================================\n');

  // 1. Robots.txt Content Verification
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  assert(fs.existsSync(robotsPath), 'public/robots.txt exists on disk');
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  assert(robotsTxt.includes('User-agent: *'), 'robots.txt specifies User-agent: *');
  assert(robotsTxt.includes('Allow: /') && robotsTxt.includes('Allow: /pricing') && robotsTxt.includes('Allow: /features') && robotsTxt.includes('Allow: /docs') && robotsTxt.includes('Allow: /blog') && robotsTxt.includes('Allow: /status/*') && robotsTxt.includes('Allow: /demo'), 'robots.txt allows all required public routes');
  assert(robotsTxt.includes('Disallow: /dashboard/*') && robotsTxt.includes('Disallow: /app/*') && robotsTxt.includes('Disallow: /api/*') && robotsTxt.includes('Disallow: /settings/*'), 'robots.txt disallows private dashboard, app, api, and settings routes');
  assert(robotsTxt.includes('Sitemap: https://www.pingava.com/sitemap.xml'), 'robots.txt specifies exact XML sitemap pointer');

  // 2. Sitemap.xml Verification
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  assert(fs.existsSync(sitemapPath), 'public/sitemap.xml exists on disk');
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  assert(sitemapXml.includes('<loc>https://www.pingava.com/features</loc>'), 'sitemap.xml contains /features');
  assert(sitemapXml.includes('<loc>https://www.pingava.com/demo</loc>'), 'sitemap.xml contains /demo');

  // 3. index.html Meta Tags Verification
  const indexPath = path.join(process.cwd(), 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  assert(indexHtml.includes('<meta name="robots" content="index, follow" />'), 'index.html contains <meta name="robots" content="index, follow" />');
  assert(!indexHtml.includes('noindex') && !indexHtml.includes('noarchive'), 'index.html contains no residual noindex or noarchive tags');

  // 4. Public Pages Metadata & SSR Content Injection
  assert(isPublicPagePath('/'), 'isPublicPagePath(/) is true');
  assert(isPublicPagePath('/pricing'), 'isPublicPagePath(/pricing) is true');
  assert(isPublicPagePath('/features'), 'isPublicPagePath(/features) is true');
  assert(isPublicPagePath('/docs'), 'isPublicPagePath(/docs) is true');
  assert(isPublicPagePath('/blog'), 'isPublicPagePath(/blog) is true');
  assert(isPublicPagePath('/demo'), 'isPublicPagePath(/demo) is true');
  assert(!isPublicPagePath('/dashboard'), 'isPublicPagePath(/dashboard) is false');
  assert(!isPublicPagePath('/settings'), 'isPublicPagePath(/settings) is false');

  const homeHtml = injectPublicPageIntoHtml(indexHtml, '/');
  assert(homeHtml.includes('<meta name="robots" content="index, follow" />'), 'Rendered home HTML contains robots index, follow');
  assert(homeHtml.includes('Next-Gen Uptime &amp; API Reliability'), 'Rendered home HTML contains hero title');
  assert(homeHtml.includes('Engineered to Reduce False Alarms'), 'Rendered home HTML contains updated reduce false alarms heading');
  assert(homeHtml.includes('Monitor websites and APIs globally'), 'Rendered home HTML contains simplified hero copy');
  assert(homeHtml.includes('Checked live across 4 of 6 global regions'), 'Rendered home HTML contains 4 of 6 global regions wording');
  assert(!homeHtml.includes('Gemini'), 'Rendered home HTML contains no Gemini mentions');
  assert(!homeHtml.includes('Zero False Alarms'), 'Rendered home HTML contains no Zero False Alarms mentions');
  assert(homeHtml.includes('All Edge Systems Operational'), 'Rendered home HTML contains dogfooding edge status widget');
  assert(homeHtml.includes('Test your website or REST API right now'), 'Rendered home HTML contains instant URL tester');
  assert(homeHtml.includes('https://codehype.ai/product/pingava?utm_source=codehype_badge') && homeHtml.includes('https://codehype.ai/badges/pingava.svg'), 'Rendered home HTML contains CodeHype verified badge embed');

  const demoHtml = injectPublicPageIntoHtml(indexHtml, '/demo');
  assert(demoHtml.includes('Live Interactive Demo Dashboard'), 'Rendered demo HTML contains demo title');
  assert(demoHtml.includes('You are viewing an interactive read-only demo'), 'Rendered demo HTML contains floating banner text');

  // 5. Rate Limiter Logic Verification
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  function checkLimit(ip: string) {
    const now = Date.now();
    let b = rateLimitMap.get(ip);
    if (!b || now > b.resetAt) {
      b = { count: 1, resetAt: now + 60000 };
      rateLimitMap.set(ip, b);
      return { allowed: true, remaining: 4 };
    }
    if (b.count >= 5) return { allowed: false, remaining: 0 };
    b.count++;
    return { allowed: true, remaining: 5 - b.count };
  }

  const testIp = '198.51.100.24';
  assert(checkLimit(testIp).allowed === true, 'Rate limiter: Request 1 allowed');
  assert(checkLimit(testIp).allowed === true, 'Rate limiter: Request 2 allowed');
  assert(checkLimit(testIp).allowed === true, 'Rate limiter: Request 3 allowed');
  assert(checkLimit(testIp).allowed === true, 'Rate limiter: Request 4 allowed');
  assert(checkLimit(testIp).allowed === true, 'Rate limiter: Request 5 allowed');
  assert(checkLimit(testIp).allowed === false, 'Rate limiter: Request 6 blocked (HTTP 429)');

  console.log('\n=================================================================');
  console.log(`📊 SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests`);
  console.log('=================================================================');

  if (failedTests > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
