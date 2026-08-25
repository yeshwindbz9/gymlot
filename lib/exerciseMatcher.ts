import type { GeneratedExercise } from "@/types/workout";
import type { ExerciseDbExercise, ResolvedExercise } from "@/types/exerciseDb";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalize(value).split(" ").filter(Boolean);
}

function wordOverlap(a: string, b: string) {
  const wordsA = new Set(tokenize(a));
  const wordsB = new Set(tokenize(b));

  if (!wordsA.size || !wordsB.size) {
    return 0;
  }

  let matches = 0;

  wordsA.forEach((word) => {
    if (wordsB.has(word)) {
      matches++;
    }
  });

  return matches / Math.max(wordsA.size, wordsB.size);
}

function includesLoose(
  values: string[] | undefined | null,
  target: string | undefined | null,
) {
  if (!Array.isArray(values) || values.length === 0) {
    return false;
  }

  if (!target) {
    return false;
  }

  const normalizedTarget = normalize(target);

  if (!normalizedTarget) {
    return false;
  }

  return values.some((value) => {
    if (!value) {
      return false;
    }

    const normalizedValue = normalize(value);

    return (
      normalizedValue.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedValue)
    );
  });
}

function scoreExercise(
  generated: GeneratedExercise,
  candidate: ExerciseDbExercise,
) {
  const generatedName = normalize(generated.name || "");
  const candidateName = normalize(candidate.name || "");

  if (!candidateName) {
    return 0;
  }

  let score = 0;

  // Exact name match
  if (generatedName === candidateName) {
    score += 100;
  }

  // One name contains the other
  if (
    generatedName &&
    candidateName &&
    (generatedName.includes(candidateName) ||
      candidateName.includes(generatedName))
  ) {
    score += 45;
  }

  // General word similarity
  score += wordOverlap(generated.name || "", candidate.name || "") * 40;

  // Equipment match
  if (includesLoose(candidate.equipments, generated.equipment)) {
    score += 15;
  }

  // Target muscle / body part match
  const candidateTargets = [
    ...(candidate.targetMuscles ?? []),
    ...(candidate.bodyParts ?? []),
  ];

  if (includesLoose(candidateTargets, generated.targetMuscle)) {
    score += 20;
  }

  return score;
}

export function findBestExerciseMatch(
  generated: GeneratedExercise,
  candidates: ExerciseDbExercise[],
): {
  exercise: ExerciseDbExercise | null;
  score: number;
} {
  if (!candidates.length) {
    return {
      exercise: null,
      score: 0,
    };
  }

  const ranked = candidates
    .map((exercise) => ({
      exercise,
      score: scoreExercise(generated, exercise),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  /*
   * Deliberately conservative.
   *
   * A wrong exercise GIF is worse than displaying
   * the Gemini exercise without media.
   */
  if (!best || best.score < 30) {
    return {
      exercise: null,
      score: best?.score ?? 0,
    };
  }

  return best;
}

export function mergeExerciseData(
  generated: GeneratedExercise,
  matched: ExerciseDbExercise | null,
  matchScore: number,
): ResolvedExercise {
  if (!matched) {
    return {
      exerciseId: null,

      aiName: generated.name,
      name: generated.name,

      gifUrl: null,

      targetMuscles: [generated.targetMuscle],
      secondaryMuscles: [],
      bodyParts: [],
      equipments: [generated.equipment],
      instructions: [],

      sets: generated.sets,
      reps: generated.reps,
      restSeconds: generated.restSeconds,
      notes: generated.notes,
      alternatives: generated.alternatives,

      matchScore,
    };
  }

  return {
    exerciseId: matched.exerciseId ?? null,

    aiName: generated.name,
    name: matched.name || generated.name,

    gifUrl: matched.gifUrl ?? null,

    targetMuscles: matched.targetMuscles?.length
      ? matched.targetMuscles
      : [generated.targetMuscle],

    secondaryMuscles: matched.secondaryMuscles ?? [],

    bodyParts: matched.bodyParts ?? [],

    equipments: matched.equipments?.length
      ? matched.equipments
      : [generated.equipment],

    instructions: matched.instructions ?? [],

    sets: generated.sets,
    reps: generated.reps,
    restSeconds: generated.restSeconds,
    notes: generated.notes,
    alternatives: generated.alternatives ?? [],

    matchScore,
  };
}
