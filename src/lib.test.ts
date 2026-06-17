import { describe, it, expect } from 'vitest';
import { splitDataUrl, base64ToUint8, parseJsonLoose, normWord, alignConfidence, genId } from './lib';

describe('splitDataUrl', () => {
  it('parses mime and base64 payload', () => {
    const r = splitDataUrl('data:image/png;base64,AAAB');
    expect(r.mime).toBe('image/png');
    expect(r.data).toBe('AAAB');
  });
  it('falls back to jpeg when no header', () => {
    const r = splitDataUrl('AAAB');
    expect(r.mime).toBe('image/jpeg');
  });
  it('handles empty input safely', () => {
    const r = splitDataUrl('');
    expect(r.mime).toBe('image/jpeg');
    expect(r.data).toBe('');
  });
});

describe('base64ToUint8', () => {
  it('round-trips ASCII via btoa', () => {
    const b = base64ToUint8(btoa('hi'));
    expect(Array.from(b)).toEqual([104, 105]);
  });
});

describe('parseJsonLoose', () => {
  it('parses plain json', () => {
    expect(parseJsonLoose('{"a":1}')).toEqual({ a: 1 });
  });
  it('strips ```json fences', () => {
    expect(parseJsonLoose('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });
  it('extracts json embedded in prose', () => {
    expect(parseJsonLoose('הנה התוצאה: {"text":"שלום"} סוף')).toEqual({ text: 'שלום' });
  });
  it('parses arrays', () => {
    expect(parseJsonLoose('[1,2,3]')).toEqual([1, 2, 3]);
  });
  it('throws on unparseable input', () => {
    expect(() => parseJsonLoose('no json here at all')).toThrow();
  });
});

describe('normWord', () => {
  it('keeps Hebrew letters, strips punctuation/gershayim', () => {
    expect(normWord('רש"י,')).toBe('רשי');
    expect(normWord('-------')).toBe('');
    expect(normWord('abc123!')).toBe('abc123');
  });
});

describe('alignConfidence', () => {
  it('aligns words to tokens by content and flags low confidence', () => {
    const text = 'שלום עולם טוב';
    const words = [
      { word: 'שלום', confidence: 95 },
      { word: 'עולם', confidence: 40 },
      { word: 'טוב', confidence: 90 },
    ];
    const toks = alignConfidence(text, words).filter(t => !t.isSpace);
    expect(toks.map(t => t.token)).toEqual(['שלום', 'עולם', 'טוב']);
    expect(toks[1].confidence).toBe(40);
  });
  it('resyncs when a word is missing from the model list (no drift)', () => {
    const text = 'אבא גדול מאוד';
    // model omitted "גדול" — alignment must not shift confidence onto wrong tokens
    const words = [
      { word: 'אבא', confidence: 99 },
      { word: 'מאוד', confidence: 50 },
    ];
    const toks = alignConfidence(text, words).filter(t => !t.isSpace);
    expect(toks[0].confidence).toBe(99);  // אבא
    expect(toks[2].confidence).toBe(50);  // מאוד (resynced)
  });
  it('returns null confidence when no words provided', () => {
    const toks = alignConfidence('שלום עולם', []).filter(t => !t.isSpace);
    expect(toks.every(t => t.confidence === null)).toBe(true);
  });
});

describe('genId', () => {
  it('produces unique non-empty ids', () => {
    const a = genId(), b = genId();
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });
});
