# NY Essential Plan Tracker — 项目状态

架构照抄 GCTracker/rate-jmjvc-us 的模式：Vite + React + Tailwind 前端，Cloudflare Pages Functions 做后端，`scripts/*.mjs` 零依赖 Node 脚本抓数据，GitHub Actions 定时任务跑脚本。

**仓库**：`github.com/ywNYC/ny-essential-plan`（public）
**线上预览**：`https://ny-essential-plan.pages.dev`（Cloudflare Pages，`wrangler pages deploy` 直传部署——**不像 GCTracker 那样连了 GitHub 自动部署**，git push 不会触发上线，改完必须手动 `wrangler pages deploy dist` 才会更新线上）

## 已完成

**核心链路（2026-08-13 首版 + 2026-08-14 UI 重做，均已 playwright headless 浏览器验证，console 零报错）**

- **语言弹窗 → 填写情况 → 直接给方案** 的单页流程，结构照抄 GCTracker 的 `LanguageGateModal` → `OnboardingModal` → `Overview` 三段式（阅读了 `~/GCTracker/src/App.jsx` 里这三个组件的真实实现后照搬视觉规格：380px 卡片、绿色顶边、backdrop blur 淡入）：
  - `src/components/LanguageGateModal.jsx` — 简体中文/繁體中文/English 三选一，首次访问才弹，选完写 localStorage `ep_lang_picked` 不再弹
  - `src/components/IntakeModal.jsx` — 「填写我的情况」（收入/家庭人数/身份/雇主医保/白卡）或「先随便看看」二选一，跟 GCTracker 的 choose/form 两段模式一致
  - `src/components/Overview.jsx` — 新的默认落地 tab（原「资格计算器」独立 tab 已删除，逻辑并入这里）：填过情况直接显示判定结果 + 下一步清单 + 最近相关时间节点；探索模式显示通用介绍卡
  - `src/lib/eligibility.js` — 纯函数 `evaluateEligibility()`，三语文案内联（zh/tw/en），供 Overview 复用
  - `src/lib/i18n.js` — LanguageContext + 语言弹窗/填写表单/结果页这条核心链路的三语文案
  - `src/index.css` — 配色变量照抄 GCTracker 的 "Passport Bureau" 主题数值（暖米纸感 + 常青绿），前缀换成 `--ep-*`
  - **已知范围限制**：其余 8 个 tab（时间线/来信解读/提醒/移民身份/FAQ/QHP经纪人/新闻/官方数据）内容仍只有中文，没有跟着三语化——这条链路之外的翻译是量级完全不同的另一件事，没有擅自扩大范围
- `src/components/Timeline.jsx` — 关键日期倒计时（2025-07-04 H.R.1 签署 → 2026-07-01 EP 200-250 终止）
- `src/components/NoticeOCR.jsx` — Tesseract.js 浏览器本地 OCR + 手动日期输入，自动算 2 个月 SEP 截止日，导出 .ics
- `src/components/SEPReminder.jsx` + `functions/api/remind.js` + `functions/api/remind-check.js` — KV/CRON_SECRET/RESEND_FROM/SITE_URL 已绑定实测通过；`RESEND_API_KEY` 待业主提供，Twilio 待业主开户（见下）
- `src/components/ImmigrationGuide.jsx`、`FAQ.jsx`、`PlansAndBrokers.jsx` — 静态内容，QHP 对比表和经纪人名单**故意留空/占位**，避免展示编造数字
- `src/components/DataDashboard.jsx` — 实时查 health.data.ny.gov 开放数据目录（已实测，目录里没有现成的 Essential Plan 参保数据集，链接回官方 PDF 报告页）
- `src/components/News.jsx` + `scripts/scrape-news.mjs` — 抓 NYSOH + health.ny.gov 新闻页，关键词过滤；两个 GitHub Actions cron（新闻抓取、提醒检查）workflow 权限已开、repo secrets 已配，手动跑过一次都 success

## 数据口径来源

FPL 数字、关键日期、DACA 138% 门槛等均见 `src/data/content.js` 顶部注释和各字段 `source` 链接，抓取于 2026-08-13，每年 FPL 会变，用前核对 NYSOH 官网。

## 还没做 / 需要业主决定

1. **`RESEND_API_KEY`** — Cloudflare secret 写后不可读，没法像 KV id 一样直接复用 rate-jmjvc-us 那份，需业主提供或自己去 Cloudflare Pages 后台配
2. **Twilio 账号** — SMS 提醒代码已写好，`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER` 需要业主自己去 twilio.com 申请
3. **QHP 对比表真实数据** — `src/data/content.js` 的 `QHP_COMPARISON_TEMPLATE.rows` 是空数组，需要经纪人拉 2026 实时报价后填入
4. **经纪人/Navigator 真实名单** — `BROKER_DIRECTORY` 目前是占位条目
5. **自定义域名** — 目前只有 `*.pages.dev` 预览地址，没接自定义域名

## 本地跑起来

```bash
cd ~/ny-essential-plan
npm install
npm run dev          # http://localhost:5174
npm run scrape:news  # 手动刷新 public/news.json
npm run build         # 生产构建，已验证无报错
```

## 部署（改完代码后）

```bash
cd ~/ny-essential-plan
npm run build
wrangler pages deploy dist --project-name=ny-essential-plan --branch=main
```
