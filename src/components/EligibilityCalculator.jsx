import React, { useMemo, useState } from 'react';
import { fplForSize } from '../data/content.js';

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

const STATUS_OPTIONS = [
  { value: 'lpr', label: '绿卡 / 公民 / 难民 / 庇护等传统合法居留' },
  { value: 'daca', label: 'DACA（追梦人）' },
  { value: 'nonimmigrant', label: '工签 / 学生签等非移民身份' },
];

function evaluate({ income, size, status, employerCoverage, medicaidEligible }) {
  const fpl100 = fplForSize(size);
  const pct = (income / fpl100) * 100;

  if (status === 'nonimmigrant') {
    return {
      verdict: 'not-eligible',
      title: '大概率不符合 Essential Plan',
      detail: '工签、学生签等非移民身份通常不满足 Essential Plan 的"相应移民身份要求"这一前提条件，这次政策变化不改变这一点。建议咨询雇主医保或 Marketplace 上其他选项。',
    };
  }
  if (employerCoverage) {
    return {
      verdict: 'not-eligible',
      title: '有雇主医保，不符合条件',
      detail: 'Essential Plan 要求"没有雇主医保"，如果你已经有雇主提供的保险，通常不符合 EP 申请条件。',
    };
  }
  if (medicaidEligible) {
    return {
      verdict: 'not-eligible',
      title: '可能更适合白卡 / 儿童白卡 / CHP',
      detail: '如果你已符合白卡（Medicaid）、儿童白卡或 CHP，Essential Plan 条件里明确排除这部分人群，你应该优先看那几个项目。',
    };
  }

  if (status === 'daca') {
    const daca138 = fpl100 * 1.38;
    if (income > daca138) {
      return {
        verdict: 'not-eligible',
        title: 'DACA 身份：收入超过 138% FPL，不符合任何 NYSOH 项目',
        detail: `按你填的家庭人数，138% FPL 约为 ${money(daca138)}/年。DACA 身份不享受 200% FPL 这条保护线，超过 138% FPL 就不符合任何 NYSOH 项目，建议直接联系经纪人了解其他选项。`,
      };
    }
    return {
      verdict: 'eligible',
      title: 'DACA 身份：收入在 138% FPL 以下，符合条件',
      detail: `按你填的家庭人数，138% FPL 约为 ${money(daca138)}/年，你的收入在这条线以下，仍符合 NYSOH 项目条件。建议关注收入变化，一旦超过这条线会立刻失去资格。`,
    };
  }

  // lpr / 传统合法居留身份：按 200% / 250% FPL 分档
  const fpl200 = fpl100 * 2;
  const fpl250 = fpl100 * 2.5;

  if (pct < 200) {
    return {
      verdict: 'eligible',
      title: '继续符合 Essential Plan（Basic Health Program）',
      detail: `按你填的家庭人数，200% FPL 约为 ${money(fpl200)}/年，你的收入在这条线以下。2026-07-01 的政策变化不影响你，继续享受 $0 保费等现有保障。`,
    };
  }
  if (pct <= 250) {
    return {
      verdict: 'transitioning',
      title: '属于 EP 200-250，2026-07-01 起失去 Essential Plan 资格',
      detail: `按你填的家庭人数，200% FPL 约为 ${money(fpl200)}/年，250% FPL 约为 ${money(fpl250)}/年，你的收入落在这个区间。你会在 2026-04-01 前后收到 NYSOH 通知信，信上的 Coverage End Date 起有 2 个月窗口转到 Qualified Health Plan，不要拖到保险中断才处理。`,
    };
  }
  return {
    verdict: 'not-eligible',
    title: '收入超过 250% FPL，不符合 Essential Plan',
    detail: `按你填的家庭人数，250% FPL 约为 ${money(fpl250)}/年，你的收入高于这条线，本来就不符合 Essential Plan，可以看 Marketplace 上的 Qualified Health Plan（部分档位仍有联邦税收抵免）。`,
  };
}

const VERDICT_STYLE = {
  eligible: { bg: '#e4ece3', border: '#93b7a0', text: '#0a3a23' },
  transitioning: { bg: '#f1e5c2', border: '#c9a94a', text: '#8a5a00' },
  'not-eligible': { bg: '#efd9d9', border: '#c98a8a', text: '#8c1919' },
};

export default function EligibilityCalculator() {
  const [income, setIncome] = useState(30000);
  const [size, setSize] = useState(1);
  const [status, setStatus] = useState('lpr');
  const [employerCoverage, setEmployerCoverage] = useState(false);
  const [medicaidEligible, setMedicaidEligible] = useState(false);

  const result = useMemo(
    () => evaluate({ income, size, status, employerCoverage, medicaidEligible }),
    [income, size, status, employerCoverage, medicaidEligible]
  );
  const style = VERDICT_STYLE[result.verdict];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">Essential Plan 资格速查</h2>
        <p className="text-sm text-[#6b6f75] mt-1">
          按 2026 年 FPL 数字和 2026-07-01 起生效的 EP 200-250 终止规则估算，不是官方裁定，最终以 NYSOH 审核结果为准。
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-[#111418]">家庭年收入（税前）</span>
          <input
            type="number"
            className="mt-1 w-full border border-[#d6cfbb] rounded px-3 py-2"
            value={income}
            min={0}
            onChange={(e) => setIncome(Number(e.target.value) || 0)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#111418]">家庭人数</span>
          <input
            type="number"
            className="mt-1 w-full border border-[#d6cfbb] rounded px-3 py-2"
            value={size}
            min={1}
            max={12}
            onChange={(e) => setSize(Number(e.target.value) || 1)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#111418]">移民 / 居留身份</span>
          <select
            className="mt-1 w-full border border-[#d6cfbb] rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={employerCoverage} onChange={(e) => setEmployerCoverage(e.target.checked)} />
          <span className="text-sm">有雇主提供的医保</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={medicaidEligible} onChange={(e) => setMedicaidEligible(e.target.checked)} />
          <span className="text-sm">已符合白卡 / 儿童白卡 / CHP</span>
        </label>
      </div>

      <div
        className="rounded p-4 border"
        style={{ background: style.bg, borderColor: style.border }}
      >
        <div className="font-bold" style={{ color: style.text }}>{result.title}</div>
        <div className="text-sm mt-2 leading-relaxed" style={{ color: style.text }}>{result.detail}</div>
      </div>
    </div>
  );
}
