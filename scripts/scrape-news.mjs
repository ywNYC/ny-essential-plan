#!/usr/bin/env node
// 零依赖抓取脚本：NYSOH 新闻列表 + health.ny.gov 新闻稿列表，按关键词过滤出跟
// Essential Plan / 医保覆盖相关的条目，写到 public/news.json。
// 用法：node scripts/scrape-news.mjs
// 可配合 GitHub Actions 定时跑（参考 GCTracker 的 scrape-bulletin 自动化模式）。

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '..', 'public', 'news.json');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const KEYWORDS = /essential plan|health coverage|qualified health plan|marketplace|medicaid|health insurance|nystateofhealth|1332 waiver/i;

async function fetchText(url) {
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!resp.ok) throw new Error(`${url} -> HTTP ${resp.status}`);
  return resp.text();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, '')).trim();
}

async function scrapeNysoh() {
  const html = await fetchText('https://info.nystateofhealth.ny.gov/news');
  const items = [];
  const articleRe = /<article class="node node--type-news[^"]*"[\s\S]*?<\/article>/g;
  const blocks = html.match(articleRe) || [];
  for (const block of blocks) {
    const hrefMatch = block.match(/<a href="(\/news\/[^"]+)"/);
    const titleMatch = block.match(/field--name-title[^>]*>([\s\S]*?)<\/span>/);
    const dateMatch = block.match(/datetime="([^"]+)"/);
    if (!hrefMatch || !titleMatch) continue;
    const title = stripTags(titleMatch[1]);
    if (!KEYWORDS.test(title)) continue;
    items.push({
      title,
      url: 'https://info.nystateofhealth.ny.gov' + hrefMatch[1],
      date: dateMatch ? dateMatch[1].slice(0, 10) : null,
      source: 'NY State of Health',
    });
  }
  return items;
}

async function scrapeHealthNy() {
  const html = await fetchText('https://www.health.ny.gov/press/releases/2026/');
  const items = [];
  // 结构: <h2>Month Day, Year</h2> 后面跟若干 <li><a href="...">Title</a></li>，直到下一个 <h2>
  const parts = html.split(/<h2>/).slice(1);
  for (const part of parts) {
    const headingMatch = part.match(/^([^<]+)<\/h2>/);
    const dateHeading = headingMatch ? headingMatch[1].trim() : null;
    const dateIso = dateHeading ? isoFromLongDate(dateHeading) : null;
    const liRe = /<li><a href="([^"]+)">([\s\S]*?)<\/a><\/li>/g;
    let m;
    while ((m = liRe.exec(part))) {
      const title = stripTags(m[2]);
      if (!KEYWORDS.test(title)) continue;
      let url = m[1];
      if (url.startsWith('/')) url = 'https://www.health.ny.gov' + url;
      items.push({ title, url, date: dateIso, source: 'NYS Dept. of Health' });
    }
  }
  return items;
}

function isoFromLongDate(s) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

async function main() {
  const results = [];
  const errors = [];

  for (const [name, fn] of [['nysoh', scrapeNysoh], ['health.ny.gov', scrapeHealthNy]]) {
    try {
      const items = await fn();
      results.push(...items);
      console.log(`[${name}] ${items.length} 条相关新闻`);
    } catch (err) {
      console.error(`[${name}] 抓取失败:`, err.message);
      errors.push({ source: name, error: err.message });
    }
  }

  // 去重 + 按日期倒序
  const seen = new Set();
  const dedup = results.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
  dedup.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), items: dedup, errors }, null, 2)
  );
  console.log(`写入 ${OUT_PATH}，共 ${dedup.length} 条`);
  if (errors.length && dedup.length === 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
