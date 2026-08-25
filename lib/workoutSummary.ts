import type { WorkoutCompletionSummary } from "@/components/Workout/WorkoutPlayer";

type SummaryInputs = {
  completion: WorkoutCompletionSummary;
  weightKg: number | null;
  experience: string;
};

export type NutritionEstimate = {
  waterLitres: {
    min: number;
    max: number;
  };

  proteinGrams: {
    min: number;
    max: number;
  };

  carbsGrams: {
    min: number;
    max: number;
  };

  fatGrams: {
    min: number;
    max: number;
  };
};

export type WorkoutSummaryStats = {
  durationMinutes: number;

  calories: {
    min: number;
    max: number;
  };

  nutrition: NutritionEstimate;
};

function roundToNearest5(value: number) {
  return Math.round(value / 5) * 5;
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateWorkoutSummary({
  completion,
  weightKg,
  experience,
}: SummaryInputs): WorkoutSummaryStats {
  const durationMinutes = Math.max(
    1,
    Math.round(completion.totalDurationSeconds / 60),
  );

  /*
   * We deliberately use a broad MET-style range rather than
   * pretending calorie burn is precise.
   *
   * General resistance training often sits around:
   * ~3.5 MET for moderate effort
   * ~6 MET for vigorous effort
   */
  const effectiveWeight = weightKg ?? 70;

  const hours = durationMinutes / 60;

  let minMet = 3.5;
  let maxMet = 5.5;

  if (experience === "advanced") {
    maxMet = 6;
  }

  if (experience === "beginner") {
    minMet = 3;
    maxMet = 5;
  }

  const minCalories = roundToNearest5(minMet * effectiveWeight * hours);

  const maxCalories = roundToNearest5(maxMet * effectiveWeight * hours);

  /*
   * General daily hydration estimate:
   * roughly 30–35 ml/kg/day.
   *
   * Add a modest workout allowance based on session duration.
   */
  const baseWaterMin = effectiveWeight * 0.03;
  const baseWaterMax = effectiveWeight * 0.035;

  const workoutWaterAddition = durationMinutes >= 60 ? 0.5 : 0.3;

  /*
   * General active-person macronutrient ranges.
   * These are intentionally broad and non-medical.
   */
  const proteinMin = roundToNearest5(effectiveWeight * 1.4);

  const proteinMax = roundToNearest5(effectiveWeight * 1.8);

  const carbsMin = roundToNearest5(effectiveWeight * 3);

  const carbsMax = roundToNearest5(effectiveWeight * 5);

  const fatMin = roundToNearest5(effectiveWeight * 0.7);

  const fatMax = roundToNearest5(effectiveWeight * 1);

  return {
    durationMinutes,

    calories: {
      min: minCalories,
      max: maxCalories,
    },

    nutrition: {
      waterLitres: {
        min: roundOneDecimal(baseWaterMin + workoutWaterAddition),

        max: roundOneDecimal(baseWaterMax + workoutWaterAddition),
      },

      proteinGrams: {
        min: proteinMin,
        max: proteinMax,
      },

      carbsGrams: {
        min: carbsMin,
        max: carbsMax,
      },

      fatGrams: {
        min: fatMin,
        max: fatMax,
      },
    },
  };
}
