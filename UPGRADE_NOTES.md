# NexusOCR — מסמך ארכיטקטורה ושדרוג המנוע

מסמך זה מפרט את הארכיטקטורה של מנוע ה-OCR המשודרג בקובץ `nexus_ocr (3).tsx`.
השדרוג מתמקד **במנוע ה-OCR בלבד**; כל הפונקציונליות והממשק הקיימים נשמרו.

## סקירה כללית של ה-Pipeline

```
תמונה / דף PDF
   │
   ├─ [1] Classification  ── classifyDocument()
   │        → scriptType (rashi / print / rashi_and_print / handwriting / mixed)
   │        → documentType (בבלי / ירושלמי / רמב"ם / שו"ע / ...)
   │
   ├─ [2] Preprocessing  ── preprocessImage()
   │        Super-Resolution → Deskew → Grayscale → Auto-Contrast
   │        → Denoise(median) → Sharpen(unsharp)
   │        → enhanced (primary)  +  binarized (Adaptive Threshold, secondary)
   │
   └─ [3] OCR Engine  ── runOcrEngine()
            ├─ עמוד שלם: runWholePagePipeline()   (7 / 10 מעברים)
            └─ לפי אזורים: runRegionPipeline()     (Layout → בלוקים → איחוד)
                     │
                     └─ אימות סופי → { text, words:[{word, confidence}] }
```

## מודולים עיקריים

### זיהוי כתב (`classifyDocument`)
קריאת Gemini עם `responseSchema` המחזירה JSON מובנה: סוג כתב, סוג מסמך, ביטחון,
האם יש עמודת רש"י, והערות פריסה. ניתן לכפות סוג כתב דרך ההגדרות (`forceScriptType`).

### עיבוד מקדים (`preprocessImage`)
מבוצע כולו בדפדפן באמצעות Canvas 2D:
- **Super-Resolution**: הגדלה מבוקרת של תמונות קטנות (עד `ocrMaxWidth`) עם `imageSmoothingQuality:'high'`, או הקטנה עדינה של תמונות ענק.
- **Deskew**: `estimateSkewAngle` — projection-profile variance על גרסה מוקטנת, ואז סיבוב הקנבס.
- **Auto-Contrast**: percentile-stretch (0.5%) + עקומת גמא קלה.
- **Denoise**: median 3×3 (כבד; מוגבל ברזולוציה ופעיל ב-Ultra/לפי הגדרה).
- **Sharpen**: unsharp mask 3×3.
- **Adaptive Threshold**: בינריזציה מקומית (integral image) → וריאנט `binarized` המשמש לקריאה העצמאית (Pass 2) להגברת אי-תלות.

### מנוע ה-OCR — מעברים מרובים
כל מעבר = קריאת Gemini עצמאית בטמפרטורה 0 (אנטי-הזיות). הטקסט מושחל ממעבר למעבר:

**סטנדרט (7):** raw → raw עצמאי → reconcile → missing-words → similar-letters → abbreviations → final-verify.

**Ultra Rashi (10):** + structure (ניקוד/פיסוק/מבנה) + completeness (אפס דילוגים) + קריאה עצמאית שלישית + final-verify.

**לפי אזורים:** `analyzeLayout` מחזיר תיבות תוחמות (0..1000), `cropRegion` חותך כל בלוק,
וכל בלוק עובר מיני-pipeline (2–3 מעברים). התוצאות מאוחדות לפי סדר הקריאה.

### מנגנון Anti-Hallucination
מיושם בפרומפטים (`SYSTEM_BASE`, `RASHI_RULES`): איסור מוחלט על השלמת פסוקים/גמרא/ביטויים/ר"ת/ציטוטים,
החלפת קטעים לא ברורים ב-`-------`, וטמפרטורה 0.

### ציוני אמינות
המעבר הסופי (`ocrFinalVerify`) מחזיר `{ text, words:[{word, confidence}] }` באמצעות `responseSchema`.
מילים עם `confidence < 85` (`CONFIDENCE_THRESHOLD`) מודגשות ב-UI ונספרות. נכללות בייצוא JSON.
במקרה כשל בפרסור — נפילה רכה לטקסט ללא ציונים (לא נאבד פלט).

## ייצוא
- `exportToDocx` — DOCX אמיתי דרך ספריית `docx` (CDN), RTL + פונט David, מעברי עמוד, תמונות אופציונליות. נפילה רכה ל-`exportToWordMhtml` אם הספרייה לא נטענת.
- `exportToPdf` — חלון הדפסה מעוצב RTL (טקסט וקטורי, "שמור כ-PDF").
- `exportToTxt` — טקסט + BOM.
- `exportToJson` — מבנה מלא עם ציוני אמינות.

## עקרונות עיצוב
- **דיוק לפני מהירות**: מעברים סדרתיים אמיתיים + השהיות + backoff מעריכי, כדי למזער הזיות ודילוגים ולהקטין סיכון Rate-Limit.
- **נפילות רכות**: כל שלב (classification, preprocessing, layout, final-verify, docx) נכשל בחן ולא מפיל את כל הפענוח.
- **שמירת תאימות**: ה-API החיצוני, הזרקת המפתח, וממשק המשתמש נשמרו; כל היכולות הקיימות פעילות.

## תלויות נטענות מ-CDN בזמן ריצה
- `pdf.js` 3.11.174 — חילוץ דפי PDF.
- `docx` 8.5.0 — יצירת DOCX אמיתי.
- Google Fonts (Frank Ruhl Libre / Heebo) — טיפוגרפיה.
