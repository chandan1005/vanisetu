// speech.ts
// Free browser voice features. Nothing here needs an API key.

// Reads text aloud with the browser's built-in voice. Returns false if not supported.
export function speakText(text: string, lang = "en-IN"): boolean {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
  return true;
}

// True if this browser can turn speech into text (Chrome on Android and desktop).
export function canListen(): boolean {
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

// Listens once and returns what was heard. Rejects on error or silence.
export function listenOnce(lang = "hi-IN"): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, any>;
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) {
      reject(new Error("Speech recognition is not available in this browser."));
      return;
    }
    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event: any) => resolve(String(event.results[0][0].transcript));
    rec.onerror = (event: any) => reject(new Error(event.error || "listening failed"));
    rec.onnomatch = () => reject(new Error("no-match"));
    rec.start();
  });
}
