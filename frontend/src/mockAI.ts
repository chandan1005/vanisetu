// mockAI.ts
// The scripted "AI" for the VANISETU demo. It uses predefined examples only,
// so the same input always gives the same output. No API keys are needed.

// Switch for the demo. Mock mode is always on in Round 2.
export const MOCK_MODE = true;

// The predefined examples. Each key is a phrase we expect to hear.
const EXAMPLES: { key: string; translation: string; flags: string[] }[] = [
  { key: "mujhe teen din se bukhar hai", translation: "I have had fever for three days", flags: [] },
  { key: "take two tablets after food", translation: "Take two tablets after food", flags: ["dose"] },
  { key: "take medicine twice daily", translation: "Take medicine twice daily", flags: ["frequency"] },
  { key: "one tablet at night", translation: "One tablet at night", flags: [] },
  { key: "twice a day", translation: "Twice a day", flags: [] },
  { key: "two tablets at one time", translation: "Two tablets at one time", flags: [] },
];

// Looks at what was said and finds the matching predefined example.
// Returns the original words, the translation, and any risky-detail flags.
// If nothing matches, returns an empty translation and the flag "unclear".
export function matchUtterance(text: string): { original: string; translation: string; flags: string[] } {
  const lowered = text.toLowerCase();
  const found = EXAMPLES.find((example) => lowered.includes(example.key));
  if (!found) return { original: text, translation: "", flags: ["unclear"] };
  return { original: text, translation: found.translation, flags: [...found.flags] };
}

// Decides whether the app must ask a question before translating.
// A dose or a frequency is risky, so it triggers the safety question.
export function needsClarification(flags: string[]): { needed: boolean; question: string; options: string[] } {
  if (flags.includes("dose") || flags.includes("frequency")) {
    return { needed: true, question: "Doctor, please confirm what you meant:", options: ["1 tablet, two times a day (after food)", "2 tablets together, once a day (after food)"] };
  }
  return { needed: false, question: "", options: [] };
}

// Turns the confirmed meaning into the sentence the patient hears.
export function translateToPatient(clarifiedMeaning: string): string {
  if (clarifiedMeaning === "1 tablet, two times a day (after food)") return "Take one tablet two times a day, after food";
  if (clarifiedMeaning === "2 tablets together, once a day (after food)") return "Take two tablets together, once a day, after food";
  return clarifiedMeaning;
}

// Gives the short "expected understanding" used by teach-back for each confirmed option.
export function expectedFor(clarifiedMeaning: string): string {
  if (clarifiedMeaning === "1 tablet, two times a day (after food)") return "twice daily";
  if (clarifiedMeaning === "2 tablets together, once a day (after food)") return "two tablets at one time";
  return clarifiedMeaning;
}

// The details the patient must repeat for each confirmed demo option (dose, how often, food timing).
export function factsFor(clarifiedMeaning: string): string[] {
  if (clarifiedMeaning === "1 tablet, two times a day (after food)") return ["dose: 1 tablet", "frequency: 2 times a day", "food: after food"];
  if (clarifiedMeaning === "2 tablets together, once a day (after food)") return ["dose: 2 tablets", "frequency: 1 time a day", "food: after food"];
  return [];
}

// Compares what the doctor said with what the patient repeated back.
// Accepts everyday ways of saying the same thing ("morning and night" = twice daily).
export function checkTeachBack(expected: string, said: string): { status: "Understood" | "Mismatch"; missed: string } {
  const t = said.toLowerCase();
  const twice =
    /\b(twice|two times|2 times|2 baar|do baar)\b/.test(t) ||
    (/\bmorning\b/.test(t) && /\b(night|evening|bedtime)\b/.test(t));
  const together = /\b(at one time|one time|at once|together|both)\b/.test(t);
  const twoTablets = /\b(two|2)\s+(tablet|tablets|pill|pills)\b/.test(t) || /\bboth\b/.test(t);

  if (expected === "twice daily") {
    if (twice) return { status: "Understood", missed: "" };
    return { status: "Mismatch", missed: "twice daily" };
  }
  if (expected === "two tablets at one time") {
    if (twoTablets && together) return { status: "Understood", missed: "" };
    return { status: "Mismatch", missed: "two tablets at one time" };
  }
  return { status: "Mismatch", missed: expected };
}

// Gives the simple re-explanation shown after a mismatch.
export function reExplain(expected: string): string {
  if (expected === "twice daily") return "One tablet in the morning and one at night, after food";
  if (expected === "two tablets at one time") return "Take both tablets together, one time, after food";
  return expected;
}

// The scripted patient answers for teach-back: first try misses details, second is complete.
export function scriptedRepeat(expected: string, attempt: number): string {
  if (expected === "twice daily") return attempt === 0 ? "One tablet at night" : "One tablet in the morning and one at night, after food";
  return attempt === 0 ? "Two tablets" : "Two tablets together once a day, after food";
}

// Used by the app to check whether an AI key is set. Round 2 uses no keys.
export function hasKey(): boolean {
  return false;
}
