// Quick checks for the scripted logic. Run: npx tsx test-mock.ts
import { extractFacts, compareFacts, expandAbbreviations, urgentWords, isOnlyYes } from "./src/safety";
import { factsFor } from "./src/mockAI";
import { matchUtterance, needsClarification, checkTeachBack, translateToPatient, reExplain, hasKey } from "./src/mockAI";

const checks: [string, boolean][] = [
  ["matchUtterance flags dose", matchUtterance("Take two tablets after food").flags.includes("dose")],
  ["unknown sentence is unclear", matchUtterance("hello there").flags.includes("unclear")],
  ["clarifier needed for dose", needsClarification(["dose"]).needed],
  ["teach-back mismatch", checkTeachBack("twice daily", "One tablet at night").status === "Mismatch"],
  ["teach-back understood", checkTeachBack("twice daily", "Twice a day, after food").status === "Understood"],
  ["translate option 1", translateToPatient("1 tablet, two times a day (after food)") === "Take one tablet two times a day, after food"],
  ["re-explain twice daily", reExplain("twice daily").includes("morning")],
  ["no key used", hasKey() === false],
  ["strict: 'morning and night' misses dose and food", compareFacts(factsFor("1 tablet, two times a day (after food)"), extractFacts("morning and night")).missing.length === 2],
  ["strict: full answer understood", compareFacts(factsFor("1 tablet, two times a day (after food)"), extractFacts("One tablet in the morning and one at night, after food")).status === "Understood"],
  ["strict: wrong dose caught", compareFacts(factsFor("1 tablet, two times a day (after food)"), extractFacts("2 tablets morning and night after food")).status === "Mismatch"],
  ["yes alone rejected", isOnlyYes("haan") && isOnlyYes("हाँ जी") && isOnlyYes("Yes.") && !isOnlyYes("yes, one tablet twice a day")],
  ["urgent: stroke signs", urgentWords("sudden severe headache and blurred vision").length === 2],
  ["abbreviation BD expanded", expandAbbreviations("Paracetamol 1 tablet BD for 3 days") === "Paracetamol 1 tablet twice a day for 3 days"],
  ["insulin units detected", extractFacts("insulin 10 units before meals").includes("dose: 10 units")],
  ["units vs ml mismatch caught", compareFacts(["dose: 10 units"], extractFacts("10 ml")).status === "Mismatch"],
  ["urgent: chest pain", urgentWords("I have chest pain and cannot breathe").length === 2],
  ["urgent: none for fever", urgentWords("I have had fever for three days").length === 0],
  ["teach-back: morning and night = twice", checkTeachBack("twice daily", "one tablet morning and night after food for five days").status === "Understood"],
  ["teach-back: two times = twice", checkTeachBack("twice daily", "two times a day").status === "Understood"],
  ["teach-back: two tablets together", checkTeachBack("two tablets at one time", "both tablets together").status === "Understood"],
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
