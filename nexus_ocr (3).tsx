import React, { useState, useRef, useEffect } from 'react';

/* =====================================================================================
 *  NexusOCR — מנוע OCR מחקרי לספרות תורנית / כתב רש"י / דפוס ישן / סריקות מורכבות
 *  -----------------------------------------------------------------------------------
 *  שדרוג מנוע ה-OCR (גרסה Research Grade):
 *    1. שלב Classification אוטומטי לזיהוי סוג הכתב + סוג המסמך התורני.
 *    2. פרומפט OCR ייעודי לכל סוג כתב (רש"י / דפוס / מעורב / כתב יד).
 *    3. Multi-Pass OCR אמיתי — 7 מעברים (סטנדרט) / 10 מעברים (Ultra Rashi).
 *    4. OCR לפי אזורים (Layout Segmentation) — פירוק העמוד לבלוקים ופענוח כל בלוק בנפרד.
 *    5. Preprocessing מתקדם בדפדפן: Deskew, Denoise, Contrast, Adaptive Threshold,
 *       Sharpen, Super-Resolution (upscaling + שיפור).
 *    6. חילוץ PDF ברזולוציה גבוהה (scale 3.0 / 4.0+).
 *    7. מנגנון Anti-Hallucination נוקשה (אפס השלמות מהזיכרון).
 *    8. Confidence Score לכל מילה + הדגשת מילים מתחת ל-85.
 *    9. מצב Ultra Rashi — 10 מעברים, מקסימום דיוק, אפס ניחושים.
 *   10. ייצוא מתקדם: DOCX אמיתי (ספריית docx), PDF, TXT, JSON (עם ציוני אמינות).
 *
 *  כל הפונקציונליות הקיימת נשמרת (העלאת קבצים/PDF, batch, wake-lock, ייצוא Word,
 *  ממשק התצוגה) — השדרוג מתמקד במנוע ה-OCR בלבד.
 * ===================================================================================== */

// --- Premium Icons ---
const UploadIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>);
const FileTextIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>);
const Loader2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);
const CheckCircle2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>);
const AlertCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>);
const PlayIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M5 3l14 9-14 9V3z"/></svg>);
const ScanTextIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h8"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>);
const FileWordIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>);
const SettingsIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
const SparklesIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>);
const DownloadIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
const FileJsonIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>);
const FilePdfIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v6"/><path d="M14 18v-6h1.5a1.5 1.5 0 0 1 0 3H14"/></svg>);
const XIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
const ChevronDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>);
const LayersIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>);

/* ============================== Engine Configuration ============================== */

const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
// מפתח מוזרק ע"י סביבת ההרצה (כמו בגרסה המקורית). ניתן להחליף במפתח אישי בעת הצורך.
const API_KEY = "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

// סף אמינות — מתחת לכך המילה מסומנת לבדיקה
const CONFIDENCE_THRESHOLD = 85;
const PLACEHOLDER = "-------";

// זוגות אותיות דומות לבדיקת Pass 5
const CONFUSABLE_PAIRS = "ב/כ · ד/ר · ה/ח · ו/ז · י/ו · ן/ו · ך/ן · ם/ס · ת/ח";

// סוגי מסמכים תורניים נתמכים (לאופטימיזציה ייעודית)
const TORAH_DOC_TYPES = {
  talmud_bavli: 'תלמוד בבלי',
  talmud_yerushalmi: 'תלמוד ירושלמי',
  mishna: 'משנה',
  rambam: 'רמב"ם (משנה תורה)',
  tur: 'טור',
  beit_yosef: 'בית יוסף',
  shulchan_aruch: 'שולחן ערוך',
  mishna_berura: 'משנה ברורה',
  responsa: 'שו"ת',
  rishonim: 'ספרי ראשונים',
  acharonim: 'ספרי אחרונים',
  chumash_rashi: 'חומש עם רש"י',
  general: 'ספר תורני כללי',
  unknown: 'לא ידוע'
};

const SCRIPT_TYPE_LABELS = {
  rashi: 'כתב רש"י',
  print: 'דפוס רגיל',
  rashi_and_print: 'שילוב רש"י ודפוס',
  handwriting: 'כתב יד',
  mixed: 'טקסט מעורב',
  unknown: 'לא זוהה'
};

// הגדרות ברירת מחדל למנוע
const DEFAULT_SETTINGS = {
  ultraRashi: false,        // מצב Ultra Rashi — 10 מעברים, מקסימום דיוק
  regionOcr: false,         // OCR לפי אזורים (פירוק לבלוקים)
  forceScriptType: 'auto',  // 'auto' או כפיית סוג כתב
  pdfScale: 3.0,            // רזולוציית חילוץ PDF (3.0 סטנדרט / מועלה ל-4.0 ב-Ultra)
  ocrMaxWidth: 2048,        // רוחב מקסימלי לתמונה הנשלחת למודל (מועלה מ-1200!)
  preprocess: {
    superResolution: true,  // הגדלת רזולוציה + חידוד
    deskew: true,           // יישור דפים עקומים
    contrast: true,         // שיפור ניגודיות
    sharpen: true,          // חידוד טקסט
    denoise: false,         // ניקוי רעשים (כבד — נדלק אוטומטית ב-Ultra)
    adaptiveThreshold: true // הבלטת אותיות חלשות (לקריאה עצמאית נוספת)
  }
};

// חישוב תצורה אפקטיבית לפי המצב (Ultra Rashi דורס חלק מההגדרות)
const effectiveSettings = (s) => {
  const eff = JSON.parse(JSON.stringify(s));
  if (s.ultraRashi) {
    eff.passCount = 10;
    eff.pdfScale = Math.max(s.pdfScale, 4.0);
    eff.ocrMaxWidth = Math.max(s.ocrMaxWidth, 3000);
    eff.preprocess.denoise = true;
    eff.preprocess.superResolution = true;
    eff.preprocess.contrast = true;
    eff.preprocess.sharpen = true;
    eff.preprocess.adaptiveThreshold = true;
  } else {
    eff.passCount = 7;
  }
  return eff;
};

/* ============================== CDN Loaders ============================== */

const loadPdfJs = async () => {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error("PDF.js library failed to load."));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// טעינת ספריית docx ליצירת קובץ Word אמיתי (.docx) — לא MHTML
const loadDocx = async () => {
  if (window.docx) return window.docx;
  const sources = [
    'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js',
    'https://unpkg.com/docx@8.5.0/build/index.umd.js'
  ];
  for (const src of sources) {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      if (window.docx) return window.docx;
    } catch (e) { /* try next source */ }
  }
  throw new Error("ספריית docx נכשלה בטעינה.");
};

/* ============================== Image Utilities ============================== */

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

const splitDataUrl = (dataUrl) => {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,/);
  return { mime: m ? m[1] : 'image/jpeg', data: dataUrl.split(',')[1] };
};

const base64ToUint8 = (b64) => {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// מזהה ייחודי עם fallback (crypto.randomUUID זמין רק ב-Secure Context)
const genId = () => {
  try { if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
};

// תמונה ממוזערת קלה לסיידבר (חוסך פענוח תמונה מלאה בכל thumbnail)
const makeThumbnail = async (base64, maxW = 140) => {
  try {
    const img = await loadImage(base64);
    const scale = Math.min(maxW / img.width, 1);
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.7);
  } catch (e) { return base64; }
};

// חילוץ דפי PDF ברזולוציה גבוהה (scale מותאם — 3.0 / 4.0+)
const extractPdfPages = async (file, scale, onProgress) => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const extractedPages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) onProgress(i, pdf.numPages);
    const page = await pdf.getPage(i);

    // רזולוציה גבוהה עם הגנת זיכרון: צמצום scale אם הקנבס גדול מדי
    let effScale = scale;
    let viewport = page.getViewport({ scale: effScale });
    const MAX_DIM = 5000; // תקרת ממד למניעת קריסת זיכרון בדפדפן
    while ((viewport.width > MAX_DIM || viewport.height > MAX_DIM) && effScale > 1.2) {
      effScale -= 0.5;
      viewport = page.getViewport({ scale: effScale });
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    try {
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      // נפילה רכה לרזולוציה נמוכה יותר
      const fbViewport = page.getViewport({ scale: 1.5 });
      canvas.width = fbViewport.width;
      canvas.height = fbViewport.height;
      await page.render({ canvasContext: ctx, viewport: fbViewport }).promise;
    }

    // JPEG באיכות גבוהה כדי לאזן בין נאמנות לזיכרון (התמונה תעבור Preprocessing נוסף)
    const base64 = canvas.toDataURL('image/jpeg', 0.92);
    const thumb = await makeThumbnail(base64);
    extractedPages.push(newPageObject(`${file.name} - עמ' ${i}`, base64, thumb));
  }
  return extractedPages;
};

const newPageObject = (name, base64, thumb) => ({
  id: genId(),
  name,
  originalImage: base64,
  thumb: thumb || base64,
  status: 'pending',
  scanStage: 0,
  totalStages: 0,
  stageLabel: '',
  combinedText: "",
  words: [],
  passes: [],
  scriptType: null,
  scriptConfidence: null,
  documentType: null,
  lowConfidenceCount: 0,
  error: null
});

/* -------- Preprocessing core (canvas, in-browser) -------- */
//  Super-Resolution (upscale + smoothing) → Grayscale → Auto-Contrast → Sharpen
//  → (אופציונלי) Denoise → מחזיר תמונה "enhanced".
//  בנוסף מייצר וריאנט "binarized" באמצעות Adaptive Threshold לקריאה עצמאית (Pass 2).

const drawScaled = (img, targetW, targetH) => {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return { canvas, ctx };
};

// יישור עקמומיות (Deskew) באמצעות projection-profile variance על גרסה מוקטנת
const estimateSkewAngle = (canvas) => {
  try {
    const small = document.createElement('canvas');
    const scale = Math.min(700 / canvas.width, 1);
    small.width = Math.max(1, Math.round(canvas.width * scale));
    small.height = Math.max(1, Math.round(canvas.height * scale));
    const sctx = small.getContext('2d');
    sctx.drawImage(canvas, 0, 0, small.width, small.height);
    const { width: w, height: h } = small;
    const base = sctx.getImageData(0, 0, w, h).data;
    // גרייסקייל + בינריזציה גסה (טקסט כהה = 1)
    const ink = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const r = base[i * 4], g = base[i * 4 + 1], b = base[i * 4 + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      ink[i] = lum < 160 ? 1 : 0;
    }
    let bestAngle = 0, bestScore = -1;
    for (let deg = -6; deg <= 6; deg += 0.5) {
      const rad = deg * Math.PI / 180;
      const tan = Math.tan(rad);
      const rows = new Float32Array(h);
      for (let y = 0; y < h; y++) {
        let sum = 0;
        for (let x = 0; x < w; x++) {
          const yy = Math.round(y + (x - w / 2) * tan);
          if (yy >= 0 && yy < h) sum += ink[yy * w + x];
        }
        rows[y] = sum;
      }
      // ככל שהשונות בין השורות גבוהה יותר — היישור טוב יותר
      let mean = 0; for (let y = 0; y < h; y++) mean += rows[y]; mean /= h;
      let varc = 0; for (let y = 0; y < h; y++) { const d = rows[y] - mean; varc += d * d; }
      if (varc > bestScore) { bestScore = varc; bestAngle = deg; }
    }
    return bestAngle;
  } catch (e) {
    return 0;
  }
};

const rotateCanvas = (canvas, deg) => {
  if (Math.abs(deg) < 0.25) return canvas;
  const rad = deg * Math.PI / 180;
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate(-rad);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return out;
};

// פילטר 3x3 חידוד (unsharp) — מופעל ידנית על מערך פיקסלים
const convolve3x3 = (data, w, h, kernel) => {
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let acc = 0, k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const yy = Math.min(h - 1, Math.max(0, y + ky));
            const xx = Math.min(w - 1, Math.max(0, x + kx));
            acc += data[(yy * w + xx) * 4 + c] * kernel[k++];
          }
        }
        out[(y * w + x) * 4 + c] = acc;
      }
      out[(y * w + x) * 4 + 3] = data[(y * w + x) * 4 + 3];
    }
  }
  return out;
};

// Denoise: median 3x3 על ערוץ הבהירות (כבד — נדלק ב-Ultra / לפי הגדרה)
const median3x3 = (data, w, h) => {
  const out = new Uint8ClampedArray(data);
  const win = new Array(9);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const yy = Math.min(h - 1, Math.max(0, y + ky));
          const xx = Math.min(w - 1, Math.max(0, x + kx));
          win[n++] = data[(yy * w + xx) * 4];
        }
      }
      // מדיאן באמצעות insertion sort על 9 ערכים (ללא comparator callback — מהיר משמעותית)
      for (let m = 1; m < 9; m++) { const v = win[m]; let p = m - 1; while (p >= 0 && win[p] > v) { win[p + 1] = win[p]; p--; } win[p + 1] = v; }
      const med = win[4];
      const idx = (y * w + x) * 4;
      out[idx] = out[idx + 1] = out[idx + 2] = med;
    }
  }
  return out;
};

// תקרת רזולוציה לעיבוד פיקסלים — איזון בין דיוק לביצועים/זיכרון (Gemini אינו מרוויח
// משמעותית מעבר ל-~2200px לטקסט, וזה שומר על denoise/threshold מהירים ובטוחים לזיכרון)
const PIXEL_PROC_MAX_WIDTH = 2200;

const preprocessImage = async (base64, settings) => {
  const pp = settings.preprocess;
  const img = await loadImage(base64);

  // Super-Resolution: הגדל תמונות קטנות עד הרוחב היעד, או הקטן תמונות ענק (מוגבל לתקרה)
  const maxW = Math.min(settings.ocrMaxWidth || 2048, PIXEL_PROC_MAX_WIDTH);
  let targetW = img.width, targetH = img.height;
  if (pp.superResolution && img.width < maxW) {
    const factor = Math.min(maxW / img.width, 2.5); // upscaling מבוקר
    targetW = Math.round(img.width * factor);
    targetH = Math.round(img.height * factor);
  } else if (img.width > maxW) {
    const factor = maxW / img.width;
    targetW = maxW;
    targetH = Math.round(img.height * factor);
  }

  let { canvas } = drawScaled(img, targetW, targetH);
  await delay(0); // yield ל-UI

  // Deskew
  if (pp.deskew) {
    const angle = estimateSkewAngle(canvas);
    canvas = rotateCanvas(canvas, angle);
    await delay(0);
  }

  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  let imageData = ctx.getImageData(0, 0, w, h);
  let d = imageData.data;

  // Grayscale + היסטוגרמה
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = d[i + 1] = d[i + 2] = lum;
    hist[lum]++;
  }
  // Auto-Contrast (percentile stretch + גמא קלה)
  if (pp.contrast) {
    let loCut = 0, hiCut = 255;
    const total = (d.length / 4);
    const clip = total * 0.005; // 0.5% percentile
    let acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > clip) { loCut = v; break; } }
    acc = 0;
    for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > clip) { hiCut = v; break; } }
    if (hiCut <= loCut) { loCut = 0; hiCut = 255; }
    const range = hiCut - loCut;
    const lut = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) {
      let nv = ((v - loCut) / range) * 255;
      nv = 255 * Math.pow(Math.min(1, Math.max(0, nv / 255)), 0.9);
      lut[v] = nv;
    }
    for (let i = 0; i < d.length; i += 4) {
      const v = lut[d[i]];
      d[i] = d[i + 1] = d[i + 2] = v;
    }
  }
  await delay(0);

  // צילום-מצב של הגרייסקייל הנקי (לפני denoise/sharpen) עבור Adaptive Threshold
  const grayClean = pp.adaptiveThreshold ? new Uint8ClampedArray(d) : null;

  // Denoise (median) — רץ תמיד כשמופעל (הרזולוציה מוגבלת ל-PIXEL_PROC_MAX_WIDTH)
  if (pp.denoise) {
    d = median3x3(d, w, h);
    imageData = new ImageData(d, w, h);
    await delay(0);
  }

  // Sharpen (unsharp mask)
  if (pp.sharpen) {
    const kernel = [0, -0.6, 0, -0.6, 3.4, -0.6, 0, -0.6, 0];
    const sharp = convolve3x3(d, w, h, kernel);
    imageData = new ImageData(sharp, w, h);
    d = imageData.data;
    await delay(0);
  } else {
    imageData = new ImageData(d, w, h);
  }

  ctx.putImageData(imageData, 0, 0);
  // JPEG איכותי — חיסכון משמעותי בזיכרון וב-payload לעומת PNG (לטקסט בגווני אפור)
  const enhanced = canvas.toDataURL('image/jpeg', 0.95);

  // Adaptive Threshold על הגרייסקייל הנקי (לא על המערך המחודד) — וריאנט לקריאה עצמאית (Pass 2)
  let binarized = null;
  if (pp.adaptiveThreshold && grayClean) {
    binarized = adaptiveThreshold(grayClean, w, h);
    await delay(0);
  }

  return { enhanced, binarized, width: w, height: h };
};

// Adaptive (local mean) threshold → מחזיר dataURL בינארי
const adaptiveThreshold = (gray, w, h) => {
  // integral image לחישוב ממוצע חלון מהיר
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += gray[(y * w + x) * 4];
      integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)] + rowSum;
    }
  }
  const radius = Math.max(8, Math.round(Math.min(w, h) / 60));
  const out = new Uint8ClampedArray(w * h * 4);
  const C = 8; // קבוע סף
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - radius), y1 = Math.min(h - 1, y + radius);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - radius), x1 = Math.min(w - 1, x + radius);
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      const sum = integral[(y1 + 1) * (w + 1) + (x1 + 1)]
        - integral[y0 * (w + 1) + (x1 + 1)]
        - integral[(y1 + 1) * (w + 1) + x0]
        + integral[y0 * (w + 1) + x0];
      const mean = sum / area;
      const val = gray[(y * w + x) * 4];
      const bw = val < (mean - C) ? 0 : 255;
      const idx = (y * w + x) * 4;
      out[idx] = out[idx + 1] = out[idx + 2] = bw;
      out[idx + 3] = 255;
    }
  }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').putImageData(new ImageData(out, w, h), 0, 0);
  return c.toDataURL('image/png');
};

// חיתוך אזור מתמונה לפי תיבה מנורמלת [ymin,xmin,ymax,xmax] בסקאלת 0..1000 (קונבנציית Gemini)
const cropRegion = async (base64, box) => {
  const img = await loadImage(base64);
  const [ymin, xmin, ymax, xmax] = box;
  const pad = 0.01;
  const x0 = Math.max(0, (xmin / 1000 - pad)) * img.width;
  const y0 = Math.max(0, (ymin / 1000 - pad)) * img.height;
  const x1 = Math.min(1, (xmax / 1000 + pad)) * img.width;
  const y1 = Math.min(1, (ymax / 1000 + pad)) * img.height;
  const cw = Math.max(1, x1 - x0), ch = Math.max(1, y1 - y0);
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, x0, y0, cw, ch, 0, 0, cw, ch);
  return c.toDataURL('image/png');
};

/* ============================== Gemini Core Call ============================== */

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// מגביל קצב גלובלי (RPM) — מבטיח מרווח מינימלי בין קריאות API למניעת 429
let _rateChain = Promise.resolve();
let _lastCallAt = 0;
const MIN_CALL_GAP_MS = 1100; // ~55 קריאות/דקה לכל היותר
const rateLimitGate = () => {
  const p = _rateChain.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, MIN_CALL_GAP_MS - (now - _lastCallAt));
    if (wait) await delay(wait);
    _lastCallAt = Date.now();
  });
  _rateChain = p.catch(() => {});
  return p;
};

// קריאה גנרית למודל עם throttle + backoff חכם. תומך בפלט טקסט או JSON (schema).
const callGemini = async ({ system, userText, imageB64, schema, temperature = 0.0 }) => {
  const parts = [];
  if (userText) parts.push({ text: userText });
  if (imageB64) {
    const { mime, data } = splitDataUrl(imageB64);
    parts.push({ inlineData: { mimeType: mime, data } });
  }

  const generationConfig = { temperature, maxOutputTokens: schema ? 16384 : 8192 };
  if (schema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = schema;
  }

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    generationConfig,
    contents: [{ role: "user", parts }]
  };

  const baseDelays = [1500, 3000, 6000, 12000];
  let lastError = null;
  for (let i = 0; i <= baseDelays.length; i++) {
    try {
      await rateLimitGate();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const status = response.status;
        const bodyText = await response.text().catch(() => '');
        const snippet = (bodyText || '').replace(/\s+/g, ' ').slice(0, 200);
        // שגיאות קבועות — אין טעם בניסיון חוזר
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          throw Object.assign(new Error(`שגיאת API (${status}): ${snippet || 'הבקשה נדחתה'}`), { permanent: true });
        }
        // 429 / 5xx — כבד Retry-After אם נשלח
        let waitMs = null;
        const ra = response.headers && response.headers.get && response.headers.get('retry-after');
        if (ra) { const s = parseInt(ra, 10); if (!isNaN(s)) waitMs = s * 1000; }
        throw Object.assign(new Error(`שגיאת שרת (${status})${status === 429 ? ' — מגבלת קצב/עומס' : ''}`), { waitMs });
      }

      const result = await response.json();
      const cand = result?.candidates?.[0];
      const text = cand?.content?.parts?.[0]?.text;
      if (!text) throw new Error("התקבל פלט ריק מהמודל (ייתכן שהתמונה אינה קריאה).");
      // זיהוי קיטוע פלט — עבור JSON זה פוסל את התוצאה ומפעיל נפילה רכה
      if (cand?.finishReason === 'MAX_TOKENS' && schema) throw new Error("פלט ה-JSON נקטע (MAX_TOKENS).");
      if (schema) return parseJsonLoose(text);
      return text.trim();
    } catch (error) {
      if (error && error.permanent) throw error;
      lastError = error;
      if (i < baseDelays.length) {
        const base = (error && error.waitMs) ? error.waitMs : baseDelays[i];
        const jittered = Math.min(60000, Math.round(base * (0.75 + Math.random() * 0.5))); // jitter
        await delay(jittered);
      }
    }
  }
  throw new Error("החיבור לשרת נכשל לאחר מספר ניסיונות. שגיאה אחרונה: " + (lastError?.message || ''));
};

const parseJsonLoose = (text) => {
  let t = text.trim();
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

/* ============================== OCR Prompt Builders ============================== */

const SYSTEM_BASE = (docHint) => `אתה מנוע OCR מקצועי ברמה מחקרית להמרת תמונה לטקסט עבור ספרות תורנית, דפוס ישן, וסריקות מורכבות. אתה פועל בדיוק מילולי מוחלט.

חוקי יסוד מחייבים:
1. דיוק מילולי: העתק את הטקסט בדיוק כפי שהוא מופיע בתמונה, אות אחר אות, כולל שגיאות כתיב שבמקור.
2. מינימום דילוגים: אל תדלג על אף מילה, אות, או שורה. עבור על כל התמונה בשיטתיות.
3. מנגנון Anti-Hallucination — אסור בהחלט:
   • להשלים פסוקים מהזיכרון.
   • להשלים סוגיות גמרא.
   • להשלים ביטויים ומטבעות לשון מוכרים.
   • להשלים או לפענח ראשי תיבות.
   • להשלים ציטוטים.
   • לתקן שגיאות כתיב או דקדוק.
   • להשתמש בהיגיון תחבירי או הקשר תלמודי כדי "לנחש" מילה.
   • להמיר מילה למונח מוכר.
4. כל רצף שאינו קריא בבירור — סמן אותו במחרוזת ${PLACEHOLDER} ואל תנחש.
5. השמט אך ורק מספרי הערות שוליים עיליים. אל תוסיף שום טקסט, כותרת או הערה משלך.
6. שמור על מבנה השורות והפסקאות המקורי. חבר שורות קטועות באמצע משפט, אך שמור על מעבר פסקה בסוף עניין.

${docHint || ''}

חוק ברזל: החזר אך ורק את הטקסט עצמו, ללא שום מילת הקדמה, הסבר או סיכום.`;

const RASHI_RULES = `
==== מצב כתב רש"י — חומרה מרבית ====
התמונה מכילה כתב רש"י. הקפד בנוסף:
• קרא אות אחר אות בלבד. אל תקרא "מילים" כיחידה.
• אל תנחש מילים ואל תבצע השלמות אוטומטיות מכל סוג.
• אל תתקן שגיאות כתיב ואל תשתמש בהיגיון תחבירי.
• אל תשתמש בהשלמות תלמודיות ואל תמיר מילים למונחים מוכרים.
• היזהר מאות הדומות בכתב רש"י: ${CONFUSABLE_PAIRS}. אל תהפוך אות לאות אחרת רק מפני שכך "מסתדרת" המילה.
• אם אות או מילה אינה ברורה — סמן ${PLACEHOLDER} ולא ניחוש.`;

const docHintFor = (documentType) => {
  if (!documentType || documentType === 'unknown') return '';
  const name = TORAH_DOC_TYPES[documentType] || '';
  if (!name) return '';
  return `הקשר: זהו ככל הנראה ${name}. השתמש בידע זה אך ורק כדי לזהות נכון את מבנה העמוד (גוף, מפרשים, ציטוטים) — לעולם לא כדי להשלים או "לתקן" את התוכן מהזיכרון.`;
};

const isRashiType = (t) => t === 'rashi' || t === 'rashi_and_print';

const buildOcrSystem = (scriptType, documentType) => {
  let sys = SYSTEM_BASE(docHintFor(documentType));
  if (isRashiType(scriptType) || scriptType === 'handwriting') sys += '\n' + RASHI_RULES;
  if (scriptType === 'rashi_and_print') {
    sys += '\nשים לב: העמוד מכיל גם דפוס רגיל וגם כתב רש"י. פענח כל אזור לפי סוג הכתב שלו, ושמור על ההפרדה ביניהם.';
  }
  return sys;
};

/* ============================== Classification ============================== */

const CLASSIFY_SCHEMA = {
  type: "OBJECT",
  properties: {
    scriptType: { type: "STRING", enum: ["rashi", "print", "rashi_and_print", "handwriting", "mixed"] },
    documentType: { type: "STRING", enum: Object.keys(TORAH_DOC_TYPES) },
    confidence: { type: "NUMBER" },
    hasRashiColumn: { type: "BOOLEAN" },
    layoutNotes: { type: "STRING" }
  },
  required: ["scriptType", "confidence"]
};

const classifyDocument = async (imageB64) => {
  const system = `אתה מומחה לזיהוי סוגי כתב וכתבי יד תורניים. נתח את התמונה וזהה:
1. scriptType — סוג הכתב הדומיננטי:
   • "rashi" = כתב רש"י (אותיות חצי-קורסיביות מעוגלות).
   • "print" = דפוס רגיל (אותיות מרובעות סטנדרטיות).
   • "rashi_and_print" = שילוב של דפוס רגיל וכתב רש"י באותו עמוד.
   • "handwriting" = כתב יד.
   • "mixed" = טקסט מעורב/לא אחיד.
2. documentType — סוג המסמך התורני מתוך הרשימה המותרת (אם לא ניתן לקבוע — "unknown").
3. confidence — מידת הביטחון בזיהוי (0-100).
4. hasRashiColumn — האם יש עמודת/אזור רש"י נפרד.
5. layoutNotes — תיאור קצר של מבנה העמוד (כותרת, גוף, מפרשים, שוליים).
החזר JSON בלבד.`;
  try {
    const res = await callGemini({ system, userText: 'סווג את התמונה.', imageB64, schema: CLASSIFY_SCHEMA });
    return {
      scriptType: res.scriptType || 'print',
      documentType: res.documentType || 'unknown',
      confidence: typeof res.confidence === 'number' ? res.confidence : 70,
      hasRashiColumn: !!res.hasRashiColumn,
      layoutNotes: res.layoutNotes || ''
    };
  } catch (e) {
    return { scriptType: 'print', documentType: 'unknown', confidence: 0, hasRashiColumn: false, layoutNotes: '' };
  }
};

/* ============================== OCR Passes ============================== */

// Pass 1 / 2 — קריאה גולמית עצמאית
const ocrRaw = async (imageB64, scriptType, documentType, variantNote) => {
  const system = buildOcrSystem(scriptType, documentType);
  const userText = `חלץ את כל הטקסט מהתמונה תוך יישום מלא של חוקי היסוד.${variantNote ? '\n' + variantNote : ''}`;
  return callGemini({ system, userText, imageB64 });
};

// Pass 3 — השוואה ואיחוד שתי הקריאות
const ocrReconcile = async (imageB64, textA, textB, scriptType, documentType) => {
  const system = buildOcrSystem(scriptType, documentType) +
    '\n\nמשימה נוספת: לפניך שתי קריאות OCR עצמאיות של אותה תמונה. השווה ביניהן מול התמונה המקורית, והפק את הגרסה המדויקת ביותר. במקום מחלוקת — הכרע לפי התמונה בלבד. אם גם לאחר השוואה מילה אינה ברורה — סמן ' + PLACEHOLDER + '.';
  const userText = `קריאה א':\n${textA}\n\n---\nקריאה ב':\n${textB}\n\n---\nהפק את הטקסט המאוחד והמדויק בלבד, מאומת מול התמונה.`;
  return callGemini({ system, userText, imageB64 });
};

// Pass 4 — חיפוש מילים/אותיות חסרות
const ocrMissingWords = async (imageB64, current, scriptType, documentType) => {
  const system = buildOcrSystem(scriptType, documentType) +
    '\n\nמשימה נוספת: בדוק האם בטקסט שסופק חסרות מילים, אותיות או שורות שמופיעות בתמונה. הוסף את החסר בלבד במיקום הנכון. אל תשנה מילים שכבר נכונות ואל תמחק דבר. החזר את הטקסט המלא והמתוקן.';
  const userText = `טקסט נוכחי:\n${current}\n\n---\nהשלם מילים/אותיות/שורות חסרות מול התמונה והחזר את הטקסט המלא.`;
  return callGemini({ system, userText, imageB64 });
};

// Pass 5 — בדיקת אותיות דומות
const ocrSimilarLetters = async (imageB64, current, scriptType, documentType) => {
  const system = buildOcrSystem(scriptType, documentType) +
    `\n\nמשימה נוספת: עבור על הטקסט מול התמונה ובדוק במיוחד החלפות של אותיות דומות: ${CONFUSABLE_PAIRS}. תקן אך ורק מקומות שבהם האות בתמונה שונה מהאות בטקסט. אל תשנה דבר אחר. החזר את הטקסט המלא.`;
  const userText = `טקסט נוכחי:\n${current}\n\n---\nבדוק ותקן אותיות דומות מול התמונה. החזר טקסט מלא בלבד.`;
  return callGemini({ system, userText, imageB64 });
};

// Pass 6 — בדיקת ראשי תיבות
const ocrAbbreviations = async (imageB64, current, scriptType, documentType) => {
  const system = buildOcrSystem(scriptType, documentType) +
    '\n\nמשימה נוספת: בדוק את ראשי התיבות, הגרשיים (") והגרש (\') מול התמונה. ודא שכל ראשי התיבות הועתקו בדיוק כפי שהם מופיעים — אסור לפענח, להרחיב או להשלים אותם. תקן רק אם הסימון בתמונה שונה. החזר את הטקסט המלא.';
  const userText = `טקסט נוכחי:\n${current}\n\n---\nוודא נאמנות ראשי התיבות והגרשיים מול התמונה. החזר טקסט מלא בלבד.`;
  return callGemini({ system, userText, imageB64 });
};

// Pass (Ultra) — בדיקת ניקוד, פיסוק ומבנה שורות
const ocrStructure = async (imageB64, current, scriptType, documentType) => {
  const system = buildOcrSystem(scriptType, documentType) +
    '\n\nמשימה נוספת: בדוק נאמנות הניקוד (אם קיים), הפיסוק, הגרשיים ומבנה השורות והפסקאות מול התמונה. אל תוסיף ניקוד שלא קיים בתמונה. החזר את הטקסט המלא.';
  const userText = `טקסט נוכחי:\n${current}\n\n---\nוודא ניקוד/פיסוק/מבנה מול התמונה. החזר טקסט מלא בלבד.`;
  return callGemini({ system, userText, imageB64 });
};

// Pass (Ultra) — בדיקת שלמות (אפס דילוגים)
const ocrCompleteness = async (imageB64, current, scriptType, documentType) => {
  const system = buildOcrSystem(scriptType, documentType) +
    '\n\nמשימה נוספת: ודא שאף קטע בתמונה לא נשמט. סרוק את התמונה משורה לשורה והשווה לטקסט. אם משהו חסר — הוסף אותו במקום הנכון. החזר את הטקסט המלא.';
  const userText = `טקסט נוכחי:\n${current}\n\n---\nאמת שלמות מלאה (אפס דילוגים) מול התמונה. החזר טקסט מלא בלבד.`;
  return callGemini({ system, userText, imageB64 });
};

// Pass אחרון — אימות סופי + ציוני אמינות לכל מילה
const FINAL_SCHEMA = {
  type: "OBJECT",
  properties: {
    text: { type: "STRING" },
    words: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { word: { type: "STRING" }, confidence: { type: "NUMBER" } },
        required: ["word", "confidence"]
      }
    }
  },
  required: ["text"]
};

const ocrFinalVerify = async (imageB64, current, scriptType, documentType) => {
  const system = buildOcrSystem(scriptType, documentType) +
    `\n\nמשימה סופית: בצע אימות סופי של הטקסט מול התמונה המקורית. החזר JSON עם:
• "text" — הטקסט הסופי המאומת (עם שמירה על שורות ופסקאות, ומחרוזות ${PLACEHOLDER} במקומות לא ברורים).
• "words" — מערך של כל המילים לפי הסדר, כאשר לכל מילה ציון אמינות 0-100 ("confidence") המשקף עד כמה האות/המילה ברורה בתמונה. מילה לא ברורה תקבל ציון נמוך.
שמור על תוכן זהה בין "text" ל-"words".`;
  const userText = `טקסט מועמד:\n${current}\n\n---\nבצע אימות סופי מול התמונה והחזר JSON בלבד.`;
  try {
    const res = await callGemini({ system, userText, imageB64, schema: FINAL_SCHEMA });
    const text = (res && typeof res.text === 'string' && res.text.trim()) ? res.text.trim() : current;
    const words = Array.isArray(res?.words) ? res.words.filter(w => w && typeof w.word === 'string') : [];
    return { text, words };
  } catch (e) {
    // נפילה רכה: החזר את הטקסט הנוכחי ללא ציוני אמינות
    return { text: current, words: [] };
  }
};

/* ============================== Pipeline Orchestration ============================== */

// פענוח עמוד שלם — Multi-Pass (7 / 10 מעברים). שומר טקסט חלקי בכשל באמצע.
const runWholePagePipeline = async (images, scriptType, documentType, settings, onStage) => {
  const N = settings.passCount;
  const passes = [];
  let stage = 0;
  const bump = (label) => { stage++; onStage(stage, N, label); };
  const primary = images.enhanced;
  const secondary = images.binarized || images.enhanced;
  let cur = '';
  let partialText = '';

  try {
    bump('Pass 1 — קריאה גולמית');
    const t1 = await ocrRaw(primary, scriptType, documentType);
    passes.push({ name: 'Pass 1 — קריאה גולמית', text: t1 });
    cur = t1; partialText = t1;
    await delay(600);

    bump('Pass 2 — קריאה שנייה עצמאית');
    const t2 = await ocrRaw(secondary, scriptType, documentType, 'קרא את התמונה מאפס באופן עצמאי, ללא הסתמכות על קריאה קודמת.');
    passes.push({ name: 'Pass 2 — קריאה עצמאית', text: t2 });
    await delay(600);

    bump('Pass 3 — השוואה ואיחוד');
    cur = await ocrReconcile(primary, t1, t2, scriptType, documentType);
    passes.push({ name: 'Pass 3 — השוואה ואיחוד', text: cur }); partialText = cur;
    await delay(600);

    bump('Pass 4 — חיפוש מילים חסרות');
    cur = await ocrMissingWords(primary, cur, scriptType, documentType);
    passes.push({ name: 'Pass 4 — מילים חסרות', text: cur }); partialText = cur;
    await delay(600);

    bump('Pass 5 — בדיקת אותיות דומות');
    cur = await ocrSimilarLetters(primary, cur, scriptType, documentType);
    passes.push({ name: 'Pass 5 — אותיות דומות', text: cur }); partialText = cur;
    await delay(600);

    bump('Pass 6 — בדיקת ראשי תיבות');
    cur = await ocrAbbreviations(primary, cur, scriptType, documentType);
    passes.push({ name: 'Pass 6 — ראשי תיבות', text: cur }); partialText = cur;
    await delay(600);

    if (N >= 10) {
      bump('Pass 7 — ניקוד, פיסוק ומבנה');
      cur = await ocrStructure(primary, cur, scriptType, documentType);
      passes.push({ name: 'Pass 7 — ניקוד ומבנה', text: cur }); partialText = cur;
      await delay(600);

      bump('Pass 8 — בדיקת שלמות (אפס דילוגים)');
      cur = await ocrCompleteness(primary, cur, scriptType, documentType);
      passes.push({ name: 'Pass 8 — שלמות', text: cur }); partialText = cur;
      await delay(600);

      bump('Pass 9 — קריאה עצמאית נוספת ואיחוד');
      const t3 = await ocrRaw(secondary, scriptType, documentType, 'קריאה עצמאית שלישית — התעלם מכל הקריאות הקודמות.');
      cur = await ocrReconcile(primary, cur, t3, scriptType, documentType);
      passes.push({ name: 'Pass 9 — איחוד שלישי', text: cur }); partialText = cur;
      await delay(600);
    }

    bump(`Pass ${N} — אימות סופי + ציוני אמינות`);
    const final = await ocrFinalVerify(primary, cur, scriptType, documentType);
    passes.push({ name: `Pass ${N} — אימות סופי`, text: final.text });

    return { text: final.text, words: final.words, passes };
  } catch (err) {
    throw Object.assign(err, { partialText, partialWords: [] });
  }
};

// פענוח לפי אזורים (Layout Segmentation)
const LAYOUT_SCHEMA = {
  type: "OBJECT",
  properties: {
    blocks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["title", "body", "commentary_rashi", "footnote", "quote", "marginalia", "other"] },
          scriptType: { type: "STRING", enum: ["rashi", "print", "handwriting", "mixed"] },
          box: { type: "ARRAY", items: { type: "NUMBER" } },
          order: { type: "NUMBER" }
        },
        required: ["type", "box"]
      }
    }
  },
  required: ["blocks"]
};

const analyzeLayout = async (imageB64) => {
  const system = `אתה מנתח פריסת עמוד (Layout Analysis) של ספרים תורניים. זהה את כל הבלוקים בעמוד (כותרת, גוף טקסט, פירוש רש"י, הערות שוליים, ציטוטים, הערות בשוליים).
לכל בלוק החזר:
• type — סוג הבלוק.
• scriptType — סוג הכתב בבלוק.
• box — תיבה תוחמת [ymin, xmin, ymax, xmax] בסקאלה 0..1000 (יחסית לגובה ולרוחב התמונה).
• order — סדר הקריאה ההגיוני (1 = ראשון).
החזר JSON בלבד. אם העמוד הוא בלוק אחיד אחד — החזר בלוק יחיד שמכסה את כל העמוד.`;
  const res = await callGemini({ system, userText: 'נתח את פריסת העמוד.', imageB64, schema: LAYOUT_SCHEMA });
  let blocks = Array.isArray(res?.blocks) ? res.blocks : [];
  blocks = blocks.filter(b => Array.isArray(b.box) && b.box.length === 4);
  blocks.sort((a, b) => (a.order || 99) - (b.order || 99));
  return blocks;
};

const runRegionPipeline = async (images, scriptType, documentType, settings, onStage) => {
  // ניתוח פריסה על התמונה המשופרת
  let blocks = [];
  try { blocks = await analyzeLayout(images.enhanced); } catch (e) { blocks = []; }
  if (!blocks.length) {
    // נפילה רכה — פענוח עמוד שלם
    return runWholePagePipeline(images, scriptType, documentType, settings, onStage);
  }

  // כל בלוק עובר רצף מעברים אמיתי: סטנדרט 4 (raw → אותיות דומות → ר"ת → אימות),
  // Ultra 7 (raw → עצמאי → איחוד → חסרות → אותיות דומות → ר"ת → אימות).
  const perBlockPasses = settings.ultraRashi ? 7 : 4;
  const total = 1 + blocks.length * perBlockPasses + 1;
  let stage = 0;
  const bump = (label) => { stage++; onStage(stage, total, label); };
  bump('ניתוח פריסת העמוד (Layout)');

  const blockLabel = { commentary_rashi: 'רש"י', footnote: 'הערת שוליים', quote: 'ציטוט', marginalia: 'הגהה', title: 'כותרת' };
  const passes = [];
  const segments = [];
  const allWords = [];
  let partialText = '';

  try {
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks[bi];
      const blockScript = block.scriptType || scriptType;
      const blockImg = await cropRegion(images.enhanced, block.box);
      const typeLabel = block.type || 'body';
      const tag = `בלוק ${bi + 1}/${blocks.length}`;

      bump(`${tag} (${typeLabel}) — קריאה גולמית`);
      let cur = await ocrRaw(blockImg, blockScript, documentType);
      await delay(400);

      if (settings.ultraRashi) {
        bump(`${tag} — קריאה עצמאית`);
        const cur2 = await ocrRaw(blockImg, blockScript, documentType, 'קרא מחדש את הבלוק באופן עצמאי לחלוטין.');
        await delay(400);
        bump(`${tag} — השוואה ואיחוד`);
        cur = await ocrReconcile(blockImg, cur, cur2, blockScript, documentType);
        await delay(400);
        bump(`${tag} — מילים חסרות`);
        cur = await ocrMissingWords(blockImg, cur, blockScript, documentType);
        await delay(400);
      }

      bump(`${tag} — אותיות דומות`);
      cur = await ocrSimilarLetters(blockImg, cur, blockScript, documentType);
      await delay(400);

      bump(`${tag} — ראשי תיבות`);
      cur = await ocrAbbreviations(blockImg, cur, blockScript, documentType);
      await delay(400);

      bump(`${tag} — אימות סופי`);
      const fin = await ocrFinalVerify(blockImg, cur, blockScript, documentType);
      await delay(400);

      // שמירת הבחנת סוג הבלוק באיחוד הסופי
      const lbl = blockLabel[typeLabel];
      const seg = (lbl && typeLabel !== 'body') ? `【${lbl}】\n${fin.text}` : fin.text;
      segments.push(seg);
      if (Array.isArray(fin.words)) allWords.push(...fin.words);
      passes.push({ name: `${tag} (${typeLabel})`, text: fin.text });
      partialText = segments.filter(s => s && s.trim()).join('\n\n');
    }
  } catch (err) {
    throw Object.assign(err, { partialText, partialWords: allWords });
  }

  bump('איחוד הבלוקים למסמך');
  const text = segments.filter(s => s && s.trim()).join('\n\n');
  return { text, words: allWords, passes };
};

const runOcrEngine = async (page, settings, onStage, onMeta) => {
  // 1. Classification (מדולג כשהמשתמש כפה סוג כתב — חוסך קריאת API)
  let scriptType, documentType, scriptConfidence;
  if (settings.forceScriptType && settings.forceScriptType !== 'auto') {
    onStage(0, 1, 'מכין עיבוד (סוג כתב נכפה ידנית)...');
    scriptType = settings.forceScriptType;
    documentType = 'unknown';
    scriptConfidence = 100;
  } else {
    onStage(0, 1, 'מסווג את סוג הכתב והמסמך...');
    const cls = await classifyDocument(page.originalImage);
    scriptType = cls.scriptType;
    documentType = cls.documentType;
    scriptConfidence = cls.confidence;
  }
  if (onMeta) onMeta({ scriptType, documentType, scriptConfidence });

  // 2. Preprocessing
  onStage(0, 1, 'עיבוד מקדים של התמונה (Deskew/Contrast/Sharpen)...');
  let images;
  try {
    images = await preprocessImage(page.originalImage, settings);
  } catch (e) {
    images = { enhanced: page.originalImage, binarized: null };
  }

  // 3. OCR — לפי אזורים או עמוד שלם
  if (settings.regionOcr) {
    return runRegionPipeline(images, scriptType, documentType, settings, onStage);
  }
  return runWholePagePipeline(images, scriptType, documentType, settings, onStage);
};

/* ============================== Export Functions ============================== */

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ייצוא Word אמיתי (.docx) באמצעות ספריית docx
const exportToDocx = async (pages, includeImages) => {
  const docx = await loadDocx();
  const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;

  const children = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (!page.combinedText) continue;

    // כותרת עמוד
    children.push(new Paragraph({
      pageBreakBefore: i > 0,
      bidirectional: true,
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: `עמוד ${i + 1}` + (page.scriptType ? ` · ${SCRIPT_TYPE_LABELS[page.scriptType] || ''}` : ''), color: '888888', size: 18, font: 'Arial' })]
    }));

    // תמונה (אופציונלי)
    if (includeImages && page.originalImage) {
      try {
        const img = await loadImage(page.originalImage);
        const { data } = splitDataUrl(page.originalImage);
        const maxW = 480;
        const ratio = img.height / img.width;
        const w = Math.min(maxW, img.width);
        const h = Math.round(w * ratio);
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ data: base64ToUint8(data), transformation: { width: w, height: h } })]
        }));
      } catch (e) { /* דלג על תמונה פגומה */ }
    }

    // גוף הטקסט — פסקה לכל שורה, RTL. שורה ריקה => פסקה ריקה (שימור מבנה הפסקאות)
    const lines = page.combinedText.split('\n');
    for (const line of lines) {
      if (!line.trim()) {
        children.push(new Paragraph({ bidirectional: true, children: [] }));
        continue;
      }
      children.push(new Paragraph({
        bidirectional: true,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 360 },
        children: [new TextRun({ text: line.trim(), rightToLeft: true, font: 'David', size: 28 })]
      }));
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'David', size: 28 } } } },
    sections: [{ properties: {}, children: children.length ? children : [new Paragraph('')] }]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, includeImages ? 'NexusOCR_RashiPro_WithImages.docx' : 'NexusOCR_RashiPro.docx');
};

// ייצוא MHTML (נשמר כגיבוי לתאימות לאחור אם docx נכשלת בטעינה)
const exportToWordMhtml = (pages, includeImages) => {
  const boundary = "----=_NextPart_Nexus_OCR_" + Math.random().toString(36).substring(2);
  let mhtmlContent = `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${boundary}"\r\n\r\n`;
  mhtmlContent += `--${boundary}\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n`;
  let htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" dir="rtl"><head><meta charset="utf-8"><style>body{font-family:'David','Frank Ruhl Libre',serif;font-size:16pt;line-height:1.8;direction:rtl;text-align:right;}p{margin-bottom:14pt;text-align:justify;direction:rtl;}.page-break{page-break-before:always;}</style></head><body>`;
  let imagesMhtml = "";
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (!page.combinedText) continue;
    htmlContent += `<div class="${i > 0 ? 'page-break' : ''}">`;
    if (includeImages && page.originalImage) {
      const { mime } = splitDataUrl(page.originalImage);
      const base64Data = page.originalImage.split(',')[1];
      const imgId = `image_${i}.jpg`;
      htmlContent += `<div style="text-align:center"><img src="cid:${imgId}" /></div>`;
      imagesMhtml += `--${boundary}\r\nContent-Type: ${mime}\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <${imgId}>\r\n\r\n`;
      imagesMhtml += (base64Data.match(/.{1,76}/g) || []).join('\r\n') + `\r\n\r\n`;
    }
    page.combinedText.split('\n').filter(p => p.trim()).forEach(p => { htmlContent += `<p>${p.trim()}</p>`; });
    htmlContent += `</div>`;
  }
  htmlContent += `</body></html>`;
  mhtmlContent += htmlContent + `\r\n\r\n` + imagesMhtml + `--${boundary}--\r\n`;
  downloadBlob(new Blob([mhtmlContent], { type: 'application/msword' }), includeImages ? 'NexusOCR_WithImages.doc' : 'NexusOCR.doc');
};

// ייצוא PDF איכותי — פתיחת חלון הדפסה מעוצב (RTL מלא, טקסט וקטורי, "שמור כ-PDF")
const exportToPdf = (pages) => {
  const win = window.open('', '_blank');
  if (!win) {
    alert('חסימת חלונות קופצים מנעה את ייצוא ה-PDF. אפשר חלונות קופצים ונסה שוב.');
    return;
  }
  // escaping מלא (& חייב להיות ראשון) לשמירה על נאמנות מילולית של הטקסט
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let body = '';
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (!page.combinedText) continue;
    body += `<div class="page ${i > 0 ? 'brk' : ''}">`;
    body += `<div class="ttl">${esc('עמוד ' + (i + 1) + (page.scriptType ? ' · ' + (SCRIPT_TYPE_LABELS[page.scriptType] || '') : ''))}</div>`;
    page.combinedText.split('\n').filter(p => p.trim()).forEach(p => {
      body += `<p>${esc(p.trim())}</p>`;
    });
    body += `</div>`;
  }
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8"><title>NexusOCR</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&display=swap');
    body{font-family:'Frank Ruhl Libre','David',serif;direction:rtl;text-align:right;color:#111;margin:2.2cm;}
    .ttl{color:#888;font-size:10pt;font-family:sans-serif;margin-bottom:8pt;}
    p{font-size:14pt;line-height:1.9;text-align:justify;margin:0 0 10pt;}
    .brk{page-break-before:always;}
    @media print{.brk{page-break-before:always;}}
  </style></head><body>${body}
  <script>window.onload=function(){var go=function(){setTimeout(function(){window.print();},150);};if(document.fonts&&document.fonts.ready){document.fonts.ready.then(go).catch(go);}else{setTimeout(go,500);}};<\/script>
  </body></html>`);
  win.document.close();
};

// ייצוא TXT — טקסט בלבד
const exportToTxt = (pages) => {
  let out = '';
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (!page.combinedText) continue;
    out += `===== עמוד ${i + 1} =====\n\n${page.combinedText}\n\n`;
  }
  // BOM עבור תצוגה תקינה של עברית ב-Notepad
  downloadBlob(new Blob(['﻿' + out], { type: 'text/plain;charset=utf-8' }), 'NexusOCR.txt');
};

// ייצוא JSON — טקסט + ציוני אמינות
const exportToJson = (pages) => {
  const data = {
    engine: 'NexusOCR Research Grade',
    generatedAt: new Date().toISOString(),
    confidenceThreshold: CONFIDENCE_THRESHOLD,
    pages: pages.filter(p => p.combinedText).map((p, idx) => ({
      page: idx + 1,
      name: p.name,
      scriptType: p.scriptType,
      scriptTypeLabel: SCRIPT_TYPE_LABELS[p.scriptType] || null,
      documentType: p.documentType,
      documentTypeLabel: TORAH_DOC_TYPES[p.documentType] || null,
      lowConfidenceCount: p.lowConfidenceCount,
      text: p.combinedText,
      words: (p.words || []).map(w => ({ word: w.word, confidence: typeof w.confidence === 'number' ? w.confidence : null }))
    }))
  };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'NexusOCR.json');
};

/* ============================== Component ============================== */

export default function App() {
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const wakeLockRef = useRef(null);

  // טעינה/שמירה של הגדרות ב-localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexusocr_settings');
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch (e) {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('nexusocr_settings', JSON.stringify(settings)); } catch (e) {}
  }, [settings]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch (err) { console.warn('Wake Lock request failed:', err.message); }
  };
  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) { await wakeLockRef.current.release(); wakeLockRef.current = null; }
  };

  const updatePageStatus = (pageId, updates) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, ...updates } : p));
  };

  // --- עיבוד עמוד יחיד דרך המנוע החדש ---
  const processPage = async (pageId, page) => {
    const eff = effectiveSettings(settings);
    updatePageStatus(pageId, { status: 'reading', scanStage: 0, totalStages: eff.passCount, stageLabel: 'מאתחל...', error: null });

    const onStage = (stage, total, label) => {
      updatePageStatus(pageId, { scanStage: stage, totalStages: total, stageLabel: label });
    };
    const onMeta = (meta) => updatePageStatus(pageId, meta);

    try {
      const result = await runOcrEngine(page, eff, onStage, onMeta);
      const lowCount = (result.words || []).filter(w => typeof w.confidence === 'number' && w.confidence < CONFIDENCE_THRESHOLD).length;
      updatePageStatus(pageId, {
        combinedText: result.text,
        words: result.words || [],
        passes: result.passes || [],
        lowConfidenceCount: lowCount,
        status: 'completed',
        scanStage: result.passes ? result.passes.length : eff.passCount
      });
    } catch (error) {
      console.error("Processing error:", error);
      const partial = error && error.partialText;
      if (partial && partial.trim()) {
        // שמירת הטקסט החלקי שכבר הופק (כשל באמצע ה-pipeline) — לא מאבדים עבודה
        const pw = error.partialWords || [];
        const lowCount = pw.filter(w => typeof w.confidence === 'number' && w.confidence < CONFIDENCE_THRESHOLD).length;
        updatePageStatus(pageId, {
          combinedText: partial,
          words: pw,
          lowConfidenceCount: lowCount,
          status: 'partial',
          error: error.message
        });
      } else {
        updatePageStatus(pageId, { status: 'error', error: error.message });
      }
    }
  };

  const startBatchProcess = async () => {
    setIsProcessingGlobal(true);
    setGlobalError(null);
    await requestWakeLock();
    const pagesToProcess = pages.filter(p => p.status === 'pending' || p.status === 'error' || p.status === 'partial');
    for (const page of pagesToProcess) {
      setSelectedPageId(page.id);
      // קרא את המצב העדכני של העמוד (כולל originalImage)
      await processPage(page.id, page);
      await delay(1200);
    }
    setIsProcessingGlobal(false);
    await releaseWakeLock();
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsExtractingPdf(true);
    setPdfProgress({ current: 0, total: 0, percentage: 0 });
    setGlobalError(null);
    const eff = effectiveSettings(settings);
    let newPages = [];
    try {
      for (const file of files) {
        if (file.type === 'application/pdf') {
          const pdfPages = await extractPdfPages(file, eff.pdfScale, (current, total) => {
            setPdfProgress({ current, total, percentage: Math.round((current / total) * 100) });
          });
          newPages = [...newPages, ...pdfPages];
        } else {
          const base64 = await fileToBase64(file);
          const thumb = await makeThumbnail(base64);
          newPages.push(newPageObject(file.name, base64, thumb));
        }
      }
      setPages(prev => [...prev, ...newPages]);
      if (!selectedPageId && newPages.length > 0) setSelectedPageId(newPages[0].id);
    } catch (err) {
      console.error("File upload error:", err);
      setGlobalError("אירעה שגיאה בטעינת הקבצים. ודא שהקובץ תקין והמערכת תומכת בו.");
    } finally {
      setIsExtractingPdf(false);
      e.target.value = '';
    }
  };

  // --- עטיפת ייצוא עם טיפול בשגיאות ---
  const runExport = async (fn) => {
    if (pages.length === 0) return;
    setExportMenuOpen(false);
    setIsExporting(true);
    try { await fn(); }
    catch (error) {
      console.error("Export error:", error);
      setGlobalError("אירעה שגיאה בייצוא: " + (error.message || ''));
    } finally { setIsExporting(false); }
  };

  const handleExportWord = (includeImages) => runExport(async () => {
    try { await exportToDocx(pages, includeImages); }
    catch (e) {
      console.warn('docx export failed, falling back to MHTML:', e.message);
      exportToWordMhtml(pages, includeImages); // נפילה רכה
    }
  });

  const selectedPage = pages.find(p => p.id === selectedPageId);
  const totalPages = pages.length;
  const processedPages = pages.filter(p => p.status === 'completed' || p.status === 'error' || p.status === 'partial').length;
  const ocrProgressPercentage = totalPages > 0 ? Math.round((processedPages / totalPages) * 100) : 0;
  const hasResults = pages.some(p => p.combinedText);

  // --- רינדור טקסט עם הדגשת מילים בעלות אמינות נמוכה (יישור לפי תוכן, לא לפי מיקום) ---
  const renderTextContent = (text, words) => {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const wlist = Array.isArray(words) ? words : [];
    const norm = (s) => (s || '').replace(/[^֐-׿0-9A-Za-z]/g, '');
    const matches = (a, b) => a && b && (a === b || a.startsWith(b) || b.startsWith(a));
    let wi = 0;
    // התאמת confidence לטוקן לפי מחרוזת המילה (עם resync קל), במקום מונה פוזיציוני שביר
    const confFor = (tok) => {
      const nt = norm(tok);
      if (!nt || wi >= wlist.length) return null;
      if (matches(nt, norm(wlist[wi].word))) { const c = wlist[wi].confidence; wi++; return c; }
      for (let k = 1; k <= 4 && wi + k < wlist.length; k++) {
        if (matches(nt, norm(wlist[wi + k].word))) { const c = wlist[wi + k].confidence; wi = wi + k + 1; return c; }
      }
      return null; // אין התאמה — לא מקדמים את המצביע (מונע סחיפה)
    };
    return (
      <div className="space-y-6 pb-12">
        {paragraphs.map((paragraph, pIdx) => {
          const parts = paragraph.split(/(\s+)/);
          return (
            <p key={pIdx} className="text-justify leading-[1.85] text-xl md:text-2xl text-slate-800 font-serif break-words px-2 md:px-4">
              {parts.map((tok, ti) => {
                if (/^\s+$/.test(tok) || tok === '') return <span key={ti}>{tok}</span>;
                if (tok === PLACEHOLDER || tok.indexOf(PLACEHOLDER) !== -1) {
                  return <span key={ti} className="bg-rose-100 text-rose-600 rounded px-1 font-bold" title="קטע לא קריא">{tok}</span>;
                }
                const conf = confFor(tok);
                const low = (typeof conf === 'number' && conf < CONFIDENCE_THRESHOLD);
                return low
                  ? <span key={ti} className="bg-amber-100 text-amber-900 rounded px-0.5 border-b-2 border-amber-300" title={`אמינות ${conf} — מומלץ לבדוק`}>{tok}</span>
                  : <span key={ti}>{tok}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const eff = effectiveSettings(settings);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200 selection:text-indigo-900 flex flex-col overflow-hidden" dir="rtl">

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-4 md:px-8 z-50 flex flex-col md:flex-row md:items-center gap-4 shrink-0 shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex items-center gap-4 shrink-0 justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-700 flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.25)] border border-white/20 relative">
              <ScanTextIcon className="text-white w-6 h-6 md:w-7 md:h-7 drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">OCR</span></h1>
              <div className="flex items-center gap-1.5 mt-1.5 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-extrabold text-indigo-700 tracking-wide uppercase">
                  {eff.ultraRashi ? 'Ultra Rashi · 10 מעברים' : 'מנוע מחקרי · 7 מעברים'}{eff.regionOcr ? ' · אזורים' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0 md:mr-auto w-full md:w-auto px-1">
          <label className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-full transition-all select-none ${isExtractingPdf ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'}`}>
            {isExtractingPdf ? <Loader2Icon className="w-5 h-5 animate-spin" /> : <UploadIcon className="w-5 h-5 text-indigo-600" />}
            <span className="text-sm md:text-base font-extrabold whitespace-nowrap">{isExtractingPdf ? 'טוען קבצים...' : 'הוסף קבצים'}</span>
            <input type="file" multiple accept="image/jpeg, image/png, application/pdf" className="sr-only" onChange={handleFileUpload} disabled={isExtractingPdf} />
          </label>

          {/* Ultra Rashi toggle */}
          <button
            onClick={() => setSettings(s => ({ ...s, ultraRashi: !s.ultraRashi }))}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-full font-extrabold text-sm transition-all border ${settings.ultraRashi ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}
            title="מצב Ultra Rashi — 10 מעברים, מקסימום דיוק"
          >
            <SparklesIcon className="w-5 h-5" /> Ultra Rashi
          </button>

          <button
            onClick={startBatchProcess}
            disabled={isProcessingGlobal || pages.length === 0}
            className="flex-shrink-0 flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white px-7 py-3 rounded-full font-extrabold transition-all shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_10px_25px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 cursor-pointer"
          >
            {isProcessingGlobal ? <Loader2Icon className="w-5 h-5 animate-spin" /> : <PlayIcon className="w-5 h-5" />}
            <span className="text-sm md:text-base whitespace-nowrap">{isProcessingGlobal ? 'מפענח כעת...' : 'התחל סריקה רב-שלבית'}</span>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all"
            title="הגדרות מנוע"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-slate-200 hidden md:block mx-1"></div>

          {/* Export dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setExportMenuOpen(o => !o)}
              disabled={!hasResults || isExporting}
              className="flex items-center gap-2 bg-slate-100/80 hover:bg-white disabled:opacity-50 text-slate-700 px-5 py-3 rounded-full transition-all font-bold text-sm cursor-pointer whitespace-nowrap border border-slate-200 shadow-inner"
            >
              {isExporting ? <Loader2Icon className="w-5 h-5 animate-spin" /> : <DownloadIcon className="w-5 h-5 text-emerald-600" />}
              ייצוא
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)}></div>
                <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 overflow-hidden">
                  <button onClick={() => handleExportWord(false)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"><FileWordIcon className="w-5 h-5 text-blue-600" /> Word (DOCX) — טקסט</button>
                  <button onClick={() => handleExportWord(true)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"><FileWordIcon className="w-5 h-5 text-indigo-600" /> Word (DOCX) + תמונות</button>
                  <button onClick={() => runExport(() => exportToPdf(pages))} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"><FilePdfIcon className="w-5 h-5 text-rose-600" /> PDF (הדפסה / שמירה)</button>
                  <button onClick={() => runExport(() => exportToTxt(pages))} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"><FileTextIcon className="w-5 h-5 text-slate-600" /> TXT — טקסט בלבד</button>
                  <button onClick={() => runExport(() => exportToJson(pages))} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"><FileJsonIcon className="w-5 h-5 text-amber-600" /> JSON — טקסט + אמינות</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative">

        {/* Sidebar */}
        <aside className="w-full md:w-[340px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-[8px_0_30px_rgba(0,0,0,0.03)] z-40 h-[30vh] md:h-full">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">תור מסמכים וקבצים</h2>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-black shadow-sm">{pages.length}</span>
            </div>
            {isExtractingPdf && (
              <div className="mb-2">
                <div className="flex justify-between text-[11px] font-bold text-indigo-600 mb-1.5">
                  <span>מחלץ דפי PDF (scale {eff.pdfScale})...</span>
                  <span>{pdfProgress.percentage}%</span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${pdfProgress.percentage}%` }}></div>
                </div>
              </div>
            )}
            {totalPages > 0 && !isExtractingPdf && (
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                  <span>התקדמות סריקה כוללת</span>
                  <span className="text-emerald-600">{ocrProgressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500 relative" style={{ width: `${ocrProgressPercentage}%` }}>
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-50/30">
            {pages.map((page) => (
              <div key={page.id} onClick={() => setSelectedPageId(page.id)}
                className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 border-2 ${selectedPageId === page.id ? 'bg-white border-indigo-500 shadow-md ring-4 ring-indigo-500/10 z-10' : 'bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200'} flex p-2.5 gap-3.5 items-center`}>
                <div className="w-14 h-20 rounded-xl bg-slate-200/50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
                  <img src={page.thumb || page.originalImage} alt="" className="w-full h-full object-cover" />
                  {page.status === 'reading' && <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center backdrop-blur-sm"><Loader2Icon className="w-6 h-6 text-white animate-spin" /></div>}
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className={`text-sm font-extrabold truncate ${selectedPageId === page.id ? 'text-indigo-900' : 'text-slate-700'}`}>{page.name}</span>
                  {page.scriptType && (
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded w-fit mt-1 border border-violet-100">{SCRIPT_TYPE_LABELS[page.scriptType] || page.scriptType}</span>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5 bg-white/50 w-fit px-2 py-0.5 rounded border border-slate-100">
                    {page.status === 'pending' && <><div className="w-2 h-2 rounded-full bg-slate-300"></div><span className="text-[11px] text-slate-500 font-bold">ממתין לסריקה</span></>}
                    {page.status === 'reading' && <><div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div><span className="text-[11px] text-indigo-600 font-extrabold">{page.scanStage}/{page.totalStages || eff.passCount}...</span></>}
                    {page.status === 'completed' && <><CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" /><span className="text-[11px] text-emerald-600 font-extrabold">{page.lowConfidenceCount > 0 ? `${page.lowConfidenceCount} לבדיקה` : '100% מושלם'}</span></>}
                    {page.status === 'partial' && <><AlertCircleIcon className="w-3.5 h-3.5 text-amber-500" /><span className="text-[11px] text-amber-600 font-extrabold truncate">חלקי — נסה שוב</span></>}
                    {page.status === 'error' && <><AlertCircleIcon className="w-3.5 h-3.5 text-rose-500" /><span className="text-[11px] text-rose-600 font-extrabold truncate">שגיאה</span></>}
                  </div>
                </div>
              </div>
            ))}
            {pages.length === 0 && !isExtractingPdf && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60 p-6 text-center">
                <FileTextIcon className="w-12 h-12 stroke-[1.5] text-slate-300" />
                <p className="text-sm font-bold">האזור ריק. גרור קבצים לכאן או השתמש בכפתור למעלה.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Workspace Panels */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden h-full">
          {globalError && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3 shadow-md shrink-0">
              <AlertCircleIcon className="w-6 h-6 shrink-0" />
              <span className="font-bold font-sans flex-1">{globalError}</span>
              <button onClick={() => setGlobalError(null)} className="hover:bg-rose-100 p-1.5 rounded-lg transition-colors font-bold">✖ סגור</button>
            </div>
          )}

          {selectedPage ? (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 overflow-hidden min-h-0">
              {/* Image Preview */}
              <div className="relative rounded-[2rem] overflow-hidden border-2 border-slate-200/60 bg-slate-200/30 flex items-center justify-center shadow-inner min-h-[30vh] lg:min-h-0 group">
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black tracking-widest text-slate-600 uppercase shadow-md border border-slate-200 z-10">מסמך מקור</div>
                {selectedPage.documentType && selectedPage.documentType !== 'unknown' && (
                  <div className="absolute top-4 left-4 bg-violet-600/95 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-md z-10">{TORAH_DOC_TYPES[selectedPage.documentType] || ''}</div>
                )}
                <div className="w-full h-full p-4 md:p-8 flex items-center justify-center overflow-auto custom-scrollbar relative">
                  <img src={selectedPage.originalImage} className="max-w-full max-h-full object-contain rounded-2xl border border-slate-200 shadow-xl bg-white relative z-10" alt="Source" />
                  {selectedPage.status === 'reading' && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[2rem] bg-indigo-900/5 backdrop-blur-[1px]">
                      <div className="laser-beam absolute left-0 w-full h-[6px] mix-blend-screen"
                        style={{
                          backgroundColor: ['#6366f1', '#fbbf24', '#34d399', '#d946ef'][selectedPage.scanStage % 4],
                          boxShadow: `0 0 30px 8px ${['#6366f180', '#fbbf2480', '#34d39980', '#d946ef80'][selectedPage.scanStage % 4]}`
                        }}>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Result */}
              <div className="rounded-[2rem] border-2 border-slate-200/60 bg-white flex flex-col shadow-2xl shadow-slate-200/50 relative overflow-hidden min-h-[40vh] lg:min-h-0">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50 gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <SettingsIcon className="w-5 h-5 text-indigo-500" /> תוצאת הפענוח
                  </h3>
                  {selectedPage.status === 'reading' && (
                    <div className="flex items-center gap-2 text-xs font-extrabold bg-white border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full shadow-sm">
                      <Loader2Icon className="w-4 h-4 animate-spin text-indigo-500" />
                      {selectedPage.scanStage}/{selectedPage.totalStages || eff.passCount}: {selectedPage.stageLabel}
                    </div>
                  )}
                  {selectedPage.status === 'completed' && (
                    selectedPage.lowConfidenceCount > 0
                      ? <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full shadow-sm"><AlertCircleIcon className="w-4 h-4" /> {selectedPage.lowConfidenceCount} מילים לבדיקה</span>
                      : <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full shadow-sm"><CheckCircle2Icon className="w-4 h-4" /> מאומת ומוכן</span>
                  )}
                  {selectedPage.status === 'partial' && <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full shadow-sm"><AlertCircleIcon className="w-4 h-4" /> פלט חלקי — נכשל באמצע, נסה שוב</span>}
                </div>

                <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white relative">
                  {selectedPage.status === 'error' ? (
                    <div className="text-rose-700 bg-rose-50 p-8 rounded-3xl border border-rose-100 text-center flex flex-col items-center">
                      <AlertCircleIcon className="w-12 h-12 mb-4 text-rose-400" />
                      <strong className="block mb-2 text-lg">שגיאת עיבוד</strong>
                      <p className="text-base text-rose-600/80 mt-2">{selectedPage.error}</p>
                    </div>
                  ) : (
                    <>
                      {selectedPage.combinedText ? (
                        renderTextContent(selectedPage.combinedText, selectedPage.words)
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6">
                          {selectedPage.status === 'reading' ? (
                            <div className="flex flex-col items-center text-center px-4">
                              <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-[4px] border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-[4px] rounded-full border-t-transparent animate-spin border-indigo-500"></div>
                                <ScanTextIcon className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" />
                              </div>
                              <h4 className="text-xl font-black text-slate-800 mb-2">{selectedPage.stageLabel || 'מפענח...'}</h4>
                              <p className="text-sm text-slate-500 font-bold">מבצע {selectedPage.totalStages || eff.passCount} מעברי OCR מדוקדקים · מינימום דילוגים · אפס הזיות.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center opacity-40">
                              <FileTextIcon className="w-20 h-20 mb-5 stroke-[1.5]" />
                              <p className="text-lg font-black text-slate-600">הטקסט יופיע כאן</p>
                              <p className="text-base font-bold mt-1">לחץ על "התחל סריקה רב-שלבית" כדי להתחיל</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-[4rem] border-[3px] border-slate-200 border-dashed m-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-md border border-slate-100 relative z-10 group-hover:-translate-y-3 transition-transform duration-500 group-hover:shadow-2xl group-hover:shadow-indigo-200 group-hover:border-indigo-200">
                <ScanTextIcon className="w-14 h-14 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight relative z-10">מערכת OCR מחקרית לכתבי רש"י וספרות תורנית</h2>
              <p className="text-lg mt-3 text-slate-500 font-bold relative z-10 max-w-xl text-center">זיהוי סוג כתב אוטומטי · 7–10 מעברי אימות · עיבוד תמונה מתקדם · אפס השלמות מהזיכרון · ציוני אמינות לכל מילה.</p>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSettingsOpen(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-lg max-h-[88vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-indigo-500" /> הגדרות מנוע OCR</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><XIcon className="w-5 h-5" /></button>
            </div>

            <div className="p-7 space-y-6">
              {/* Modes */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">מצבי פענוח</h4>
                <ToggleRow icon={<SparklesIcon className="w-5 h-5 text-amber-500" />} title="Ultra Rashi Mode" desc="10 מעברי OCR · עיבוד מקסימלי · אפס השלמות · דיוק לפני מהירות." checked={settings.ultraRashi} onChange={() => setSettings(s => ({ ...s, ultraRashi: !s.ultraRashi }))} />
                <ToggleRow icon={<LayersIcon className="w-5 h-5 text-indigo-500" />} title="OCR לפי אזורים" desc={'פירוק העמוד לבלוקים (כותרת, גוף, רש"י, שוליים) ופענוח כל בלוק בנפרד. מומלץ לעמודים מורכבים.'} checked={settings.regionOcr} onChange={() => setSettings(s => ({ ...s, regionOcr: !s.regionOcr }))} />
              </div>

              {/* Script type */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">סוג כתב</h4>
                <select value={settings.forceScriptType} onChange={e => setSettings(s => ({ ...s, forceScriptType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-indigo-400">
                  <option value="auto">זיהוי אוטומטי (Classification)</option>
                  <option value="rashi">כתב רש"י</option>
                  <option value="print">דפוס רגיל</option>
                  <option value="rashi_and_print">שילוב רש"י ודפוס</option>
                  <option value="handwriting">כתב יד</option>
                  <option value="mixed">טקסט מעורב</option>
                </select>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">רזולוציה</h4>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-slate-600">רזולוציית חילוץ PDF: <span className="text-indigo-600">{settings.pdfScale.toFixed(1)}x</span></label>
                  <input type="range" min="2" max="5" step="0.5" value={settings.pdfScale} onChange={e => setSettings(s => ({ ...s, pdfScale: parseFloat(e.target.value) }))} className="flex-1 max-w-[200px] accent-indigo-600" disabled={settings.ultraRashi} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-slate-600">רוחב מקסימלי ל-OCR: <span className="text-indigo-600">{settings.ocrMaxWidth}px</span></label>
                  <input type="range" min="1200" max="3500" step="256" value={settings.ocrMaxWidth} onChange={e => setSettings(s => ({ ...s, ocrMaxWidth: parseInt(e.target.value) }))} className="flex-1 max-w-[200px] accent-indigo-600" disabled={settings.ultraRashi} />
                </div>
                {settings.ultraRashi && <p className="text-[11px] text-amber-600 font-bold">במצב Ultra Rashi הרזולוציה מוגדרת אוטומטית למקסימום.</p>}
              </div>

              {/* Preprocessing */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">עיבוד מקדים (Preprocessing)</h4>
                {[
                  ['superResolution', 'Super Resolution', 'הגדלת רזולוציה וחידוד תמונה'],
                  ['deskew', 'Deskew', 'יישור דפים עקומים'],
                  ['contrast', 'Contrast Enhancement', 'שיפור ניגודיות'],
                  ['sharpen', 'Sharpen', 'חידוד טקסט'],
                  ['denoise', 'Denoise', 'ניקוי רעשים (איטי יותר)'],
                  ['adaptiveThreshold', 'Adaptive Threshold', 'הבלטת אותיות חלשות (קריאה עצמאית נוספת)'],
                ].map(([key, title, desc]) => (
                  <ToggleRow key={key} small title={title} desc={desc} checked={settings.preprocess[key]} disabled={settings.ultraRashi} onChange={() => setSettings(s => ({ ...s, preprocess: { ...s.preprocess, [key]: !s.preprocess[key] } }))} />
                ))}
                {settings.ultraRashi && <p className="text-[11px] text-amber-600 font-bold">במצב Ultra Rashi כל שלבי העיבוד פעילים.</p>}
              </div>

              <button onClick={() => setSettings(DEFAULT_SETTINGS)} className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-colors">איפוס להגדרות ברירת מחדל</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=Heebo:wght@300;400;500;700;800;900&display=swap');
        body { font-family: 'Heebo', sans-serif; }
        .font-serif { font-family: 'Frank Ruhl Libre', serif; }
        .laser-beam { animation: laserScan 2.5s ease-in-out infinite alternate; }
        @keyframes laserScan { 0% { top: -2%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 12px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}

/* --- Reusable Toggle Row for settings --- */
const ToggleRow = ({ icon, title, desc, checked, onChange, disabled, small }) => (
  <button onClick={onChange} disabled={disabled}
    className={`w-full flex items-center gap-3 text-right ${small ? 'p-3' : 'p-4'} rounded-2xl border transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' : checked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
    {icon && <div className="shrink-0">{icon}</div>}
    <div className="flex-1 min-w-0">
      <div className={`font-black ${small ? 'text-sm' : 'text-base'} text-slate-800`}>{title}</div>
      {desc && <div className="text-[12px] text-slate-500 font-medium mt-0.5 leading-snug">{desc}</div>}
    </div>
    <div className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'right-0.5' : 'right-5'}`}></div>
    </div>
  </button>
);
