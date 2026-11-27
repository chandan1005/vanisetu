// Quick checks for the scripted logic. Run: npx tsx test-mock.ts
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
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
console.log(failed ? `${failed} check(s) failed` : "All checks passed");
process.exit(failed ? 1 : 0);
