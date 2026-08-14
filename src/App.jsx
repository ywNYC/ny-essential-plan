import React, { useEffect, useState } from 'react';
import Overview from './components/Overview.jsx';
import Timeline from './components/Timeline.jsx';
import ImmigrationGuide from './components/ImmigrationGuide.jsx';
import FAQPage from './components/FAQ.jsx';
import PlansAndBrokers from './components/PlansAndBrokers.jsx';
import NoticeOCR from './components/NoticeOCR.jsx';
import DataDashboard from './components/DataDashboard.jsx';
import News from './components/News.jsx';
import SEPReminder from './components/SEPReminder.jsx';
import LanguageGateModal from './components/LanguageGateModal.jsx';
import IntakeModal from './components/IntakeModal.jsx';
import { LanguageContext, STRINGS } from './lib/i18n.js';

const TABS = [
  { id: 'overview', label: { zh: '我的方案', tw: '我的方案', en: 'My Plan' }, Comp: Overview },
  { id: 'timeline', label: { zh: '时间线', tw: '時間線', en: 'Timeline' }, Comp: Timeline },
  { id: 'notice', label: { zh: '来信解读', tw: '來信解讀', en: 'Notice Reader' }, Comp: NoticeOCR },
  { id: 'remind', label: { zh: '提醒', tw: '提醒', en: 'Reminders' }, Comp: SEPReminder },
  { id: 'immigration', label: { zh: '移民身份', tw: '移民身份', en: 'Immigration' }, Comp: ImmigrationGuide },
  { id: 'faq', label: { zh: 'FAQ', tw: 'FAQ', en: 'FAQ' }, Comp: FAQPage },
  { id: 'plans', label: { zh: 'QHP / 经纪人', tw: 'QHP / 經紀人', en: 'QHP / Brokers' }, Comp: PlansAndBrokers },
  { id: 'news', label: { zh: '新闻', tw: '新聞', en: 'News' }, Comp: News },
  { id: 'data', label: { zh: '官方数据', tw: '官方數據', en: 'Data' }, Comp: DataDashboard },
];

function readLS(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : raw;
  } catch { return fallback; }
}

export default function App() {
  const [lang, setLang] = useState(() => {
    const raw = readLS('ep_lang', 'zh');
    return ['zh', 'tw', 'en'].includes(raw) ? raw : 'zh';
  });
  useEffect(() => { try { window.localStorage.setItem('ep_lang', lang); } catch {} }, [lang]);

  // 语言门禁：只在真正第一次打开时弹一次（picked 或 intake 任一完成过就跳过），
  // 跟 GCTracker 的 hasPickedLanguage 逻辑一致，不打扰回访用户。
  const [hasPickedLanguage, setHasPickedLanguage] = useState(() => {
    return readLS('ep_lang_picked', null) === 'true' || readLS('ep_has_intake', null) === 'true';
  });

  const [hasIntake, setHasIntake] = useState(() => readLS('ep_has_intake', null) === 'true');
  const [userCase, setUserCase] = useState(() => {
    try {
      const raw = window.localStorage.getItem('ep_case');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [tab, setTab] = useState('overview');

  const t = STRINGS[lang] || STRINGS.zh;
  const ActiveComp = TABS.find((tb) => tb.id === tab)?.Comp || Overview;

  const completeIntake = (form) => {
    setUserCase(form);
    try { window.localStorage.setItem('ep_case', JSON.stringify(form)); } catch {}
    try { window.localStorage.setItem('ep_has_intake', 'true'); } catch {}
    setHasIntake(true);
    setTab('overview');
  };

  const explore = () => {
    try { window.localStorage.setItem('ep_has_intake', 'true'); } catch {}
    setHasIntake(true);
    setTab('overview');
  };

  const redoIntake = () => {
    try { window.localStorage.removeItem('ep_has_intake'); } catch {}
    setHasIntake(false);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {!hasPickedLanguage && (
        <LanguageGateModal
          onPick={(v) => {
            setLang(v);
            try { window.localStorage.setItem('ep_lang_picked', 'true'); } catch {}
            setHasPickedLanguage(true);
          }}
        />
      )}
      {hasPickedLanguage && !hasIntake && (
        <IntakeModal lang={lang} onComplete={completeIntake} onExplore={explore} />
      )}

      <div className="min-h-screen" style={{ background: 'var(--ep-paper)' }}>
        <header style={{ borderBottom: '2px solid var(--ep-ink)', background: 'var(--ep-surface)' }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-start justify-between gap-3">
            <div>
              <div className="ep-eyebrow">{t.brand}</div>
              <div className="ep-serif" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ep-ink)', marginTop: '4px' }}>
                {lang === 'en' ? 'NY Health Coverage Tracker' : lang === 'tw' ? '紐約健保追蹤' : '纽约健保追踪'}
              </div>
            </div>
            <div style={{ display: 'flex', border: '1px solid var(--ep-rule)', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
              {[{ v: 'zh', label: '简' }, { v: 'tw', label: '繁' }, { v: 'en', label: 'EN' }].map((o, i) => (
                <button
                  key={o.v}
                  onClick={() => setLang(o.v)}
                  style={{
                    padding: '5px 9px', fontSize: '11px', fontWeight: 700,
                    borderLeft: i === 0 ? 'none' : '1px solid var(--ep-rule-soft)',
                    background: lang === o.v ? 'var(--ep-green)' : 'transparent',
                    color: lang === o.v ? 'var(--ep-surface)' : 'var(--ep-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <nav className="max-w-2xl mx-auto px-4 pb-2 flex flex-wrap gap-2">
            {TABS.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className="text-xs px-3 py-1.5 rounded font-semibold"
                style={{
                  background: tab === tb.id ? 'var(--ep-green)' : 'var(--ep-paper-soft)',
                  color: tab === tb.id ? 'var(--ep-surface)' : 'var(--ep-ink-soft)',
                }}
              >
                {tb.label[lang] || tb.label.zh}
              </button>
            ))}
          </nav>
        </header>

        <main className="py-6">
          {tab === 'overview' ? (
            <Overview lang={lang} userCase={userCase} onRedo={redoIntake} />
          ) : (
            <ActiveComp />
          )}
        </main>

        <footer className="max-w-2xl mx-auto px-4 py-8 text-xs border-t mt-8" style={{ color: 'var(--ep-muted-soft)', borderColor: 'var(--ep-rule)', lineHeight: 1.7 }}>
          {lang === 'en'
            ? 'This is an independent information tool, not the official NY State of Health site, and is not legal or insurance advice. Eligibility is decided by your official NYSOH letter and '
            : lang === 'tw'
            ? '本站為個人整理的資訊工具，非 NY State of Health 官方網站，不構成法律或保險建議。資格判定以你收到的 NYSOH 官方信件和 '
            : '本站为个人整理的信息工具，非 NY State of Health 官方网站，不构成法律或保险建议。资格判定以你收到的 NYSOH 官方信件和 '}
          <a className="underline" href="https://info.nystateofhealth.ny.gov" target="_blank" rel="noreferrer">nystateofhealth.ny.gov</a>
          {lang === 'en' ? '.' : lang === 'tw' ? '為準。' : '为准。'}
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}
