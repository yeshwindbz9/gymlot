import type {
  ExerciseDbExercise,
  ExerciseDbResponse,
} from "@/types/exerciseDb";

const EXERCISE_DB_BASE_URL =
  process.env.EXERCISE_DB_BASE_URL || "https://oss.exercisedb.dev/api/v1";

function extractExercises(
  response: ExerciseDbResponse | ExerciseDbExercise[],
): ExerciseDbExercise[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (![502, 503, 504].includes(response.status)) {
      return response;
    }

    if (attempt < retries) {
      const delay = 400 * (attempt + 1);

      console.warn(
        `ExerciseDB returned ${response.status}. Retrying in ${delay}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });
}

export async function searchExercises(
  search: string,
): Promise<ExerciseDbExercise[]> {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    return [];
  }

  const url =
    `${EXERCISE_DB_BASE_URL}/exercises/search` +
    `?search=${encodeURIComponent(trimmedSearch)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 60 * 60 * 24,
      },
    });

    if (!response.ok) {
      console.warn(`ExerciseDB search failed for "${trimmedSearch}"`, {
        status: response.status,
        statusText: response.statusText,
      });

      return [];
    }

    const data = (await response.json()) as
      | ExerciseDbResponse
      | ExerciseDbExercise[];

    const exercises = extractExercises(data);

    return exercises;
  } catch (error) {
    console.error(`ExerciseDB search failed for "${trimmedSearch}":`, error);

    return [];
  }
}
