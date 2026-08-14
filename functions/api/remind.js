// Cloudflare Pages Function: POST /api/remind
// 注册一条 SEP（Special Enrollment Period）转保截止提醒。立即发一封/条确认，
// 到期前的提醒由 functions/api/remind-check.js 配合定时任务发送。
//
// 需要的 bindings (Cloudflare Pages → Settings → Variables and Secrets):
//   - REMINDERS         (KV namespace binding)
//   - RESEND_API_KEY     (加密 secret —— 跟 rate.jmjvc.us / gc.jmjvc.us 共用同一个 key)
//   - RESEND_FROM        (纯文本，例如 "NY Essential Plan Tracker <notice@mail.jmjvc.us>")
// 可选（要发短信才需要，目前没有现成账号，需要新申请 Twilio）：
//   - TWILIO_ACCOUNT_SID
//   - TWILIO_AUTH_TOKEN
//   - TWILIO_FROM_NUMBER  (Twilio 购买的发送号码，E.164 格式，如 +1XXXXXXXXXX)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

const isValidEmail = (e) => typeof e === 'string' && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p) => typeof p === 'string' && /^\+1\d{10}$/.test(p);
const isValidDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(d).getTime());

async function sendMail(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) return { skipped: true, reason: 'resend not configured' };
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html, ...(text ? { text } : {}) }),
  });
  if (!resp.ok) return { ok: false, status: resp.status, body: await resp.text() };
  return { ok: true };
}

async function sendSms(env, { to, body }) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    return { skipped: true, reason: 'twilio not configured' };
  }
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: env.TWILIO_FROM_NUMBER, Body: body }),
  });
  if (!resp.ok) return { ok: false, status: resp.status, body: await resp.text() };
  return { ok: true };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.REMINDERS) return json({ success: false, error: 'KV namespace REMINDERS not bound' }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ success: false, error: 'Invalid JSON' }, 400); }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const deadline = body?.deadline;

  if (!isValidDate(deadline)) return json({ success: false, error: 'deadline must be YYYY-MM-DD' }, 400);
  if (!email && !phone) return json({ success: false, error: 'need email or phone' }, 400);
  if (email && !isValidEmail(email)) return json({ success: false, error: 'invalid email' }, 400);
  if (phone && !isValidPhone(phone)) return json({ success: false, error: 'phone must be E.164, e.g. +12125551234' }, 400);

  const key = `reminder:${email || phone}`;
  const record = {
    email: email || null,
    phone: phone || null,
    deadline,
    createdAt: new Date().toISOString(),
    sentMilestones: [],
  };
  await env.REMINDERS.put(key, JSON.stringify(record));

  const results = {};
  if (email) {
    results.email = await sendMail(env, {
      to: email,
      subject: 'NY Essential Plan 转保提醒已设置',
      html: `<p>已记下你的转保截止日 <b>${deadline}</b>。在截止日前 14 天、7 天、1 天会再提醒你一次。</p>`,
      text: `已记下你的转保截止日 ${deadline}。截止日前 14/7/1 天会再提醒你一次。`,
    });
  }
  if (phone) {
    results.sms = await sendSms(env, {
      to: phone,
      body: `NY Essential Plan 提醒已设置，转保截止日 ${deadline}，到期前会再提醒你。`,
    });
  }

  return json({ success: true, results });
}
