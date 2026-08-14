import { fplForSize } from '../data/content.js';

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

// 纯函数：不依赖组件状态，供 IntakeModal（首次填写）和 Overview（结果页）共用，
// 三语文案内联在分支里，而不是拆成 i18n key + 模板，因为每支都要嵌入算出来的数字，
// 拆分反而更难读。
export function evaluateEligibility({ income, size, status, employerCoverage, medicaidEligible }, lang = 'zh') {
  const fpl100 = fplForSize(size);
  const pct = (income / fpl100) * 100;

  if (status === 'nonimmigrant') {
    return {
      verdict: 'not-eligible',
      title: { zh: '大概率不符合 Essential Plan', tw: '大概率不符合 Essential Plan', en: 'Likely not eligible for Essential Plan' }[lang],
      detail: {
        zh: '工签、学生签等非移民身份通常不满足 Essential Plan 的"相应移民身份要求"这一前提条件，这次政策变化不改变这一点。建议咨询雇主医保或 Marketplace 上其他选项。',
        tw: '工簽、學生簽等非移民身份通常不滿足 Essential Plan 的「相應移民身份要求」這一前提條件，這次政策變化不改變這一點。建議諮詢雇主醫保或 Marketplace 上其他選項。',
        en: 'Work/student visas and other nonimmigrant statuses usually don’t meet Essential Plan’s underlying immigration-status requirement, and this policy change doesn’t alter that. Check employer coverage or other Marketplace options instead.',
      }[lang],
    };
  }
  if (employerCoverage) {
    return {
      verdict: 'not-eligible',
      title: { zh: '有雇主医保，不符合条件', tw: '有雇主醫保，不符合條件', en: 'Employer coverage makes you ineligible' }[lang],
      detail: {
        zh: 'Essential Plan 要求"没有雇主医保"，如果你已经有雇主提供的保险，通常不符合 EP 申请条件。',
        tw: 'Essential Plan 要求「沒有雇主醫保」，如果你已經有雇主提供的保險，通常不符合 EP 申請條件。',
        en: 'Essential Plan requires that you have no employer-sponsored coverage. If you already have employer insurance, you generally don’t qualify.',
      }[lang],
    };
  }
  if (medicaidEligible) {
    return {
      verdict: 'not-eligible',
      title: { zh: '可能更适合白卡 / 儿童白卡 / CHP', tw: '可能更適合白卡 / 兒童白卡 / CHP', en: 'You may fit Medicaid / Child Health Plus / CHP better' }[lang],
      detail: {
        zh: '如果你已符合白卡（Medicaid）、儿童白卡或 CHP，Essential Plan 条件里明确排除这部分人群，你应该优先看那几个项目。',
        tw: '如果你已符合白卡（Medicaid）、兒童白卡或 CHP，Essential Plan 條件裡明確排除這部分人群，你應該優先看那幾個項目。',
        en: 'If you already qualify for Medicaid, Child Health Plus, or CHP, Essential Plan rules explicitly exclude you — those programs are the better fit.',
      }[lang],
    };
  }

  if (status === 'daca') {
    const daca138 = fpl100 * 1.38;
    if (income > daca138) {
      return {
        verdict: 'not-eligible',
        title: { zh: 'DACA 身份：收入超过 138% FPL，不符合任何 NYSOH 项目', tw: 'DACA 身份：收入超過 138% FPL，不符合任何 NYSOH 項目', en: 'DACA status: income above 138% FPL, not eligible for any NYSOH program' }[lang],
        detail: {
          zh: `按你填的家庭人数，138% FPL 约为 ${money(daca138)}/年。DACA 身份不享受 200% FPL 这条保护线，超过 138% FPL 就不符合任何 NYSOH 项目，建议直接联系经纪人了解其他选项。`,
          tw: `按你填的家庭人數，138% FPL 約為 ${money(daca138)}/年。DACA 身份不享受 200% FPL 這條保護線，超過 138% FPL 就不符合任何 NYSOH 項目，建議直接聯繫經紀人了解其他選項。`,
          en: `Based on your household size, 138% FPL is about ${money(daca138)}/year. DACA status doesn’t get the 200% FPL protection — above 138% FPL you don’t qualify for any NYSOH program. Talk to a broker about other options.`,
        }[lang],
      };
    }
    return {
      verdict: 'eligible',
      title: { zh: 'DACA 身份：收入在 138% FPL 以下，符合条件', tw: 'DACA 身份：收入在 138% FPL 以下，符合條件', en: 'DACA status: income below 138% FPL, eligible' }[lang],
      detail: {
        zh: `按你填的家庭人数，138% FPL 约为 ${money(daca138)}/年，你的收入在这条线以下，仍符合 NYSOH 项目条件。建议关注收入变化，一旦超过这条线会立刻失去资格。`,
        tw: `按你填的家庭人數，138% FPL 約為 ${money(daca138)}/年，你的收入在這條線以下，仍符合 NYSOH 項目條件。建議關注收入變化，一旦超過這條線會立刻失去資格。`,
        en: `Based on your household size, 138% FPL is about ${money(daca138)}/year, and your income is under it, so you still qualify. Watch your income — crossing that line ends eligibility immediately.`,
      }[lang],
    };
  }

  const fpl200 = fpl100 * 2;
  const fpl250 = fpl100 * 2.5;

  if (pct < 200) {
    return {
      verdict: 'eligible',
      title: { zh: '继续符合 Essential Plan（Basic Health Program）', tw: '繼續符合 Essential Plan（Basic Health Program）', en: 'Still eligible for Essential Plan (Basic Health Program)' }[lang],
      detail: {
        zh: `按你填的家庭人数，200% FPL 约为 ${money(fpl200)}/年，你的收入在这条线以下。2026-07-01 的政策变化不影响你，继续享受 $0 保费等现有保障。`,
        tw: `按你填的家庭人數，200% FPL 約為 ${money(fpl200)}/年，你的收入在這條線以下。2026-07-01 的政策變化不影響你，繼續享受 $0 保費等現有保障。`,
        en: `Based on your household size, 200% FPL is about ${money(fpl200)}/year, and your income is under it. The 2026-07-01 policy change doesn’t affect you — you keep $0-premium coverage as-is.`,
      }[lang],
    };
  }
  if (pct <= 250) {
    return {
      verdict: 'transitioning',
      title: { zh: '属于 EP 200-250，2026-07-01 起失去 Essential Plan 资格', tw: '屬於 EP 200-250，2026-07-01 起失去 Essential Plan 資格', en: 'You’re in EP 200-250 — losing Essential Plan eligibility on 2026-07-01' }[lang],
      detail: {
        zh: `按你填的家庭人数，200% FPL 约为 ${money(fpl200)}/年，250% FPL 约为 ${money(fpl250)}/年，你的收入落在这个区间。你会在 2026-04-01 前后收到 NYSOH 通知信，信上的 Coverage End Date 起有 2 个月窗口转到 Qualified Health Plan，不要拖到保险中断才处理。`,
        tw: `按你填的家庭人數，200% FPL 約為 ${money(fpl200)}/年，250% FPL 約為 ${money(fpl250)}/年，你的收入落在這個區間。你會在 2026-04-01 前後收到 NYSOH 通知信，信上的 Coverage End Date 起有 2 個月窗口轉到 Qualified Health Plan，不要拖到保險中斷才處理。`,
        en: `Based on your household size, 200% FPL is about ${money(fpl200)}/year and 250% FPL is about ${money(fpl250)}/year — your income falls in between. You’ll get a NYSOH notice around 2026-04-01; from its Coverage End Date you get a 2-month window to switch to a Qualified Health Plan. Don’t wait until coverage actually lapses.`,
      }[lang],
    };
  }
  return {
    verdict: 'not-eligible',
    title: { zh: '收入超过 250% FPL，不符合 Essential Plan', tw: '收入超過 250% FPL，不符合 Essential Plan', en: 'Income above 250% FPL — not eligible for Essential Plan' }[lang],
    detail: {
      zh: `按你填的家庭人数，250% FPL 约为 ${money(fpl250)}/年，你的收入高于这条线，本来就不符合 Essential Plan，可以看 Marketplace 上的 Qualified Health Plan（部分档位仍有联邦税收抵免）。`,
      tw: `按你填的家庭人數，250% FPL 約為 ${money(fpl250)}/年，你的收入高於這條線，本來就不符合 Essential Plan，可以看 Marketplace 上的 Qualified Health Plan（部分檔位仍有聯邦稅收抵免）。`,
      en: `Based on your household size, 250% FPL is about ${money(fpl250)}/year, and your income is above it — you were never eligible for Essential Plan. Look at Qualified Health Plans on the Marketplace (some income tiers still get federal tax credits).`,
    }[lang],
  };
}

export const VERDICT_STYLE = {
  eligible: { bg: 'var(--ep-green-soft)', border: 'var(--ep-green-border)', text: 'var(--ep-green-ink)' },
  transitioning: { bg: 'var(--ep-amber-soft)', border: 'var(--ep-amber-border)', text: 'var(--ep-amber-ink)' },
  'not-eligible': { bg: 'var(--ep-red-soft)', border: 'var(--ep-red-border)', text: 'var(--ep-red-ink)' },
};
