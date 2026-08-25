import {
  ArrowRight,
  CircleCheck,
  Database,
  Sparkles,
  Timer,
} from "lucide-react";

export default function WhyGymlot() {
  return (
    <section className="why-gymlot" id="why-gymlot">
      <div className="why-shell">
        <div className="why-left">
          <span className="why-eyebrow">WHY GYMLOT?</span>

          <h2>
            MOST AI
            <br />
            WORKOUT TOOLS
            <br />
            STOP TOO
            <br />
            EARLY.
          </h2>

          <p className="why-copy">
            A generated list of exercises is useful. But that&apos;s only the
            start. Gymlot is designed to stay useful once the workout actually
            begins.
          </p>
        </div>

        <div className="why-right">
          <div className="why-before">
            <span>MOST GENERATORS</span>

            <div className="fake-output">
              <small>AI WORKOUT</small>

              <strong>Dumbbell Bench Press</strong>

              <p>4 × 10</p>

              <strong>Shoulder Press</strong>

              <p>3 × 12</p>

              <strong>Triceps Pushdown</strong>

              <p>3 × 12</p>
            </div>

            <p className="why-scribble">...and then you&apos;re on your own.</p>
          </div>

          <div className="why-divider">
            <ArrowRight size={32} strokeWidth={1.5} />
          </div>

          <div className="why-after">
            <span>GYMLOT KEEPS GOING</span>

            <div className="why-live-card">
              <div className="why-live-top">
                <span>02 / 05</span>
                <span>CHEST</span>
              </div>

              <h3>
                DUMBBELL
                <br />
                BENCH PRESS
              </h3>

              <div className="why-live-stats">
                <div>
                  <small>SETS</small>
                  <strong>4</strong>
                </div>

                <div>
                  <small>REPS</small>
                  <strong>8–10</strong>
                </div>

                <div>
                  <small>REST</small>
                  <strong>90s</strong>
                </div>
              </div>

              <div className="why-live-progress">
                <span>SET 2 / 4</span>

                <div>
                  <i />
                </div>
              </div>
            </div>

            <div className="why-capabilities">
              <div>
                <Sparkles size={18} />
                AI planning
              </div>

              <div>
                <Database size={18} />
                real exercise data
              </div>

              <div>
                <Timer size={18} />
                rest timer
              </div>

              <div>
                <CircleCheck size={18} />
                set tracking
              </div>
            </div>
          </div>
        </div>

        <div className="why-statement">
          <span>GYMLOT ISN&apos;T JUST:</span>

          <strong>“HERE&apos;S YOUR WORKOUT.”</strong>

          <span className="why-statement-arrow">↓</span>

          <strong className="why-statement-accent">
            IT&apos;S “LET&apos;S DO IT.”
          </strong>
        </div>
      </div>
    </section>
  );
}
