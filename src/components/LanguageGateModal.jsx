import React from 'react';
import { Globe } from 'lucide-react';
import { STRINGS } from '../lib/i18n.js';

// 结构照抄 GCTracker 的 LanguageGateModal：全屏 fixed 遮罩 + 380px 卡片，绿色顶边，
// 是访客第一次打开网站看到的第一个东西，picked 之后写 localStorage 不再弹。
export default function LanguageGateModal({ onPick }) {
  const opts = [
    { v: 'zh', label: STRINGS.zh.langZh },
    { v: 'tw', label: STRINGS.zh.langTw },
    { v: 'en', label: STRINGS.zh.langEn },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
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
          <Globe size={20} style={{ color: 'var(--ep-green)', marginBottom: '6px' }} strokeWidth={1.6} />
          <div className="ep-eyebrow" style={{ color: 'var(--ep-green)', marginBottom: '4px' }}>{STRINGS.zh.brand}</div>
          <h2 className="ep-serif" style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ep-ink)', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
            {STRINGS.zh.gateTitle}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {opts.map((o) => (
            <button
              key={o.v}
              onClick={() => onPick(o.v)}
              style={{
                width: '100%', textAlign: 'center', padding: '16px 14px',
                background: 'var(--ep-surface)', border: '1px solid var(--ep-rule)',
                borderLeft: '2px solid var(--ep-green)', borderRadius: 'var(--ep-radius-sm)',
                cursor: 'pointer', transition: 'all 140ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ep-paper-soft)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ep-surface)'; }}
            >
              <span className="ep-serif" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ep-ink)' }}>{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
