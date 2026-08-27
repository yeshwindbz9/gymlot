"use client";

import { useState } from "react";
import {
  Brain,
  Check,
  Clock3,
  Dumbbell,
  Flame,
  Play,
  Sparkles,
} from "lucide-react";
import TypewriterHeading from "./TypewriterHeading";

type FeatureId = "planning" | "demos" | "timer" | "tracking" | "summary";

const features = [
  {
    id: "planning" as FeatureId,
    number: "01",
    label: "AI PLANNING",
    description:
      "Tell Gymlot what you want to train and how much time you have. Gemini structures the session around your inputs.",
  },
  {
    id: "demos" as FeatureId,
    number: "02",
    label: "EXERCISE DEMOS",
    description:
      "Real ExerciseDB demonstrations, target muscles, equipment and instructions sit alongside the AI plan.",
  },
  {
    id: "timer" as FeatureId,
    number: "03",
    label: "REST TIMER",
    description:
      "Finish a set and Gymlot immediately starts the recommended rest period for you.",
  },
  {
    id: "tracking" as FeatureId,
    number: "04",
    label: "SET TRACKING",
    description:
      "Tick off sets as you go and see exactly how far you are through the workout.",
  },
  {
    id: "summary" as FeatureId,
    number: "05",
    label: "WORKOUT SUMMARY",
    description:
      "Finish with duration, completed sets, calorie estimates and general recovery guidance.",
  },
];

export default function Features() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>("planning");

  const selectedFeature =
    features.find((feature) => feature.id === activeFeature) ?? features[0];

  return (
    <section className="features-section" id="features">
      <div className="features-grid-bg" />

      <div className="features-shell">
        <div className="features-heading">
          <div>
            <span className="section-index">04</span>

            <p className="light-section-kicker">
              <span />
              BUILT FOR THE WORKOUT
            </p>
          </div>

          <TypewriterHeading
            text={"NOT JUST ANOTHER\nWORKOUT GENERATOR."}
            speed={150}
          />

          <p className="features-marker">click around ↘</p>
        </div>

        <div className="features-interactive">
          <div className="feature-selector">
            {features.map((feature) => {
              const active = feature.id === activeFeature;

              return (
                <button
                  key={feature.id}
                  type="button"
                  className={`feature-selector-item ${
                    active ? "feature-selector-item-active" : ""
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <span>{feature.number}</span>

                  <strong>{feature.label}</strong>

                  <i>{active ? "●" : "○"}</i>
                </button>
              );
            })}
          </div>

          <div className="feature-visual-wrap">
            <div className="feature-description">
              <span>{selectedFeature.number}</span>

              <p>{selectedFeature.description}</p>
            </div>

            <div className="feature-visual" key={activeFeature}>
              {activeFeature === "planning" && <PlanningVisual />}

              {activeFeature === "demos" && <DemoVisual />}

              {activeFeature === "timer" && <TimerVisual />}

              {activeFeature === "tracking" && <TrackingVisual />}

              {activeFeature === "summary" && <SummaryVisual />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanningVisual() {
  return (
    <div className="feature-planning-card">
      <div className="feature-card-topline">
        <span>GYMLOT AI</span>

        <Sparkles size={17} />
      </div>

      <div className="planning-question">
        <small>WHAT ARE YOU TRAINING?</small>

        <strong>PUSH</strong>
      </div>

      <div className="planning-meta">
        <div>
          <span>TIME</span>
          <strong>45 MIN</strong>
        </div>

        <div>
          <span>LEVEL</span>
          <strong>INTERMEDIATE</strong>
        </div>

        <div>
          <span>EQUIPMENT</span>
          <strong>FULL GYM</strong>
        </div>
      </div>

      <div className="planning-output">
        <span>BUILDING SESSION...</span>

        <div>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <p className="feature-handwriting">your workout, not everyone&apos;s →</p>
    </div>
  );
}

function DemoVisual() {
  return (
    <div className="feature-demo-card">
      <div className="feature-demo-media">
        <div className="demo-dumbbell">
          <span />
          <i />
          <span />
        </div>

        <button type="button" aria-label="Exercise demo preview">
          <Play size={21} fill="currentColor" />
        </button>

        <small>EXERCISEDB DEMO</small>
      </div>

      <div className="feature-demo-content">
        <span>CHEST</span>

        <h3>
          DUMBBELL
          <br />
          BENCH PRESS
        </h3>

        <div className="feature-demo-info">
          <div>
            <small>EQUIPMENT</small>
            <strong>DUMBBELL</strong>
          </div>

          <div>
            <small>TARGET</small>
            <strong>PECTORALS</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimerVisual() {
  return (
    <div className="feature-timer-card">
      <div className="timer-feature-top">
        <span>REST.</span>

        <Clock3 size={24} strokeWidth={1.4} />
      </div>

      <div className="feature-timer-number">01:14</div>

      <p>NEXT SET 3 / 4</p>

      <div className="feature-timer-actions">
        <button type="button">+30 SEC</button>

        <button type="button">SKIP</button>
      </div>

      <div className="feature-timer-progress">
        <i />
      </div>
    </div>
  );
}

function TrackingVisual() {
  return (
    <div className="feature-tracking-card">
      <div className="tracking-card-top">
        <div>
          <span>WORKOUT PROGRESS</span>

          <strong>42%</strong>
        </div>

        <Dumbbell size={27} strokeWidth={1.3} />
      </div>

      <div className="tracking-progress">
        <i />
      </div>

      <div className="tracking-exercise">
        <span>02 / 05</span>

        <strong>DUMBBELL BENCH PRESS</strong>
      </div>

      <div className="tracking-sets">
        {[true, true, false, false].map((complete, index) => (
          <div
            key={index}
            className={
              complete ? "tracking-set tracking-set-complete" : "tracking-set"
            }
          >
            <span>SET {index + 1}</span>

            {complete ? <Check size={16} /> : <i />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryVisual() {
  return (
    <div className="feature-summary-card">
      <div className="feature-summary-heading">
        <div>
          <span>WORKOUT COMPLETE</span>

          <strong>DONE.</strong>
        </div>

        <Check size={40} strokeWidth={1.4} />
      </div>

      <div className="feature-summary-stats">
        <div>
          <small>TIME</small>
          <strong>47:31</strong>
        </div>

        <div>
          <small>KCAL</small>
          <strong>210–330</strong>
        </div>

        <div>
          <small>SETS</small>
          <strong>16/16</strong>
        </div>
      </div>

      <div className="feature-summary-recovery">
        <Flame size={19} strokeWidth={1.5} />

        <p>Rehydrate, refuel and give trained muscles time to recover.</p>
      </div>
    </div>
  );
}
