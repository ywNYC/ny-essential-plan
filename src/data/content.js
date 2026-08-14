// 数据来源见各字段旁的 source 注释，抓取于 2026-08-13。
// FPL = 联邦贫困线；数字每年会更新，用之前核对 NYSOH 官网当年数值。

export const FPL_100 = [
  // [家庭人数, 100% FPL 年收入] —— 用于按人数插值 200%/250%/138% 各档
  [1, 15650],
  [2, 21150],
  [3, 26650],
  [4, 32150],
  [5, 37650],
  [6, 43150],
  [7, 48650],
  [8, 54150],
];

export function fplForSize(size) {
  const s = Math.max(1, Math.min(8, Math.round(size)));
  const row = FPL_100.find((r) => r[0] === s);
  if (row) return row[1];
  // 8 人以上，每多 1 人加 8 人档与 7 人档的差值
  const extra = size - 8;
  const step = FPL_100[7][1] - FPL_100[6][1];
  return FPL_100[7][1] + extra * step;
}

export const KEY_DATES = [
  {
    date: '2025-07-04',
    title: 'H.R.1 联邦法案签署',
    detail: '取消了大部分合法居留移民的 premium tax credit 资格，是这次 Essential Plan 收窄的根源。',
    source: 'https://documentedny.com/2026/06/17/essential-plan-changes-new-york/',
  },
  {
    date: '2026-03-23',
    title: '州政府宣布联邦批复',
    detail: 'CMS 批准纽约州终止 1332 waiver 中 200-250% FPL 那部分资金，同时保留 200% FPL 以下人群的 Basic Health Program 资格。',
    source: 'https://www.health.ny.gov/press/releases/2026/2026-03-23_federal_approval_to_preserve_health_coverage.htm',
  },
  {
    date: '2026-04-01',
    title: 'NYSOH 向受影响人群发送通知信',
    detail: '收入在 200-250% FPL 之间、目前享受 EP 的人会收到信，信里会写 Coverage End Date 和下一步选项。',
    source: 'https://nysfocus.com/2026/06/15/new-york-essential-plan-coverage-ending-guide',
  },
  {
    date: '2026-07-01',
    title: 'EP 200-250 正式终止',
    detail: '收入 200-250% FPL 的人失去 Essential Plan 资格，需转入 Qualified Health Plan 或其他保险；200% FPL 以下人群不受影响，继续享受 $0 保费。',
    source: 'https://hfproviders.org/resource-posts/new-york-state-essential-plan-200-250-coverage-to-end-effective-7-1-2026',
  },
];

export const SEP_WINDOW_MONTHS = 2; // Special Enrollment Period：Coverage End Date 起 2 个月内完成转保

export const FAQ = [
  {
    q: '什么是 Essential Plan？',
    a: '纽约州为低收入居民提供的医疗保险：$0 或低保费、无 Deductible、覆盖处方药、预防医疗、住院门诊、牙科和视力。全年可申请，没有固定的开放投保期（除非你是因为资格变化被踢出，那种情况走 Special Enrollment Period，见下）。',
  },
  {
    q: 'Essential Plan 5 是什么，跟普通 Essential Plan 有什么区别？',
    a: '"EP 200-250" 指收入在 200%-250% 联邦贫困线（FPL）之间、此前靠联邦扩大资助纳入 Essential Plan 的那一档人群。H.R.1 取消了这部分联邦资金，纽约州因此从 2026-07-01 起终止这一档的 EP 资格。200% FPL 以下人群不受影响。',
  },
  {
    q: '我符合 Essential Plan 的基本条件是什么？',
    a: '19-64 岁、住在纽约州、符合移民身份要求、不能同时享受白卡/儿童白卡/CHP、没有雇主医保、家庭收入在规定范围内（随家庭人数上调，见资格计算器）。',
  },
  {
    q: '收到 NYSOH 的信，是不是就要失去保险了？',
    a: '不一定。先看信里的 Coverage End Date 和资格档位说明：如果你的收入在 200% FPL 以下，大概率继续留在 Basic Health Program，保障不变；如果在 200-250% 之间，信里会说明你需要在 2026-07-01 前转到 Qualified Health Plan 或其他保险。不要把这封信当成普通宣传邮件删掉。',
  },
  {
    q: '"两个月转换期限" 具体怎么算？',
    a: '当你的原有资格因政策变化而终止时，触发 Special Enrollment Period（特别投保期），从信上的 Coverage End Date 起算，通常有 2 个月窗口去申请新保险或转换保单。过了这个窗口，可能要等到下一个常规投保期才能重新买保险，中间会出现保险真空期。',
  },
  {
    q: '如果我是 DACA 身份，会受影响吗？',
    a: '会，而且门槛更低。DACA 身份年收入超过 138% FPL（单人约 $22,024）就不再符合任何 NYSOH 项目，不受 200% FPL 这条线保护。收入更低的 DACA 申请人建议直接联系经纪人确认最新规则。',
  },
  {
    q: '不符合 Essential Plan 了，还有什么选择？',
    a: '主要是 Qualified Health Plan（QHP）——即 Marketplace 上的其他保险，可能有月保费和数千美元的 Deductible，但符合条件仍可以申请联邦税收抵免降低保费。具体保费因人而异，建议对比几家再定。',
  },
  {
    q: '这封信上最该看哪一项？',
    a: 'Coverage End Date（保险终止日期）——这决定了你的 2 个月转换窗口从哪天开始算，也决定了你还剩多少时间办新保险。',
  },
];

// 名字/联系方式为占位模板，需要业主自己核实、替换为真实经纪人/navigator 信息后再对外发布
export const BROKER_DIRECTORY = [
  {
    name: '（待补充）NYSOH 官方 Navigator 项目',
    area: '全州',
    contact: '拨打 NYSOH 客服 1-855-355-5777 索取本地免费 Navigator 名单',
    note: '官方免费协助转保服务，非商业经纪人',
    placeholder: true,
  },
  {
    name: '（待补充：填入你信任的持牌健康险经纪人）',
    area: '',
    contact: '',
    note: '建议至少收录 2-3 位能处理 Essential Plan → QHP 转保的持牌经纪人',
    placeholder: true,
  },
];

// QHP 对比为占位模板：真实保费/Deductible 需要经纪人报价或 NYSOH Marketplace 实时查询，不能凭搜索结果编数字
export const QHP_COMPARISON_TEMPLATE = {
  columns: ['保险公司 / 计划名', '月保费（税前）', '月保费（税收抵免后）', 'Deductible', '备注'],
  rows: [], // 待补充真实报价后再填入，避免展示编造的数字
  note: '此表格故意留空——搜索结果里的"数千美元 Deductible"是笼统说法，不是具体保单数字。建议找持牌经纪人拉 2026 QHP 实时报价后再填进来，否则宁可不展示。',
};

export const IMMIGRATION_STATUS_GUIDE = [
  {
    status: '绿卡 / LPR、公民、难民、庇护等传统合法居留身份',
    impact: '按收入档位判断：200% FPL 以下继续留在 Basic Health Program；200-250% FPL 之间 2026-07-01 起失去 EP 资格，需转 QHP。',
    affected: 'income-based',
  },
  {
    status: 'DACA（追梦人）',
    impact: '门槛更低：年收入超过 138% FPL（单人约 $22,024）即不符合任何 NYSOH 项目，不享受 200% FPL 保护线。',
    affected: 'high',
  },
  {
    status: '持工签 / 学生签等非移民身份',
    impact: '通常本就不符合 Essential Plan 基本条件（需要"相应移民身份要求"），此次政策变化不改变这一前提。',
    affected: 'unrelated',
  },
];
