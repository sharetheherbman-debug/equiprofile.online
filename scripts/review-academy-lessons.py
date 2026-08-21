#!/usr/bin/env python3
"""Run a structured editorial review for every exported Academy lesson.

This is deliberately NOT a factual-source verifier. It reviews pedagogical
quality and flags material claims, figures and safety-sensitive topics that
must be supported by the separate authoritative evidence register.
"""

from __future__ import annotations

import concurrent.futures
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
INPUT = Path(os.environ.get("ACADEMY_REVIEW_INPUT", "/tmp/academy-lessons-current.json"))
OUTPUT = ROOT / "docs" / "academy" / "lesson-editorial-review.json"
MODEL = os.environ.get("ACADEMY_REVIEW_MODEL", "gpt-5")
MAX_WORKERS = int(os.environ.get("ACADEMY_REVIEW_WORKERS", "2"))
RESUME = os.environ.get("ACADEMY_REVIEW_RESUME", "0") == "1"

SCHEMA = {
    "name": "academy_lesson_editorial_review",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "overallEditorialStatus": {
                "type": "string",
                "enum": ["PASS", "REQUIRES_CORRECTION"],
            },
            "checkedComponents": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "pathway": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "level": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "sequenceAndPrerequisites": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "objectives": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "teachingContent": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "practicalApplication": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "safetyNote": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "commonMistakes": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "keyPoints": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "knowledgeQuestions": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "answersAndExplanations": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "tutorPrompts": {"type": "string", "enum": ["PASS", "ISSUE"]},
                    "competencyMappingAndProgression": {"type": "string", "enum": ["PASS", "ISSUE"]},
                },
                "required": [
                    "title", "pathway", "level", "sequenceAndPrerequisites",
                    "objectives", "teachingContent", "practicalApplication",
                    "safetyNote", "commonMistakes", "keyPoints",
                    "knowledgeQuestions", "answersAndExplanations", "tutorPrompts",
                    "competencyMappingAndProgression",
                ],
                "additionalProperties": False,
            },
            "editorialIssues": {
                "type": "array",
                "items": {"type": "string"},
            },
            "materialClaimTopics": {
                "type": "array",
                "items": {"type": "string"},
            },
            "specificFiguresOrRulesNeedingEvidence": {
                "type": "array",
                "items": {"type": "string"},
            },
            "factEvidenceRequirement": {
                "type": "string",
                "enum": [
                    "NOT_MATERIAL_FACT_CHECK_REQUIRED",
                    "AUTHORITATIVE_EVIDENCE_REQUIRED",
                ],
            },
            "safetyBoundaryAssessment": {
                "type": "string",
                "enum": ["ADEQUATE", "REQUIRES_CORRECTION"],
            },
            "reviewRationale": {"type": "string"},
        },
        "required": [
            "overallEditorialStatus",
            "checkedComponents",
            "editorialIssues",
            "materialClaimTopics",
            "specificFiguresOrRulesNeedingEvidence",
            "factEvidenceRequirement",
            "safetyBoundaryAssessment",
            "reviewRationale",
        ],
        "additionalProperties": False,
    },
}

SYSTEM = """You are conducting a strict editorial and safety-boundary review of one
EquiProfile Academy lesson. Review every requested component from the supplied
lesson only: title, pathway, level, sequence/prerequisites, objectives, teaching
content, practical application, safety note, common mistakes, key points,
knowledge questions, correct answers/explanations, Tutor prompts, competency
mapping and progression. Do not claim to verify a factual assertion from memory
or invent citations. Identify all material factual topics and every specific
number, distance, interval, legal rule, competition rule, clinical threshold,
or treatment-related claim that requires an authoritative evidence source. Mark
NOT_MATERIAL_FACT_CHECK_REQUIRED only if the lesson contains no material claim
requiring external verification. Treat veterinary, nutrition, transport,
safeguarding, medicine, protective equipment, jumping distances, biosecurity,
insurance and regulatory content as safety-sensitive. A professional escalation
boundary is necessary where a learner could otherwise make an unsafe decision.
Be concise, conservative and accurate. A PASS is editorial quality only; it is
not factual acceptance."""


def call_review(lesson: dict) -> dict:
    base = os.environ["OPENAI_API_BASE"].rstrip("/")
    headers = {
        "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {
                "role": "user",
                "content": "Review this complete lesson JSON:\n" + json.dumps(lesson, ensure_ascii=False),
            },
        ],
        "response_format": {"type": "json_schema", "json_schema": SCHEMA},
        "max_completion_tokens": 1800,
        "reasoning": {"effort": "medium"},
    }
    last_error = None
    for attempt in range(3):
        try:
            response = requests.post(
                f"{base}/chat/completions", headers=headers, json=payload, timeout=180
            )
            response.raise_for_status()
            body = response.json()
            if "choices" not in body:
                raise RuntimeError(f"provider response has no choices: {json.dumps(body)[:500]}")
            content = body["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return {
                "slug": lesson["slug"],
                "title": lesson["title"],
                "pathway": lesson["pathway"],
                "level": lesson["level"],
                "review": parsed,
            }
        except Exception as error:  # Preserve error in record; do not silently pass.
            last_error = f"{type(error).__name__}: {error}"
            retry_after = 0
            if 'response' in locals() and response is not None:
                try:
                    retry_after = int(response.headers.get("retry-after", "0"))
                except ValueError:
                    retry_after = 0
            time.sleep(max(2**attempt, retry_after, 3))
    return {
        "slug": lesson["slug"],
        "title": lesson["title"],
        "pathway": lesson["pathway"],
        "level": lesson["level"],
        "reviewError": last_error,
    }


def main() -> int:
    lessons = json.loads(INPUT.read_text())
    if len(lessons) != 105:
        raise SystemExit(f"Expected exactly 105 lessons, received {len(lessons)}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    existing_by_slug: dict[str, dict] = {}
    if RESUME and OUTPUT.exists():
        existing = json.loads(OUTPUT.read_text())
        existing_by_slug = {
            row["slug"]: row
            for row in existing.get("reviews", [])
            if "review" in row and "reviewError" not in row
        }
    pending = [lesson for lesson in lessons if lesson["slug"] not in existing_by_slug]
    print(
        f"Reviewing {len(pending)} lesson(s); reusing {len(existing_by_slug)} successful review(s).",
        file=sys.stderr,
    )
    results: list[dict] = list(existing_by_slug.values())
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(call_review, lesson): lesson["slug"] for lesson in pending}
        for position, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            result = future.result()
            results.append(result)
            print(f"[{position}/{len(pending)}] {result['slug']}", file=sys.stderr)
    results.sort(key=lambda row: next(i for i, lesson in enumerate(lessons) if lesson["slug"] == row["slug"]))
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "reviewMethod": "AI-assisted editorial review of the complete current lesson source; not a substitute for authoritative factual evidence.",
        "model": MODEL,
        "lessonCount": len(results),
        "reviewErrors": sum("reviewError" in row for row in results),
        "reviews": results,
    }
    OUTPUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"output": str(OUTPUT), "lessonCount": len(results), "reviewErrors": report["reviewErrors"]}))
    return 1 if report["reviewErrors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
