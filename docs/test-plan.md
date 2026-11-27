# VANISETU – Manual test plan

| ID | Screen | Steps | Expected result | Pass/Fail |
|---|---|---|---|---|
| T01 | Setup | Delete any .env, run `docker compose up --build`, open localhost:5173 | Home loads; shows "AI key not set: using scripted responses" | |
| T02 | Home | Tap Start Consultation | Consultation opens, empty conversation message shown | |
| T03 | Home | Tap My Consultations | My Consultations opens | |
| T04 | Consultation | Tap Patient: Hold to speak | Status cycles; bubble shows original + "AI translation: I have had fever for three days" | |
| T05 | Consultation | Tap Doctor: Hold to speak | No translation; Safety check popup opens with 2 options + Repeat | |
| T06 | Consultation | Choose 2 times daily | "AI translation (confirmed): Take one tablet two times a day, after food" + "Confirmed: 2 times daily" | |
| T07 | Consultation | Doctor speak → Repeat | Popup closes, nothing added | |
| T08 | Consultation | Type "hello" → Send as patient | "Not understood. Please say it again." shown; no translation | |
| T09 | Consultation | Before any confirmation | Check understanding button disabled | |
| T10 | Teach-back | Ask patient to repeat → Patient: Hold to speak | ⚠ Mismatch, Expected: twice daily, Patient: One tablet at night | |
| T11 | Teach-back | Explain again → Patient repeats | Re-explanation shown; ✓ Understood | |
| T12 | Summary | Continue to Summary | Facility, doctor, date, languages, symptoms, instructions, Understanding: Verified | |
| T13 | Summary | Save consultation | "Saved ✓ as C001"; View My Consultations shown | |
| T14 | History | Refresh the page | Saved consultation still listed | |
| T15 | Details | View → Replay instructions | Instructions read aloud, or "Audio not available on this device" | |
| T16 | Details | Open /history/C999 | "Consultation not found" | |
| T17 | Teach-back | Open /teachback directly with no consultation | Message to finish the safety check first | |
| T18 | History | Demo reset → confirm | List empty; "No consultations yet" | |
| T19 | Mic | In Chrome, Patient mic, stay silent | Friendly retry message, no crash | |
| T20 | Mobile | Open on phone (same Wi-Fi), repeat T02–T13 | Layout fits; buttons easy to tap | |

## Before recording the video
- [ ] T01–T18 pass on the laptop
- [ ] Demo reset done (clean list)
- [ ] Volume on; read-aloud tested
- [ ] Browser zoom 100%, notifications off
