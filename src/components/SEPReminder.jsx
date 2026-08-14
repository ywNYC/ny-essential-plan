import React, { useState } from 'react';

export default function SEPReminder() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const resp = await fetch('/api/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, phone: phone || undefined, deadline }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setStatus('error');
        setMessage(data.error || `HTTP ${resp.status}`);
        return;
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setMessage('本地 npm run dev 环境没有 /api/remind（Pages Functions 需要部署或 wrangler pages dev 才能跑），部署后再测。');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">短信 / 邮件提醒</h2>
        <p className="text-sm text-[#6b6f75] mt-1 leading-relaxed">
          留邮箱和/或手机号 + 转保截止日，截止日前 14 天、7 天、1 天各提醒一次。邮件走 Resend（复用 rate.jmjvc.us 同一个账号），短信走 Twilio——目前还没申请 Twilio 账号，部署前需要先注册并把 API key 配进 Cloudflare Pages 环境变量。
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-[#111418]">邮箱（可选）</span>
          <input
            type="email"
            className="mt-1 w-full border border-[#d6cfbb] rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#111418]">手机号（可选，E.164 格式）</span>
          <input
            type="tel"
            className="mt-1 w-full border border-[#d6cfbb] rounded px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+12125551234"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#111418]">转保截止日</span>
          <input
            type="date"
            required
            className="mt-1 w-full border border-[#d6cfbb] rounded px-3 py-2"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={status === 'sending' || (!email && !phone) || !deadline}
          className="px-4 py-2 rounded bg-[#0e4d2e] text-white font-semibold disabled:opacity-50"
        >
          {status === 'sending' ? '提交中…' : '设置提醒'}
        </button>
      </form>

      {status === 'done' && (
        <div className="rounded p-3 bg-[#e4ece3] border border-[#93b7a0] text-sm text-[#0a3a23]">
          已设置，会在截止日前 14/7/1 天提醒你。
        </div>
      )}
      {status === 'error' && (
        <div className="rounded p-3 bg-[#efd9d9] border border-[#c98a8a] text-sm text-[#8c1919]">{message}</div>
      )}

      <p className="text-xs text-[#8a8f96]">
        不想等短信/邮件基础设施，也可以直接用「来信解读」页生成 .ics 日历文件，加到手机日历里，零账号依赖。
      </p>
    </div>
  );
}
