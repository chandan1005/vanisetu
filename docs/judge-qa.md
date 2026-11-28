# Judge questions – honest answers

Use these. Do not quote statistics you have not verified from a source.

**Is the translation real AI?**
Two modes. The demo lines are scripted so the presentation always works offline. Real speech and typed text are translated live by Chrome's built-in on-device translator, and the language is detected automatically. The translation layer is replaceable (for example Bhashini or a cloud API). VANISETU's value is the safety workflow around translation: confirm before translate, teach-back, communication risk and an audit trail.

**Why not Google Translate conversation mode?**
It translates. It does not stop a risky instruction until the doctor confirms the dose and timing, does not check that the patient can repeat the instruction, and does not keep a record of what was understood.

**How does teach-back work?**
It extracts the instruction details (dose, units, frequency, food timing, duration, warnings) and requires every one in the patient's repeat, in any language. Everyday wording is accepted ("morning and night" = twice a day), but missing the dose or food timing is a Mismatch, and "yes"/"haan" alone never counts. It checks instruction recall, which is what clinical teach-back checks; it cannot prove deep comprehension, and neither can a human doing teach-back. Next step: semantic matching with an AI model.

**What about patient data?**
In this prototype, data stays in the browser on one device and is fictional. A real deployment needs encrypted server storage, consent and access control under India's Digital Personal Data Protection Act, 2023.

**Is this a medical device?**
VANISETU does not diagnose, prescribe or give advice; it supports communication of what the doctor said. Any regulatory position would need to be confirmed with experts before deployment; we do not claim one yet.

**What if the patient says something urgent?**
Words like chest pain, breathing difficulty, fainting, seizure, heavy bleeding or allergic swelling show a red "Urgent words heard" banner and an audio alert for the doctor. It flags; it does not triage.

**Have you tested with doctors or patients?**
Only say what you have actually done. If nothing yet: "Not yet; a pilot with one clinic serving migrant workers is the next step."
