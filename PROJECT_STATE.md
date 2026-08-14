# NY Essential Plan Tracker — 项目状态

架构照抄 GCTracker/rate-jmjvc-us 的模式：Vite + React + Tailwind 前端，Cloudflare Pages Functions 做后端，`scripts/*.mjs` 零依赖 Node 脚本抓数据，GitHub Actions 定时任务跑脚本（模板已就位，未接通触发——见下）。

**仓库**：`github.com/ywNYC/ny-essential-plan`（public）
**线上预览**：`https://ny-essential-plan.pages.dev`（Cloudflare Pages，2026-08-14 部署，已用 playwright 验证生产环境 console 零报错）

## 已完成（2026-08-13 本地验证通过，含 headless 浏览器截图 + console 零报错）

- `src/components/EligibilityCalculator.jsx` — 收入/家庭人数/移民身份 → EP 资格判定，200%/250%/138% FPL 三档逻辑
- `src/components/Timeline.jsx` — 关键日期倒计时（2025-07-04 H.R.1 签署 → 2026-07-01 EP 200-250 终止）
- `src/components/NoticeOCR.jsx` — Tesseract.js 浏览器本地 OCR + 手动日期输入，自动算 2 个月 SEP 截止日，导出 .ics
- `src/components/SEPReminder.jsx` + `functions/api/remind.js` + `functions/api/remind-check.js` — 邮件走 Resend（复用 rate.jmjvc.us 同一个 RESEND_API_KEY），短信走 Twilio（**尚未申请账号，占位 env var**）
- `src/components/ImmigrationGuide.jsx`、`FAQ.jsx`、`PlansAndBrokers.jsx` — 静态内容，QHP 对比表和经纪人名单**故意留空/占位**，避免展示编造数字
- `src/components/DataDashboard.jsx` — 实时查 health.data.ny.gov 开放数据目录（已实测，目录里没有现成的 Essential Plan 参保数据集，链接回官方 PDF 报告页）
- `src/components/News.jsx` + `scripts/scrape-news.mjs` — 抓 NYSOH + health.ny.gov 新闻页，关键词过滤，已实测抓到 10 条真实新闻写入 `public/news.json`

## 数据口径来源

FPL 数字、关键日期、DACA 138% 门槛等均见 `src/data/content.js` 顶部注释和各字段 `source` 链接，抓取于 2026-08-13，每年 FPL 会变，用前核对 NYSOH 官网。

## 还没做 / 需要业主决定

1. **Twilio 账号** — SMS 提醒代码已写好（`functions/api/remind.js` / `remind-check.js`），但 `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` 需要业主自己去 twilio.com 注册申请，我没法代开户
2. **QHP 对比表真实数据** — `src/data/content.js` 的 `QHP_COMPARISON_TEMPLATE.rows` 是空数组，需要经纪人拉 2026 实时报价后填入
3. **经纪人/Navigator 真实名单** — `BROKER_DIRECTORY` 目前是占位条目
4. **KV namespace 未绑定** — `REMINDERS` 还没在 Cloudflare Pages 项目里建、没绑定，所以线上 `/api/remind` 目前返回 500（已实测确认是「未绑定」的可控失败，不是崩溃）。要让提醒功能真正工作，需要：
   - Cloudflare 后台建一个 KV namespace，在 Pages 项目 Settings → Functions 里绑定为 `REMINDERS`
   - 配 `RESEND_API_KEY` / `RESEND_FROM`（可以直接复用 rate.jmjvc.us 那一份）
   - 配 `CRON_SECRET`（配合 `.github/workflows/check-reminders.yml`）
   - 要短信还要配三个 `TWILIO_*`
5. **两个 GitHub Actions cron 还没激活** — `.github/workflows/scrape-news.yml`、`check-reminders.yml` 已随仓库推送，但仓库 Settings → Actions → General → Workflow permissions 还没设成 "Read and write"（参考 GCTracker 当年踩的同一个坑），且 `check-reminders.yml` 依赖的 `SITE_URL`/`CRON_SECRET` repo secrets 还没配
6. **自定义域名** — 目前只有 `*.pages.dev` 预览地址，没接自定义域名

## 本地跑起来

```bash
cd ~/ny-essential-plan
npm install
npm run dev          # http://localhost:5174
npm run scrape:news  # 手动刷新 public/news.json
npm run build         # 生产构建，已验证无报错
```
