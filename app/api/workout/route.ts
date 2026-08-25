import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";
import { workoutResponseSchema } from "@/lib/workoutSchema";
import type { GeneratedWorkout, WorkoutRequest } from "@/types/workout";
import { resolveWorkoutExercises } from "@/lib/resolveWorkout";

export const runtime = "nodejs";

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
      return "Bodyweight only. Do not use machines, dumbbells, barbells or cables.";

    case "dumbbells":
      return "Dumbbells are available. Prefer dumbbell and bodyweight exercises.";

    case "home-gym":
      return "Limited home gym equipment is available. Prefer common home-friendly exercises and avoid specialised commercial machines.";

    case "full-gym":
    default:
      return "A fully equipped commercial gym is available, including dumbbells, barbells, benches, cables and resistance machines.";
  }
}

function createPrompt(input: WorkoutRequest) {
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

Gymlot will later match each exercise against ExerciseDB.
Only use conventional exercise names that are highly likely to exist in ExerciseDB.

Prefer simple canonical exercise names.
Do not invent exercise names.

Therefore:
- use common, conventional exercise names
- avoid unusual invented variations
- avoid branded exercise names
- avoid unnecessary descriptive phrases
- prefer database-friendly names such as:
  "Dumbbell Bench Press"
  "Lat Pulldown"
  "Barbell Squat"
  "Dumbbell Lateral Raise"
  "Cable Triceps Pushdown"

Do not write lengthy exercise instructions.
ExerciseDB will provide the actual movement instructions and demonstrations.

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

    const response = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

      contents: createPrompt(input),

      config: {
        responseMimeType: "application/json",
        responseSchema: workoutResponseSchema,

        temperature: 0.6,
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
