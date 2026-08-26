"use client";

import {
  ArrowRight,
  Check,
  Droplets,
  Flame,
  Beef,
  Wheat,
  CircleDot,
  RotateCcw,
} from "lucide-react";

import type { GeneratedWorkout } from "@/types/workout";

import type { WorkoutCompletionSummary } from "@/components/Workout/WorkoutPlayer";

import { calculateWorkoutSummary } from "@/lib/workoutSummary";

type Props = {
  workout: GeneratedWorkout;

  completion: WorkoutCompletionSummary;

  weightKg: number | null;
  experience: string;

  onBuildAnother: () => void;
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function WorkoutSummary({
  workout,
  completion,
  weightKg,
  experience,
  onBuildAnother,
}: Props) {
  const summary = calculateWorkoutSummary({
    completion,
    weightKg,
    experience,
  });

  const resolvedExercises = workout.resolvedExercises?.length
    ? workout.resolvedExercises
    : workout.exercises.map((exercise) => ({
        exerciseId: null,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
      }));

  return (
    <section className="final-summary">
      <div className="final-summary-grid" />

      <div className="final-summary-shell">
        <div className="final-summary-hero">
          <div>
            <span className="summary-eyebrow">WORKOUT COMPLETE</span>

            <h1>
              DONE.
              <br />
              YOU SHOWED
              <br />
              UP.
            </h1>

            <p className="summary-marker">that counts →</p>
          </div>

          <div className="summary-big-check">
            <Check size={88} strokeWidth={1.3} />
          </div>
        </div>

        <div className="summary-main-stats">
          <div>
            <span>TIME</span>

            <strong>{formatDuration(completion.totalDurationSeconds)}</strong>

            <small>total workout duration</small>
          </div>

          <div>
            <span>CALORIES</span>

            <strong>
              {summary.calories
                ? `${summary.calories.min}–${summary.calories.max}`
                : "—"}
            </strong>

            <small>
              {summary.calories ? "estimated kcal" : "add weight for estimate"}
            </small>
          </div>

          <div>
            <span>EXERCISES</span>

            <strong>
              {completion.exercisesCompleted}/{completion.totalExercises}
            </strong>

            <small>completed</small>
          </div>

          <div>
            <span>SETS</span>

            <strong>
              {completion.setsCompleted}/{completion.totalSets}
            </strong>

            <small>completed</small>
          </div>
        </div>

        {completion.exercisesSkipped > 0 && (
          <div className="summary-skipped-note">
            <span>SKIPPED</span>

            <strong>
              {completion.exercisesSkipped}{" "}
              {completion.exercisesSkipped === 1 ? "exercise" : "exercises"}
            </strong>

            <small>skipped exercises are not counted as completed</small>
          </div>
        )}

        <div className="summary-session-card">
          <div className="summary-session-top">
            <span>TODAY&apos;S SESSION</span>

            <strong>{workout.workoutType}</strong>
          </div>

          <h2>{workout.title}</h2>

          <div className="summary-exercise-list">
            {resolvedExercises.map((exercise, index) => (
              <div key={exercise.exerciseId ?? `${exercise.name}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>

                <strong>{exercise.name}</strong>

                <small>
                  {exercise.sets} × {exercise.reps}
                </small>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-guidance">
          <div className="summary-guidance-heading">
            <span>GENERAL DAILY ESTIMATES</span>

            <h2>
              RECOVER.
              <br />
              THEN GO AGAIN.
            </h2>

            <p>
              These are broad fitness estimates rather than medical or
              personalised nutritional advice.
            </p>
          </div>

          {summary.nutrition ? (
            <div className="summary-nutrition-grid">
              <div className="nutrition-card">
                <Droplets size={25} strokeWidth={1.5} />

                <span>WATER</span>

                <strong>
                  {summary.nutrition.waterLitres.min}–
                  {summary.nutrition.waterLitres.max}L
                </strong>

                <small>estimated daily intake</small>
              </div>

              <div className="nutrition-card">
                <Beef size={25} strokeWidth={1.5} />

                <span>PROTEIN</span>

                <strong>
                  {summary.nutrition.proteinGrams.min}–
                  {summary.nutrition.proteinGrams.max}g
                </strong>

                <small>general daily range</small>
              </div>

              <div className="nutrition-card">
                <Wheat size={25} strokeWidth={1.5} />

                <span>CARBS</span>

                <strong>
                  {summary.nutrition.carbsGrams.min}–
                  {summary.nutrition.carbsGrams.max}g
                </strong>

                <small>general daily range</small>
              </div>

              <div className="nutrition-card">
                <CircleDot size={25} strokeWidth={1.5} />

                <span>FAT</span>

                <strong>
                  {summary.nutrition.fatGrams.min}–
                  {summary.nutrition.fatGrams.max}g
                </strong>

                <small>general daily range</small>
              </div>
            </div>
          ) : (
            <div className="summary-nutrition-missing">
              <strong>ADD YOUR WEIGHT FOR PERSONALISED ESTIMATES.</strong>

              <p>
                Water and macronutrient estimates depend heavily on body weight,
                so Gymlot doesn&apos;t guess when it hasn&apos;t been provided.
              </p>
            </div>
          )}
        </div>

        <div className="summary-post-workout">
          <div>
            <span>01</span>

            <strong>REHYDRATE</strong>

            <p>
              Replace fluids gradually after training, especially after longer
              or warmer sessions.
            </p>
          </div>

          <div>
            <span>02</span>

            <strong>EAT NORMALLY</strong>

            <p>
              Aim for a balanced meal containing protein, carbohydrates and
              whole foods.
            </p>
          </div>

          <div>
            <span>03</span>

            <strong>RECOVER</strong>

            <p>
              Give trained muscles time to recover before repeating the same
              demanding session.
            </p>
          </div>
        </div>

        <div className="summary-disclaimer">
          <Flame size={18} strokeWidth={1.5} />

          <p>
            Calorie burn and nutrition figures are estimates only. Actual
            requirements vary with exercise intensity, body composition, fitness
            level, environment and individual needs.
          </p>
        </div>

        <div className="summary-final-action">
          <div>
            <span>SESSION COMPLETE</span>

            <strong>WHAT&apos;S NEXT?</strong>

            <small>
              Gymlot can build a completely different session whenever
              you&apos;re ready.
            </small>
          </div>

          <button type="button" onClick={onBuildAnother}>
            <RotateCcw size={18} />
            Build another
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </section>
  );
}
