// speech.ts
// Free browser voice features. Nothing here needs an API key.

// Reads text aloud with the browser's built-in voice. Returns false if not supported.
export function speakText(text: string, lang = "en-IN", onEnd?: () => void): boolean {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

// Stops any voice that is playing.
export function stopSpeaking(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

// True if this browser can turn speech into text (Chrome on Android and desktop).
export function canListen(): boolean {
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export type Listening = { result: Promise<string>; stop: () => void };

// Starts listening. It stops by itself after a pause in speech, after maxMs,
// or when stop() is called (for example, the person taps "Stop listening").
export function startListening(lang = "hi-IN", maxMs = 12000): Listening {
  const w = window as unknown as Record<string, any>;
  const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Recognition) {
    return { result: Promise.reject(new Error("Speech recognition is not available in this browser.")), stop: () => undefined };
  }
  const rec = new Recognition();
  rec.lang = lang;
  rec.interimResults = false;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const result = new Promise<string>((resolve, reject) => {
    let finished = false;
    const finish = (fn: () => void) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      fn();
    };
    rec.onresult = (event: any) => {
      const text = String(event.results[0][0].transcript || "").trim();
      finish(() => (text ? resolve(text) : reject(new Error("no-speech"))));
    };
    rec.onerror = (event: any) => finish(() => reject(new Error(event.error || "listening failed")));
    rec.onend = () => finish(() => reject(new Error("no-speech")));
  });
  timer = setTimeout(() => rec.stop(), maxMs);
  rec.start();
  return { result, stop: () => rec.stop() };
}

// Kept for simple one-off listening.
export function listenOnce(lang = "hi-IN"): Promise<string> {
  return startListening(lang).result;
}
