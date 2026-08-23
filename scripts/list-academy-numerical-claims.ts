import { LESSON_UNITS } from "../server/lessonContent";

const HIGH_RISK =
  /\b(colic|laminitis|wound|vital signs?|first aid|vaccin|worm|parasite|nutrition|supplement|dental|farrier|transport|insurance|competition|safeguard|biosecurity|infectious|legal|legislation|passport)\b/i;
const MATERIAL_NUMBER =
  /\b\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*(?:m|metres?|cm|mm|kg|g|ml|litres?|bpm|°c|degrees?|hours?|days?|weeks?|months?|years?|strides?|percent|%)\b/gi;

function fullText(lesson: (typeof LESSON_UNITS)[number]) {
  return [
    lesson.title,
    lesson.content,
    lesson.safetyNote,
    lesson.practicalApplication,
    ...lesson.objectives,
    ...lesson.keyPoints,
    ...lesson.commonMistakes,
    ...lesson.knowledgeCheck.flatMap((question) => [
      question.question,
      ...question.options,
      question.explanation,
    ]),
    ...lesson.aiTutorPrompts,
  ].join("\n");
}

const rows = LESSON_UNITS.map((lesson) => {
  const text = fullText(lesson);
  return {
    slug: lesson.slug,
    title: lesson.title,
    highRiskTopic: HIGH_RISK.test(text),
    numericClaims: [...text.matchAll(MATERIAL_NUMBER)].map((match) => match[0]),
  };
}).filter((row) => row.highRiskTopic && row.numericClaims.length > 0);

process.stdout.write(
  `${JSON.stringify({ count: rows.length, rows }, null, 2)}\n`,
);
