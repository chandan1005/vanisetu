# VANISETU

**No Patient Lost in Translation.**

VANISETU is a voice-first consultation safety prototype for Indian hospitals, built for the India Runs on Voice hackathon (Scaler × Wispr Flow), Round 2, theme **Healthcare access**.

A patient and a doctor who speak different languages talk through one phone or laptop. VANISETU:

- **detects which language was spoken and who spoke** (doctor's language = doctor, any other = patient), across 11 languages: English, Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, Malayalam, Gujarati, Punjabi, Odia; the patient never has to choose,
- replies to each person **in their own language**, on screen and aloud,
- shows the original words next to an **AI translation**,
- **confirms risky details before translating** (dose, how often, how long, warnings),
- runs a **teach-back check**: the patient repeats the instruction, and the app shows **Mismatch** or **Understood**,
- saves each consultation and **replays** the summary and instructions aloud.

> Prototype: all data is **fictional**. VANISETU does not diagnose or give medical advice. It only carries what people said.

## Run it (no keys needed)

Requirements: Docker Desktop running.

```bash
docker compose up --build
```

Open **http://localhost:5173**. No `.env` file or API keys are needed (see `frontend/.env.example`).

Without Docker:

```bash
cd frontend
npm install
npm run dev
```

## How we used Wispr Flow

- **Building:** we used Wispr Flow to dictate product specs, prompts for our AI coding assistants, and documentation (see `docs/wispr-flow-log.md`).
- **Inside the app:** the doctor can dictate instructions with Wispr Flow into the **"Type or dictate a sentence"** field. Tapping **Send as doctor** runs VANISETU's safety check on the dictated sentence.
- **Patient side:** uses the browser's free speech recognition, so it works on any Chrome device with no setup.

Wispr helps capture what was said. VANISETU helps make sure it was understood.

## Two ways VANISETU translates

| Mode | When it is used | Needs |
|---|---|---|
| **Demo lines (scripted)** | The two "Hold to speak" demo buttons | Nothing; works offline |
| **Live translation** | Real speech from the mic buttons, or any typed/dictated sentence | Recent desktop Chrome with its built-in, on-device Translator (free, no key). Language packs download on first use |

If live translation is not available (other browsers, unsupported language pair, or a pack still downloading), the app shows the original words with a clear message and the demo lines keep working.

## Architecture (Round 2)

```
Patient / Doctor voice
   │  (browser speech recognition, or Wispr Flow dictation into the text field)
   ▼
React app in the browser
   ├─ mockAI.ts      scripted demo lines, safety question, teach-back
   ├─ detector.ts    detects the language (Indian scripts offline + Chrome Language Detector)
   ├─ translator.ts  live on-device translation (Chrome Translator)
   ├─ safety.ts      finds dose / frequency / duration / warnings; compares teach-back answers
   ├─ speech.ts      mic + read-aloud (browser, free)
   └─ storage.ts     consultation history in localStorage
```

No backend and no database in Round 2, by design: the prototype must start with no keys and stay reliable in a live demo. Next phase: FastAPI backend, PostgreSQL/Supabase, medical-grade speech and translation services, behind the same screens.

## Screens

1. Home (choose patient and doctor languages)
2. Consultation (with the Safety check overlay)
3. Teach-back
4. Summary
5. My Consultations
6. Consultation Details

Full walkthrough of every flow: `docs/how-it-works.md`.

## Tests

```bash
cd frontend
npx tsx test-mock.ts     # 14 automatic checks
```

Manual test cases: `docs/test-plan.md`.

## Known limits (stated honestly)

- Demo lines are scripted. Live translation quality depends on Chrome's on-device models and may be imperfect, which is why VANISETU confirms risky details and checks understanding.
- Speech recognition and voices vary by device; Odia may not be supported on every device.
- Data stays in this browser on this device only.

## Roadmap

Medication Guardian (three-question check), missed-call replay on basic phones, WhatsApp voice notes, Care Circle (family updates), Voice Health Passport, backend and clinic dashboards.

## Built with

React, Vite, TypeScript, Tailwind CSS, Docker, browser speech and translation APIs, Wispr Flow (dictation), AI coding assistants.

## Problem evidence

A Bengaluru study by Kozan, Siddaiah and Dasgupta reported that most patients had no professional interpreter and relied on informal translators, and that language barriers led to perceived misdiagnosis and medicines taken at the wrong time. Verify the figures against the original paper before quoting them.
