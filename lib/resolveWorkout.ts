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
   * Search the full Gemini name first.
   */
  let candidates = await searchExercises(exercise.name);

  /*
   * Fallback search:
   * if ExerciseDB doesn't understand the exact name,
   * try a shorter target/equipment query.
   */
  if (!candidates.length) {
    candidates = await searchExercises(
      `${exercise.equipment} ${exercise.targetMuscle}`,
    );
  }

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
