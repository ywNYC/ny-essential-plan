import React, { useState } from 'react';
import { FileText, Compass } from 'lucide-react';
import { STRINGS } from '../lib/i18n.js';

const STATUS_OPTIONS = (t) => [
  { value: 'lpr', label: t.statusLpr },
  { value: 'daca', label: t.statusDaca },
  { value: 'nonimmigrant', label: t.statusNonimmigrant },
];

// 结构照抄 GCTracker 的 OnboardingModal：choose 模式先问"填情况"还是"随便看看"，
// 选"填情况"才展开表单。跟语言弹窗用同一套卡片几何（380px/绿顶边/淡入上浮），
// 两个弹窗连续出现时读起来像同一个界面在往下走，不是突然换了个窗口。
export default function IntakeModal({ lang, onComplete, onExplore }) {
  const t = STRINGS[lang] || STRINGS.zh;
  const [mode, setMode] = useState('choose'); // 'choose' | 'form'
  const [income, setIncome] = useState(30000);
  const [size, setSize] = useState(1);
  const [status, setStatus] = useState('lpr');
  const [employerCoverage, setEmployerCoverage] = useState(false);
  const [medicaidEligible, setMedicaidEligible] = useState(false);

  const submit = () => {
    onComplete({ income, size, status, employerCoverage, medicaidEligible });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="ep-modal-backdrop" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15, 20, 25, 0.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        animation: 'epBackdropIn 240ms ease-out both',
      }} />
      <div className="ep-modal-card" style={{
        position: 'relative',
        background: 'var(--ep-surface)',
        border: '1px solid var(--ep-rule)',
        borderTop: '3px solid var(--ep-green)',
        borderRadius: 'var(--ep-radius)',
        width: '100%', maxWidth: '380px', maxHeight: '92vh', overflowY: 'auto',
        padding: '20px 18px 16px',
        animation: 'epCardIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both',
        animationDelay: '60ms',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.12)',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--ep-rule-soft)' }}>
          <div className="ep-eyebrow" style={{ color: 'var(--ep-green)', marginBottom: '4px' }}>{t.brand}</div>
          <h2 className="ep-serif" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ep-ink)', margin: '0 0 3px', lineHeight: 1.2 }}>
            {t.intakeTitle}
          </h2>
          <div style={{ fontSize: '12.5px', color: 'var(--ep-muted)', marginTop: '4px' }}>{t.intakeSubtitle}</div>
        </div>

        {mode === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setMode('form')}
              style={{
                textAlign: 'left', padding: '14px 14px', background: 'var(--ep-green-soft)',
                border: '1px solid var(--ep-green-border)', borderRadius: 'var(--ep-radius-sm)', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} style={{ color: 'var(--ep-green-ink)' }} strokeWidth={1.8} />
                <span className="ep-serif" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ep-green-ink)' }}>{t.haveCase}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ep-green-ink)', marginTop: '4px', opacity: 0.85 }}>{t.haveCaseDesc}</div>
            </button>
            <button
              onClick={onExplore}
              style={{
                textAlign: 'left', padding: '14px 14px', background: 'var(--ep-surface)',
                border: '1px solid var(--ep-rule)', borderRadius: 'var(--ep-radius-sm)', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={16} style={{ color: 'var(--ep-muted)' }} strokeWidth={1.8} />
                <span className="ep-serif" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ep-ink)' }}>{t.exploring}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ep-muted)', marginTop: '4px' }}>{t.exploringDesc}</div>
            </button>
          </div>
        )}

        {mode === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ep-ink)' }}>{t.income}</span>
              <input
                type="number" min={0} value={income}
                onChange={(e) => setIncome(Number(e.target.value) || 0)}
                style={{ marginTop: '4px', width: '100%', border: '1px solid var(--ep-rule)', borderRadius: 'var(--ep-radius-sm)', padding: '8px 10px', fontSize: '14px' }}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ep-ink)' }}>{t.size}</span>
              <input
                type="number" min={1} max={12} value={size}
                onChange={(e) => setSize(Number(e.target.value) || 1)}
                style={{ marginTop: '4px', width: '100%', border: '1px solid var(--ep-rule)', borderRadius: 'var(--ep-radius-sm)', padding: '8px 10px', fontSize: '14px' }}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ep-ink)' }}>{t.status}</span>
              <select
                value={status} onChange={(e) => setStatus(e.target.value)}
                style={{ marginTop: '4px', width: '100%', border: '1px solid var(--ep-rule)', borderRadius: 'var(--ep-radius-sm)', padding: '8px 10px', fontSize: '14px' }}
              >
                {STATUS_OPTIONS(t).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ep-ink-soft)' }}>
              <input type="checkbox" checked={employerCoverage} onChange={(e) => setEmployerCoverage(e.target.checked)} />
              {t.employerCoverage}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ep-ink-soft)' }}>
              <input type="checkbox" checked={medicaidEligible} onChange={(e) => setMedicaidEligible(e.target.checked)} />
              {t.medicaidEligible}
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={() => setMode('choose')} style={{ flex: '0 0 auto', padding: '10px 12px', fontSize: '13px', color: 'var(--ep-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {t.back}
              </button>
              <button
                onClick={submit}
                style={{ flex: 1, padding: '11px 14px', background: 'var(--ep-green)', color: 'var(--ep-surface)', fontWeight: 700, fontSize: '14px', borderRadius: 'var(--ep-radius-sm)', border: 'none', cursor: 'pointer' }}
              >
                {t.start}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
