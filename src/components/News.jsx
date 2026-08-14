import React, { useEffect, useState } from 'react';

export default function News() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/news.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">政策新闻</h2>
        <p className="text-sm text-[#6b6f75] mt-1">
          抓自 NY State of Health 官网新闻页 + health.ny.gov 新闻稿列表，只保留跟保险/医保覆盖相关的条目。
          {data && ` 抓取于 ${new Date(data.fetchedAt).toLocaleString('zh-CN', { timeZone: 'America/New_York' })} EST。`}
        </p>
        <p className="text-xs text-[#8a8f96] mt-1">
          本地跑 <code className="bg-[#f1ede0] px-1 rounded">npm run scrape:news</code> 手动刷新；要自动刷新需要接 GitHub Actions 定时任务（参考 GCTracker 的 scrape-bulletin 自动化，本项目暂未启用）。
        </p>
      </div>

      {error && <div className="text-sm text-[#8c1919]">加载失败：{error}（先跑一次 npm run scrape:news 生成 public/news.json）</div>}
      {!error && !data && <div className="text-sm text-[#6b6f75]">加载中…</div>}

      <div className="space-y-2">
        {(data?.items || []).map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block border border-[#d6cfbb] rounded p-3 bg-white/60 hover:bg-white"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded bg-[#e4ece3] text-[#0a3a23] font-semibold">{item.source}</span>
              {item.date && <span className="text-xs text-[#8a8f96] font-mono">{item.date}</span>}
            </div>
            <div className="text-sm font-semibold text-[#111418] mt-2 leading-relaxed">{item.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
