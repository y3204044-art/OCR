/* =====================================================================================
 *  rashiReference.ts — אביזרי דיוק ייעודיים לכתב רש"י
 *  -----------------------------------------------------------------------------------
 *  הבהרה חשובה: לא ניתן "לאמן מודל" בתוך הדפדפן, וקובץ פונט כשלעצמו אינו משפר OCR.
 *  מה שכן עוזר הוא לתת למודל **ייחוס בהקשר** (in-context reference):
 *    1. RASHI_READING_GUIDE — מדריך טקסטואלי לזיהוי צורות אותיות בכתב רש"י (תמיד פעיל).
 *    2. טבלת ייחוס ויזואלית — אם מסופק פונט רש"י (TTF), נרנדר טבלת אותיות רש"י מול דפוס
 *       ונצרף אותה כתמונת-ייחוס לקריאות הגולמיות. כך המודל ממפה צורות אות במדויק יותר.
 *
 *  כדי להפעיל את הטבלה הוויזואלית: הניחו קובץ פונט רש"י בשם public/rashi.ttf
 *  (או הגדירו URL אחר בהגדרות). אם הקובץ חסר — הפיצ'ר פשוט מושבת בשקט.
 * ===================================================================================== */

export const DEFAULT_RASHI_FONT_URL = '/rashi.ttf';

// מדריך טקסטואלי לזיהוי אותיות בכתב רש"י — מתואר לפי צורת האות בלבד (לא להשלמת תוכן)
export const RASHI_READING_GUIDE = `
מדריך לזיהוי צורות אותיות בכתב רש"י (לשימוש בזיהוי צורת האות בלבד — לא להשלמת תוכן ולא ל"תיקון"):
- כתב רש"י הוא חצי-קורסיבי ומעוגל, ללא תגים, והאותיות צרות יחסית.
- א': קו אלכסוני עם וו/רגל; היזהר לא לבלבל עם ע' (שרחבה ופתוחה יותר למטה).
- ב' מול כ': ל-ב' יש "עקב" ישר ובולט בבסיס מימין; כ' מעוגלת לגמרי וללא עקב.
- ד' מול ר': ל-ד' פינה ימנית-עליונה מודגשת ("עקב"); ר' מעוגלת בפינה.
- ה' / ח' / ת': ל-ה' רגל שמאלית מנותקת מהגג; ח' רציפה לגמרי בגג; ת' עם רגל שמאלית פונה פנימה.
- ו' / ז' / י' / ן': ו' קו ישר יורד; ז' ראש מודגש מעל קו קצר; י' קצרה ואינה יורדת מתחת לשורה; ן' ארוכה ויורדת הרבה מתחת לשורה.
- ם מול ס: ס' מעוגלת וסגורה לחלוטין; ם' מרובעת/זוויתית יותר.
- ך מול ן: ך' רחבה בראשה ויורדת; ן' צרה ויורדת.
- ג' מול נ': שים לב לכיוון ולאורך ה"רגל" התחתונה.
- כ' סופית (ך) ופ' סופית (ף) יורדות מתחת לשורה — אל תבלבל עם הצורות הרגילות.
כלל: אם צורת האות אינה חד-משמעית בתמונה — סמן ------- ואל תנחש לפי הקשר.`;

// כל אותיות הא"ב כולל סופיות, לרינדור טבלת הייחוס
const LETTERS = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת','ך','ם','ן','ף','ץ'];

// memoization לפי URL כדי לא לרנדר/לטעון את הפונט שוב ושוב
let _chartCache: { url: string; img: string | null } | null = null;

/**
 * בונה טבלת ייחוס ויזואלית (כתב רש"י מול דפוס) כ-dataURL.
 * מחזיר null אם אין פונט/נכשלה הטעינה — כך הפיצ'ר מושבת בשקט.
 */
export async function buildRashiReferenceChart(fontUrl?: string): Promise<string | null> {
  const url = (fontUrl || '').trim();
  if (!url) return null;
  if (_chartCache && _chartCache.url === url) return _chartCache.img;
  try {
    if (typeof (window as any).FontFace === 'undefined' || !(document as any).fonts) {
      _chartCache = { url, img: null };
      return null;
    }
    const font = new FontFace('RashiRefFont', `url(${url})`);
    await font.load();
    (document as any).fonts.add(font);

    const cols = 7;
    const cell = 96;
    const rows = Math.ceil(LETTERS.length / cols);
    const c = document.createElement('canvas');
    c.width = cols * cell;
    c.height = rows * cell + 30;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // כותרת
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('טבלת ייחוס: כתב רש"י (שחור) מול אות דפוס (אפור)', c.width / 2, 16);

    LETTERS.forEach((ch, i) => {
      const x = (i % cols) * cell + cell / 2;
      const y = Math.floor(i / cols) * cell + cell / 2 + 30;
      // אות בכתב רש"י
      ctx.fillStyle = '#000000';
      ctx.font = '52px RashiRefFont, serif';
      ctx.fillText(ch, x, y - 12);
      // אות דפוס (תווית)
      ctx.fillStyle = '#888888';
      ctx.font = '18px sans-serif';
      ctx.fillText(ch, x, y + 30);
    });

    const img = c.toDataURL('image/png');
    _chartCache = { url, img };
    return img;
  } catch (e) {
    _chartCache = { url, img: null };
    return null;
  }
}
