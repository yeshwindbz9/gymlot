import type { ResolvedExercise } from "@/types/exerciseDb";

export type GeneratedExercise = {
  name: string;
  targetMuscle: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
  alternatives: string[];
};

export type GeneratedWorkout = {
  title: string;
  workoutType: string;
  estimatedDurationMinutes: number;

  warmup: {
    durationMinutes: number;
    instructions: string[];
  };

  exercises: GeneratedExercise[];

  resolvedExercises?: ResolvedExercise[];

  recommendations: string[];

  cooldown: {
    durationMinutes: number;
    instructions: string[];
  };
};

export type WorkoutRequest = {
  workoutType: string;
  muscles: string[];
  durationMinutes: number;

  profile: {
    gender: string | null;
    heightCm: number | null;
    weightKg: number | null;
    experience: string;
    equipment: string;
  };
};
