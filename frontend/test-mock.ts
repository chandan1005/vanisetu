// Quick checks for the scripted logic. Run: npx tsx test-mock.ts
import { extractFacts, compareFacts } from "./src/safety";
import { matchUtterance, needsClarification, checkTeachBack, translateToPatient, reExplain, hasKey } from "./src/mockAI";

const checks: [string, boolean][] = [
  ["matchUtterance flags dose", matchUtterance("Take two tablets after food").flags.includes("dose")],
  ["unknown sentence is unclear", matchUtterance("hello there").flags.includes("unclear")],
  ["clarifier needed for dose", needsClarification(["dose"]).needed],
  ["teach-back mismatch", checkTeachBack("twice daily", "One tablet at night").status === "Mismatch"],
  ["teach-back understood", checkTeachBack("twice daily", "Twice a day, after food").status === "Understood"],
  ["translate 2 times daily", translateToPatient("2 times daily") === "Take one tablet two times a day, after food"],
  ["re-explain twice daily", reExplain("twice daily").includes("morning")],
  ["no key used", hasKey() === false],
  ["live: finds dose", extractFacts("Take one tablet twice daily after food for five days").includes("dose: 1 tablet")],
  ["live: finds frequency", extractFacts("Take one tablet twice daily").includes("frequency: 2 times a day")],
  ["live: finds duration", extractFacts("for five days").includes("duration: 5 days")],
  ["live: no facts in symptom", extractFacts("I have a headache").length === 0],
  ["live: teach-back mismatch", compareFacts(["dose: 1 tablet", "frequency: 2 times a day"], extractFacts("one tablet at night")).status === "Mismatch"],
  ["live: morning+night = twice", compareFacts(["frequency: 2 times a day"], extractFacts("one in the morning and one at night")).status === "Understood"],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
console.log(failed ? `${failed} check(s) failed` : "All checks passed");
process.exit(failed ? 1 : 0);
