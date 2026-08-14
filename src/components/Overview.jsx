import React from 'react';
import { evaluateEligibility, VERDICT_STYLE } from '../lib/eligibility.js';
import { KEY_DATES } from '../data/content.js';
import { STRINGS } from '../lib/i18n.js';

const NEXT_STEPS = {
  eligible: {
    zh: ['继续留意每年 FPL 数字更新，收入变化时重新算一遍', '把「时间线」标签页收藏，关注后续政策动向'],
    tw: ['繼續留意每年 FPL 數字更新，收入變化時重新算一遍', '把「時間線」標籤頁收藏，關注後續政策動向'],
    en: ['Keep an eye on the yearly FPL update and re-check if your income changes', 'Bookmark the Timeline tab to track further policy moves'],
  },
  transitioning: {
    zh: ['收到 NYSOH 信后，用「来信解读」提取 Coverage End Date', '设置「提醒」，2 个月转保窗口别错过', '去「QHP / 经纪人」页看替代方案'],
    tw: ['收到 NYSOH 信後，用「來信解讀」提取 Coverage End Date', '設置「提醒」，2 個月轉保窗口別錯過', '去「QHP / 經紀人」頁看替代方案'],
    en: ['Once your NYSOH letter arrives, use the Notice Reader to pull the Coverage End Date', 'Set a Reminder so you don’t miss the 2-month switch window', 'Check the QHP / Brokers tab for alternatives'],
  },
  'not-eligible': {
    zh: ['去「QHP / 经纪人」页看 Marketplace 上的其他选项', '不确定的话，联系持牌经纪人核实一遍'],
    tw: ['去「QHP / 經紀人」頁看 Marketplace 上的其他選項', '不確定的話，聯繫持牌經紀人核實一遍'],
    en: ['Check the QHP / Brokers tab for other Marketplace options', 'When in doubt, confirm with a licensed broker'],
  },
};

const SECTION_LABEL = {
  zh: { verdict: '你的情况', nextSteps: '接下来做什么', timeline: '相关时间节点', exploreTitle: '纽约健保追踪', exploreBody: 'Essential Plan 收入 200%-250% FPL 的那一档，将在 2026-07-01 起失去资格。填一下你的情况，我们直接告诉你受不受影响；也可以先看其他标签页了解政策背景。', redo: '重新填写' },
  tw: { verdict: '你的情況', nextSteps: '接下來做什麼', timeline: '相關時間節點', exploreTitle: '紐約健保追蹤', exploreBody: 'Essential Plan 收入 200%-250% FPL 的那一檔，將在 2026-07-01 起失去資格。填一下你的情況，我們直接告訴你受不受影響；也可以先看其他標籤頁了解政策背景。', redo: '重新填寫' },
  en: { verdict: 'Your situation', nextSteps: 'What to do next', timeline: 'Relevant dates', exploreTitle: 'NY Essential Plan Tracker', exploreBody: 'The Essential Plan tier for 200%-250% FPL income loses eligibility starting 2026-07-01. Fill in your situation and we’ll tell you directly whether it affects you — or browse the other tabs first for background.', redo: 'Redo intake' },
};

export default function Overview({ lang, userCase, onRedo }) {
  const t = STRINGS[lang] || STRINGS.zh;
  const s = SECTION_LABEL[lang] || SECTION_LABEL.zh;

  if (!userCase) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="rounded p-5" style={{ background: 'var(--ep-surface)', border: '1px solid var(--ep-rule)', borderTop: '3px solid var(--ep-green)' }}>
          <div className="ep-eyebrow" style={{ color: 'var(--ep-green)' }}>{t.exploreBadge}</div>
          <h2 className="ep-serif" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ep-ink)', margin: '6px 0' }}>{s.exploreTitle}</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ep-ink-soft)', lineHeight: 1.7 }}>{s.exploreBody}</p>
          <button
            onClick={onRedo}
            className="mt-4"
            style={{ padding: '10px 16px', background: 'var(--ep-green)', color: 'var(--ep-surface)', fontWeight: 700, fontSize: '13.5px', borderRadius: 'var(--ep-radius-sm)', border: 'none', cursor: 'pointer' }}
          >
            {t.haveCase}
          </button>
        </div>
      </div>
    );
  }

  const result = evaluateEligibility(userCase, lang);
  const style = VERDICT_STYLE[result.verdict];
  const steps = NEXT_STEPS[result.verdict][lang] || NEXT_STEPS[result.verdict].zh;
  const nextDate = KEY_DATES.find((d) => new Date(d.date) >= new Date());

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="ep-eyebrow" style={{ color: 'var(--ep-green)' }}>{s.verdict}</div>
        <button onClick={onRedo} style={{ fontSize: '12px', color: 'var(--ep-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          {s.redo}
        </button>
      </div>

      <div className="rounded p-5" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
        <h2 className="ep-serif" style={{ fontSize: '19px', fontWeight: 700, color: style.text, margin: 0, lineHeight: 1.3 }}>{result.title}</h2>
        <p style={{ fontSize: '13.5px', color: style.text, marginTop: '10px', lineHeight: 1.75 }}>{result.detail}</p>
      </div>

      <div className="rounded p-4" style={{ background: 'var(--ep-surface)', border: '1px solid var(--ep-rule)' }}>
        <div className="ep-eyebrow" style={{ color: 'var(--ep-green)', marginBottom: '8px' }}>{s.nextSteps}</div>
        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {steps.map((step, i) => (
            <li key={i} style={{ fontSize: '13px', color: 'var(--ep-ink-soft)', lineHeight: 1.6 }}>{step}</li>
          ))}
        </ul>
      </div>

      {nextDate && (
        <div className="rounded p-4" style={{ background: 'var(--ep-surface)', border: '1px solid var(--ep-rule)' }}>
          <div className="ep-eyebrow" style={{ color: 'var(--ep-green)', marginBottom: '6px' }}>{s.timeline}</div>
          <div className="ep-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ep-green)' }}>{nextDate.date}</div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ep-ink)', marginTop: '2px' }}>{nextDate.title}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--ep-muted)', marginTop: '4px', lineHeight: 1.6 }}>{nextDate.detail}</div>
        </div>
      )}
    </div>
  );
}
