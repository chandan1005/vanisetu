// safety.ts
// Rule-based safety checks for real (unscripted) speech. Works on English text:
// the app translates each sentence to English first, then looks for risky details.

const WORD_NUMBERS: Record<string, string> = {
  half: "0.5", one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9", ten: "10", fourteen: "14", thirty: "30",
};

function toNumber(word: string): string {
  return WORD_NUMBERS[word] ?? word;
}

// "1 tablet", "2 tablets": same wording for doctor and patient, so they can be compared.
function amount(n: string, unit: string): string {
  const base = unit.replace(/s$/, "");
  return `${n} ${base}${n === "1" || n === "0.5" || ["ml", "mg", "iu"].includes(base) ? "" : "s"}`;
}

// Finds the details that change what the patient must do: dose, how often, when, how long, warnings.
export function extractFacts(englishText: string): string[] {
  const t = ` ${englishText.toLowerCase()} `;
  const facts = new Set<string>();
  const num = "(\\d+(?:\\.\\d+)?|half|one|two|three|four|five|six|seven|eight|nine|ten|fourteen|thirty)";

  const dose = new RegExp(`${num}\\s*(tablet|tablets|pill|pills|capsule|capsules|ml|mg|unit|units|iu|drop|drops|spoon|spoons|teaspoon|teaspoons)`, "g");
  for (const m of t.matchAll(dose)) facts.add(`dose: ${amount(toNumber(m[1]), m[2])}`);

  if (/\b(twice|two times|bd|bid)\b/.test(t)) facts.add("frequency: 2 times a day");
  if (/\b(thrice|three times|tds|tid)\b/.test(t)) facts.add("frequency: 3 times a day");
  if (/\b(four times|qid)\b/.test(t)) facts.add("frequency: 4 times a day");
  if (/\b(once|one time|od)\b/.test(t)) facts.add("frequency: 1 time a day");
  if (/\b(sos|as needed|when needed|if needed)\b/.test(t)) facts.add("frequency: only when needed");
  for (const m of t.matchAll(/every\s+(\d+|two|three|four|six|eight|twelve)\s*hours?/g)) {
    facts.add(`frequency: every ${toNumber(m[1])} hours`);
  }

  if (/\bmorning\b/.test(t)) facts.add("time: morning");
  if (/\bafternoon\b/.test(t)) facts.add("time: afternoon");
  if (/\b(evening)\b/.test(t)) facts.add("time: evening");
  if (/\b(night|bedtime)\b/.test(t)) facts.add("time: night");
  if (/\bafter (food|meal|meals|eating|breakfast|lunch|dinner)\b/.test(t)) facts.add("food: after food");
  if (/\bbefore (food|meal|meals|eating|breakfast|lunch|dinner)\b/.test(t)) facts.add("food: before food");

  const duration = new RegExp(`(?:for\\s+)?${num}\\s*(day|days|week|weeks)`, "g");
  for (const m of t.matchAll(duration)) facts.add(`duration: ${amount(toNumber(m[1]), m[2])}`);

  if (/\b(do not|don't|dont|never|avoid|stop)\b/.test(t)) facts.add("warning: do not / avoid");
  return [...facts];
}

// A sentence is risky if it contains any dose, frequency, timing, duration or warning.
export function isRisky(englishText: string): boolean {
  return extractFacts(englishText).length > 0;
}

// Compares the doctor's confirmed facts with what the patient repeated.
// "Morning and night" counts as "2 times a day".
export function compareFacts(expected: string[], said: string[]): { status: "Understood" | "Mismatch"; missing: string[] } {
  const saidSet = new Set(said);
  const timesOfDay = said.filter((f) => f.startsWith("time:")).length;
  if (timesOfDay >= 2) saidSet.add("frequency: 2 times a day");
  if (timesOfDay >= 3) saidSet.add("frequency: 3 times a day");
  const missing = expected.filter((f) => !saidSet.has(f) && !f.startsWith("time:"));
  return { status: missing.length === 0 ? "Understood" : "Mismatch", missing };
}

// Doctors often write prescription shorthand. Patients don't know it, so it is spelled out before translating.
export function expandAbbreviations(text: string): string {
  return text
    .replace(/\bOD\b/g, "once a day")
    .replace(/\b(BD|BID)\b/g, "twice a day")
    .replace(/\b(TDS|TID)\b/g, "three times a day")
    .replace(/\bQID\b/g, "four times a day")
    .replace(/\bSOS\b/g, "only when needed")
    .replace(/\bHS\b/g, "at bedtime");
}

// Words that need the doctor's attention straight away. This is not a diagnosis: it only flags what was said.
const URGENT: [RegExp, string][] = [
  [/chest pain|pain in (my |the )?chest/, "chest pain"],
  [/(can't|cannot|can not|not able to|unable to|difficulty|trouble) breath|breathless|short(ness)? of breath/, "breathing difficulty"],
  [/unconscious|fainted|passed out|blacked out/, "fainting / unconscious"],
  [/seizure|fits|convulsion/, "seizure"],
  [/heavy bleeding|bleeding a lot|vomiting blood|blood in vomit/, "heavy bleeding"],
  [/allerg|swelling (of|in) (my |the )?(face|lips|throat)|rash all over/, "possible allergic reaction"],
  [/left arm (pain|numb)|arm (is )?numb/, "arm pain or numbness"],
  [/sudden (severe )?headache|worst headache/, "sudden severe headache"],
  [/blurred vision|can't see|cannot see|vision (is )?blur/, "sudden vision problem"],
  [/face (is )?drooping|slurred speech|can't speak|cannot speak|one side (of (my |the )?body )?(weak|numb)/, "possible stroke signs"],
  [/(baby|infant|newborn).*(fever|not feeding|not drinking)|(fever|not feeding).*(baby|infant|newborn)/, "sick infant"],
];

export function urgentWords(englishText: string): string[] {
  const t = englishText.toLowerCase();
  return URGENT.filter(([re]) => re.test(t)).map(([, label]) => label);
}

// Answers like "yes", "haan" or "ok" are not a repeat of the instructions.
const AFFIRMATIONS = /^(?:(?:yes|yeah|ok|okay|haan|han|ha|hmm|ji|ji haan|theek hai|thik hai|samajh gaya|samajh gayi|understood|got it|sari|houdu|avunu|aamaa|हाँ|हां|जी|जी हाँ|ठीक है|समझ गया|ಹೌದು|ಸರಿ|అవును|సరే|ஆமாம்|சரி|ହଁ|ঠিক আছে|হ্যাঁ)[\s,.!।]*)+$/i;
export function isOnlyYes(text: string): boolean {
  return AFFIRMATIONS.test(text.trim());
}
