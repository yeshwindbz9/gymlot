import type { GeneratedExercise, GeneratedWorkout } from "@/types/workout";

import type { ResolvedExercise } from "@/types/exerciseDb";

import { searchExercises } from "@/lib/exerciseDb";

import { searchFallbackExercises } from "@/lib/exerciseFallbackDb";

import {
  findBestExerciseMatch,
  mergeExerciseData,
} from "@/lib/exerciseMatcher";

const REQUEST_GAP_MS = 180;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveExercise(
  exercise: GeneratedExercise,
): Promise<ResolvedExercise> {
  /*
   * Primary source:
   * ExerciseDB V1
   */
  let candidates = await searchExercises(exercise.name);

  /*
   * Only use fallback if the
   * primary source returned nothing.
   *
   * This covers:
   * - 503
   * - network failure
   * - no search results
   */
  if (!candidates.length) {
    candidates = await searchFallbackExercises(exercise.name);
  }

  const match = findBestExerciseMatch(exercise, candidates);

  return mergeExerciseData(exercise, match.exercise, match.score);
}

export async function resolveWorkoutExercises(
  workout: GeneratedWorkout,
): Promise<GeneratedWorkout> {
  const resolvedExercises: ResolvedExercise[] = [];

  for (let index = 0; index < workout.exercises.length; index++) {
    const exercise = workout.exercises[index];

    const resolved = await resolveExercise(exercise);

    resolvedExercises.push(resolved);

    if (index < workout.exercises.length - 1) {
      await wait(REQUEST_GAP_MS);
    }
  }

  return {
    ...workout,
    resolvedExercises,
  };
}
