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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchExerciseDb(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },

    next: {
      revalidate: 60 * 60 * 24,
    },
  });

  /*
   * Retry ONCE only for temporary
   * upstream failures.
   *
   * We deliberately do not retry
   * 400 / 404 / 429 responses.
   */
  if ([502, 503, 504].includes(response.status)) {
    /*
     * Give the upstream service a
     * little longer to recover.
     */
    const delay = 400 + Math.floor(Math.random() * 200);

    console.warn(
      `ExerciseDB returned ${response.status}. Retrying once in ${delay}ms.`,
    );

    await wait(delay);

    /*
     * Retry without cache so we do not
     * accidentally reuse a failed response.
     */
    return fetch(url, {
      headers: {
        Accept: "application/json",
      },

      cache: "no-store",
    });
  }

  return response;
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
    const response = await fetchExerciseDb(url);

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

    return extractExercises(data);
  } catch (error) {
    console.error(`ExerciseDB search failed for "${trimmedSearch}":`, error);

    return [];
  }
}
