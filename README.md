# Gymlot

**AI-Powered Gym & Workout Helper**

Gymlot is a mobile-first workout planning and training companion built with Next.js, Gemini AI, ExerciseDB V1, and a lightweight GIF fallback dataset.

Instead of only generating a list of exercises, Gymlot is designed to stay useful throughout the workout itself.

> **Plan → See It → Track It → Time It → Finish**

---

## Overview

Gymlot helps users build a personalised workout based on workout type, target muscle groups, available training time, experience level, available equipment, and optional profile information such as height, weight, and gender.

Gemini AI generates the workout structure, including exercise selection, sets, reps, rest periods, warm-up, cooldown, and short training recommendations.

The generated exercises are then enriched with real exercise data, GIF demonstrations, target muscles, secondary muscles, equipment details, and instructions.

Once the plan is created, Gymlot turns into an interactive workout player where users can start and complete individual sets, track actual working-set time, automatically start rest timers, pause or skip rest periods, follow exercise demonstrations, skip exercises when needed, track overall workout progress, prevent unrealistic speed-running of sets, and finish with a workout and recovery summary.

No account or database is required for the current MVP.

---

## Why Gymlot?

A lot of AI workout tools stop after generating something like:

```text
Bench Press — 4 × 10
Shoulder Press — 3 × 12
Triceps Pushdown — 3 × 12
```

That is useful, but the user still has to manage the rest of the workout themselves.

Gymlot is designed around a different idea:

> **Gymlot doesn't just give you a workout. It stays with you through it.**

The experience combines AI planning with practical gym-session functionality.

---

## Core Flow

### 1. Choose what to train

Users can select Push, Pull, Legs, Upper Body, Lower Body, Full Body, or a custom muscle selection.

Custom muscle groups include Chest, Shoulders, Triceps, Biceps, Back, Lats, Traps, Forearms, Abs, Glutes, Quads, Hamstrings, and Calves.

### 2. Choose available time

Users can select a workout duration between approximately 15 and 120 minutes, with quick presets such as 20, 30, 45, 60, and 90 minutes.

Gymlot adjusts the suggested workout size according to the available time.

| Time      | Typical session         |
| --------- | ----------------------- |
| 15–25 min | Quick session           |
| 25–40 min | Focused workout         |
| 40–60 min | Standard workout        |
| 60–75 min | Full session            |
| 75+ min   | Longer training session |

### 3. Add optional profile information

Users can optionally provide gender, height, and weight.

They can also select an experience level:

- Beginner
- Intermediate
- Advanced

And available equipment:

- Full Gym
- Dumbbells
- Bodyweight
- Home Gym

Equipment availability is treated as an important workout-generation constraint, particularly for bodyweight-only sessions.

### 4. Generate workout with Gemini

Gymlot sends the workout request to a server-side Next.js API route.

Gemini returns structured JSON containing workout title, workout type, estimated duration, warm-up, exercises, sets, reps, rest time, exercise notes, alternatives, recommendations, and cooldown.

Structured output is used instead of free-form AI text so the frontend can reliably render the workout.

Gymlot also introduces controlled variation when generating workouts so repeated requests are less likely to return exactly the same exercise combination while still preferring conventional, sensible movements.

### 5. Enrich exercises with ExerciseDB

Each Gemini-generated exercise is searched against ExerciseDB V1.

Gymlot attempts to retrieve:

- exercise ID
- exercise name
- animated GIF demonstration
- target muscles
- secondary muscles
- body parts
- equipment
- step-by-step instructions

To reduce burst traffic, ExerciseDB requests are resolved sequentially with a small delay between exercises instead of firing every lookup at the same time.

For temporary upstream failures such as `502 Bad Gateway`, `503 Service Unavailable`, or `504 Gateway Timeout`, Gymlot waits briefly and retries that ExerciseDB request once only.

It does not aggressively retry permanent or rate-limit responses.

### 6. GIF fallback dataset

If ExerciseDB V1 still fails or returns no usable result, Gymlot falls back to a static exercise dataset based on ExerciseGymGifsDB.

The fallback dataset is fetched from a CDN and cached rather than queried separately for every exercise. Gymlot then performs name matching locally against the cached dataset.

```text
Gemini exercise
↓
ExerciseDB V1
↓
success → use V1 GIF + metadata

failure / 503
↓
single delayed retry
↓
still unavailable
↓
cached fallback dataset
↓
local exercise match
↓
fallback GIF + metadata
```

This improves demo coverage without repeatedly hammering external APIs.

### 7. Start the workout

Once the user is happy with the generated plan, they can select:

```text
START WORKOUT
```

The interface switches into the workout player and scrolls directly to the active session.

The workout player includes the current exercise, animated exercise demonstration, target muscles, equipment, sets, reps, rest duration, exercise notes, instructions, exercise navigation, workout elapsed time, and total progress.

### 8. Track working sets

Gymlot treats a set as a timed action rather than a simple checkbox.

The first tap starts the set. A set cannot be immediately marked as complete; the user must spend a minimum amount of time performing it before completion is accepted.

```text
START SET 1
↓
working set timer
↓
COMPLETE SET 1
```

The current MVP uses a minimum working-set duration of approximately 20 seconds.

If someone attempts to complete the set unrealistically quickly, Gymlot shows a playful integrity prompt rather than accepting it immediately.

### 9. Automatic rest timer

Completing a set starts the recommended rest timer.

Users can pause, resume, add 30 seconds, or skip the rest period.

```text
REST.

01:30

PAUSE
+30 SEC
SKIP
```

### 10. Skip an exercise

Exercises can be skipped without falsely marking their sets as complete.

Skipped exercises are tracked separately from completed exercises and reflected in workout completion data.

### 11. Complete the workout

Once every exercise is either completed or skipped, Gymlot allows the user to finish the session.

The summary shows total workout duration, estimated calorie range, exercises completed, exercises skipped, sets completed, general water estimate, general protein estimate, general carbohydrate estimate, general fat estimate, and post-workout recovery guidance.

---

# Workout Generation UX

Workout generation may involve Gemini plus several exercise lookups, so generation can take several seconds.

Gymlot displays a dedicated generation overlay while the workout is being created.

```text
GYMLOT IS THINKING

BUILDING
YOUR SESSION.

Picking exercises,
balancing muscle groups
and planning your sets and rest.

● ● ●
```

If the browser request fails, the popup remains visible and gives the user a clearer explanation instead of exposing a raw browser error such as:

```text
TypeError: NetworkError when attempting to fetch resource
```

The user can then select **Try again** without losing their selected workout type, muscles, duration, experience level, equipment, or profile inputs.

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Custom CSS
- Lucide React
- Next.js Fonts

## AI

### Google Gemini

Gemini is used to generate the workout structure.

The API key remains server-side and is never exposed directly to the browser.

Package:

```bash
@google/genai
```

## Exercise Data

### ExerciseDB V1

Primary exercise source:

```text
https://oss.exercisedb.dev/api/v1
```

Used for exercise matching, GIF demonstrations, exercise metadata, instructions, target muscles, secondary muscles, and equipment.

The free V1 endpoint does not require authentication.

### ExerciseGymGifsDB fallback

A static CDN-backed exercise dataset is used only when the primary ExerciseDB lookup does not produce a usable exercise.

The complete fallback dataset is cached and matched locally to minimise network traffic.

## Hosting

The project is designed for deployment on Vercel.

---

# Project Structure

```text
app/
├── api/
│   └── workout/
│       └── route.ts
├── globals.css
├── icon.png
├── layout.tsx
└── page.tsx

components/
├── Header.tsx
├── Hero.tsx
├── HowItWorks.tsx
├── WhyGymlot.tsx
├── Features.tsx
├── FinalCTA.tsx
├── Footer.tsx
├── WorkoutBuilder/
│   └── WorkoutBuilder.tsx
├── Workout/
│   └── WorkoutPlayer.tsx
└── Summary/
    └── WorkoutSummary.tsx

lib/
├── gemini.ts
├── workoutSchema.ts
├── workoutSummary.ts
├── exerciseDb.ts
├── exerciseFallbackDb.ts
├── exerciseMatcher.ts
└── resolveWorkout.ts

types/
├── workout.ts
└── exerciseDb.ts
```

---

# Environment Variables

Create:

```text
.env.local
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
EXERCISE_DB_BASE_URL=https://oss.exercisedb.dev/api/v1
```

Do not commit `.env.local` to Git.

Do not expose the Gemini key using a `NEXT_PUBLIC_` environment variable.

---

# Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd gymlot
```

Install dependencies:

```bash
npm install
```

Create `.env.local` and add the required environment variables.

Start development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Production Build

Run:

```bash
npm run build
```

Then:

```bash
npm start
```

Before deployment, confirm that `npm run build` completes without errors.

---

# AI Architecture

```text
User
↓
Workout Builder
↓
POST /api/workout
↓
Gemini
↓
Structured Workout JSON
↓
ExerciseDB V1
↓
single retry for temporary upstream failure
↓
cached GIF fallback if required
↓
Resolved Workout
↓
Frontend
↓
Workout Player
```

This separation keeps AI generation and external API logic away from the client.

---

# Gemini Responsibilities

Gemini is responsible for exercise selection, sets, reps, rest periods, workout structure, warm-up, cooldown, and recommendations.

Gemini is encouraged to use short, conventional exercise names that are easier to match against exercise databases.

The prompt also encourages controlled exercise variety instead of returning exactly the same workout on every generation.

Equipment restrictions are treated as hard constraints where appropriate.

---

# Exercise Matching

Because Gemini and exercise datasets may occasionally use slightly different names, Gymlot uses a matching layer.

Example:

```text
Gemini:
Dumbbell Bench Press

Exercise database:
dumbbell bench press
```

The matcher considers normalized exercise names, word overlap, partial name matches, equipment, target muscle, and body part.

If the primary source cannot return usable candidates, the same generated exercise name is matched locally against the cached fallback dataset.

If neither source can produce a suitable match, Gymlot keeps the original Gemini exercise and shows the demonstration as unavailable.

---

# API Reliability Strategy

Gymlot intentionally avoids aggressive request retrying.

Exercise resolution uses:

```text
sequential requests
+
small spacing between exercises
+
one delayed retry for 502/503/504
+
cached fallback dataset
```

It does **not**:

- fire all exercise searches simultaneously
- repeatedly retry failed requests
- retry rate-limit responses
- issue vague secondary searches such as equipment + muscle
- make one fallback dataset download per exercise

The goal is to improve reliability without creating unnecessary traffic or making workout generation excessively slow.

---

# Graceful Failure

Third-party failures should not destroy the workout.

```text
Gemini succeeds
↓
ExerciseDB unavailable
↓
retry once
↓
fallback dataset
↓
GIF found
```

If both exercise data sources fail:

```text
Gemini exercise remains usable
↓
sets / reps / rest still work
↓
demo shown as unavailable
```

If the main `/api/workout` browser request itself fails:

```text
generation popup stays visible
↓
clear explanation
↓
TRY AGAIN
↓
same workout settings reused
```

---

# Workout Summary Calculations

The final summary uses deterministic calculations rather than asking Gemini to guess numerical values.

Calories are only estimated when a valid body weight is provided.

The estimate considers:

- body weight
- actual workout duration
- completed sets
- recorded working-set time
- workout density
- experience level

Gymlot no longer silently assumes a default body weight when one has not been entered.

Workout calories use a MET-style resistance-training estimate and are presented as a range rather than an exact value.

General recovery estimates include water, protein, carbohydrates, and fat.

These are intentionally broad fitness estimates and should not be interpreted as personalised medical or nutritional advice.

---

# Design Direction

Gymlot intentionally avoids the typical fitness-SaaS dashboard look.

The design direction is closer to:

```text
creative editorial website
×
analogue gym notebook
×
brutalist interface
×
playful fitness app
```

Core visual characteristics include:

- warm paper background
- black typography
- orange-red accent
- large editorial headlines
- handwritten annotations
- slight card rotations
- thick outlines
- rough circles
- grain texture
- grid backgrounds
- oversized exercise visuals
- asymmetrical layouts

Fonts:

```text
Space Grotesk
DM Sans
Permanent Marker
```

---

# Mobile-First UX

Gymlot is designed to remain highly usable during an actual gym session.

The mobile experience includes:

- sticky header
- thumb-friendly controls
- large tap targets
- stacked workout builder
- automatic scrolling between builder steps
- direct scroll into the workout player
- horizontal exercise navigation
- sticky workout progress
- large exercise demonstrations
- compact set controls
- centered rest overlay
- responsive workout summary
- swipe-friendly feature selector

The workout player is especially optimised for phone use because that is the most likely device users will have with them while training.

---

# Current MVP Scope

Included:

- AI workout generation
- custom muscle selection
- workout duration selection
- experience selection
- equipment selection
- bodyweight/no-equipment constraints
- optional profile inputs
- ExerciseDB V1 integration
- cached GIF fallback dataset
- exercise demonstrations
- exercise instructions
- sequential exercise resolution
- transient API retry handling
- generation loading/error popup
- retry generation without losing settings
- controlled workout variety
- timed set tracking
- anti-speed-run set validation
- exercise skipping
- automatic rest timer
- workout progress
- workout completion
- calorie estimate
- general nutrition estimates
- responsive/mobile-first interface
- no account required

---

# Privacy

The current MVP does not require an account.

Profile information entered into the workout builder is used to generate the current workout.

No custom Gymlot database is currently used to persist user workout history.

API keys are kept server-side.

---

# Disclaimer

Gymlot is a fitness planning tool.

It does not provide medical diagnosis, physiotherapy advice, injury rehabilitation advice, personalised medical guidance, or professional nutritional advice.

Workout, calorie, hydration, and nutrition figures are general estimates only.

Users should use their own judgement and stop exercising if they experience pain, dizziness, or unusual discomfort.

---

# Built With

```text
Next.js
React
TypeScript
Google Gemini
ExerciseDB V1
ExerciseGymGifsDB
Lucide React
Vercel
```

---

## Gymlot

> **Pick. Plan. Train.**
