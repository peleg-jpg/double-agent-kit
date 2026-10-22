# Voice-ready text (tts.txt)

AI voices (ElevenLabs, HeyGen) read text literally. `script.txt` is for captions and people; `tts.txt` is
the same words prepared so the voice sounds natural.

## Rules

1. **One flowing run with commas.** Almost no periods. Periods create robotic full stops and long pauses.
2. **No "?", no "...", no audio tags** like [laughs]. A question mark makes the voice rise and sound unsure.
   Rewrite questions as statements ("והחלק הכי טוב, זה ש...").
3. **Loanwords in Hebrew letters, Israeli pronunciation.** English letters make many voices switch to an
   American accent mid-sentence.

| script.txt (captions) | tts.txt (voice)   |
| --------------------- | ----------------- |
| Claude Code           | קלוד קוד          |
| WhatsApp              | וואטסאפ           |
| GitHub                | גיטהאב            |
| HeyGen                | הייג'ן            |
| ElevenLabs            | אילבן לאבס        |
| Instagram             | אינסטגרם          |
| prompt / prompts      | פרומפט / פרומפטים |
| skills                | סקילים            |
| plugin                | פלאגין            |
| AI                    | AI (keep)         |

A "p" sound inside a word needs a dagesh: פּ. If a word sounds wrong, test it alone in a short sentence
before generating the full voice.

4. **Numbers as spoken words:** "שלושים אלף", "אחת עשרה", "תשעים ותשע שקל". Captions keep digits ("30K").
5. **English plural -> Hebrew plural:** "הוקים", "סקילים", "לידים".
6. **No long dashes.** Only a normal hyphen, a comma or a period.

## Settings to suggest

- ElevenLabs: the student's cloned voice, Hebrew, stability around 0.8 for a calm, steady read. If it sounds
  flat, lower stability a little; if it wobbles, raise it.
- HeyGen: upload the finished ElevenLabs audio to the avatar instead of typing the text into HeyGen, so the
  voice is the student's real clone.
- After generating, listen once all the way through. Any line that ends rising (sounds like a question) or
  mispronounces a word: fix that line in `tts.txt` and regenerate only it.

## Check against the captions

After the voice exists, `motion-reel-pop` transcribes it with `--script script.txt`, so the captions use the
correct spelling from `script.txt` even though the voice read the Hebrew-letter version. Keep the two files aligned:
same words in the same order. Only spelling differs, plus numbers written as words, which can add a word
("6-7" becomes "שישה שבעה").
