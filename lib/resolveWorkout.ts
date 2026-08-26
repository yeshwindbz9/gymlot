import type { GeneratedExercise, GeneratedWorkout } from "@/types/workout";

import type { ResolvedExercise } from "@/types/exerciseDb";

import { searchExercises } from "@/lib/exerciseDb";

import {
  findBestExerciseMatch,
  mergeExerciseData,
} from "@/lib/exerciseMatcher";

async function resolveExercise(
  exercise: GeneratedExercise,
): Promise<ResolvedExercise> {
  /*
   * One ExerciseDB request only.
   *
   * If ExerciseDB is unavailable or
   * no suitable result exists, Gymlot
   * gracefully keeps the Gemini exercise.
   */
  const candidates = await searchExercises(exercise.name);

  const match = findBestExerciseMatch(exercise, candidates);

  return mergeExerciseData(exercise, match.exercise, match.score);
}

export async function resolveWorkoutExercises(
  workout: GeneratedWorkout,
): Promise<GeneratedWorkout> {
  const resolvedExercises = await Promise.all(
    workout.exercises.map(resolveExercise),
  );

  return {
    ...workout,
    resolvedExercises,
  };
}
