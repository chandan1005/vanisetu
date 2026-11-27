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
  return `${n} ${base}${n === "1" || n === "0.5" || ["ml", "mg"].includes(base) ? "" : "s"}`;
}

// Finds the details that change what the patient must do: dose, how often, when, how long, warnings.
export function extractFacts(englishText: string): string[] {
  const t = ` ${englishText.toLowerCase()} `;
  const facts = new Set<string>();
  const num = "(\\d+(?:\\.\\d+)?|half|one|two|three|four|five|six|seven|eight|nine|ten|fourteen|thirty)";

  const dose = new RegExp(`${num}\\s*(tablet|tablets|pill|pills|capsule|capsules|ml|mg|drop|drops|spoon|spoons|teaspoon|teaspoons)`, "g");
  for (const m of t.matchAll(dose)) facts.add(`dose: ${amount(toNumber(m[1]), m[2])}`);

  if (/\b(twice|two times)\b/.test(t)) facts.add("frequency: 2 times a day");
  if (/\b(thrice|three times)\b/.test(t)) facts.add("frequency: 3 times a day");
  if (/\b(once|one time)\b/.test(t)) facts.add("frequency: 1 time a day");
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
