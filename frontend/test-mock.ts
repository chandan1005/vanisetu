import {
  matchUtterance,
  needsClarification,
  checkTeachBack,
  translateToPatient,
  reExplain,
  hasKey,
} from "./src/mockAI";

console.log("1. matchUtterance:", matchUtterance("Take two tablets after food"));
// Expect: translation "Take two tablets after food", flags ["dose"]

console.log("2. needsClarification:", needsClarification(["dose"]));
// Expect: needed true, options ["2 tablets at one time", "2 times daily"]

console.log("3. checkTeachBack:", checkTeachBack("twice daily", "One tablet at night"));
// Expect: status "Mismatch", missed "twice daily"

console.log("4. translateToPatient:", translateToPatient("2 times daily"));
// Expect: "Take one tablet two times a day, after food"

console.log("5. reExplain:", reExplain("twice daily"));
// Expect: "One tablet in the morning and one at night, after food"

console.log("6. hasKey:", hasKey());
// Expect: false