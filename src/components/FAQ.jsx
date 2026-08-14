import React, { useState } from 'react';
import { FAQ } from '../data/content.js';

export default function FAQPage() {
  const [open, setOpen] = useState(() => new Set([0]));

  const toggle = (i) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">常见问题</h2>
        <p className="text-sm text-[#6b6f75] mt-1">中文整理，覆盖 Essential Plan 基本规则和这次政策变化的常见疑问。</p>
      </div>

      <div className="space-y-2">
        {FAQ.map((item, i) => {
          const isOpen = open.has(i);
          return (
            <div key={item.q} className="border border-[#d6cfbb] rounded overflow-hidden bg-white/60">
              <button
                className="w-full text-left px-4 py-3 font-semibold text-[#111418] flex items-center justify-between gap-2"
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <span className="text-[#6b6f75]">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-[#3a3f45] leading-relaxed">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
