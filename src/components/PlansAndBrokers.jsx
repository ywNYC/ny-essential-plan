import React from 'react';
import { QHP_COMPARISON_TEMPLATE, BROKER_DIRECTORY } from '../data/content.js';

export default function PlansAndBrokers() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">Qualified Health Plan 对比</h2>
        <p className="text-sm text-[#6b6f75] mt-1">{QHP_COMPARISON_TEMPLATE.note}</p>
        <div className="overflow-x-auto mt-3">
          <table className="min-w-full text-sm border border-[#d6cfbb]">
            <thead>
              <tr className="bg-[#f1ede0]">
                {QHP_COMPARISON_TEMPLATE.columns.map((c) => (
                  <th key={c} className="text-left px-3 py-2 border-b border-[#d6cfbb] font-semibold text-[#111418]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QHP_COMPARISON_TEMPLATE.rows.length === 0 ? (
                <tr>
                  <td colSpan={QHP_COMPARISON_TEMPLATE.columns.length} className="px-3 py-6 text-center text-[#8a8f96]">
                    暂无数据 — 拿到真实报价后填入 src/data/content.js 的 QHP_COMPARISON_TEMPLATE.rows
                  </td>
                </tr>
              ) : (
                QHP_COMPARISON_TEMPLATE.rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#e5e0d0]">
                    {row.map((cell, j) => <td key={j} className="px-3 py-2">{cell}</td>)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#111418]">免费经纪人 / Navigator 名单</h2>
        <p className="text-sm text-[#6b6f75] mt-1">以下含占位条目，发布前请替换为核实过的真实联系方式。</p>
        <div className="space-y-3 mt-3">
          {BROKER_DIRECTORY.map((b, i) => (
            <div key={i} className="border border-[#d6cfbb] rounded p-4 bg-white/60 relative">
              {b.placeholder && (
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-[#efd9d9] text-[#8c1919] font-semibold">
                  待补充
                </span>
              )}
              <div className="font-bold text-[#111418]">{b.name}</div>
              {b.area && <div className="text-sm text-[#3a3f45] mt-1">服务范围：{b.area}</div>}
              {b.contact && <div className="text-sm text-[#3a3f45] mt-1">联系方式：{b.contact}</div>}
              <div className="text-xs text-[#6b6f75] mt-1">{b.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
