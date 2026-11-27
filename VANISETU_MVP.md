# VANISETU – MVP

## 1. Problem
A migrant worker cannot communicate with a doctor because of language barriers. This leads to misunderstood instructions and medicine mistakes.

## 2. Solution
VANISETU helps patients and doctors communicate safely through voice. It confirms risky details such as doses and frequency before translating, and checks whether the patient understood the instructions.

## 3. Core flow
Home → Consultation → Safety check → Teach-back → Summary → Save → My Consultations → Details

## 4. Screens (6)
1. Home – choose patient and doctor languages, Start Consultation, My Consultations
2. Consultation – speak buttons, original and translated text, Safety check overlay
3. Teach-back – expected vs patient answer, Mismatch or Understood
4. Summary – facility, date, time, symptoms, instructions, status, Save
5. My Consultations – saved list
6. Consultation Details – replay summary and instructions

## 5. Demo script
1. Patient says "Mujhe teen din se bukhar hai" → "I have had fever for three days"
2. Doctor says "Take two tablets after food" → Safety check: "2 tablets at one time" or "2 times daily"
3. Doctor picks "2 times daily" → patient hears "Take one tablet two times a day, after food"
4. Patient repeats "One tablet at night" → Mismatch
5. Explain again → patient repeats "Twice a day, after food" → Understood
6. Save → appears in My Consultations → replay instructions

## 5b. Live mode
Real speech (mic) or Wispr Flow dictation is translated on-device by Chrome. Doctor sentences with dose, frequency, timing, duration or warnings go through the Safety check (chips + confirm). Teach-back compares the patient's answer with the confirmed details.

## 6. Out of scope for Round 2
Backend and database, medical-grade AI services, Medication Guardian, Care Circle, Voice Health Passport, missed-call replay, real WhatsApp, real phone calls, GPS, maps, login, notifications, emergency features.

## 7. Data shape
See `frontend/src/types.ts` (Consultation, Turn, TeachBackResult).
