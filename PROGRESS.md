# VANISETU – Progress

## One line
Voice consultation prototype: patient and doctor speak different languages; confirm risky details, teach-back, save. Solo, Round 2, Healthcare access.

## Rules
- Starts with no keys (scripted responses; Home shows "AI key not set").
- No diagnosis or advice. Original words always shown with "AI translation".
- Fictional data only: "Sample Government PHC, Bengaluru (demo)", "Dr. Demo".
- 6 screens only. No maps, GPS, login, real WhatsApp, real calls.

## Status
- [x] Repo public, folders and files created
- [x] VANISETU_MVP.md
- [x] docker compose up works
- [x] Home (starts a fresh consultation, shows key status)
- [x] Mock logic (mockAI.ts) + test-mock.ts (8 checks pass)
- [x] Consultation with scripted turns
- [x] Safety check overlay (confirm before translate, Repeat)
- [x] Unknown sentence → "Not understood. Please say it again."
- [x] Optional Chrome microphone + type/dictate field (Wispr Flow)
- [x] Read-aloud of translations (browser speech, free)
- [x] Teach-back (Mismatch → Explain again → Understood)
- [x] Summary + save to localStorage
- [x] My Consultations + Details + replay + demo reset
- [x] README, demo script, test plan, prompts log
- [x] PWA manifest (installable)
- [ ] Run docs/test-plan.md on laptop and phone
- [ ] Test microphone in Chrome (Hindi hi-IN, English en-IN)
- [ ] Record YouTube video (unlisted, 3 min or less)
- [ ] Pitch deck PDF (problem/solution, users + numbers, dependencies + fallback, launch plan)
- [ ] Fill Result column in docs/prompts-used.md
- [ ] Friend test: clone repo, docker compose up
- [ ] Submit on the dashboard (once, by 30 Nov 11:59 PM; aim 29 Nov)

## Files
- frontend/src/mockAI.ts – scripted logic (done)
- frontend/src/storage.ts – localStorage (done)
- frontend/src/speech.ts – read aloud + mic (done)
- frontend/src/types.ts – data shapes (done)
- frontend/src/components/PageShell.tsx – page frame (done)
- frontend/src/pages/*.tsx – 6 screens (done)
- frontend/test-mock.ts – logic checks (done)

## Next task
Run the manual test plan, then record the video.

## Last session
All 6 screens built and connected. Full flow tested: Home → Consultation → Safety check → Teach-back → Summary → Save → My Consultations → Details (survives page refresh).
