import type { ExerciseDbExercise } from "@/types/exerciseDb";

type FallbackExercise = {
  id?: string;
  slug?: string;
  name?: string;

  muscle?: string;
  bodyPart?: string;
  equipment?: string;
  category?: string;

  secondaryMuscles?: string[];
  instructions?: string[];

  gifUrl?: string;
};

type FallbackResponse =
  | FallbackExercise[]
  | {
      exercises?: FallbackExercise[];
    };

const FALLBACK_DB_URL =
  "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/en/exercises.json";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExercises(data: FallbackResponse): FallbackExercise[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.exercises)) {
    return data.exercises;
  }

  return [];
}

async function getFallbackExercises(): Promise<FallbackExercise[]> {
  try {
    const response = await fetch(FALLBACK_DB_URL, {
      headers: {
        Accept: "application/json",
      },

      /*
       * Cache the whole static
       * dataset for 24 hours.
       *
       * Multiple failed ExerciseDB
       * lookups can therefore reuse
       * the same cached response.
       */
      next: {
        revalidate: 60 * 60 * 24,
      },
    });

    if (!response.ok) {
      console.warn("Exercise fallback database request failed", {
        status: response.status,

        statusText: response.statusText,
      });

      return [];
    }

    const data = (await response.json()) as FallbackResponse;

    return extractExercises(data);
  } catch (error) {
    console.error("Exercise fallback database request failed:", error);

    return [];
  }
}

function wordOverlap(first: string, second: string) {
  const firstWords = new Set(normalize(first).split(" ").filter(Boolean));

  const secondWords = new Set(normalize(second).split(" ").filter(Boolean));

  if (firstWords.size === 0 || secondWords.size === 0) {
    return 0;
  }

  let matches = 0;

  firstWords.forEach((word) => {
    if (secondWords.has(word)) {
      matches++;
    }
  });

  return matches / Math.max(firstWords.size, secondWords.size);
}

function scoreFallbackExercise(search: string, exercise: FallbackExercise) {
  const searchName = normalize(search);

  const exerciseName = normalize(exercise.name ?? "");

  if (!exerciseName) {
    return 0;
  }

  let score = 0;

  /*
   * Exact match.
   */
  if (searchName === exerciseName) {
    score += 100;
  }

  /*
   * One name contains the other.
   */
  if (searchName.includes(exerciseName) || exerciseName.includes(searchName)) {
    score += 50;
  }

  /*
   * General word overlap.
   */
  score += wordOverlap(searchName, exerciseName) * 40;

  return score;
}

function mapFallbackExercise(exercise: FallbackExercise): ExerciseDbExercise {
  return {
    exerciseId: exercise.id ?? exercise.slug,

    name: exercise.name,

    gifUrl: exercise.gifUrl,

    targetMuscles: exercise.muscle ? [exercise.muscle] : [],

    secondaryMuscles: exercise.secondaryMuscles ?? [],

    bodyParts: exercise.bodyPart ? [exercise.bodyPart] : [],

    equipments: exercise.equipment ? [exercise.equipment] : [],

    instructions: exercise.instructions ?? [],
  };
}

export async function searchFallbackExercises(
  search: string,
): Promise<ExerciseDbExercise[]> {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    return [];
  }

  const exercises = await getFallbackExercises();

  if (!exercises.length) {
    return [];
  }

  const ranked = exercises
    .map((exercise) => ({
      exercise,

      score: scoreFallbackExercise(trimmedSearch, exercise),
    }))
    .filter((item) => item.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((item) => mapFallbackExercise(item.exercise));

  return ranked;
}
