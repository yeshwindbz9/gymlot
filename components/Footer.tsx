import { Dumbbell } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-brand-mark">
              <Dumbbell size={20} strokeWidth={2} />
            </div>

            <strong>GYMLOT</strong>

            <p>AI-powered workouts backed by real exercise data.</p>
          </div>

          <div className="footer-links">
            <div>
              <span>EXPLORE</span>

              <a href="#workout-builder">Build a workout</a>

              <a href="#how-it-works">How it works</a>

              <a href="#features">Features</a>

              <a href="#why-gymlot">Why Gymlot</a>
            </div>

            <div>
              <span>POWERED BY</span>

              <p>Gemini AI</p>
              <p>ExerciseDB</p>
              <p>Next.js</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            Gymlot provides general fitness and nutrition estimates only. It is
            not medical advice.
          </p>

          <div>
            <span>© {new Date().getFullYear()} GYMLOT</span>

            <span className="footer-dot">●</span>

            <span>BUILT TO TRAIN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
