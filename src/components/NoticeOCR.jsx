import React, { useState } from 'react';

const DATE_PATTERNS = [
  /(?:coverage\s*end\s*date|end\s*date|effective\s*date)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
];

function parseDate(raw) {
  const m = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!m) return null;
  let [, mm, dd, yy] = m;
  if (yy.length === 2) yy = '20' + yy;
  const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
  return Number.isNaN(d.getTime()) ? null : d;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function buildIcs({ title, date }) {
  const dt = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${dt}`,
    `DTEND:${dt}`,
    `SUMMARY:${title}`,
    'DESCRIPTION:NY Essential Plan 转保截止提醒（本地生成，非官方通知）',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export default function NoticeOCR() {
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [foundDate, setFoundDate] = useState(null);
  const [manualDate, setManualDate] = useState('');

  const runOcr = async (file) => {
    setStatus('running');
    setProgress(0);
    setText('');
    setFoundDate(null);
    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });
      setText(data.text);
      for (const re of DATE_PATTERNS) {
        const m = data.text.match(re);
        if (m) {
          const d = parseDate(m[1]);
          if (d) { setFoundDate(d); break; }
        }
      }
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file) runOcr(file);
  };

  const effectiveDate = foundDate || (manualDate ? new Date(manualDate) : null);
  const deadline = effectiveDate ? addMonths(effectiveDate, 2) : null;

  const downloadIcs = () => {
    if (!deadline) return;
    const ics = buildIcs({ title: 'NY Essential Plan 转保截止（2个月窗口）', date: deadline });
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'essential-plan-deadline.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418]">来信解读（本地 OCR）</h2>
        <p className="text-sm text-[#6b6f75] mt-1">
          上传 NYSOH 通知信截图，浏览器本地识别文字，不上传到任何服务器。识别出 Coverage End Date 后自动算出 2 个月转换截止日，可导出日历提醒。
        </p>
      </div>

      <input type="file" accept="image/*,.pdf" onChange={onFile} className="block" />

      {status === 'running' && (
        <div className="text-sm text-[#6b6f75]">识别中… {progress}%</div>
      )}

      {status === 'error' && (
        <div className="text-sm text-[#8c1919]">识别失败，换一张更清晰的截图再试，或直接在下面手动填日期。</div>
      )}

      {status === 'done' && (
        <div className="space-y-3">
          {foundDate ? (
            <div className="rounded p-3 bg-[#e4ece3] border border-[#93b7a0] text-sm text-[#0a3a23]">
              识别到日期：<b>{fmtDate(foundDate)}</b>（请核对信件原文是否准确，OCR 可能出错）
            </div>
          ) : (
            <div className="rounded p-3 bg-[#f1e5c2] border border-[#c9a94a] text-sm text-[#8a5a00]">
              没能自动识别出 Coverage End Date，可以在下面手动填。
            </div>
          )}
          <details className="text-xs text-[#6b6f75]">
            <summary className="cursor-pointer">查看识别出的全部文字</summary>
            <pre className="whitespace-pre-wrap mt-2 border border-[#d6cfbb] rounded p-2 bg-white/60">{text}</pre>
          </details>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-semibold text-[#111418]">手动输入 / 修正 Coverage End Date</span>
        <input
          type="date"
          className="mt-1 w-full border border-[#d6cfbb] rounded px-3 py-2"
          value={manualDate}
          onChange={(e) => setManualDate(e.target.value)}
        />
      </label>

      {deadline && (
        <div className="rounded p-4 bg-[#f1e5c2] border border-[#c9a94a]">
          <div className="font-bold text-[#8a5a00]">2 个月转换窗口截止日：{fmtDate(deadline)}</div>
          <button
            onClick={downloadIcs}
            className="mt-3 px-3 py-1.5 rounded bg-[#0e4d2e] text-white text-sm font-semibold"
          >
            下载日历提醒 (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
