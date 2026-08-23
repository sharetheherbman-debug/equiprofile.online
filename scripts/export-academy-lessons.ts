import { LESSON_PATHWAYS, LESSON_UNITS } from "../server/lessonContent";

const pathways = Object.fromEntries(
  LESSON_PATHWAYS.map((pathway) => [pathway.slug, pathway.title]),
);

process.stdout.write(
  `${JSON.stringify(
    LESSON_UNITS.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      pathway: pathways[lesson.pathwaySlug] ?? lesson.pathwaySlug,
      level: lesson.level,
      category: lesson.category,
      objectives: lesson.objectives,
      content: lesson.content,
      keyPoints: lesson.keyPoints,
      safetyNote: lesson.safetyNote,
      practicalApplication: lesson.practicalApplication,
      commonMistakes: lesson.commonMistakes,
      knowledgeCheck: lesson.knowledgeCheck,
      aiTutorPrompts: lesson.aiTutorPrompts,
      linkedCompetencies: lesson.linkedCompetencies,
    })),
    null,
    2,
  )}\n`,
);
