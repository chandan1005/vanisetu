// translator.ts
// Live translation using Chrome's built-in, on-device Translator (no API key, free).
// Chrome only downloads a language pack after a tap or click, so every button that
// may translate calls warmUp() first, while the click is still "fresh".

type Translator = { translate: (t: string) => Promise<string> };
type CreateOptions = {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (m: EventTarget) => void;
};
type TranslatorApi = {
  availability: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  create: (o: CreateOptions) => Promise<Translator>;
};

const cache = new Map<string, Promise<Translator>>();
const progress = new Map<string, number>();
const listeners = new Set<() => void>();

function api(): TranslatorApi | null {
  return (self as unknown as { Translator?: TranslatorApi }).Translator ?? null;
}

// True if this browser has the built-in Translator (recent desktop Chrome).
export function liveTranslationSupported(): boolean {
  return api() !== null;
}

// Stops waiting after a while, so a slow download never freezes the screen.
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

function friendly(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/gesture|activation/i.test(msg)) return new Error("Tap 'Prepare languages' first, then try again.");
  if (/not supported|unsupported|unavailable/i.test(msg)) return new Error("This language pair is not supported by this browser.");
  return new Error(msg || "Live translation failed.");
}

// Starts creating a translator for one pair. Call inside a click handler.
function startPair(from: string, to: string): Promise<Translator> {
  const key = `${from}>${to}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const T = api();
  if (!T) return Promise.reject(new Error("Live translation is not available in this browser."));
  const p = T.create({
    sourceLanguage: from,
    targetLanguage: to,
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        progress.set(key, Math.round(((e as ProgressEvent).loaded ?? 0) * 100));
        listeners.forEach((fn) => fn());
      });
    },
  }).then((t) => {
    progress.set(key, 100);
    listeners.forEach((fn) => fn());
    return t;
  });
  p.catch(() => cache.delete(key)); // allow a retry later
  cache.set(key, p);
  return p;
}

// Prepares the pairs needed to go from one language to another (direct, and via English).
export function warmUp(from: string, to: string): void {
  if (!api() || from === to) return;
  startPair(from, to).catch(() => undefined);
  if (from !== "en") startPair(from, "en").catch(() => undefined);
  if (to !== "en") startPair("en", to).catch(() => undefined);
}

// Prepares everything a consultation needs. Call from a button click.
export function warmUpConsultation(patient: string, doctor: string): void {
  warmUp(patient, doctor);
  warmUp(doctor, patient);
}

// Download progress for the "Prepare languages" panel (0–100 per pair).
export function getProgress(): Record<string, number> {
  return Object.fromEntries(progress);
}
export function onProgress(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function translateDirect(text: string, from: string, to: string): Promise<string> {
  const t = await withTimeout(startPair(from, to), 30000, "The language pack is still downloading. Please try again in a minute.");
  return withTimeout(t.translate(text), 10000, "Live translation took too long.");
}

// Translates text. Tries the direct pair, then goes through English. Throws a friendly error if it can't.
export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (from === to) return text;
  try {
    return await translateDirect(text, from, to);
  } catch (direct) {
    if (from === "en" || to === "en") throw friendly(direct);
    try {
      const english = await translateDirect(text, from, "en");
      return await translateDirect(english, "en", to);
    } catch (pivot) {
      throw friendly(pivot);
    }
  }
}
