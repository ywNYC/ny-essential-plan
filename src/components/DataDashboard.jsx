import React, { useEffect, useState } from 'react';

const CATALOG_API = 'https://api.us.socrata.com/api/catalog/v1?domains=health.data.ny.gov&limit=6&q=';
const QUERIES = ['essential plan', 'health plan enrollment', 'medicaid enrollment', 'child health plus enrollment'];

export default function DataDashboard() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = [];
        const seen = new Set();
        for (const q of QUERIES) {
          const resp = await fetch(CATALOG_API + encodeURIComponent(q));
          if (!resp.ok) continue;
          const data = await resp.json();
          for (const r of data.results || []) {
            if (seen.has(r.resource.id)) continue;
            seen.add(r.resource.id);
            all.push({
              id: r.resource.id,
              name: r.resource.name,
              updatedAt: r.resource.updatedAt,
              link: r.link,
            });
          }
        }
        if (!cancelled) setResults(all);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">官方数据</h2>
        <p className="text-sm text-[#6b6f75] mt-1 leading-relaxed">
          说明：health.data.ny.gov 的开放数据目录里，目前没有一份现成的"Essential Plan 参保人数趋势"数据集（已实测查询，没找到）。
          真实的参保数字以 NYSOH 官方发布的登记报告（PDF）为准：
          {' '}
          <a href="https://info.nystateofhealth.ny.gov/enrollmentdata" target="_blank" rel="noreferrer" className="underline text-[#0e4d2e]">
            info.nystateofhealth.ny.gov/enrollmentdata
          </a>
          。下面是从开放数据目录实时搜到的相关数据集，可以点进去看有没有你需要的口径。
        </p>
      </div>

      {error && <div className="text-sm text-[#8c1919]">数据目录接口访问失败：{error}</div>}
      {!error && results === null && <div className="text-sm text-[#6b6f75]">正在从 health.data.ny.gov 查询相关数据集…</div>}
      {results && results.length === 0 && (
        <div className="text-sm text-[#6b6f75]">没搜到相关数据集，直接看上面的官方 PDF 报告页。</div>
      )}

      <div className="space-y-2">
        {(results || []).map((r) => (
          <a
            key={r.id}
            href={r.link}
            target="_blank"
            rel="noreferrer"
            className="block border border-[#d6cfbb] rounded p-3 bg-white/60 hover:bg-white"
          >
            <div className="font-semibold text-[#111418] text-sm">{r.name}</div>
            <div className="text-xs text-[#8a8f96] mt-1">
              {r.updatedAt ? `更新于 ${r.updatedAt.slice(0, 10)}` : ''} · health.data.ny.gov/{r.id}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
