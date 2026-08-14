import React from 'react';
import { KEY_DATES, SEP_WINDOW_MONTHS } from '../data/content.js';

function daysUntil(dateStr) {
  const target = new Date(dateStr + 'T00:00:00-05:00');
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export default function Timeline() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">EP 200-250 终止时间线</h2>
        <p className="text-sm text-[#6b6f75] mt-1">
          只影响收入 200%-250% FPL 的人群；200% FPL 以下继续享受现有 Essential Plan 保障。
        </p>
      </div>

      <div className="space-y-4">
        {KEY_DATES.map((ev) => {
          const d = daysUntil(ev.date);
          const passed = d < 0;
          return (
            <div key={ev.date} className="border border-[#d6cfbb] rounded p-4 bg-white/60">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-mono text-sm text-[#0e4d2e] font-bold">{ev.date}</div>
                <div className={`text-xs px-2 py-0.5 rounded ${passed ? 'bg-[#e5e5e5] text-[#6b6f75]' : 'bg-[#e4ece3] text-[#0a3a23]'}`}>
                  {passed ? `已过去 ${Math.abs(d)} 天` : `还剩 ${d} 天`}
                </div>
              </div>
              <div className="font-bold text-[#111418] mt-1">{ev.title}</div>
              <div className="text-sm text-[#3a3f45] mt-1 leading-relaxed">{ev.detail}</div>
              <a href={ev.source} target="_blank" rel="noreferrer" className="text-xs text-[#0e4d2e] underline mt-2 inline-block">
                查看信息来源
              </a>
            </div>
          );
        })}
      </div>

      <div className="rounded p-4 bg-[#f1e5c2] border border-[#c9a94a]">
        <div className="font-bold text-[#8a5a00]">2 个月转换窗口（Special Enrollment Period）</div>
        <div className="text-sm text-[#8a5a00] mt-1 leading-relaxed">
          如果你收到 NYSOH 通知信，窗口期是从信上的 <b>Coverage End Date</b> 起算 {SEP_WINDOW_MONTHS} 个月，不是从今天起算——具体日期以你收到的信为准，可以用下面「来信解读」工具提取。
        </div>
      </div>
    </div>
  );
}
