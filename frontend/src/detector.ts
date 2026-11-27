// detector.ts
// Works out which language a sentence is in, so nobody has to choose a language.
// 1) Indian scripts (Kannada, Telugu, Tamil, ...) are recognised instantly from the letters.
// 2) For Latin text, Chrome's built-in on-device Language Detector is used if available (free, no key).
import { LANGUAGES } from "./languages";

type Detector = { detect: (t: string) => Promise<{ detectedLanguage: string; confidence: number }[]> };
type DetectorApi = { create: () => Promise<Detector> };

let detectorPromise: Promise<Detector> | null = null;

function api(): DetectorApi | null {
  return (self as unknown as { LanguageDetector?: DetectorApi }).LanguageDetector ?? null;
}

// Starts loading the detector. Call inside a tap or click (Chrome may need to download it).
export function warmUpDetector(): void {
  const D = api();
  if (!D || detectorPromise) return;
  detectorPromise = D.create();
  detectorPromise.catch(() => {
    detectorPromise = null;
  });
}

const SCRIPTS: [RegExp, string][] = [
  [/[\u0C80-\u0CFF]/, "kn"],
  [/[\u0C00-\u0C7F]/, "te"],
  [/[\u0B80-\u0BFF]/, "ta"],
  [/[\u0D00-\u0D7F]/, "ml"],
  [/[\u0A80-\u0AFF]/, "gu"],
  [/[\u0A00-\u0A7F]/, "pa"],
  [/[\u0B00-\u0B7F]/, "or"],
  [/[\u0980-\u09FF]/, "bn"],
  [/[\u0900-\u097F]/, "hi"],
];

// Recognises the language from its letters. Devanagari is Hindi unless Marathi is expected.
export function detectByScript(text: string, devanagari: "hi" | "mr" = "hi"): string | null {
  for (const [pattern, code] of SCRIPTS) {
    if (pattern.test(text)) return code === "hi" ? devanagari : code;
  }
  return /[a-zA-Z]/.test(text) ? "en" : null;
}

export type Detection = { code: string | null; sure: boolean };

// Returns the language of a sentence. "sure" is true when the letters prove it (Indian scripts)
// or the detector is confident. Latin text without the detector is reported as English, not sure.
export async function detectLanguage(text: string, devanagari: "hi" | "mr" = "hi"): Promise<Detection> {
  const script = detectByScript(text, devanagari);
  if (script && script !== "en") return { code: script, sure: true };
  if (detectorPromise) {
    try {
      const detector = await Promise.race([
        detectorPromise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
      ]);
      const top = (await detector.detect(text))[0];
      const code = top?.detectedLanguage.split("-")[0];
      if (top && top.confidence >= 0.6 && LANGUAGES.some((l) => l.code === code)) return { code, sure: true };
    } catch {
      // fall through to the script result
    }
  }
  return { code: script, sure: false };
}
