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
  } | null;

  nutrition: NutritionEstimate | null;
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
   * CALORIE ESTIMATE
   *
   * Only calculate calories when the user has supplied
   * a valid body weight.
   *
   * This avoids pretending that a default 70 kg body
   * weight is personalised.
   */
  let calories: {
    min: number;
    max: number;
  } | null = null;

  if (weightKg && weightKg > 0) {
    const preciseDurationMinutes = Math.max(
      1,
      completion.totalDurationSeconds / 60,
    );

    const activeSetSeconds = completion.activeSetSeconds ?? 0;

    const activeMinutes = activeSetSeconds / 60;

    const setsPerMinute = completion.setsCompleted / preciseDurationMinutes;

    const activeRatio = activeMinutes / preciseDurationMinutes;

    /*
     * Start with a moderate resistance-training MET value.
     */
    let met = 3.5;

    /*
     * Increase estimated intensity based on
     * how dense the workout actually was.
     */
    if (setsPerMinute >= 0.3) {
      met += 0.4;
    }

    if (setsPerMinute >= 0.45) {
      met += 0.5;
    }

    /*
     * Increase intensity slightly when more of the workout
     * was spent actively performing sets.
     */
    if (activeRatio >= 0.2) {
      met += 0.4;
    }

    if (activeRatio >= 0.3) {
      met += 0.4;
    }

    /*
     * Small adjustment for advanced users.
     */
    if (experience === "advanced") {
      met += 0.2;
    }

    /*
     * Slightly reduce the estimate for beginners.
     */
    if (experience === "beginner") {
      met -= 0.2;
    }

    /*
     * Keep MET within a realistic resistance-training range.
     */
    met = Math.min(6, Math.max(3, met));

    /*
     * Standard MET calorie equation:
     *
     * kcal/min =
     * MET × 3.5 × body weight in kg / 200
     */
    const caloriesPerMinute = (met * 3.5 * weightKg) / 200;

    const estimatedCalories = caloriesPerMinute * preciseDurationMinutes;

    calories = {
      min: roundToNearest5(estimatedCalories * 0.9),

      max: roundToNearest5(estimatedCalories * 1.1),
    };
  }

  /*
   * NUTRITION + HYDRATION
   *
   * These also depend heavily on body weight, so if the
   * user didn't provide weight we return null rather than
   * silently assuming 70 kg.
   */
  let nutrition: NutritionEstimate | null = null;

  if (weightKg && weightKg > 0) {
    /*
     * General daily hydration range:
     * approximately 30–35 ml/kg/day.
     */
    const baseWaterMin = weightKg * 0.03;

    const baseWaterMax = weightKg * 0.035;

    /*
     * Add a modest allowance for the workout itself.
     */
    const workoutWaterAddition =
      durationMinutes >= 60 ? 0.5 : durationMinutes >= 30 ? 0.3 : 0.2;

    /*
     * Broad active-person daily macronutrient ranges.
     */
    const proteinMin = roundToNearest5(weightKg * 1.4);

    const proteinMax = roundToNearest5(weightKg * 1.8);

    const carbsMin = roundToNearest5(weightKg * 3);

    const carbsMax = roundToNearest5(weightKg * 5);

    const fatMin = roundToNearest5(weightKg * 0.7);

    const fatMax = roundToNearest5(weightKg * 1);

    nutrition = {
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
    };
  }

  return {
    durationMinutes,
    calories,
    nutrition,
  };
}
