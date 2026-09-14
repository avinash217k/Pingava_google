/**
 * Real Alert Dispatcher Engine for Pingava
 * Formats and transmits live incident alerts to Slack, Discord, and custom HTTPS Webhooks.
 */

import { observability } from './observabilityService';

export type WebhookEventKind = 'down' | 'recovery' | 'ssl_expiring' | 'test';

export interface WebhookDispatchPayload {
  kind: WebhookEventKind;
  monitor: {
    id: number;
    name: string;
    url: string;
    status: string;
    uptime?: number;
    check_interval_seconds?: number;
  };
  incident?: {
    id?: number;
    error?: string | null;
    response_time_ms?: number;
    timestamp: string;
  };
  dashboard_url?: string;
}

export interface WebhookDispatchResult {
  success: boolean;
  status_code: number | null;
  error: string | null;
  response_body?: string | null;
  delivered_at: string;
}

/**
 * Detects the destination webhook service from the URL format.
 */
export function detectWebhookService(url: string): 'slack' | 'discord' | 'generic' {
  const normalized = String(url || '').toLowerCase();
  if (normalized.includes('hooks.slack.com/services/')) {
    return 'slack';
  }
  if (normalized.includes('discord.com/api/webhooks/') || normalized.includes('discordapp.com/api/webhooks/')) {
    return 'discord';
  }
  return 'generic';
}

/**
 * Formats a Slack Block Kit payload with color attachments.
 */
function buildSlackPayload(payload: WebhookDispatchPayload) {
  const isDown = payload.kind === 'down';
  const isRecovery = payload.kind === 'recovery';
  const isSsl = payload.kind === 'ssl_expiring';
  const isTest = payload.kind === 'test';

  const color = isDown ? '#EF4444' : isRecovery ? '#10B981' : isSsl ? '#F59E0B' : '#3B82F6';
  const emoji = isDown ? '🚨' : isRecovery ? '✅' : isSsl ? '⚠️' : '🔔';
  const title = isDown
    ? `Downtime Incident: ${payload.monitor.name} is DOWN`
    : isRecovery
    ? `Service Recovered: ${payload.monitor.name} is back UP`
    : isSsl
    ? `SSL Certificate Warning: ${payload.monitor.name}`
    : `Test Notification: ${payload.monitor.name}`;

  const statusText = isDown
    ? `❌ DOWN (${payload.incident?.error || 'Unresponsive'})`
    : isRecovery
    ? `✅ Operational`
    : isSsl
    ? `⚠️ ${payload.incident?.error || 'Expiring soon'}`
    : `🟢 Test Active`;

  const dashboardUrl = payload.dashboard_url || 'https://dashboard.pingava.com/monitors';

  return {
    text: `${emoji} [Pingava] ${title}`,
    attachments: [
      {
        color,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} ${title}`,
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Monitor:*\n<${payload.monitor.url}|${payload.monitor.name}>`
              },
              {
                type: 'mrkdwn',
                text: `*Status:*\n${statusText}`
              },
              {
                type: 'mrkdwn',
                text: `*Latency:*\n${payload.incident?.response_time_ms ? `${payload.incident.response_time_ms} ms` : 'N/A'}`
              },
              {
                type: 'mrkdwn',
                text: `*Timestamp:*\n<!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs} UTC|${new Date().toISOString()}>`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View in Pingava Dashboard',
                  emoji: true
                },
                url: dashboardUrl,
                style: isDown ? 'danger' : 'primary'
              }
            ]
          }
        ]
      }
    ]
  };
}

/**
 * Formats a Discord Webhook payload with rich embeds.
 */
function buildDiscordPayload(payload: WebhookDispatchPayload) {
  const isDown = payload.kind === 'down';
  const isRecovery = payload.kind === 'recovery';
  const isSsl = payload.kind === 'ssl_expiring';

  // Discord decimal colors: Red: 0xEF4444 (15680580), Green: 0x10B981 (1096065), Amber: 0xF59E0B (16096779), Blue: 0x3B82F6 (3900150)
  const color = isDown ? 15680580 : isRecovery ? 1096065 : isSsl ? 16096779 : 3900150;
  const emoji = isDown ? '🚨' : isRecovery ? '✅' : isSsl ? '⚠️' : '🔔';
  const title = isDown
    ? `${emoji} Downtime Detected: ${payload.monitor.name}`
    : isRecovery
    ? `${emoji} Service Recovered: ${payload.monitor.name}`
    : isSsl
    ? `${emoji} SSL Expiry Alert: ${payload.monitor.name}`
    : `${emoji} Pingava Test Webhook`;

  const dashboardUrl = payload.dashboard_url || 'https://dashboard.pingava.com/monitors';

  return {
    username: 'Pingava Uptime',
    avatar_url: 'https://pingava.com/pingava-mark.png',
    embeds: [
      {
        title,
        url: dashboardUrl,
        color,
        description: isDown
          ? `**${payload.monitor.name}** is not responding to synthetic health checks.`
          : isRecovery
          ? `**${payload.monitor.name}** has passed consecutive health checks and is fully operational.`
          : `Test webhook dispatched from Pingava monitoring engine.`,
        fields: [
          {
            name: 'Target URL',
            value: `[${payload.monitor.url}](${payload.monitor.url})`,
            inline: false
          },
          {
            name: 'Status / Detail',
            value: payload.incident?.error || (isRecovery ? '200 OK' : 'Operational'),
            inline: true
          },
          {
            name: 'Response Latency',
            value: payload.incident?.response_time_ms ? `${payload.incident.response_time_ms} ms` : 'N/A',
            inline: true
          }
        ],
        footer: {
          text: 'Pingava Synthetic Monitoring • Zero False Alarms'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };
}

/**
 * Formats a generic JSON webhook payload for custom backend servers, PagerDuty, or Zapier.
 */
function buildGenericPayload(payload: WebhookDispatchPayload) {
  return {
    event: `monitor.${payload.kind}`,
    event_id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    monitor: payload.monitor,
    incident: payload.incident || {
      timestamp: new Date().toISOString(),
      error: null,
      response_time_ms: 0
    },
    dashboard_url: payload.dashboard_url || 'https://dashboard.pingava.com/monitors'
  };
}

/**
 * Dispatches an alert to an external webhook URL with proper formatting, timeout, and response tracking.
 */
export async function dispatchWebhook(
  targetUrl: string,
  payload: WebhookDispatchPayload,
  timeoutMs: number = 7000
): Promise<WebhookDispatchResult> {
  const deliveredAt = new Date().toISOString();

  if (!targetUrl || (!targetUrl.startsWith('https://') && !targetUrl.startsWith('http://'))) {
    return {
      success: false,
      status_code: null,
      error: 'Invalid webhook URL (must be HTTPS)',
      delivered_at: deliveredAt
    };
  }

  const service = detectWebhookService(targetUrl);
  let requestBody: any;

  if (service === 'slack') {
    requestBody = buildSlackPayload(payload);
  } else if (service === 'discord') {
    requestBody = buildDiscordPayload(payload);
  } else {
    requestBody = buildGenericPayload(payload);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Pingava-Alert-Dispatcher/2.0 (+https://pingava.com)',
        'X-Pingava-Event': `monitor.${payload.kind}`,
        'X-Pingava-Timestamp': deliveredAt
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timer);

    let responseSnippet: string | null = null;
    try {
      const text = await response.text();
      responseSnippet = text.slice(0, 250);
    } catch {
      // Body reading error is non-critical
    }

    const isSuccess = response.status >= 200 && response.status < 300;
    const errorDetail = isSuccess ? null : `HTTP ${response.status}: ${responseSnippet || response.statusText || 'Delivery rejected'}`;
    observability.recordWebhookAttempt(isSuccess, errorDetail || undefined);

    return {
      success: isSuccess,
      status_code: response.status,
      error: errorDetail,
      response_body: responseSnippet,
      delivered_at: deliveredAt
    };
  } catch (err: any) {
    clearTimeout(timer);
    const isTimeout = err.name === 'AbortError';
    const errorMessage = isTimeout
      ? `Delivery timed out after ${timeoutMs}ms`
      : err.message || 'Network connection failed';

    observability.recordWebhookAttempt(false, errorMessage);

    return {
      success: false,
      status_code: null,
      error: errorMessage,
      delivered_at: deliveredAt
    };
  }
}
