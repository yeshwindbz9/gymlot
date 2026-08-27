"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BicepsFlexed,
  Clock3,
  Dumbbell,
  PersonStanding,
  RotateCcw,
  Sparkles,
  UserRound,
  Play,
  X,
} from "lucide-react";

import type { GeneratedWorkout } from "@/types/workout";
import WorkoutPlayer, {
  type WorkoutCompletionSummary,
} from "@/components/Workout/WorkoutPlayer";

import WorkoutSummary from "@/components/Summary/WorkoutSummary";

import { calculateWorkoutSummary } from "@/lib/workoutSummary";
import TypewriterHeading from "../TypewriterHeading";

type BuilderStep = 1 | 2 | 3;

type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full-body"
  | "custom";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

type EquipmentOption = "full-gym" | "dumbbells" | "bodyweight" | "home-gym";

type GenderOption = "male" | "female" | "prefer-not-to-say";

type WorkoutOption = {
  id: WorkoutType;
  label: string;
  shortLabel: string;
  description: string;
  muscles: string[];
};

const workoutOptions: WorkoutOption[] = [
  {
    id: "push",
    label: "Push",
    shortLabel: "PUSH",
    description: "Chest, shoulders and triceps.",
    muscles: ["Chest", "Shoulders", "Triceps"],
  },
  {
    id: "pull",
    label: "Pull",
    shortLabel: "PULL",
    description: "Back, lats, traps and biceps.",
    muscles: ["Back", "Lats", "Traps", "Biceps", "Forearms"],
  },
  {
    id: "legs",
    label: "Legs",
    shortLabel: "LEGS",
    description: "Quads, hamstrings, glutes and calves.",
    muscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
  },
  {
    id: "upper",
    label: "Upper Body",
    shortLabel: "UPPER",
    description: "A balanced upper-body session.",
    muscles: ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms"],
  },
  {
    id: "lower",
    label: "Lower Body",
    shortLabel: "LOWER",
    description: "Legs, glutes and lower-body strength.",
    muscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
  },
  {
    id: "full-body",
    label: "Full Body",
    shortLabel: "FULL BODY",
    description: "Hit everything in one session.",
    muscles: [
      "Chest",
      "Back",
      "Shoulders",
      "Biceps",
      "Triceps",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Calves",
      "Abs",
    ],
  },
  {
    id: "custom",
    label: "Custom",
    shortLabel: "CUSTOM",
    description: "Choose exactly what you want to train.",
    muscles: [],
  },
];

const muscleGroups = [
  "Chest",
  "Shoulders",
  "Triceps",
  "Biceps",
  "Back",
  "Lats",
  "Traps",
  "Forearms",
  "Abs",
  "Glutes",
  "Quads",
  "Hamstrings",
  "Calves",
];

const experienceOptions: {
  id: ExperienceLevel;
  label: string;
  description: string;
}[] = [
  {
    id: "beginner",
    label: "Beginner",
    description: "New to training or getting back into it.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Training consistently and comfortable with the basics.",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Experienced lifter looking for more volume and variation.",
  },
];

const equipmentOptions: {
  id: EquipmentOption;
  label: string;
  description: string;
}[] = [
  {
    id: "full-gym",
    label: "Full Gym",
    description: "Machines, cables, barbells, dumbbells and benches.",
  },
  {
    id: "dumbbells",
    label: "Dumbbells",
    description: "A dumbbell-focused workout with minimal equipment.",
  },
  {
    id: "bodyweight",
    label: "Bodyweight",
    description: "No equipment required.",
  },
  {
    id: "home-gym",
    label: "Home Gym",
    description: "Limited equipment and home-friendly exercise choices.",
  },
];

function getTimeMeta(minutes: number) {
  if (minutes <= 25) {
    return {
      label: "QUICK HIT",
      description: "Short, focused and efficient.",
      exercises: "3 exercises",
      sets: "2–3 sets each",
    };
  }

  if (minutes <= 40) {
    return {
      label: "FOCUSED SESSION",
      description: "Enough time to train properly without hanging around.",
      exercises: "4 exercises",
      sets: "3 sets each",
    };
  }

  if (minutes <= 60) {
    return {
      label: "SOLID WORKOUT",
      description: "A balanced session with room for proper rest.",
      exercises: "5–6 exercises",
      sets: "3–4 sets each",
    };
  }

  if (minutes <= 75) {
    return {
      label: "FULL SESSION",
      description: "More volume, more variety and less rushing.",
      exercises: "6–7 exercises",
      sets: "3–4 sets each",
    };
  }

  return {
    label: "YOU'VE GOT TIME",
    description: "A longer session with extra volume and accessories.",
    exercises: "7–9 exercises",
    sets: "3–5 sets each",
  };
}

export default function WorkoutBuilder() {
  const [step, setStep] = useState<BuilderStep>(1);

  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(45);

  const [gender, setGender] = useState<GenderOption | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel>("intermediate");
  const [equipment, setEquipment] = useState<EquipmentOption>("full-gym");

  const [generatedWorkout, setGeneratedWorkout] =
    useState<GeneratedWorkout | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  const [generationError, setGenerationError] = useState<string | null>(null);

  const [workoutStarted, setWorkoutStarted] = useState(false);

  const [completionSummary, setCompletionSummary] =
    useState<WorkoutCompletionSummary | null>(null);

  useEffect(() => {
    if (!generatedWorkout) return;

    window.setTimeout(() => {
      document.getElementById("generated-workout")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, [generatedWorkout]);

  useEffect(() => {
    if (!workoutStarted) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("workout-player")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [workoutStarted]);

  const goToStep = (nextStep: BuilderStep) => {
    setStep(nextStep);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("workout-builder")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const selectedWorkout = useMemo(
    () => workoutOptions.find((option) => option.id === workoutType),
    [workoutType],
  );

  const selectedExperience = useMemo(
    () => experienceOptions.find((option) => option.id === experience),
    [experience],
  );

  const selectedEquipment = useMemo(
    () => equipmentOptions.find((option) => option.id === equipment),
    [equipment],
  );

  const timeMeta = useMemo(
    () => getTimeMeta(durationMinutes),
    [durationMinutes],
  );

  const sliderProgress = ((durationMinutes - 15) / (120 - 15)) * 100;

  const chooseWorkoutType = (option: WorkoutOption) => {
    setWorkoutType(option.id);

    if (option.id === "custom") {
      setSelectedMuscles([]);
      return;
    }

    setSelectedMuscles(option.muscles);
  };

  const toggleMuscle = (muscle: string) => {
    setWorkoutType("custom");

    setSelectedMuscles((current) =>
      current.includes(muscle)
        ? current.filter((item) => item !== muscle)
        : [...current, muscle],
    );
  };

  const resetSelection = () => {
    setWorkoutType(null);
    setSelectedMuscles([]);
    goToStep(1);
  };

  const canContinueFromStepOne =
    workoutType !== null &&
    (workoutType !== "custom" || selectedMuscles.length > 0);

  const goToStepTwo = () => {
    if (!canContinueFromStepOne) return;
    goToStep(2);
  };

  const goToStepThree = () => {
    goToStep(3);
  };

  const handleGenerateWorkout = async () => {
    if (!workoutType) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const payload = {
        workoutType,
        muscles: selectedMuscles,
        durationMinutes,

        profile: {
          gender: gender || null,
          heightCm: heightCm ? Number(heightCm) : null,
          weightKg: weightKg ? Number(weightKg) : null,
          experience,
          equipment,
        },
      };

      const response = await fetch("/api/workout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate workout.");
      }

      setGeneratedWorkout(data.workout);
      //   console.log("Resolved Gymlot workout:", data.workout);
    } catch (error) {
      console.error(error);

      setGenerationError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your workout.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (workoutStarted && generatedWorkout) {
    return (
      <WorkoutPlayer
        workout={generatedWorkout}
        onExit={() => setWorkoutStarted(false)}
        onComplete={(summary) => {
          setCompletionSummary(summary);
          setWorkoutStarted(false);
        }}
      />
    );
  }
  if (completionSummary && generatedWorkout) {
    return (
      <WorkoutSummary
        workout={generatedWorkout}
        completion={completionSummary}
        weightKg={weightKg ? Number(weightKg) : null}
        experience={experience}
        onBuildAnother={() => {
          setCompletionSummary(null);
          setGeneratedWorkout(null);

          setWorkoutType(null);
          setSelectedMuscles([]);

          setDurationMinutes(45);

          setGender("");
          setHeightCm("");
          setWeightKg("");

          setExperience("intermediate");

          setEquipment("full-gym");

          goToStep(1);
        }}
      />
    );
  }

  return (
    <section className="workout-builder" id="workout-builder">
      <div className="builder-grid" />

      <div className="builder-shell">
        <div className="builder-header">
          <div>
            <div className="section-index">{String(step).padStart(2, "0")}</div>

            <p className="section-kicker">
              <span />
              BUILD YOUR SESSION
            </p>
          </div>

          <div className="builder-progress">
            <span className={step >= 1 ? "builder-progress-active" : ""}>
              01
            </span>

            <span className="builder-progress-line" />

            <span className={step >= 2 ? "builder-progress-active" : ""}>
              02
            </span>

            <span className="builder-progress-line" />

            <span className={step >= 3 ? "builder-progress-active" : ""}>
              03
            </span>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="builder-layout">
              <div className="builder-copy">
                <p className="marker-note">start here ↘</p>

                <TypewriterHeading text="WHY GYMLOT?" speed={55} />

                <p className="builder-description">
                  Pick a workout split or choose individual muscles. Gymlot will
                  use this as the foundation for your session.
                </p>

                <div className="builder-mini-note">
                  <BicepsFlexed size={21} strokeWidth={1.7} />

                  <span>
                    You can still tweak the exercise selection when the workout
                    is generated.
                  </span>
                </div>
              </div>

              <div className="training-selector">
                <div className="training-card-grid">
                  {workoutOptions.map((option, index) => {
                    const isSelected = workoutType === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`training-option ${
                          isSelected ? "training-option-selected" : ""
                        }`}
                        onClick={() => chooseWorkoutType(option)}
                        aria-pressed={isSelected}
                      >
                        <div className="training-option-top">
                          <span className="training-option-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="training-option-indicator">
                            {isSelected ? "●" : "○"}
                          </span>
                        </div>

                        <div className="training-option-body">
                          <h3>{option.shortLabel}</h3>
                          <p>{option.description}</p>
                        </div>

                        {isSelected && (
                          <span className="training-option-stamp">
                            selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`muscle-picker ${
                    workoutType === "custom" ? "muscle-picker-active" : ""
                  }`}
                >
                  <div className="muscle-picker-heading">
                    <div>
                      <p className="muscle-picker-eyebrow">OR CHOOSE MUSCLES</p>

                      <h3>Build it yourself.</h3>
                    </div>

                    <PersonStanding size={38} strokeWidth={1.2} />
                  </div>

                  <div className="muscle-chip-list">
                    {muscleGroups.map((muscle) => {
                      const active = selectedMuscles.includes(muscle);

                      return (
                        <button
                          key={muscle}
                          type="button"
                          className={`muscle-chip ${
                            active ? "muscle-chip-selected" : ""
                          }`}
                          onClick={() => toggleMuscle(muscle)}
                          aria-pressed={active}
                        >
                          <span>{muscle}</span>
                          <span className="muscle-chip-symbol">
                            {active ? "×" : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="builder-selection-bar">
              <div className="selection-summary">
                <div className="selection-icon">
                  <Dumbbell size={21} />
                </div>

                <div>
                  <p>YOUR SESSION</p>

                  {workoutType ? (
                    <>
                      <strong>
                        {selectedWorkout?.label}
                        {workoutType === "custom" &&
                          selectedMuscles.length > 0 &&
                          ` · ${selectedMuscles.length} muscles`}
                      </strong>

                      <span>
                        {selectedMuscles.length > 0
                          ? selectedMuscles.join(" · ")
                          : "Choose at least one muscle"}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>Nothing selected yet</strong>
                      <span>Choose a workout type above.</span>
                    </>
                  )}
                </div>
              </div>

              <div className="builder-actions">
                {workoutType && (
                  <button
                    type="button"
                    className="builder-reset"
                    onClick={resetSelection}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                )}

                <button
                  type="button"
                  className="builder-next"
                  disabled={!canContinueFromStepOne}
                  onClick={goToStepTwo}
                >
                  Next: your time
                  <ArrowRight size={19} />
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="time-step">
            <div className="time-step-copy">
              <button
                type="button"
                className="builder-back-inline"
                onClick={() => goToStep(1)}
              >
                <ArrowLeft size={15} />
                Back to training
              </button>

              <p className="marker-note">make it fit your day ↘</p>

              <TypewriterHeading
                text="HOW MUCH TIME HAVE YOU GOT?"
                speed={55}
              />

              <p className="builder-description">
                Gymlot will use your available time to control the number of
                exercises, overall volume and recommended rest periods.
              </p>
            </div>

            <div className="time-control-panel">
              <div className="time-display">
                <div className="time-display-main">
                  <Clock3 size={28} strokeWidth={1.5} />

                  <div>
                    <span className="time-eyebrow">AVAILABLE TIME</span>

                    <strong>{durationMinutes}</strong>

                    <span className="time-unit">MIN</span>
                  </div>
                </div>

                <p className="time-marker-copy">
                  {timeMeta.label.toLowerCase()} →
                </p>
              </div>

              <div className="time-slider-wrap">
                <input
                  className="time-slider"
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={durationMinutes}
                  onChange={(event) =>
                    setDurationMinutes(Number(event.target.value))
                  }
                  aria-label="Workout duration in minutes"
                  style={{
                    background: `linear-gradient(
                      to right,
                      var(--accent) 0%,
                      var(--accent) ${sliderProgress}%,
                      rgba(243,239,230,0.18) ${sliderProgress}%,
                      rgba(243,239,230,0.18) 100%
                    )`,
                  }}
                />

                <div className="time-slider-labels">
                  <span>15 MIN</span>
                  <span>45</span>
                  <span>75</span>
                  <span>120 MIN</span>
                </div>
              </div>

              <div className="time-personality-card">
                <div className="time-personality-top">
                  <span>GYMLOT SAYS</span>
                  <span>{timeMeta.label}</span>
                </div>

                <h3>{timeMeta.description}</h3>

                <div className="time-plan-stats">
                  <div>
                    <span>LIKELY PLAN</span>
                    <strong>{timeMeta.exercises}</strong>
                  </div>

                  <div>
                    <span>VOLUME</span>
                    <strong>{timeMeta.sets}</strong>
                  </div>

                  <div>
                    <span>SESSION</span>
                    <strong>{durationMinutes} min</strong>
                  </div>
                </div>
              </div>

              <div className="time-presets">
                {[20, 30, 45, 60, 90].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={
                      durationMinutes === minutes
                        ? "time-preset time-preset-active"
                        : "time-preset"
                    }
                    onClick={() => setDurationMinutes(minutes)}
                  >
                    {minutes}
                    <span>min</span>
                  </button>
                ))}
              </div>

              <div className="time-actions">
                <div className="time-session-context">
                  <span>{selectedWorkout?.label}</span>
                  <small>{selectedMuscles.join(" · ")}</small>
                </div>

                <button
                  type="button"
                  className="builder-next"
                  onClick={goToStepThree}
                >
                  Next: about you
                  <ArrowRight size={19} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="profile-step">
            <div className="profile-step-copy">
              <button
                type="button"
                className="builder-back-inline"
                onClick={() => goToStep(2)}
              >
                <ArrowLeft size={15} />
                Back to time
              </button>

              <p className="marker-note">optional, but useful ↘</p>

              <TypewriterHeading text="ABOUT YOU." speed={55} />

              <p className="builder-description">
                A little context helps Gymlot tailor exercise difficulty, volume
                and estimates. You can leave the personal fields blank.
              </p>

              <div className="builder-mini-note">
                <UserRound size={21} strokeWidth={1.7} />

                <span>
                  Experience level and equipment have the biggest impact on
                  exercise selection.
                </span>
              </div>
            </div>

            <div className="profile-panel">
              <div className="profile-block">
                <div className="profile-block-heading">
                  <div>
                    <span>01</span>
                    <h3>BASIC DETAILS</h3>
                  </div>

                  <small>OPTIONAL</small>
                </div>

                <div className="profile-fields">
                  <label className="profile-field">
                    <span>Gender</span>

                    <select
                      value={gender}
                      onChange={(event) =>
                        setGender(event.target.value as GenderOption | "")
                      }
                    >
                      <option value="">Prefer not to enter</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                  </label>

                  <label className="profile-field">
                    <span>Height</span>

                    <div className="number-input-wrap">
                      <input
                        type="number"
                        min="100"
                        max="250"
                        inputMode="numeric"
                        placeholder="170"
                        value={heightCm}
                        onChange={(event) => setHeightCm(event.target.value)}
                      />
                      <span>CM</span>
                    </div>
                  </label>

                  <label className="profile-field">
                    <span>Weight</span>

                    <div className="number-input-wrap">
                      <input
                        type="number"
                        min="30"
                        max="300"
                        step="0.1"
                        inputMode="decimal"
                        placeholder="70"
                        value={weightKg}
                        onChange={(event) => setWeightKg(event.target.value)}
                      />
                      <span>KG</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="profile-block">
                <div className="profile-block-heading">
                  <div>
                    <span>02</span>
                    <h3>EXPERIENCE</h3>
                  </div>

                  <small>RECOMMENDED</small>
                </div>

                <div className="experience-options">
                  {experienceOptions.map((option) => {
                    const selected = experience === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`profile-choice ${
                          selected ? "profile-choice-selected" : ""
                        }`}
                        onClick={() => setExperience(option.id)}
                      >
                        <div className="profile-choice-top">
                          <span>{selected ? "●" : "○"}</span>
                          <strong>{option.label}</strong>
                        </div>

                        <p>{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="profile-block">
                <div className="profile-block-heading">
                  <div>
                    <span>03</span>
                    <h3>EQUIPMENT</h3>
                  </div>

                  <small>RECOMMENDED</small>
                </div>

                <div className="equipment-options">
                  {equipmentOptions.map((option) => {
                    const selected = equipment === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`equipment-choice ${
                          selected ? "equipment-choice-selected" : ""
                        }`}
                        onClick={() => setEquipment(option.id)}
                      >
                        <span className="equipment-choice-indicator">
                          {selected ? "●" : "○"}
                        </span>

                        <div>
                          <strong>{option.label}</strong>
                          <p>{option.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="profile-review">
                <div className="profile-review-top">
                  <span>YOUR WORKOUT</span>
                  <span className="marker-text">ready to build →</span>
                </div>

                <div className="profile-review-main">
                  <div>
                    <small>SESSION</small>
                    <strong>{selectedWorkout?.label}</strong>
                    <span>{selectedMuscles.join(" · ")}</span>
                  </div>

                  <div>
                    <small>TIME</small>
                    <strong>{durationMinutes} MIN</strong>
                  </div>

                  <div>
                    <small>LEVEL</small>
                    <strong>{selectedExperience?.label}</strong>
                  </div>

                  <div>
                    <small>EQUIPMENT</small>
                    <strong>{selectedEquipment?.label}</strong>
                  </div>
                </div>
              </div>

              <div className="profile-generate-row">
                <p>
                  Personal details are used only to improve general workout and
                  calorie estimates.
                </p>

                <button
                  type="button"
                  className="generate-workout-button"
                  onClick={handleGenerateWorkout}
                  disabled={isGenerating}
                >
                  <Sparkles size={19} />

                  {isGenerating ? "Building workout..." : "Generate workout"}

                  {!isGenerating && <ArrowRight size={20} />}
                </button>
                {generationError && (
                  <p className="generation-error">{generationError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {generatedWorkout && (
        <div className="generated-workout-preview" id="generated-workout">
          <div className="generated-workout-shell">
            <div className="generated-workout-heading">
              <div>
                <span className="generated-eyebrow">YOUR WORKOUT IS READY</span>

                <h2>{generatedWorkout.title}</h2>
              </div>

              <div className="generated-duration">
                <span>EST.</span>
                <strong>{generatedWorkout.estimatedDurationMinutes}</strong>
                <span>MIN</span>
              </div>
            </div>

            <div className="generated-warmup">
              <span>WARM UP</span>

              <strong>{generatedWorkout.warmup.durationMinutes} MIN</strong>

              <div>
                {generatedWorkout.warmup.instructions.map(
                  (instruction, index) => (
                    <p key={index}>{instruction}</p>
                  ),
                )}
              </div>
            </div>

            <div className="generated-exercise-list">
              {(
                generatedWorkout.resolvedExercises ??
                generatedWorkout.exercises.map((exercise) => ({
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
                }))
              ).map((exercise, index) => (
                <article
                  className="resolved-exercise-card"
                  key={exercise.exerciseId ?? `${exercise.name}-${index}`}
                >
                  <div className="resolved-exercise-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="resolved-exercise-media">
                    {exercise.gifUrl ? (
                      <img
                        src={exercise.gifUrl}
                        alt={`${exercise.name} exercise demonstration`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="exercise-media-fallback">
                        <Dumbbell size={36} strokeWidth={1.3} />

                        <span>
                          DEMO
                          <br />
                          UNAVAILABLE
                        </span>
                      </div>
                    )}

                    <span className="exercise-demo-label">EXERCISE DEMO</span>
                  </div>

                  <div className="resolved-exercise-info">
                    <div className="resolved-exercise-tags">
                      {exercise.targetMuscles.slice(0, 2).map((muscle) => (
                        <span key={muscle}>{muscle}</span>
                      ))}
                    </div>

                    <h3>{exercise.name}</h3>

                    {exercise.aiName.toLowerCase() !==
                      exercise.name.toLowerCase() && (
                      <p className="exercise-match-note">
                        Planned as: {exercise.aiName}
                      </p>
                    )}

                    <p className="resolved-exercise-note">{exercise.notes}</p>

                    <div className="resolved-equipment">
                      <span>EQUIPMENT</span>

                      <strong>
                        {exercise.equipments.length
                          ? exercise.equipments.join(" · ")
                          : "Not specified"}
                      </strong>
                    </div>

                    {exercise.secondaryMuscles.length > 0 && (
                      <div className="resolved-secondary">
                        <span>ALSO WORKS</span>

                        <strong>{exercise.secondaryMuscles.join(" · ")}</strong>
                      </div>
                    )}
                  </div>

                  <div className="resolved-prescription">
                    <div>
                      <span>SETS</span>
                      <strong>{exercise.sets}</strong>
                    </div>

                    <div>
                      <span>REPS</span>
                      <strong>{exercise.reps}</strong>
                    </div>

                    <div>
                      <span>REST</span>
                      <strong>
                        {exercise.restSeconds}
                        <small> SEC</small>
                      </strong>
                    </div>
                  </div>

                  {exercise.instructions.length > 0 && (
                    <details className="exercise-instructions">
                      <summary>
                        HOW TO DO IT
                        <span>+</span>
                      </summary>

                      <div className="exercise-instruction-list">
                        {exercise.instructions.map(
                          (instruction, instructionIndex) => (
                            <div
                              key={instructionIndex}
                              className="exercise-instruction-row"
                            >
                              <span>
                                {String(instructionIndex + 1).padStart(2, "0")}
                              </span>

                              <p>{instruction.replace(/^Step:\d+\s*/i, "")}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </details>
                  )}

                  {exercise.alternatives.length > 0 && (
                    <div className="resolved-alternative">
                      <span>NEED A SWAP?</span>

                      <strong>{exercise.alternatives[0]}</strong>

                      <small>Exercise alternative suggested by Gymlot</small>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="generated-recommendations">
              <span>GYMLOT NOTES</span>

              {generatedWorkout.recommendations.map((recommendation, index) => (
                <p key={index}>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>

                  {recommendation}
                </p>
              ))}
            </div>
            <div className="start-workout-row">
              <div>
                <span>READY?</span>

                <strong>{generatedWorkout.exercises.length} EXERCISES</strong>

                <small>Sets, rest timer and progress tracking included.</small>
              </div>

              <button
                type="button"
                className="start-workout-button"
                onClick={() => {
                  setCompletionSummary(null);
                  setWorkoutStarted(true);

                  //   window.scrollTo({
                  //     top: 0,
                  //     behavior: "smooth",
                  //   });
                }}
              >
                <Play size={19} fill="currentColor" />
                Start workout
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      {isGenerating && (
        <div className="generation-overlay" role="status" aria-live="polite">
          <div className="generation-card">
            <div className="generation-loader">
              <Dumbbell size={34} strokeWidth={1.5} />
            </div>

            <span>GYMLOT IS THINKING</span>

            <h3>
              BUILDING
              <br />
              YOUR SESSION.
            </h3>

            <p>
              Picking exercises, balancing muscle groups and planning your sets
              and rest.
            </p>

            <div className="generation-dots">
              <i />
              <i />
              <i />
            </div>

            <small>DON&apos;T CLOSE THIS WINDOW</small>
          </div>
        </div>
      )}
    </section>
  );
}
