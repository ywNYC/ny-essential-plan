import React from 'react';
import { IMMIGRATION_STATUS_GUIDE } from '../data/content.js';

const BADGE = {
  'income-based': { label: '按收入档位判断', bg: '#f1e5c2', text: '#8a5a00' },
  high: { label: '门槛更低，风险更高', bg: '#efd9d9', text: '#8c1919' },
  unrelated: { label: '本次变化基本不涉及', bg: '#e4ece3', text: '#0a3a23' },
};

export default function ImmigrationGuide() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">按移民身份看影响</h2>
        <p className="text-sm text-[#6b6f75] mt-1">
          不同身份受这次 EP 200-250 终止的影响程度不一样，DACA 身份门槛尤其低，务必单独确认。
        </p>
      </div>

      <div className="space-y-3">
        {IMMIGRATION_STATUS_GUIDE.map((item) => {
          const badge = BADGE[item.affected];
          return (
            <div key={item.status} className="border border-[#d6cfbb] rounded p-4 bg-white/60">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-bold text-[#111418]">{item.status}</div>
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ background: badge.bg, color: badge.text }}
                >
                  {badge.label}
                </span>
              </div>
              <div className="text-sm text-[#3a3f45] mt-2 leading-relaxed">{item.impact}</div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-[#8a8f96] leading-relaxed">
        以上为基于公开新闻和 NYSOH/州政府新闻稿整理的通用情况说明，不构成法律或移民建议。具体身份的资格判定，建议联系持牌经纪人或移民法律援助机构核实。
      </div>
    </div>
  );
}
