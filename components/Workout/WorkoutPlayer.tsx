"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Dumbbell,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  X,
} from "lucide-react";

import type { GeneratedWorkout } from "@/types/workout";
import type { ResolvedExercise } from "@/types/exerciseDb";

type Props = {
  workout: GeneratedWorkout;
  onExit: () => void;
  onComplete: (summary: WorkoutCompletionSummary) => void;
};

export type WorkoutCompletionSummary = {
  startedAt: string;
  completedAt: string;
  totalDurationSeconds: number;

  exercisesCompleted: number;
  totalExercises: number;

  setsCompleted: number;
  totalSets: number;
};

function createFallbackExercises(
  workout: GeneratedWorkout,
): ResolvedExercise[] {
  return workout.exercises.map((exercise) => ({
    exerciseId: null,

    aiName: exercise.name,
    name: exercise.name,

    gifUrl: null,

    targetMuscles: [exercise.targetMuscle],
    secondaryMuscles: [],
    bodyParts: [],
    equipments: [exercise.equipment],
    instructions: [],

    sets: exercise.sets,
    reps: exercise.reps,
    restSeconds: exercise.restSeconds,
    notes: exercise.notes,
    alternatives: exercise.alternatives,

    matchScore: 0,
  }));
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function WorkoutPlayer({ workout, onExit, onComplete }: Props) {
  const exercises = useMemo(
    () =>
      workout.resolvedExercises?.length
        ? workout.resolvedExercises
        : createFallbackExercises(workout),
    [workout],
  );

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const [completedSets, setCompletedSets] = useState<Record<number, boolean[]>>(
    () => {
      const initial: Record<number, boolean[]> = {};

      exercises.forEach((exercise, index) => {
        initial[index] = Array(exercise.sets).fill(false);
      });

      return initial;
    },
  );

  const [restSeconds, setRestSeconds] = useState(0);
  const [restRunning, setRestRunning] = useState(false);

  const [startedAt] = useState(() => new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const activeExercise = exercises[activeExerciseIndex];

  const totalSets = useMemo(
    () => exercises.reduce((total, exercise) => total + exercise.sets, 0),
    [exercises],
  );

  const setsCompleted = useMemo(
    () =>
      Object.values(completedSets).reduce(
        (total, sets) => total + sets.filter(Boolean).length,
        0,
      ),
    [completedSets],
  );

  const exercisesCompleted = useMemo(
    () =>
      exercises.filter((exercise, exerciseIndex) => {
        const sets = completedSets[exerciseIndex] ?? [];

        return (
          exercise.sets > 0 &&
          sets.length === exercise.sets &&
          sets.every(Boolean)
        );
      }).length,
    [completedSets, exercises],
  );

  const progress =
    totalSets > 0 ? Math.round((setsCompleted / totalSets) * 100) : 0;

  const activeSets = completedSets[activeExerciseIndex] ?? [];

  const activeExerciseComplete =
    activeSets.length > 0 && activeSets.every(Boolean);

  const workoutComplete = setsCompleted === totalSets && totalSets > 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [startedAt]);

  useEffect(() => {
    if (!restRunning || restSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRestSeconds((current) => {
        if (current <= 1) {
          setRestRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [restRunning, restSeconds]);

  const startRestTimer = () => {
    setRestSeconds(activeExercise.restSeconds);
    setRestRunning(true);
  };

  const toggleSet = (setIndex: number) => {
    const wasComplete = completedSets[activeExerciseIndex]?.[setIndex];

    setCompletedSets((current) => {
      const exerciseSets = [...(current[activeExerciseIndex] ?? [])];

      exerciseSets[setIndex] = !exerciseSets[setIndex];

      return {
        ...current,
        [activeExerciseIndex]: exerciseSets,
      };
    });

    if (!wasComplete) {
      startRestTimer();
    }
  };

  const moveToExercise = (index: number) => {
    if (index < 0 || index >= exercises.length) return;

    setRestRunning(false);
    setRestSeconds(0);
    setActiveExerciseIndex(index);
  };

  const finishWorkout = () => {
    onComplete({
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),

      totalDurationSeconds: elapsedSeconds,

      exercisesCompleted,
      totalExercises: exercises.length,

      setsCompleted,
      totalSets,
    });
  };

  return (
    <section className="workout-player">
      <div className="workout-player-grid" />

      <header className="workout-player-header">
        <button type="button" className="workout-exit-button" onClick={onExit}>
          <X size={17} />
          Exit
        </button>

        <div className="workout-player-title">
          <span>GYMLOT SESSION</span>
          <strong>{workout.title}</strong>
        </div>

        <div className="workout-elapsed">
          <Clock3 size={15} />
          {formatTimer(elapsedSeconds)}
        </div>
      </header>

      <div className="workout-progress-shell">
        <div className="workout-progress-info">
          <span>
            EXERCISE {activeExerciseIndex + 1} / {exercises.length}
          </span>

          <strong>{progress}% COMPLETE</strong>
        </div>

        <div className="workout-progress-track">
          <div
            className="workout-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="active-workout-shell">
        <aside className="exercise-sidebar">
          <span className="exercise-sidebar-label">WORKOUT</span>

          <div className="exercise-sidebar-list">
            {exercises.map((exercise, index) => {
              const sets = completedSets[index] ?? [];

              const complete = sets.length > 0 && sets.every(Boolean);

              const active = index === activeExerciseIndex;

              return (
                <button
                  key={exercise.exerciseId ?? `${exercise.name}-${index}`}
                  type="button"
                  className={`exercise-sidebar-item ${
                    active ? "exercise-sidebar-item-active" : ""
                  } ${complete ? "exercise-sidebar-item-complete" : ""}`}
                  onClick={() => moveToExercise(index)}
                >
                  <span>
                    {complete ? (
                      <Check size={14} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>

                  <div>
                    <strong>{exercise.name}</strong>

                    <small>
                      {sets.filter(Boolean).length}/{exercise.sets} SETS
                    </small>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="active-exercise">
          <div className="active-exercise-heading">
            <div>
              <span className="active-exercise-target">
                {activeExercise.targetMuscles.slice(0, 2).join(" · ")}
              </span>

              <h2>{activeExercise.name}</h2>
            </div>

            <span className="active-exercise-number">
              {String(activeExerciseIndex + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="active-exercise-layout">
            <div className="active-exercise-media">
              {activeExercise.gifUrl ? (
                <img
                  src={activeExercise.gifUrl}
                  alt={`${activeExercise.name} demonstration`}
                />
              ) : (
                <div className="active-media-fallback">
                  <Dumbbell size={50} strokeWidth={1.2} />

                  <span>
                    DEMO
                    <br />
                    UNAVAILABLE
                  </span>
                </div>
              )}

              <span className="active-media-label">EXERCISE DEMO</span>
            </div>

            <div className="active-exercise-controls">
              <div className="active-prescription">
                <div>
                  <span>SETS</span>
                  <strong>{activeExercise.sets}</strong>
                </div>

                <div>
                  <span>REPS</span>
                  <strong>{activeExercise.reps}</strong>
                </div>

                <div>
                  <span>REST</span>
                  <strong>{activeExercise.restSeconds}s</strong>
                </div>
              </div>

              <div className="set-tracker">
                <div className="set-tracker-heading">
                  <span>COMPLETE YOUR SETS</span>

                  <strong>
                    {activeSets.filter(Boolean).length}/{activeExercise.sets}
                  </strong>
                </div>

                <div className="set-buttons">
                  {activeSets.map((complete, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`set-button ${
                        complete ? "set-button-complete" : ""
                      }`}
                      onClick={() => toggleSet(index)}
                    >
                      <span>SET {index + 1}</span>

                      {complete ? (
                        <Check size={18} />
                      ) : (
                        <span className="set-circle" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="active-exercise-note">
                <span>GYMLOT SAYS</span>
                <p>{activeExercise.notes}</p>
              </div>

              <div className="active-exercise-meta">
                <div>
                  <span>EQUIPMENT</span>
                  <strong>
                    {activeExercise.equipments.length
                      ? activeExercise.equipments.join(" · ")
                      : "Not specified"}
                  </strong>
                </div>

                {activeExercise.secondaryMuscles.length > 0 && (
                  <div>
                    <span>ALSO WORKS</span>
                    <strong>
                      {activeExercise.secondaryMuscles.join(" · ")}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {activeExercise.instructions.length > 0 && (
            <details className="player-instructions">
              <summary>
                HOW TO DO IT
                <Plus size={18} />
              </summary>

              <div className="player-instruction-list">
                {activeExercise.instructions.map((instruction, index) => (
                  <div key={index} className="player-instruction">
                    <span>{String(index + 1).padStart(2, "0")}</span>

                    <p>{instruction.replace(/^Step:\d+\s*/i, "")}</p>
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="exercise-navigation">
            <button
              type="button"
              className="exercise-nav-secondary"
              disabled={activeExerciseIndex === 0}
              onClick={() => moveToExercise(activeExerciseIndex - 1)}
            >
              <ArrowLeft size={17} />
              Previous
            </button>

            {!workoutComplete ? (
              <button
                type="button"
                className="exercise-nav-primary"
                disabled={activeExerciseIndex === exercises.length - 1}
                onClick={() => moveToExercise(activeExerciseIndex + 1)}
              >
                Next exercise
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="finish-workout-button"
                onClick={finishWorkout}
              >
                <Check size={18} />
                Finish workout
                <ArrowRight size={18} />
              </button>
            )}
          </div>

          {activeExerciseComplete && !workoutComplete && (
            <p className="exercise-complete-note">
              exercise complete — nice work ↗
            </p>
          )}
        </main>
      </div>

      {restSeconds > 0 && (
        <div className="rest-overlay">
          <div className="rest-card">
            <div className="rest-card-heading">
              <span>REST.</span>

              <button
                type="button"
                onClick={() => {
                  setRestRunning(false);
                  setRestSeconds(0);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rest-timer">{formatTimer(restSeconds)}</div>

            <p>
              Next set:{" "}
              {Math.min(
                activeSets.filter(Boolean).length + 1,
                activeExercise.sets,
              )}{" "}
              / {activeExercise.sets}
            </p>

            <div className="rest-actions">
              <button
                type="button"
                onClick={() => setRestRunning((current) => !current)}
              >
                {restRunning ? (
                  <>
                    <Pause size={16} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Resume
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRestSeconds((current) => current + 30)}
              >
                <Plus size={16} />
                30 sec
              </button>

              <button
                type="button"
                onClick={() => {
                  setRestRunning(false);
                  setRestSeconds(0);
                }}
              >
                <SkipForward size={16} />
                Skip
              </button>
            </div>

            <div className="rest-progress">
              <div
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (restSeconds / activeExercise.restSeconds) * 100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
