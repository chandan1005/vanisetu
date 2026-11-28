# VANISETU – Progress

## One line
Voice consultation prototype: patient and doctor speak different languages; confirm risky details before translating, teach-back, save. Solo, Round 2, Healthcare access.

## Rules
- Starts with no keys (Home shows "AI key not set"). No .env needed (`frontend/.env.example` documents this).
- No diagnosis or advice. Original words always shown with "AI translation".
- Fictional data only: "Sample Government PHC, Bengaluru (demo)", "Dr. Demo".
- 6 screens only. No backend, database, maps, login, real WhatsApp, real calls.

## Status – code (done)
- [x] Docker + nginx, one command, no keys
- [x] Home with patient/doctor language picker (11 languages) + key and live-translation status
- [x] Scripted demo lines (mockAI.ts) – work offline
- [x] Live translation via Chrome built-in Translator (translator.ts), with timeouts and clear fallback
- [x] Live safety check: dose/frequency/time/food/duration/warning chips → confirm → translate (safety.ts)
- [x] Mic in each person's language + type/dictate field (Wispr Flow)
- [x] Read-aloud in the listener's language
- [x] Teach-back: scripted and live (fact comparison, "Missed" list)
- [x] Summary + save, My Consultations, Details + replay, demo reset
- [x] test-mock.ts: 14 checks pass
- [x] README (Wispr Flow section, architecture, limits), docs/how-it-works.md, test plan, demo script, Wispr log, prompts log

## Pending – submission
- [ ] Copy new files into repo, delete Placeholder.tsx, rebuild, commit, push
- [ ] Run docs/test-plan.md T01–T22 (laptop Chrome + phone)
- [ ] Check live translation in your Chrome for your demo languages (T08–T12, T15–T16)
- [ ] Fill docs/wispr-flow-log.md and docs/prompts-used.md with real usage only
- [ ] Friend test: clone repo, docker compose up
- [ ] Pitch deck PDF (text, 4 required points)
- [ ] Record video (docs/demo-script.md), upload Unlisted
- [ ] Optional: live link (Vercel/Netlify)
- [ ] Submit once (deadline 30 Nov 11:59 PM; aim 29 Nov)

## Fixes (27 Nov evening)
- [x] "Requires a user gesture" error: language packs now start downloading on button taps; added "Prepare languages" panel with progress
- [x] Direct pair not supported → translates through English automatically
- [x] Demo lines now shown and read in the listener's chosen language when ready (English otherwise)
- [x] Failed live sentences are labelled "live", not "demo"

- [x] Listening could stay stuck: added ■ Stop listening, auto-stop after a pause or 12 s
- [x] One big "Tap and speak" button with automatic turns (patient → doctor → patient); patient never chooses a language

- [x] Automatic language detection (Indian scripts offline + Chrome Language Detector) and automatic speaker detection (doctor's language = doctor, other = patient)
- [x] Patient language defaults to "Detect automatically"; switches when the patient changes language; replies in that language
- [x] "Prepare … and translate" retry button when a new language pack needs a tap

## Fixes from Claude in Chrome test report
- [x] Step 6 FAIL: teach-back now accepts everyday wording ("morning and night", "two times", "both together") and answers in other languages (translated first)
- [x] "Prepare languages" button no longer shown mid-page: replaced by a small collapsible "Translation ready ✓ / Preparing translation…" line
- [x] Replay buttons show "🔊 Playing…" with the text and a ■ Stop button; voice stops when leaving the page
- [x] "Mismatch" badge renamed "Needs re-explaining" with a one-line explanation (Summary, My Consultations, Details)
- [x] "Send as patient / doctor" are now full-size buttons
- [x] Home: technical "AI key not set" moved into "About this demo"; plain wording on the main screen

## Final polish
- [x] Summary and Details: Understanding status, Communication risk (Low/Medium/High), "x of y details repeated correctly", "Why VANISETU flagged this" (patient said / expected / missed / reason), timeline of every step
- [x] My Consultations cards: "Consultation #001", facility, date (27 Nov 2026), language pair, communication risk, understanding
- [x] Patient language / doctor language / translation pair shown on Summary
- [x] docs/pitch-slide-text.md with the "Why not Google Translate?" slide
- [x] Feature freeze: no more features before submission (no login, backend, GPS, WhatsApp, calls, dashboards)

## Last session
Added language picker, live on-device translation, live safety check and live teach-back, Wispr Flow docs. Scripted and live flows tested end to end.
