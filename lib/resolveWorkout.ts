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

async function getCandidates(exerciseName: string) {
  /*
   * 1. Primary source:
   * ExerciseDB V1
   */
  let candidates = await searchExercises(exerciseName);

  /*
   * 2. Cached static fallback
   */
  if (!candidates.length) {
    candidates = await searchFallbackExercises(exerciseName);
  }

  return candidates;
}

async function resolveExercise(
  exercise: GeneratedExercise,
): Promise<ResolvedExercise> {
  /*
   * First try the exact exercise
   * Gemini selected.
   */
  let candidates = await getCandidates(exercise.name);

  let match = findBestExerciseMatch(exercise, candidates);

  /*
   * If the original exercise could not
   * be resolved, try ONE suggested
   * alternative.
   *
   * Example:
   *
   * Cable EZ Bar Curl
   *       ↓
   * no usable demo
   *       ↓
   * Barbell Curl
   */
  if (!match.exercise && exercise.alternatives?.length) {
    const alternativeName = exercise.alternatives[0]?.trim();

    if (alternativeName) {
      /*
       * Small gap before making another
       * primary ExerciseDB request.
       */
      await wait(REQUEST_GAP_MS);

      const alternativeCandidates = await getCandidates(alternativeName);

      /*
       * Build a temporary generated
       * exercise so the matcher compares
       * against the alternative name.
       */
      const alternativeExercise: GeneratedExercise = {
        ...exercise,

        name: alternativeName,
      };

      const alternativeMatch = findBestExerciseMatch(
        alternativeExercise,
        alternativeCandidates,
      );

      if (alternativeMatch.exercise) {
        /*
         * Merge using the alternative
         * exercise name, but preserve the
         * original alternatives list.
         */
        const resolved = mergeExerciseData(
          alternativeExercise,
          alternativeMatch.exercise,
          alternativeMatch.score,
        );

        /*
         * Keep the original Gemini exercise
         * name so the UI can show that a swap
         * was used.
         */
        return {
          ...resolved,

          aiName: exercise.name,

          alternatives: exercise.alternatives,
        };
      }
    }
  }

  /*
   * Original exercise succeeded,
   * or nothing could be resolved.
   */
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

    /*
     * Space the normal exercise
     * requests slightly.
     */
    if (index < workout.exercises.length - 1) {
      await wait(REQUEST_GAP_MS);
    }
  }

  return {
    ...workout,
    resolvedExercises,
  };
}
