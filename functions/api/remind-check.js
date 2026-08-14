// Cloudflare Pages Function: GET /api/remind-check?secret=...
// 由外部定时任务（GitHub Actions，见 .github/workflows/check-reminders.yml）每天调用一次，
// 扫描 KV 里所有 reminder:* 记录，给截止日前 14/7/1 天且还没发过那个里程碑的人发提醒。
//
// 需要的 bindings，在 remind.js 基础上再加一个：
//   - CRON_SECRET  (纯文本 secret，跟 GitHub Actions workflow 里配的一致，防止被陌生人调用触发滥发)

const MILESTONES = [14, 7, 1];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function sendMail(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) return { skipped: true };
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html, ...(text ? { text } : {}) }),
  });
  return { ok: resp.ok, status: resp.status };
}

async function sendSms(env, { to, body }) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) return { skipped: true };
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: env.TWILIO_FROM_NUMBER, Body: body }),
  });
  return { ok: resp.ok, status: resp.status };
}

function daysUntil(dateStr, now) {
  const target = new Date(dateStr + 'T00:00:00-05:00');
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.REMINDERS) return json({ success: false, error: 'KV namespace REMINDERS not bound' }, 500);

  const url = new URL(request.url);
  if (!env.CRON_SECRET || url.searchParams.get('secret') !== env.CRON_SECRET) {
    return json({ success: false, error: 'unauthorized' }, 401);
  }

  const now = new Date();
  const list = await env.REMINDERS.list({ prefix: 'reminder:' });
  let checked = 0;
  let sent = 0;

  for (const { name: key } of list.keys) {
    checked++;
    const raw = await env.REMINDERS.get(key);
    if (!raw) continue;
    const rec = JSON.parse(raw);
    const d = daysUntil(rec.deadline, now);
    const milestone = MILESTONES.find((m) => d === m);
    if (!milestone || rec.sentMilestones?.includes(milestone)) continue;

    const subject = `NY Essential Plan 转保截止还剩 ${milestone} 天`;
    const text = `你的转保截止日是 ${rec.deadline}，还剩 ${milestone} 天，别忘了处理。`;
    if (rec.email) await sendMail(env, { to: rec.email, subject, html: `<p>${text}</p>`, text });
    if (rec.phone) await sendSms(env, { to: rec.phone, body: text });

    rec.sentMilestones = [...(rec.sentMilestones || []), milestone];
    await env.REMINDERS.put(key, JSON.stringify(rec));
    sent++;
  }

  return json({ success: true, checked, sent });
}
