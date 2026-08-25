export const workoutResponseSchema = {
  type: "object",

  properties: {
    title: {
      type: "string",
      description: "Short descriptive workout title.",
    },

    workoutType: {
      type: "string",
      description: "Workout type such as Push, Pull, Legs or Full Body.",
    },

    estimatedDurationMinutes: {
      type: "integer",
      description:
        "Estimated total workout duration including working sets and rest.",
    },

    warmup: {
      type: "object",

      properties: {
        durationMinutes: {
          type: "integer",
        },

        instructions: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },

      required: ["durationMinutes", "instructions"],
    },

    exercises: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
            description:
              "Common standard gym exercise name suitable for matching against an exercise database.",
          },

          targetMuscle: {
            type: "string",
          },

          equipment: {
            type: "string",
          },

          sets: {
            type: "integer",
          },

          reps: {
            type: "string",
            description: "Rep prescription such as 8-10, 12-15 or 30 seconds.",
          },

          restSeconds: {
            type: "integer",
          },

          notes: {
            type: "string",
            description:
              "One concise recommendation about execution or effort.",
          },

          alternatives: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: [
          "name",
          "targetMuscle",
          "equipment",
          "sets",
          "reps",
          "restSeconds",
          "notes",
          "alternatives",
        ],
      },
    },

    recommendations: {
      type: "array",
      items: {
        type: "string",
      },
    },

    cooldown: {
      type: "object",

      properties: {
        durationMinutes: {
          type: "integer",
        },

        instructions: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },

      required: ["durationMinutes", "instructions"],
    },
  },

  required: [
    "title",
    "workoutType",
    "estimatedDurationMinutes",
    "warmup",
    "exercises",
    "recommendations",
    "cooldown",
  ],
};
