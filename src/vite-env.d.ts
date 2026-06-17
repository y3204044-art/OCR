/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// תלויות הנטענות מ-CDN בזמן ריצה
interface Window {
  pdfjsLib?: any;
  docx?: any;
}
