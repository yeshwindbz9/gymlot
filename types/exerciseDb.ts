export type ExerciseDbExercise = {
  exerciseId?: string;
  name?: string;
  gifUrl?: string;

  targetMuscles?: string[];
  bodyParts?: string[];
  equipments?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
};

export type ExerciseDbResponse = {
  success?: boolean;
  data?: ExerciseDbExercise[];
  meta?: {
    total?: number;
    hasNextPage?: boolean;
    nextCursor?: string | null;
  };
};

export type ResolvedExercise = {
  exerciseId: string | null;

  aiName: string;
  name: string;

  gifUrl: string | null;

  targetMuscles: string[];
  secondaryMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  instructions: string[];

  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
  alternatives: string[];

  matchScore: number;
};
