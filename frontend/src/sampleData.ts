// sampleData.ts
// Six realistic, fictional consultations so judges can see every outcome without running a full demo.
// Native-language lines are sample text; have a native speaker review them before a public demo.
import type { Consultation, TeachBackAttempt, Turn } from "./types";
import { findLanguage } from "./languages";

type Sample = {
  date: string;
  time: string;
  patientLang: string;
  facility: string;
  symptoms: string[];
  instructions: string[];
  facts: string[];
  expected: string;
  turns: Turn[];
  history: TeachBackAttempt[];
  urgent?: string[];
};

function build(s: Sample): Consultation {
  const p = findLanguage(s.patientLang);
  const last = s.history[s.history.length - 1];
  const status: Consultation["status"] = !last ? "Not checked" : last.status === "Understood" ? "Verified" : "Mismatch";
  return {
    id: "draft",
    facility: s.facility,
    doctor: "Dr. Demo",
    date: s.date,
    time: s.time,
    patientLanguage: p.name,
    doctorLanguage: "English",
    patientLang: p.code,
    doctorLang: "en",
    patientAuto: true,
    symptoms: s.symptoms,
    instructions: s.instructions,
    expectedUnderstanding: s.facts.length ? "live" : "",
    liveFacts: s.facts,
    urgent: s.urgent,
    teachBack: last
      ? {
          expected: s.expected,
          patient: last.answer,
          status: last.status,
          attempts: s.history.length,
          missed: last.missed,
          totalDetails: s.facts.filter((f) => !f.startsWith("time:")).length || 1,
          history: s.history,
        }
      : { expected: s.expected, patient: "", status: "Not checked", attempts: 0 },
    status,
    turns: s.turns,
  };
}

const PHC = "Sample Government PHC, Bengaluru (demo sample)";
const DH = "Sample District Hospital OPD (demo sample)";

const SAMPLES: Sample[] = [
  {
    // 1. Low risk: Kannada-speaking construction worker understands first time.
    date: "2026-11-25", time: "09:40", patientLang: "kn", facility: PHC,
    symptoms: ["I have had fever for three days and body pain"],
    instructions: ["ಪ್ಯಾರಸಿಟಮಾಲ್ ಒಂದು ಮಾತ್ರೆ, ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಊಟದ ನಂತರ, ಮೂರು ದಿನ ತೆಗೆದುಕೊಳ್ಳಿ"],
    facts: ["dose: 1 tablet", "frequency: 2 times a day", "food: after food", "duration: 3 days"],
    expected: "1 tablet, 2 times a day, after food, 3 days",
    turns: [
      { speaker: "system", original: "Patient language detected: Kannada (ಕನ್ನಡ)", translation: "", time: "09:40:05" },
      { speaker: "patient", original: "ನನಗೆ ಮೂರು ದಿನದಿಂದ ಜ್ವರ ಇದೆ, ಮೈಕೈ ನೋವು ಇದೆ", translation: "I have had fever for three days and body pain", live: true, time: "09:40:06" },
      { speaker: "doctor", original: "Take Paracetamol, one tablet twice a day after food, for three days.", translation: "ಪ್ಯಾರಸಿಟಮಾಲ್ ಒಂದು ಮಾತ್ರೆ, ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಊಟದ ನಂತರ, ಮೂರು ದಿನ ತೆಗೆದುಕೊಳ್ಳಿ", confirmed: true, live: true, time: "09:41:10" },
      { speaker: "system", original: "Confirmed: dose: 1 tablet, frequency: 2 times a day, food: after food, duration: 3 days", translation: "", time: "09:41:12" },
    ],
    history: [{ answer: "ಬೆಳಿಗ್ಗೆ ಒಂದು, ರಾತ್ರಿ ಒಂದು ಮಾತ್ರೆ, ಊಟದ ನಂತರ, ಮೂರು ದಿನ", status: "Understood", missed: [] }],
  },
  {
    // 2. Medium risk: Odia-speaking worker gets the frequency wrong, understands after re-explaining.
    date: "2026-11-25", time: "11:15", patientLang: "or", facility: PHC,
    symptoms: ["My stomach hurts and I have had loose motions for two days"],
    instructions: ["ପ୍ରତି ଥର ଝାଡ଼ା ପରେ ORS ପିଅନ୍ତୁ। ମେଟ୍ରୋନିଡାଜୋଲ୍ ଗୋଟିଏ ଟାବଲେଟ୍, ଦିନକୁ ତିନି ଥର ଖାଇବା ପରେ, ପାଞ୍ଚ ଦିନ ନିଅନ୍ତୁ।"],
    facts: ["dose: 1 tablet", "frequency: 3 times a day", "food: after food", "duration: 5 days"],
    expected: "1 tablet, 3 times a day, after food, 5 days",
    turns: [
      { speaker: "system", original: "Patient language detected: Odia (ଓଡ଼ିଆ)", translation: "", time: "11:15:03" },
      { speaker: "patient", original: "ମୋ ପେଟ ବିନ୍ଧୁଛି, ଦୁଇ ଦିନ ହେଲା ଝାଡ଼ା ହେଉଛି", translation: "My stomach hurts and I have had loose motions for two days", live: true, time: "11:15:04" },
      { speaker: "doctor", original: "Drink ORS after every loose motion. Take Metronidazole, one tablet three times a day after food, for five days.", translation: "ପ୍ରତି ଥର ଝାଡ଼ା ପରେ ORS ପିଅନ୍ତୁ। ମେଟ୍ରୋନିଡାଜୋଲ୍ ଗୋଟିଏ ଟାବଲେଟ୍, ଦିନକୁ ତିନି ଥର ଖାଇବା ପରେ, ପାଞ୍ଚ ଦିନ ନିଅନ୍ତୁ।", confirmed: true, live: true, time: "11:16:20" },
      { speaker: "system", original: "Confirmed: dose: 1 tablet, frequency: 3 times a day, food: after food, duration: 5 days", translation: "", time: "11:16:22" },
    ],
    history: [
      { answer: "ଦିନକୁ ଦୁଇ ଥର ଗୋଟିଏ ଟାବଲେଟ୍", status: "Mismatch", missed: ["frequency: 3 times a day", "food: after food", "duration: 5 days"] },
      { answer: "ଖାଇବା ପରେ ଦିନକୁ ତିନି ଥର ଗୋଟିଏ ଟାବଲେଟ୍, ପାଞ୍ଚ ଦିନ", status: "Understood", missed: [] },
    ],
  },
  {
    // 3. High risk: elderly Hindi-speaking patient confuses insulin units with ml.
    date: "2026-11-26", time: "10:05", patientLang: "hi", facility: DH,
    symptoms: ["I have diabetes; the doctor told me to take insulin"],
    instructions: ["हर दिन नाश्ते से पहले इंसुलिन की 10 यूनिट का इंजेक्शन लें"],
    facts: ["dose: 10 units", "food: before food"],
    expected: "10 units, before food",
    turns: [
      { speaker: "patient", original: "मुझे शुगर है, डॉक्टर ने इंसुलिन बोला है", translation: "I have diabetes; the doctor told me to take insulin", live: true, time: "10:05:10" },
      { speaker: "doctor", original: "Inject insulin 10 units before breakfast every day.", translation: "हर दिन नाश्ते से पहले इंसुलिन की 10 यूनिट का इंजेक्शन लें", confirmed: true, live: true, time: "10:06:02" },
      { speaker: "system", original: "Confirmed: dose: 10 units, food: before food", translation: "", time: "10:06:04" },
    ],
    history: [
      { answer: "नाश्ते से पहले 10 ml", status: "Mismatch", missed: ["dose: 10 units"] },
      { answer: "10 ml सुबह", status: "Mismatch", missed: ["dose: 10 units", "food: before food"] },
    ],
  },
  {
    // 4. Medium risk: Telugu-speaking patient leaves before teach-back (not checked).
    date: "2026-11-27", time: "15:30", patientLang: "te", facility: PHC,
    symptoms: ["I have had a cough for a week"],
    instructions: ["రాత్రి 10 ml దగ్గు సిరప్ ఐదు రోజులు తీసుకోండి. తీసుకున్న తర్వాత వాహనం నడపవద్దు."],
    facts: ["dose: 10 ml", "time: night", "duration: 5 days", "warning: do not / avoid"],
    expected: "10 ml, 5 days, do not drive",
    turns: [
      { speaker: "system", original: "Patient language detected: Telugu (తెలుగు)", translation: "", time: "15:30:02" },
      { speaker: "patient", original: "నాకు ఒక వారం నుంచి దగ్గు ఉంది", translation: "I have had a cough for a week", live: true, time: "15:30:03" },
      { speaker: "doctor", original: "Take cough syrup 10 ml at night for five days. Do not drive after taking it.", translation: "రాత్రి 10 ml దగ్గు సిరప్ ఐదు రోజులు తీసుకోండి. తీసుకున్న తర్వాత వాహనం నడపవద్దు.", confirmed: true, live: true, time: "15:31:15" },
      { speaker: "system", original: "Confirmed: dose: 10 ml, time: night, duration: 5 days, warning: do not / avoid", translation: "", time: "15:31:17" },
    ],
    history: [],
  },
  {
    // 5. Urgent words: Tamil-speaking patient describes chest pain; the doctor is alerted.
    date: "2026-11-27", time: "18:10", patientLang: "ta", facility: DH,
    symptoms: ["I have chest pain and cannot breathe"],
    instructions: [],
    facts: [],
    expected: "",
    urgent: ["chest pain", "breathing difficulty"],
    turns: [
      { speaker: "system", original: "Patient language detected: Tamil (தமிழ்)", translation: "", time: "18:10:01" },
      { speaker: "patient", original: "எனக்கு நெஞ்சு வலி, மூச்சு விட முடியவில்லை", translation: "I have chest pain and cannot breathe", live: true, time: "18:10:02" },
      { speaker: "system", original: "⚠ Urgent words heard: chest pain, breathing difficulty. Doctor alerted.", translation: "", time: "18:10:03" },
      { speaker: "doctor", original: "Please lie down. We will do an ECG now.", translation: "தயவுசெய்து படுத்துக்கொள்ளுங்கள். இப்போது ECG எடுக்கிறோம்.", live: true, time: "18:10:40" },
    ],
    history: [],
  },
  {
    // 6. Medium risk: patient first only says "yes"; VANISETU asks for a real repeat.
    date: "2026-11-28", time: "09:20", patientLang: "hi", facility: PHC,
    symptoms: ["I have had fever for three days"],
    instructions: ["एक गोली दिन में दो बार, भोजन के बाद लें"],
    facts: ["dose: 1 tablet", "frequency: 2 times a day", "food: after food"],
    expected: "1 tablet, 2 times a day, after food",
    turns: [
      { speaker: "patient", original: "Mujhe teen din se bukhar hai", translation: "I have had fever for three days", time: "09:20:05" },
      { speaker: "doctor", original: "Take two tablets after food", translation: "एक गोली दिन में दो बार, भोजन के बाद लें", confirmed: true, time: "09:20:40" },
      { speaker: "system", original: "Confirmed: 1 tablet, two times a day (after food)", translation: "", time: "09:20:45" },
    ],
    history: [
      { answer: "हाँ जी", status: "Mismatch", missed: ["dose: 1 tablet", "frequency: 2 times a day", "food: after food"] },
      { answer: "सुबह एक और रात को एक गोली, खाने के बाद", status: "Understood", missed: [] },
    ],
  },
];

export function sampleConsultations(): Consultation[] {
  return SAMPLES.map(build);
}
