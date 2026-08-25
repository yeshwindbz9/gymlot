# Gymlot

**AI-Powered Gym & Workout Helper**

Gymlot is a mobile-first workout planning and training companion built with Next.js, Gemini AI, and ExerciseDB.

Instead of only generating a list of exercises, Gymlot is designed to stay useful throughout the workout itself.

> **Plan → See It → Track It → Time It → Finish**

---

## Overview

Gymlot helps users build a personalised workout based on workout type, target muscle groups, available training time, experience level, available equipment, and optional profile information such as height, weight, and gender.

Gemini AI generates the workout structure, including exercise selection, sets, reps, rest periods, warm-up, cooldown, and short training recommendations.

ExerciseDB then enriches the workout with real exercise names, animated exercise demonstrations, target muscles, secondary muscles, equipment information, and exercise instructions.

Once the plan is created, Gymlot turns into an interactive workout player where users can complete individual sets, automatically start rest timers, pause or skip rest periods, follow exercise demonstrations, track overall workout progress, move between exercises, and finish with a session summary.

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

Users can select:

- Push
- Pull
- Legs
- Upper Body
- Lower Body
- Full Body
- Custom muscle selection

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

These inputs are passed to Gemini to make the workout more relevant.

### 4. Generate workout with Gemini

Gymlot sends the workout request to a server-side Next.js API route.

Gemini returns structured JSON containing:

- workout title
- workout type
- estimated duration
- warm-up
- exercises
- sets
- reps
- rest time
- exercise notes
- exercise alternatives
- recommendations
- cooldown

Structured output is used instead of free-form AI text so the frontend can reliably render the workout.

### 5. Enrich exercises with ExerciseDB

Each generated exercise is matched against ExerciseDB.

Gymlot attempts to retrieve:

- exercise ID
- exercise name
- GIF demonstration
- target muscles
- secondary muscles
- body parts
- equipment
- step-by-step instructions

If ExerciseDB is temporarily unavailable or an exercise cannot be matched, Gymlot still keeps the AI-generated exercise so the workout remains usable.

The demo is simply shown as unavailable.

This is intentional for the MVP because the free ExerciseDB service can occasionally return temporary `503 Service Unavailable` responses.

### 6. Start the workout

Once the user is happy with the generated plan, they can select:

```text
START WORKOUT
```

The app switches into the workout player.

The workout player includes the current exercise, ExerciseDB demonstration, target muscles, equipment, sets, reps, rest duration, exercise notes, instructions, exercise navigation, workout elapsed time, and total progress.

### 7. Track sets

Each exercise includes individual set controls.

Example:

```text
SET 1 ○
SET 2 ○
SET 3 ○
SET 4 ○
```

Completing a set changes its state:

```text
SET 1 ✓
```

Overall progress is calculated from:

```text
completed sets / total sets
```

### 8. Automatic rest timer

Completing a set starts the recommended rest timer.

Users can pause, resume, add 30 seconds, or skip the rest period.

Example:

```text
REST.

01:30

PAUSE
+30 SEC
SKIP
```

### 9. Complete the workout

Once all sets are complete, Gymlot allows the user to finish the session.

The summary shows:

- total workout duration
- estimated calorie range
- exercises completed
- sets completed
- general water estimate
- general protein estimate
- general carbohydrate estimate
- general fat estimate
- post-workout recovery guidance

These figures are intentionally presented as broad estimates rather than precise medical or nutritional advice.

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

The API key is kept server-side and is never exposed directly to the browser.

Package:

```bash
@google/genai
```

## Exercise Data

### ExerciseDB V1

ExerciseDB is used for exercise metadata and demonstrations.

Current API base:

```text
https://oss.exercisedb.dev/api/v1
```

The free API does not require authentication.

## Hosting

The project is designed for deployment on Vercel.

The frontend and server-side workout API can be deployed together as a standard Next.js application.

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

Before deployment, confirm that:

```bash
npm run build
```

completes without errors.

---

# Deployment with Vercel

Gymlot can be deployed directly from GitHub.

Recommended flow:

```text
GitHub
↓
Vercel
↓
Import repository
↓
Add environment variables
↓
Deploy
```

In Vercel, add:

```text
GEMINI_API_KEY
GEMINI_MODEL
EXERCISE_DB_BASE_URL
```

under:

```text
Project Settings
→ Environment Variables
```

Do not expose the Gemini API key using a variable beginning with `NEXT_PUBLIC_`.

The Gemini key must remain server-side.

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
ExerciseDB Matching
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

Gemini is responsible for:

```text
exercise selection
sets
reps
rest periods
workout structure
warm-up
cooldown
recommendations
```

Gemini is encouraged to use conventional exercise names that are easy to match against ExerciseDB.

---

# ExerciseDB Responsibilities

ExerciseDB is responsible for:

```text
exercise demonstrations
exercise metadata
target muscles
secondary muscles
equipment
instructions
```

This avoids relying on Gemini to invent technique instructions or exercise metadata.

---

# Exercise Matching

Because Gemini and ExerciseDB may occasionally use slightly different exercise names, Gymlot uses a matching layer.

Example:

```text
Gemini:
Dumbbell Bench Press

ExerciseDB:
dumbbell bench press
```

The matcher considers:

- normalized exercise names
- word overlap
- partial name matches
- equipment
- target muscle
- body part

If no sufficiently strong match is found, Gymlot falls back to the original AI exercise.

---

# Graceful Failure

The app is intentionally designed so third-party failures do not destroy the entire workout.

For example:

```text
Gemini succeeds
↓
ExerciseDB request fails
↓
Workout still renders
↓
GIF shown as unavailable
↓
sets / reps / rest remain usable
```

For the MVP, Gymlot does not aggressively retry ExerciseDB failures in order to avoid unnecessary API traffic and latency.

---

# Workout Summary Calculations

The final summary uses deterministic calculations rather than asking Gemini to guess numerical values.

Examples include:

- workout duration
- calorie range
- water estimate
- protein estimate
- carbohydrate estimate
- fat estimate

These are intentionally broad estimates and should not be interpreted as personalised medical or nutritional recommendations.

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
- horizontal exercise navigation
- sticky workout progress
- large exercise demonstrations
- compact set controls
- mobile rest timer
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
- optional profile inputs
- ExerciseDB integration
- exercise demonstrations
- exercise instructions
- set tracking
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

---

# Disclaimer

Gymlot is a fitness planning tool.

It does not provide medical diagnosis, physiotherapy advice, injury rehabilitation advice, personalised medical guidance, or professional nutritional advice.

Workout, calorie, hydration, and nutrition figures are general estimates only.

---

# Built With

```text
Next.js
React
TypeScript
Google Gemini
ExerciseDB
Lucide
Vercel
```

---

## Gymlot

> **Pick. Plan. Train.**
