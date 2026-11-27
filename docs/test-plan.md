# VANISETU – Manual test plan

| ID | Area | Steps | Expected result | Pass/Fail |
|---|---|---|---|---|
| T01 | Setup | No .env, `docker compose up --build`, open localhost:5173 | Home loads; "AI key not set"; live translation status shown | |
| T02 | Home | Pick Patient Hindi, Doctor English → Start Consultation | Header shows Hindi (हिन्दी) and English | |
| T03 | Home | My Consultations | List opens | |
| T04 | Demo | Patient: Hold to speak | Bubble "demo", AI translation "I have had fever for three days" | |
| T05 | Demo | Doctor: Hold to speak | Safety check with 2 options + Repeat, no translation yet | |
| T06 | Demo | Choose 2 times daily | Confirmed translation + "Confirmed: 2 times daily" | |
| T07 | Demo | Doctor speak → Repeat | Popup closes, nothing added | |
| T07b | Live | Choose Kannada patient, Telugu doctor → Consultation → Prepare languages | All pairs show "ready" (first time may take a minute) | |
| T08 | Live | Type "I have headache since yesterday" → Send as patient | Live bubble with translation (or clear "Not translated" message if unavailable) | |
| T09 | Live/Wispr | Dictate with Wispr Flow "Take one tablet twice daily after food for five days" → Send as doctor | Safety check with chips: dose 1 tablet, 2 times a day, after food, 5 days | |
| T10 | Live | Yes, these are correct | Translated into patient language, "Confirmed: …" line | |
| T11 | Live | Type "Please drink water" → Send as doctor | Translated directly (no risky details) | |
| T12 | Mic | Tap and speak (Patient, Hindi), speak a sentence | Button turns red while listening, stops by itself, text translated; next turn shows Doctor | |
| T13 | Mic | Tap and speak, stay silent, or tap ■ Stop listening | "I didn't hear anything…" message; status back to Ready (never stuck) | |
| T13b | Mic | Switch to doctor / patient | Next-to-speak card and listening language change | |
| T14 | Teach-back | Demo path: Hold to speak → Explain again → Patient repeats | Mismatch, then Understood | |
| T15 | Teach-back | Live path: answer "one tablet at night" | Mismatch, Missed lists 2 times a day / after food / 5 days | |
| T16 | Teach-back | Live: answer "one tablet morning and night after food for five days" | Understood | |
| T17 | Summary | Continue → Save | "Saved ✓ as C00x", status Verified | |
| T18 | History | Refresh page | Saved item still there | |
| T19 | Details | Replay instructions | Read aloud, or "Audio not available on this device" | |
| T20 | Errors | Open /history/C999 and /teachback with no consultation | Not found / finish safety check first | |
| T21 | Fallback | Open in Firefox/Edge (or no Translator) | "Live translation: not available"; demo lines still work | |
| T22 | Mobile | Open on phone (same Wi-Fi), repeat T02–T07 | Layout fits; buttons easy to tap | |

## Before recording the video
- [ ] Demo reset done (clean list)
- [ ] Chrome up to date; live translation status "available"; run T08 once so language packs are downloaded
- [ ] Wispr Flow running and tested on the text field
- [ ] Volume on; browser zoom 100%; notifications off
