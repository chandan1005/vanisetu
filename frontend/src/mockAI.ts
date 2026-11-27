// mockAI.ts
// The scripted "AI" for the VANISETU demo. It uses predefined examples only,
// so the same input always gives the same output. No API keys are needed.

// Switch for the demo. Mock mode is always on in Round 2.
export const MOCK_MODE = true;

// The predefined examples. Each key is a phrase we expect to hear.
const EXAMPLES: {
  key: string;
  translation: string;
  flags: string[];
}[] = [
  {
    key: "mujhe teen din se bukhar hai",
    translation: "I have had fever for three days",
    flags: [],
  },
  {
    key: "take two tablets after food",
    translation: "Take two tablets after food",
    flags: ["dose"],
  },
  {
    key: "take medicine twice daily",
    translation: "Take medicine twice daily",
    flags: ["frequency"],
  },
  {
    key: "one tablet at night",
    translation: "One tablet at night",
    flags: [],
  },
];

// Looks at what was said and finds the matching predefined example.
// It returns the original words, the translation, and any risky-detail flags.
// If nothing matches, it returns an empty translation and the flag "unclear".
export function matchUtterance(text: string): {
  original: string;
  translation: string;
  flags: string[];
} {
  const lowered = text.toLowerCase();
  const found = EXAMPLES.find((example) => lowered.includes(example.key));

  if (!found) {
    return { original: text, translation: "", flags: ["unclear"] };
  }

  return {
    original: text,
    translation: found.translation,
    flags: [...found.flags],
  };
}

// Decides whether the app must ask a question before translating.
// A dose or a frequency is risky, so it triggers the safety question.
export function needsClarification(flags: string[]): {
  needed: boolean;
  question: string;
  options: string[];
} {
  if (flags.includes("dose") || flags.includes("frequency")) {
    return {
      needed: true,
      question: "Did you mean:",
      options: ["2 tablets at one time", "2 times daily"],
    };
  }

  return { needed: false, question: "", options: [] };
}

// Turns the confirmed meaning into the sentence the patient hears.
// If the meaning is not one we know, it returns the text unchanged.
export function translateToPatient(clarifiedMeaning: string): string {
  if (clarifiedMeaning === "2 times daily") {
    return "Take one tablet two times a day, after food";
  }
  if (clarifiedMeaning === "2 tablets at one time") {
    return "Take two tablets at one time, after food";
  }
  return clarifiedMeaning;
}

// Compares what the doctor said with what the patient repeated back.
// It returns "Understood" if the patient got the timing right,
// or "Mismatch" and the part that was missed.
export function checkTeachBack(
  expected: string,
  said: string
): { status: "Understood" | "Mismatch"; missed: string } {
  const lowered = said.toLowerCase();

  if (expected === "twice daily") {
    if (lowered.includes("once") || lowered.includes("one tablet at night")) {
      return { status: "Mismatch", missed: "twice daily" };
    }
    if (lowered.includes("twice") || lowered.includes("two times")) {
      return { status: "Understood", missed: "" };
    }
  }

  return { status: "Mismatch", missed: expected };
}

// Gives the simple re-explanation shown after a mismatch.
// Only "twice daily" has a re-explanation in the demo.
export function reExplain(expected: string): string {
  if (expected === "twice daily") {
    return "One tablet in the morning and one at night, after food";
  }
  return expected;
}

// Used by the app to check whether an AI key is set.
// Round 2 uses no keys, so this always returns false.
export function hasKey(): boolean {
  return false;
}