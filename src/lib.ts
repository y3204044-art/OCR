/* =====================================================================================
 *  lib.ts — פונקציות עזר טהורות (ללא תלות ב-DOM/React), ניתנות לבדיקה ביחידות.
 * ===================================================================================== */

// מזהה ייחודי עם fallback (crypto.randomUUID זמין רק ב-Secure Context)
export const genId = (): string => {
  try { if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID(); } catch (e) {}
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
};

// פירוק data URL ל-mime + base64 נקי
export const splitDataUrl = (dataUrl: string): { mime: string; data: string } => {
  const m = (dataUrl || '').match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,/);
  return { mime: m ? m[1] : 'image/jpeg', data: (dataUrl || '').split(',')[1] || '' };
};

// המרת base64 ל-Uint8Array (לייצוא תמונות ב-DOCX)
export const base64ToUint8 = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// פענוח JSON "סלחני" — מסיר code fences ומחלץ את גוש ה-JSON גם אם יש טקסט עוטף
export const parseJsonLoose = (text: string): any => {
  let t = (text || '').trim();
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(t); } catch (e) {
    const start = t.indexOf('{');
    const startA = t.indexOf('[');
    const s = (startA !== -1 && (startA < start || start === -1)) ? startA : start;
    const endObj = t.lastIndexOf('}');
    const endArr = t.lastIndexOf(']');
    const e2 = Math.max(endObj, endArr);
    if (s !== -1 && e2 !== -1) {
      try { return JSON.parse(t.slice(s, e2 + 1)); } catch (_) {}
    }
    throw new Error("כשל בפענוח JSON מהמודל.");
  }
};

// נירמול מילה להשוואה (אותיות עברית/לטינית/ספרות בלבד)
export const normWord = (s: string): string => (s || '').replace(/[^֐-׿0-9A-Za-z]/g, '');

// יישור ציוני אמינות מילים לטוקנים של טקסט לפי תוכן (עם resync קל).
// מחזיר מערך אובייקטים {token, isSpace, confidence|null} לפי סדר הקריאה.
export interface ConfToken { token: string; isSpace: boolean; confidence: number | null; }
export const alignConfidence = (text: string, words: Array<{ word: string; confidence?: number }>): ConfToken[] => {
  const wlist = Array.isArray(words) ? words : [];
  const matches = (a: string, b: string) => !!a && !!b && (a === b || a.startsWith(b) || b.startsWith(a));
  let wi = 0;
  const out: ConfToken[] = [];
  const parts = (text || '').split(/(\s+)/);
  for (const tok of parts) {
    if (tok === '') continue;
    if (/^\s+$/.test(tok)) { out.push({ token: tok, isSpace: true, confidence: null }); continue; }
    const nt = normWord(tok);
    let conf: number | null = null;
    if (nt && wi < wlist.length) {
      if (matches(nt, normWord(wlist[wi].word))) {
        conf = typeof wlist[wi].confidence === 'number' ? (wlist[wi].confidence as number) : null; wi++;
      } else {
        for (let k = 1; k <= 4 && wi + k < wlist.length; k++) {
          if (matches(nt, normWord(wlist[wi + k].word))) {
            conf = typeof wlist[wi + k].confidence === 'number' ? (wlist[wi + k].confidence as number) : null;
            wi = wi + k + 1; break;
          }
        }
      }
    }
    out.push({ token: tok, isSpace: false, confidence: conf });
  }
  return out;
};
