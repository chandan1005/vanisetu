# VANISETU

**No Patient Lost in Translation.**

VANISETU is a voice-first consultation safety prototype for Indian hospitals, built for the India Runs on Voice hackathon (Scaler × Wispr Flow), Round 2, theme **Healthcare access**.

A patient and a doctor who speak different languages talk through one phone or laptop. VANISETU:

- shows the patient's original words next to an **AI translation**,
- **confirms risky details before translating** (for example "2 tablets at one time, or 2 times daily?"),
- runs a **teach-back check**: the patient repeats the instruction, and the app shows **Mismatch** or **Understood**,
- saves each consultation and lets you **replay** the summary and instructions aloud.

> This is a prototype. Translations are **scripted (mock) responses** and all data is **fictional**. VANISETU does not diagnose or give medical advice. It only carries what people said.

## Run it (no keys needed)

Requirements: Docker Desktop running.

```bash
docker compose up --build
```

Open **http://localhost:5173**.

The app starts without any API keys. The Home screen shows "AI key not set: using scripted responses".

### Without Docker

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed in the terminal.

## Demo flow (2 minutes)

1. Home → **Start Consultation**.
2. **Patient: Hold to speak** → "Mujhe teen din se bukhar hai" → AI translation "I have had fever for three days".
3. **Doctor: Hold to speak** → "Take two tablets after food" → the **Safety check** popup asks "2 tablets at one time" or "2 times daily". Choose **2 times daily**.
4. **Check understanding** → **Ask patient to repeat** → patient says "One tablet at night" → **⚠ Mismatch**.
5. **Explain again** → **Patient repeats** → "Twice a day, after food" → **✓ Understood**.
6. **Continue to Summary** → **Save consultation** → **View My Consultations** → **View** → **Replay instructions**.

## Voice features (free, browser-only)

- **Read aloud:** translations and replays use the browser's built-in speech synthesis.
- **Microphone (optional):** in Chrome, "Patient mic" and "Doctor mic" use the browser's speech recognition. Unknown sentences show "Not understood. Please say it again." (the app never guesses).
- **Type or dictate:** the text field works with Wispr Flow dictation.
- If a voice is not available on the device, the app shows text and reports "Audio not available on this device".

## Screens

1. Home
2. Consultation (with the Safety check overlay)
3. Teach-back
4. Summary
5. My Consultations
6. Consultation Details

## Project structure

```
docker-compose.yml        one-command start
frontend/
  Dockerfile, nginx.conf  build and serve
  test-mock.ts            checks for the scripted logic (npx tsx test-mock.ts)
  src/
    mockAI.ts             scripted translation, safety check, teach-back
    storage.ts            saves consultations in localStorage
    speech.ts             browser read-aloud and microphone
    types.ts              data shapes
    components/PageShell.tsx
    pages/                Home, Consultation, TeachBack, Summary, History, Details
docs/                     demo script, test plan, prompts log
```

## Tests

```bash
cd frontend
npx tsx test-mock.ts
```

Manual test cases: `docs/test-plan.md`.

## Roadmap (not built in Round 2)

Live AI translation engine, Medication Guardian (three-question check), missed-call replay on basic phones, WhatsApp voice notes, Care Circle (family updates), Voice Health Passport.

## Built with

React, Vite, TypeScript, Tailwind CSS, Docker. Built solo with AI coding assistants; prompts dictated with **Wispr Flow** (see `docs/prompts-used.md`).

## Problem evidence

A Bengaluru study by Kozan, Siddaiah and Dasgupta reported that most patients had no professional interpreter and relied on informal translators, and that language barriers led to perceived misdiagnosis and medicines taken at the wrong time. Verify the figures against the original paper before quoting them.
