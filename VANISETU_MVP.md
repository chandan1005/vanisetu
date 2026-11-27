# VANISETU – MVP

## 1. Problem
A migrant worker cannot communicate with a doctor because of language barriers. This leads to misunderstood instructions and medicine mistakes.

## 2. Solution
VANISETU helps patients and doctors communicate safely through voice. It confirms risky details such as doses and frequency before translating, and checks whether the patient understood the instructions.

## 3. Core flow
Home → Consultation → Clarifier → Teach-back → Summary → Save → My Consultations → Details

## 4. Screens (6)
1. Home – Start Consultation, My Consultations
2. Consultation – hold to speak, original and translated text, clarifier overlay
3. Teach-back – expected vs patient answer, Mismatch or Understood
4. Summary – facility, date, time, symptoms, instructions, status, Save
5. My Consultations – list of saved consultations
6. Consultation Details – replay summary and instructions

## 5. Demo script
1. Patient says "Mujhe teen din se bukhar hai" → shows "I have had fever for three days"
2. Doctor says "Take two tablets after food" → clarifier asks "2 tablets at one time or 2 times daily?"
3. Doctor picks "2 times daily" → patient hears "Take one tablet two times a day, after food"
4. Doctor asks patient to repeat → patient says "One tablet at night" → Mismatch
5. App re-explains → patient repeats correctly → Understood
6. Doctor saves → consultation appears in My Consultations

## 6. Out of scope for Round 2
Medication Guardian, Care Circle, Voice Health Passport, missed-call replay, real WhatsApp, real phone calls, GPS, maps, login, notifications, emergency features.

## 7. Data shape
{
  "id": "C001",
  "facility": "Sample Government PHC, Bengaluru (demo)",
  "doctor": "Dr. Demo",
  "date": "2026-11-27",
  "time": "10:30",
  "patientLanguage": "Odia",
  "doctorLanguage": "Kannada",
  "symptoms": ["Fever for 3 days"],
  "instructions": ["Take one tablet two times a day, after food"],
  "teachBack": { "expected": "Twice daily", "patient": "Once daily", "status": "Mismatch" },
  "status": "Mismatch",
  "turns": [
    { "speaker": "patient", "original": "Mujhe teen din se bukhar hai", "translation": "I have had fever for three days" }
  ]
}