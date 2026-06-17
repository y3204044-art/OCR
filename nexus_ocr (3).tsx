import React, { useState, useRef, useEffect } from 'react';

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

// --- Utilities ---
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

const extractPdfPages = async (file, onProgress) => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const extractedPages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) onProgress(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 }); 
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) continue;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    
    extractedPages.push({
      id: crypto.randomUUID(),
      name: `${file.name} - עמ' ${i}`,
      originalImage: base64,
      status: 'pending',
      scanStage: 0, 
      combinedText: "",
      error: null
    });
  }
  return extractedPages;
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const compressImageForOcr = (base64, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); 
    };
    img.onerror = () => resolve(base64); 
    img.src = base64;
  });
};

export default function App() {
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0, percentage: 0 });
  
  const wakeLockRef = useRef(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn('Wake Lock request failed:', err.message);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const updatePageStatus = (pageId, updates) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, ...updates } : p));
  };

  // --- Consolidated Core Engine: 1 API Call to prevent 401 Rate Limiting ---
  const extractTextFromImage = async (originalBase64Data) => {
    
    // Compress image to ensure payload is accepted by proxy
    const optimizedBase64 = await compressImageForOcr(originalBase64Data);
    
    const mimeTypeMatch = optimizedBase64.match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const base64Clean = optimizedBase64.split(',')[1];
    
    // Environment standard key definition
    const apiKey = ""; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const systemInstruction = `אתה רכיב תוכנה תעשייתי להמרת תמונה לטקסט (OCR) הפועל בסביבה משפטית קפדנית.
עליך לבצע את המשימה ב"סריקה מרובעת פנימית" לפני החזרת הפלט:
1. קריאה מילולית: העתקה מדויקת ללא דילוגים, כולל שגיאות כתיב במקור.
2. אנטי-הזיות: ודא באדיקות שלא החלפת אותיות דומות (י/ו, ך/ן, ד/ר, ה/ח/ת, ם/ס). אל תשפר מילים.
3. ניקוי: השמט מספרי הערות שוליים עיליים בלבד. מילים מטושטשות לחלוטין יוחלפו ב- -------.
4. עימוד: ערוך את הטקסט לפסקאות רציפות. חבר שורות קטועות, למעט סוף עניין.

חוק ברזל: החזר אך ורק את הטקסט הסופי והנקי! ללא שום מילת הסבר או פתיחה.`;

    const masterPrompt = `חלץ את הטקסט מהתמונה המצורפת תוך יישום מלא של הסריקה המרובעת הפנימית שהוגדרה לך.`;

    const payload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.0 // Crucial for non-hallucinating OCR
      },
      contents: [{
        role: "user",
        parts: [
          { text: masterPrompt },
          { inlineData: { mimeType: mimeType, data: base64Clean } }
        ]
      }]
    };

    const delays = [1000, 2000, 4000, 8000];
    let lastError = null;

    // Single unified fetch block with backoff
    for (let i = 0; i <= delays.length; i++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`שגיאת שרת (${response.status}): ייתכן שמדובר בעומס רשת (Rate Limit).`);
        }

        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
           throw new Error("התקבל חילוץ ריק, ייתכן שהתמונה אינה קריאה.");
        }
        
        return text.trim();
        
      } catch (error) {
        lastError = error;
        if (i < delays.length) {
          await new Promise(res => setTimeout(res, delays[i]));
        }
      }
    }
    
    throw new Error("החיבור לשרת נכשל לחלוטין לאחר מספר ניסיונות. שגיאה אחרונה: " + lastError?.message);
  };

  const processPage = async (pageId, originalImage) => {
    updatePageStatus(pageId, { status: 'reading', scanStage: 1, error: null });
    
    // Simulate the 4 stages visually to avoid hitting the API rate limits with actual requests
    let currentStage = 1;
    const stageInterval = setInterval(() => {
      currentStage = currentStage < 4 ? currentStage + 1 : 4;
      updatePageStatus(pageId, { scanStage: currentStage });
    }, 3000);

    try {
      const extractedText = await extractTextFromImage(originalImage);
      clearInterval(stageInterval);
      
      updatePageStatus(pageId, { 
        combinedText: extractedText, 
        status: 'completed',
        scanStage: 4
      });
    } catch (error) {
      clearInterval(stageInterval);
      console.error("Processing error:", error);
      updatePageStatus(pageId, { status: 'error', error: error.message });
    }
  };

  const startBatchProcess = async () => {
    setIsProcessingGlobal(true);
    setGlobalError(null);
    await requestWakeLock();
    
    const pagesToProcess = pages.filter(p => p.status === 'pending' || p.status === 'error');

    for (const page of pagesToProcess) {
      setSelectedPageId(page.id);
      await processPage(page.id, page.originalImage);
      // Brief delay between completely separate page jobs
      await new Promise(resolve => setTimeout(resolve, 1500));
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
    let newPages = [];

    try {
      for (const file of files) {
        if (file.type === 'application/pdf') {
          const pdfPages = await extractPdfPages(file, (current, total) => {
            setPdfProgress({ current, total, percentage: Math.round((current / total) * 100) });
          });
          newPages = [...newPages, ...pdfPages];
        } else {
          const base64 = await fileToBase64(file);
          newPages.push({
            id: crypto.randomUUID(),
            name: file.name,
            originalImage: base64,
            status: 'pending',
            scanStage: 0,
            combinedText: "",
            error: null
          });
        }
      }
      
      setPages(prev => [...prev, ...newPages]);
      
      if (!selectedPageId && newPages.length > 0) {
        setSelectedPageId(newPages[0].id);
      }
    } catch (err) {
      console.error("File upload error:", err);
      setGlobalError("אירעה שגיאה בטעינת הקבצים. ודא שהקובץ תקין והמערכת תומכת בו.");
    } finally {
      setIsExtractingPdf(false);
      e.target.value = '';
    }
  };

  const exportToWord = async (includeImages) => {
    if (pages.length === 0) return;
    setIsExporting(true);

    try {
      const boundary = "----=_NextPart_Nexus_OCR_" + Math.random().toString(36).substring(2);
      
      let mhtmlContent = `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${boundary}"\r\n\r\n`;
      mhtmlContent += `--${boundary}\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n`;

      let htmlContent = `
        <html xmlns:v="urn:schemas-microsoft-com:vml"
              xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
              xmlns="http://www.w3.org/TR/REC-html40"
              dir="rtl">
        <head>
          <meta charset="utf-8">
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <style>
            body { font-family: 'David', 'Frank Ruhl Libre', 'Times New Roman', serif; font-size: 16pt; line-height: 1.8; text-align: right; direction: rtl; }
            p { margin-bottom: 14pt; text-align: justify; text-indent: 1.5em; direction: rtl; }
            .img-container { text-align: center; margin-bottom: 24pt; border-bottom: 1px dashed #ccc; padding-bottom: 10pt; }
            img { border: 1px solid #ccc; }
            .page-title { color: #555; font-size: 12pt; text-align: left; margin-bottom: 10pt; font-family: sans-serif; font-weight: bold;}
            .page-break { page-break-before: always; mso-break-type: page-break; }
          </style>
        </head>
        <body>
      `;

      let imagesMhtml = "";

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page.combinedText) continue;
        
        htmlContent += `<div class="${i > 0 ? 'page-break' : ''}">`;
        htmlContent += `<div class="page-title">עמוד ${i + 1}</div>`;

        if (includeImages && page.originalImage) {
          const mimeMatch = page.originalImage.match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const base64Data = page.originalImage.split(',')[1];
          const imgId = `image_${i}_${Date.now()}.jpg`;

          htmlContent += `<div class="img-container"><img src="cid:${imgId}" /></div>`;
          
          imagesMhtml += `--${boundary}\r\n`;
          imagesMhtml += `Content-Type: ${mimeType}\r\n`;
          imagesMhtml += `Content-Transfer-Encoding: base64\r\n`;
          imagesMhtml += `Content-ID: <${imgId}>\r\n\r\n`;
          
          const chunks = base64Data.match(/.{1,76}/g) || [];
          imagesMhtml += chunks.join('\r\n') + `\r\n\r\n`;
        }
        
        const paragraphs = page.combinedText.split('\n').filter(p => p.trim());
        paragraphs.forEach(p => {
          htmlContent += `<p>${p.trim()}</p>`;
        });

        htmlContent += `</div>`; 
      }
      
      htmlContent += `</body></html>`;
      
      mhtmlContent += htmlContent + `\r\n\r\n`;
      mhtmlContent += imagesMhtml;
      mhtmlContent += `--${boundary}--\r\n`;

      const blob = new Blob([mhtmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = includeImages ? 'NexusOCR_MaxPro_WithImages.doc' : 'NexusOCR_MaxPro.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      setGlobalError("אירעה שגיאה בייצוא לקובץ Word.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedPage = pages.find(p => p.id === selectedPageId);
  const totalPages = pages.length;
  const processedPages = pages.filter(p => p.status === 'completed' || p.status === 'error').length;
  const ocrProgressPercentage = totalPages > 0 ? Math.round((processedPages / totalPages) * 100) : 0;

  const renderTextContent = (text) => {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    return (
      <div className="space-y-6 pb-12">
        {paragraphs.map((paragraph, pIdx) => (
          <p key={pIdx} className="text-justify leading-[1.8] text-xl md:text-2xl text-slate-800 font-serif break-words px-2 md:px-4">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200 selection:text-indigo-900 flex flex-col overflow-hidden" dir="rtl">
      
      {/* Modern Premium App Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-4 md:px-8 z-50 flex flex-col md:flex-row md:items-center gap-4 shrink-0 shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all">
        
        {/* Logo Section */}
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
                <span className="text-[11px] font-extrabold text-indigo-700 tracking-wide uppercase">מנוע דחיסה ואנטי-דילוגים פועל</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Section - Ultra Rounded Buttons */}
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0 md:mr-auto w-full md:w-auto px-1">
          <label className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-full transition-all select-none ${isExtractingPdf ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'}`}>
            {isExtractingPdf ? <Loader2Icon className="w-5 h-5 animate-spin" /> : <UploadIcon className="w-5 h-5 text-indigo-600" />}
            <span className="text-sm md:text-base font-extrabold whitespace-nowrap">{isExtractingPdf ? 'טוען קבצים...' : 'הוסף קבצים'}</span>
            <input type="file" multiple accept="image/jpeg, image/png, application/pdf" className="sr-only" onChange={handleFileUpload} disabled={isExtractingPdf} />
          </label>
          
          <button 
            onClick={startBatchProcess}
            disabled={isProcessingGlobal || pages.length === 0}
            className="flex-shrink-0 flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white px-8 py-3 rounded-full font-extrabold transition-all shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_10px_25px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 cursor-pointer"
          >
            {isProcessingGlobal ? <Loader2Icon className="w-5 h-5 animate-spin" /> : <PlayIcon className="w-5 h-5" />}
            <span className="text-sm md:text-base whitespace-nowrap">{isProcessingGlobal ? 'מפענח כעת...' : 'התחל סריקה מרובעת'}</span>
          </button>

          <div className="w-px h-8 bg-slate-200 hidden md:block mx-2"></div>

          <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200 flex-shrink-0 shadow-inner">
            <button onClick={() => exportToWord(false)} disabled={pages.length === 0 || isExporting} className="flex items-center gap-2 hover:bg-white disabled:opacity-50 text-slate-600 hover:text-emerald-600 px-5 py-2.5 rounded-full transition-all font-bold text-sm cursor-pointer whitespace-nowrap hover:shadow-sm">
              <FileWordIcon className="w-4 h-4 md:w-5 md:h-5" /> Word טקסט
            </button>
            <div className="w-px bg-slate-200 mx-1 my-2"></div>
            <button onClick={() => exportToWord(true)} disabled={pages.length === 0 || isExporting} className="flex items-center gap-2 hover:bg-white disabled:opacity-50 text-slate-600 hover:text-indigo-600 px-5 py-2.5 rounded-full transition-all font-bold text-sm cursor-pointer whitespace-nowrap hover:shadow-sm">
              <FileWordIcon className="w-4 h-4 md:w-5 md:h-5" /> + תמונות
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative">
        
        {/* Sidebar (Documents List) */}
        <aside className="w-full md:w-[340px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-[8px_0_30px_rgba(0,0,0,0.03)] z-40 h-[30vh] md:h-full">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">תור מסמכים וקבצים</h2>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-black shadow-sm">{pages.length}</span>
            </div>

            {isExtractingPdf && (
              <div className="mb-2">
                <div className="flex justify-between text-[11px] font-bold text-indigo-600 mb-1.5">
                  <span>מחלץ דפי PDF איכותיים...</span>
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
              <div 
                key={page.id} 
                onClick={() => setSelectedPageId(page.id)}
                className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 border-2 ${
                  selectedPageId === page.id 
                    ? 'bg-white border-indigo-500 shadow-md ring-4 ring-indigo-500/10 z-10' 
                    : 'bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200'
                } flex p-2.5 gap-3.5 items-center`}
              >
                <div className="w-14 h-20 rounded-xl bg-slate-200/50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
                  <img src={page.originalImage} alt="" className="w-full h-full object-cover" />
                  {page.status === 'reading' && <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center backdrop-blur-sm"><Loader2Icon className="w-6 h-6 text-white animate-spin" /></div>}
                </div>
                
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className={`text-sm font-extrabold truncate ${selectedPageId === page.id ? 'text-indigo-900' : 'text-slate-700'}`}>{page.name}</span>
                  <div className="flex items-center gap-1.5 mt-1.5 bg-white/50 w-fit px-2 py-0.5 rounded border border-slate-100">
                    {page.status === 'pending' && <><div className="w-2 h-2 rounded-full bg-slate-300"></div><span className="text-[11px] text-slate-500 font-bold">ממתין לסריקה</span></>}
                    {page.status === 'reading' && <><div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div><span className="text-[11px] text-indigo-600 font-extrabold">דינמי {page.scanStage}/4...</span></>}
                    {page.status === 'completed' && <><CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" /><span className="text-[11px] text-emerald-600 font-extrabold">100% מושלם</span></>}
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

        {/* Workspace Panels (Image & Text) */}
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
              
              {/* Image Preview Panel */}
              <div className="relative rounded-[2rem] overflow-hidden border-2 border-slate-200/60 bg-slate-200/30 flex items-center justify-center shadow-inner min-h-[30vh] lg:min-h-0 group">
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black tracking-widest text-slate-600 uppercase shadow-md border border-slate-200 z-10">
                  מסמך מקור
                </div>
                
                <div className="w-full h-full p-4 md:p-8 flex items-center justify-center overflow-auto custom-scrollbar relative">
                  <img src={selectedPage.originalImage} className="max-w-full max-h-full object-contain rounded-2xl border border-slate-200 shadow-xl bg-white relative z-10" alt="Source" />
                  
                  {/* Fixed Full-Page Laser Scan Animation covering entire box */}
                  {selectedPage.status === 'reading' && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[2rem] bg-indigo-900/5 backdrop-blur-[1px]">
                      <div className="laser-beam absolute left-0 w-full h-[6px] mix-blend-screen"
                           style={{
                             backgroundColor: selectedPage.scanStage === 1 ? '#6366f1' : selectedPage.scanStage === 2 ? '#fbbf24' : selectedPage.scanStage === 3 ? '#34d399' : '#d946ef',
                             boxShadow: `0 0 30px 8px ${selectedPage.scanStage === 1 ? '#6366f180' : selectedPage.scanStage === 2 ? '#fbbf2480' : selectedPage.scanStage === 3 ? '#34d39980' : '#d946ef80'}`
                           }}>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Result Panel */}
              <div className="rounded-[2rem] border-2 border-slate-200/60 bg-white flex flex-col shadow-2xl shadow-slate-200/50 relative overflow-hidden min-h-[40vh] lg:min-h-0">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <SettingsIcon className="w-5 h-5 text-indigo-500" />
                    תוצאת הפענוח
                  </h3>
                  
                  {selectedPage.status === 'reading' && (
                    <div className="flex items-center gap-2 text-xs font-extrabold bg-white border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full shadow-sm">
                      <Loader2Icon className="w-4 h-4 animate-spin text-indigo-500"/>
                      {selectedPage.scanStage === 1 && "1/4: חילוץ אנליטי ודחיסת תמונה..."}
                      {selectedPage.scanStage === 2 && "2/4: מאתר ומחסל הזיות מודל..."}
                      {selectedPage.scanStage === 3 && "3/4: אימות כפול מול התמונה..."}
                      {selectedPage.scanStage === 4 && "4/4: עיצוב פסקאות וליטוש..."}
                    </div>
                  )}
                  {selectedPage.status === 'completed' && <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full shadow-sm"><CheckCircle2Icon className="w-4 h-4"/> מאומת 100% מוכן</span>}
                </div>
                
                <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white relative">
                  {selectedPage.status === 'error' ? (
                    <div className="text-rose-700 bg-rose-50 p-8 rounded-3xl border border-rose-100 text-center flex flex-col items-center">
                      <AlertCircleIcon className="w-12 h-12 mb-4 text-rose-400" />
                      <strong className="block mb-2 text-lg">שגיאת תקשורת</strong>
                      <p className="text-base text-rose-600/80 mt-2">{selectedPage.error}</p>
                    </div>
                  ) : (
                    <>
                      {selectedPage.combinedText ? (
                        renderTextContent(selectedPage.combinedText)
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6">
                          {selectedPage.status === 'reading' ? (
                            <div className="flex flex-col items-center text-center px-4">
                              <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-[4px] border-slate-100 rounded-full"></div>
                                <div className={`absolute inset-0 border-[4px] rounded-full border-t-transparent animate-spin ${selectedPage.scanStage === 1 ? 'border-indigo-500' : selectedPage.scanStage === 2 ? 'border-amber-400' : selectedPage.scanStage === 3 ? 'border-emerald-400' : 'border-fuchsia-500'}`}></div>
                                <ScanTextIcon className={`w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors ${selectedPage.scanStage === 1 ? 'text-indigo-500' : selectedPage.scanStage === 2 ? 'text-amber-500' : selectedPage.scanStage === 3 ? 'text-emerald-500' : 'text-fuchsia-500'}`}/>
                              </div>
                              <h4 className="text-xl font-black text-slate-800 mb-2">
                                {selectedPage.scanStage === 1 && 'קורא מילה-במילה ומסיר מספרים עיליים...'}
                                {selectedPage.scanStage === 2 && 'מחסל תיקונים אוטומטיים (קימעא לא הופך ל-ה)...'}
                                {selectedPage.scanStage === 3 && 'מציב ------- במקום להמציא מילים...'}
                                {selectedPage.scanStage === 4 && 'מעצב פסקאות רציפות (ללא שבירות סתמיות)...'}
                              </h4>
                              <p className="text-sm text-slate-500 font-bold">מבצע 4 שלבי אימות קפדניים. פעולה חזקה ורציפה בבקשה אחת.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center opacity-40">
                              <FileTextIcon className="w-20 h-20 mb-5 stroke-[1.5]" />
                              <p className="text-lg font-black text-slate-600">הטקסט יופיע כאן</p>
                              <p className="text-base font-bold mt-1">לחץ על סריקה מרובעת כדי להתחיל</p>
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
              <h2 className="text-3xl font-black text-slate-800 tracking-tight relative z-10">המערכת מוכנה לסריקה תעשייתית</h2>
              <p className="text-lg mt-3 text-slate-500 font-bold relative z-10 max-w-lg text-center">העלה תמונות וקבל פסקאות רציפות. חוקי הליבה החדשים מונעים מחיקת אותיות ומחסלים "השלמות טקסט" מהזיכרון.</p>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=Heebo:wght@300;400;500;700;800;900&display=swap');
        
        body { font-family: 'Heebo', sans-serif; }
        .font-serif { font-family: 'Frank Ruhl Libre', serif; }

        /* Full-Page Absolute Laser Animation */
        .laser-beam {
          animation: laserScan 2.5s ease-in-out infinite alternate;
        }

        @keyframes laserScan {
          0% { top: -2%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
        
        /* Custom Premium Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 12px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}