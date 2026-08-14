import React, { useState } from 'react';
import EligibilityCalculator from './components/EligibilityCalculator.jsx';
import Timeline from './components/Timeline.jsx';
import ImmigrationGuide from './components/ImmigrationGuide.jsx';
import FAQPage from './components/FAQ.jsx';
import PlansAndBrokers from './components/PlansAndBrokers.jsx';
import NoticeOCR from './components/NoticeOCR.jsx';
import DataDashboard from './components/DataDashboard.jsx';
import News from './components/News.jsx';
import SEPReminder from './components/SEPReminder.jsx';

const TABS = [
  { id: 'calc', label: '资格计算器', Comp: EligibilityCalculator },
  { id: 'timeline', label: '时间线', Comp: Timeline },
  { id: 'notice', label: '来信解读', Comp: NoticeOCR },
  { id: 'remind', label: '提醒', Comp: SEPReminder },
  { id: 'immigration', label: '移民身份', Comp: ImmigrationGuide },
  { id: 'faq', label: 'FAQ', Comp: FAQPage },
  { id: 'plans', label: 'QHP / 经纪人', Comp: PlansAndBrokers },
  { id: 'news', label: '新闻', Comp: News },
  { id: 'data', label: '官方数据', Comp: DataDashboard },
];

export default function App() {
  const [tab, setTab] = useState('calc');
  const Active = TABS.find((t) => t.id === tab)?.Comp || EligibilityCalculator;

  return (
    <div className="min-h-screen bg-[#f6f2e8]">
      <header className="border-b-2 border-[#111418] bg-[#fdfcf7]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="text-xs tracking-[0.2em] text-[#6b6f75] uppercase">NY Essential Plan Tracker</div>
          <div className="text-xl font-bold text-[#111418] mt-1" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            纽约健保追踪
          </div>
        </div>
        <nav className="max-w-2xl mx-auto px-4 pb-2 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded font-semibold ${
                tab === t.id ? 'bg-[#0e4d2e] text-white' : 'bg-[#f1ede0] text-[#3a3f45]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="py-6">
        <Active />
      </main>

      <footer className="max-w-2xl mx-auto px-4 py-8 text-xs text-[#8a8f96] leading-relaxed border-t border-[#d6cfbb] mt-8">
        本站为个人整理的信息工具，非 NY State of Health 官方网站，不构成法律或保险建议。
        资格判定以你收到的 NYSOH 官方信件和 <a className="underline" href="https://info.nystateofhealth.ny.gov" target="_blank" rel="noreferrer">nystateofhealth.ny.gov</a> 为准。
      </footer>
    </div>
  );
}
