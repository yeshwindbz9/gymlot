import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";
import { workoutResponseSchema } from "@/lib/workoutSchema";
import type { GeneratedWorkout, WorkoutRequest } from "@/types/workout";
import { resolveWorkoutExercises } from "@/lib/resolveWorkout";

export const runtime = "nodejs";
const variationStyles = [
  "classic compound focused",
  "alternative standard exercises",
  "unilateral movement emphasis",
  "machine and free-weight balance",
  "compound plus accessory balance",
];

function getVariationStyle() {
  return variationStyles[Math.floor(Math.random() * variationStyles.length)];
}

function getExerciseGuidance(durationMinutes: number) {
  if (durationMinutes <= 25) {
    return {
      minExercises: 3,
      maxExercises: 3,
      typicalSets: "2-3",
    };
  }

  if (durationMinutes <= 40) {
    return {
      minExercises: 4,
      maxExercises: 4,
      typicalSets: "3",
    };
  }

  if (durationMinutes <= 60) {
    return {
      minExercises: 5,
      maxExercises: 6,
      typicalSets: "3-4",
    };
  }

  if (durationMinutes <= 75) {
    return {
      minExercises: 6,
      maxExercises: 7,
      typicalSets: "3-4",
    };
  }

  return {
    minExercises: 7,
    maxExercises: 9,
    typicalSets: "3-5",
  };
}

function equipmentDescription(equipment: string) {
  switch (equipment) {
    case "bodyweight":
      return `
              STRICT NO-EQUIPMENT WORKOUT.

              The user has NO gym equipment available.

              Every exercise MUST be performable using only the user's body and the floor.

              DO NOT use:
              - dumbbells
              - barbells
              - cables
              - gym machines
              - kettlebells
              - resistance bands
              - benches
              - pull-up bars
              - smith machines
              - medicine balls
              - suspension trainers

              Do not suggest pull-ups because they require a bar.
              Do not suggest any machine based workouts becaue they require a machine.

              For every generated exercise, the equipment field MUST be either:
              "body weight"
              or
              "none".

              This is a HARD constraint, not a preference.
              `;

    case "dumbbells":
      return `
              The user has dumbbells available.

              Exercises may use:
              - dumbbells
              - body weight

              DO NOT require:
              - barbells
              - cable machines
              - selectorised gym machines
              - smith machines
              - kettlebells
              - resistance bands

              Prefer standard ExerciseDB-friendly dumbbell and bodyweight exercises.

              Every generated exercise MUST be performable with dumbbells or bodyweight.
              `;

    case "home-gym":
      return `
              HOME GYM EQUIPMENT ONLY.

              The user has access to a typical home gym with limited, commonly available equipment.

              Prefer exercises using:
              - dumbbells
              - adjustable dumbbells
              - resistance bands
              - kettlebells
              - bench
              - body weight

              Avoid specialised commercial gym equipment that would be uncommon in a home gym.

              DO NOT require:
              - specialised selectorised machines
              - hack squat machines
              - leg press machines
              - pec deck machines
              - commercial chest press machines
              - commercial lat pulldown machines
              - smith machines unless explicitly reasonable for a home gym
              - other large specialised commercial machines

              Prefer simple, versatile home-gym exercises that can be performed with common equipment.

              Every generated exercise MUST be realistically performable in a typical home gym.
              `;

    case "full-gym":
    default:
      return `
              FULL COMMERCIAL GYM ACCESS.

              The user has access to a fully equipped commercial gym.

              There are NO meaningful equipment restrictions.

              Prefer the most appropriate equipment for the target muscle and exercise.

              Commercial gym machines and specialised equipment are allowed.

              Every generated exercise MUST still be a legitimate, standard gym exercise
              and should be compatible with the available exercise database.
              `;
  }
}

function createPrompt(input: WorkoutRequest, variationStyle: string) {
  const guidance = getExerciseGuidance(input.durationMinutes);

  return `
You are the workout planning engine for Gymlot, an AI gym assistant.

Create a practical gym workout using the user's preferences below.

USER REQUEST

Workout type:
${input.workoutType}

Target muscles:
${input.muscles.join(", ")}

Available workout time:
${input.durationMinutes} minutes

Experience:
${input.profile.experience}

Equipment:
${equipmentDescription(input.profile.equipment)}

IMPORTANT EQUIPMENT RULE:

The selected equipment is a HARD constraint.

Never recommend an exercise requiring equipment that the user does not have.

If the user selected bodyweight/no equipment, every exercise must require zero equipment.

Equipment compliance is more important than exercise variety.

Optional profile information:
Gender: ${input.profile.gender ?? "not provided"}
Height: ${
    input.profile.heightCm ? `${input.profile.heightCm} cm` : "not provided"
  }
Weight: ${
    input.profile.weightKg ? `${input.profile.weightKg} kg` : "not provided"
  }

WORKOUT CONSTRAINTS

Create between ${guidance.minExercises} and ${guidance.maxExercises} exercises.

Typical working sets should be approximately:
${guidance.typicalSets} sets per exercise.

The entire workout should realistically fit inside approximately ${
    input.durationMinutes
  } minutes, including:
- warm-up
- working sets
- rest periods
- normal exercise transitions

Prioritise exercises that directly train:
${input.muscles.join(", ")}.

Choose exercises appropriate for a ${input.profile.experience} trainee.

Only choose exercises compatible with:
${input.profile.equipment}.

IMPORTANT EXERCISE NAMING RULES

Gymlot will later match each exercise against AscendAPI previously ExerciseDB: https://oss.exercisedb.dev.
Only use conventional exercise names that are highly likely to exist in ExerciseDB.

Prefer simple canonical exercise names.
Do not invent exercise names.

Therefore:
- use common, conventional exercise names
- avoid unusual invented variations
- avoid branded exercise names
- avoid unnecessary descriptive phrases
- prefer database-friendly names.


VARIATION STYLE FOR THIS SESSION:
${variationStyle}

VARIETY RULES:
Do not always choose the most obvious exercise for every muscle.
When several equally appropriate standard exercises exist, vary the selection between workout generations.
For example, a movement could reasonably vary depending on available equipment.

Do not force unusual exercises purely for variety.

All exercises must still:
- be conventional
- suit the user's experience
- suit the available equipment
- be ExerciseDB/AscendAPI friendly
- make sense together as one workout
Avoid producing exactly the same exercise combination for identical requests when good alternatives exist.

Do not write lengthy exercise instructions.
ExerciseDB/AscendAPI will provide the actual movement instructions and demonstrations.

Sets, reps, rest periods and workout structure are your responsibility.

RECOMMENDATIONS

Provide 2-4 short general workout recommendations.

Do not provide medical advice.

Do not diagnose injuries or conditions.
Do not make exaggerated calorie claims.
Do not prescribe supplements.
`.trim();
}

function isValidRequest(input: WorkoutRequest) {
  if (!input) return false;

  if (!input.workoutType) return false;

  if (!Array.isArray(input.muscles) || input.muscles.length === 0) {
    return false;
  }

  if (
    typeof input.durationMinutes !== "number" ||
    input.durationMinutes < 15 ||
    input.durationMinutes > 120
  ) {
    return false;
  }

  if (!input.profile) return false;

  if (!input.profile.experience) return false;

  if (!input.profile.equipment) return false;

  return true;
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as WorkoutRequest;

    if (!isValidRequest(input)) {
      return NextResponse.json(
        {
          error: "Invalid workout request.",
        },
        {
          status: 400,
        },
      );
    }

    const variationStyle = getVariationStyle();

    const response = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

      contents: createPrompt(input, variationStyle),

      config: {
        responseMimeType: "application/json",
        responseSchema: workoutResponseSchema,

        temperature: 0.85,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const aiWorkout = JSON.parse(response.text) as GeneratedWorkout;

    const workout = await resolveWorkoutExercises(aiWorkout);

    return NextResponse.json({
      workout,
    });
  } catch (error) {
    console.error("Workout generation failed:", error);

    return NextResponse.json(
      {
        error: "Unable to generate workout.",
      },
      {
        status: 500,
      },
    );
  }
}
