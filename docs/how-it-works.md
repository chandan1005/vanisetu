# How VANISETU works – every flow

Read this before the demo so you can explain each screen and answer judges.

## Flow 1 – Start
1. **Home**: the doctor sets **Doctor speaks** once (default English). **Patient speaks** defaults to **Detect automatically**, so the patient never chooses anything.
2. The Home screen shows two status lines:
   - "AI key not set: using scripted demo lines" (Round 2 rule: no keys).
   - "Live translation: available" (recent desktop Chrome) or "not available" (other browsers).
3. Tap **Start Consultation**. A new consultation is created with the fictional facility "Sample Government PHC, Bengaluru (demo)" and "Dr. Demo". If live translation is available, language packs start downloading in the background.

## Before a live demo – Prepare languages
Chrome downloads a translation language pack only after a tap. On the Consultation screen, tap **Prepare languages** and wait until every pair shows **ready** (for example "kn → te: ready"). Start Consultation and every speak/send button also start the download, but the first sentence may fail with "language pack is still downloading" until it finishes. Do this once per language pair on the demo laptop before recording.

## Flow 2 – Demo lines (scripted, always works)
Use this for the recorded video and as the backup on stage.
The demo lines themselves are fixed: a Hindi patient sentence and an English doctor sentence. Their meaning is written in English. If languages are prepared, VANISETU shows and reads that meaning in the listener's chosen language; if not, it shows English. For a demo that matches the lines exactly, choose Hindi (patient) and English (doctor).
1. **Patient: Hold to speak** → status Listening → Understanding → Speaking → bubble "Mujhe teen din se bukhar hai" with AI translation "I have had fever for three days". It is read aloud.
2. **Doctor: Hold to speak** → "Take two tablets after food" contains a dose, so **no translation yet** → **Safety check** popup: "2 tablets at one time" / "2 times daily" / Repeat.
3. Choose **2 times daily** → "AI translation (confirmed): Take one tablet two times a day, after food" + "Confirmed: 2 times daily". Read aloud to the patient.
4. **Repeat** closes the popup without translating (doctor speaks again).

## Flow 3 – Live speech (real users)
Works in recent desktop Chrome. Each bubble is labelled "live" or "demo".
VANISETU works out **who spoke** and **which language** by itself:
- **Language:** Indian scripts (Kannada, Telugu, Tamil, Malayalam, Gujarati, Punjabi, Odia, Bengali, Devanagari) are recognised from the letters, instantly and offline. English and other Latin text uses Chrome's on-device Language Detector when available.
- **Who:** if the sentence is in the doctor's language, the doctor spoke; any other language is the patient. When the patient switches language (for example Kannada, then Telugu), the app shows "Patient language detected: Telugu" and replies in Telugu from then on.
- **Reply:** every translation goes to the other person's language and is read aloud in that language.

Speaking uses **one big button** and **automatic turns**, so the patient (often elderly or unable to read) only has to speak.
1. The card shows **Next to speak: 🧑 Patient · हिन्दी**. Tap **🎙 Tap and speak**. The button turns red (**■ Stop listening**). Listening stops by itself when the person stops talking, after 12 seconds, or when you tap Stop.
2. The patient's words are translated on-device into the doctor's language, shown and read aloud. The English version is saved as a symptom. The turn passes to **🩺 Doctor** automatically.
3. The doctor taps the same button and speaks (or dictates with Wispr Flow into the text field + **Send as doctor**). The sentence is translated to English and checked by `safety.ts`. The turn passes back to the patient.
4. If the wrong person is shown, tap **Switch to doctor / Switch to patient**. Nobody needs to pick languages during the consultation: they were set once on Home.
   - If it has a **dose, frequency, time, food timing, duration or warning**, the **Safety check** shows the heard sentence, the English version, and orange chips such as "dose: 1 tablet", "frequency: 2 times a day", "duration: 5 days". The doctor taps **Yes, these are correct** (or **Repeat**).
   - Only then is it translated into the patient's language and read aloud.
   - Sentences without risky details are translated straight away.
3. If anything fails (no Translator, unsupported pair, pack still downloading, timeout), VANISETU shows the original words and "Not translated: … Use the demo buttons, or ask staff to help." It never guesses.

**Limits of automatic detection (say this honestly):**
- The **microphone** must be told a language before it listens. It listens in the doctor's language on the doctor's turn and in the patient's last detected language on the patient's turn (Hindi at first). If a new patient speaks another language, the first sentence may be heard wrongly; type or dictate one sentence in their language (Wispr Flow detects many languages), and from then on the mic uses the detected language.
- **Typed or dictated text** in any supported script is detected exactly. Romanised text ("mujhe bukhar hai") looks like English; use "Send as patient" for it.
- If a new language pack needs downloading, an orange **Prepare … and translate** button appears; one tap downloads it and translates the sentence.

**Will it translate when a real user speaks?** Yes, in recent desktop Chrome with live translation available: the mic hears the language you picked, and Chrome translates on the device. On phones or other browsers, the mic may work but live translation may not; then use the demo lines.

## Flow 4 – Teach-back
1. **Check understanding** (enabled after a confirmed instruction) → shows the instruction in the patient's language.
2. **Ask patient to repeat** → the instruction is read aloud.
3. The patient answers by **mic**, by typing/dictating, or (demo) **Patient: Hold to speak**.
   - Demo: first answer "One tablet at night" → **⚠ Mismatch** (Expected: twice daily). Everyday wording such as "morning and night" or "two times a day" counts as correct, in any language.
   - Live: the answer is translated to English and compared with the confirmed facts. Missing facts are listed under **Missed**. "Morning and night" counts as "2 times a day".
4. **Explain again** reads the instruction again → patient repeats → **✓ Understood**.
5. **Continue to Summary**.

## Status words shown to users
- **Understood ✓** – the patient repeated the instructions correctly.
- **Needs re-explaining** – the last answer did not match; explain again before the patient leaves.
- **Not checked** – teach-back was skipped.

## Flow 5 – Summary and save
Facility, doctor, date/time, language pair, symptoms, confirmed instructions, Understanding status (Verified / Mismatch / Not checked), last answer and attempts. **Save consultation** → "Saved ✓ as C001" → **View My Consultations**.

## Flow 6 – History and details
- **My Consultations**: saved list (stays after refresh). "Demo reset: delete all" clears it before recording.
- **Details**: full record, conversation with live/confirmed labels, **▶ Replay summary** and **▶ Replay instructions** (browser voice, or "Audio not available on this device").

## What to say if asked
- **Is this real AI?** Demo lines are scripted; real speech uses Chrome's on-device translation. The product's value is the safety layer around translation: confirm before translate, then teach-back.
- **Where is Wispr Flow used?** We built by dictating with Wispr Flow, and the doctor dictates instructions with Wispr Flow into VANISETU, which triggers the safety check.
- **Why no backend?** Round 2 must start with no keys and be reliable in a live demo. Backend and database are next.
