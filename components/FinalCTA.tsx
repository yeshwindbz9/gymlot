"use client";

import { ArrowRight, Dumbbell, Sparkles } from "lucide-react";

export default function FinalCTA() {
  const scrollToBuilder = () => {
    document.getElementById("workout-builder")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="final-cta-section">
      <div className="final-cta-grid" />

      <div className="final-cta-shell">
        <div className="final-cta-kicker">
          <Sparkles size={17} strokeWidth={1.6} />

          <span>YOUR NEXT SESSION STARTS HERE</span>
        </div>

        <div className="final-cta-layout">
          <div className="final-cta-copy">
            <h2>
              STOP
              <br />
              OVERTHINKING
              <br />
              YOUR
              <br />
              WORKOUT.
            </h2>

            <p className="final-cta-marker">pick. plan. train. →</p>
          </div>

          <div className="final-cta-card-wrap">
            <div className="final-cta-card">
              <div className="final-cta-card-top">
                <span>GYMLOT</span>

                <Dumbbell size={23} strokeWidth={1.5} />
              </div>

              <p>
                Choose what you want to train, tell Gymlot how much time you
                have, and get a workout you can actually follow from start to
                finish.
              </p>

              <button type="button" onClick={scrollToBuilder}>
                Build my workout
                <ArrowRight size={20} />
              </button>

              <small>No account. No subscription. Just train.</small>
            </div>

            <p className="final-cta-scribble">see you in the gym ↗</p>
          </div>
        </div>

        <div className="final-cta-strip">
          <span>PLAN</span>
          <i />
          <span>DEMO</span>
          <i />
          <span>TRACK</span>
          <i />
          <span>REST</span>
          <i />
          <span>FINISH</span>
        </div>
      </div>
    </section>
  );
}
