"use client";

import { ArrowDownRight, ArrowRight, Play } from "lucide-react";

export default function Hero() {
  const scrollToBuilder = () => {
    document
      .getElementById("workout-builder")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero-grid" />

      <div className="hero-copy">
        <div className="hero-kicker">
          <span className="hero-kicker-dot" />
          GYM HELPER
        </div>

        <h1 className="hero-title">
          <span>TRAIN</span>
          <span className="hero-title-accent">
            HARDER.
            <span className="rough-circle" aria-hidden="true" />
          </span>
          <span>SMARTER.</span>
        </h1>

        <div className="hero-bottom">
          <div className="hero-intro">
            <ArrowDownRight
              className="hero-intro-arrow"
              size={38}
              strokeWidth={1.5}
            />

            <p>
              Tell Gymlot what you&apos;re training and how much time
              you&apos;ve got. We&apos;ll build the workout, show every exercise
              and keep you moving.
            </p>

            <div className="hero-actions">
              <button className="primary-cta" onClick={scrollToBuilder}>
                Build my workout
                <ArrowRight size={20} />
              </button>

              <span className="no-account">No account. Just train.</span>
            </div>
          </div>

          <div className="hero-workout-preview">
            <div className="preview-note">
              <span>45 mins?</span>
              <span className="marker-text">sorted.</span>
            </div>

            <div className="preview-card">
              <div className="preview-card-top">
                <span>01 / 05</span>

                <span className="preview-tag">CHEST</span>
              </div>

              <div className="preview-visual">
                <div className="preview-dumbbell">
                  <span className="weight plate-one" />
                  <span className="weight plate-two" />
                  <span className="bar" />
                  <span className="weight plate-three" />
                  <span className="weight plate-four" />
                </div>

                <button
                  className="preview-play"
                  type="button"
                  aria-label="Exercise preview"
                >
                  <Play size={18} fill="currentColor" />
                </button>

                <span className="preview-caption">exercise demo</span>
              </div>

              <div className="preview-card-content">
                <div>
                  <p className="preview-label">NEXT UP</p>
                  <h2>DUMBBELL BENCH PRESS</h2>
                </div>

                <div className="preview-stats">
                  <div>
                    <span>SETS</span>
                    <strong>4</strong>
                  </div>

                  <div>
                    <span>REPS</span>
                    <strong>8–10</strong>
                  </div>

                  <div>
                    <span>REST</span>
                    <strong>90s</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-scribble">don&apos;t skip this one →</div>
          </div>
        </div>
      </div>

      <div className="hero-side-label">
        PLAN <span>/</span> TRAIN <span>/</span> TRACK
      </div>

      <div className="hero-scroll">
        <span>SCROLL</span>
        <span className="scroll-line" />
      </div>
    </section>
  );
}
