import {
  ArrowDownRight,
  Brain,
  Dumbbell,
  PlayCircle,
  TimerReset,
} from "lucide-react";
import TypewriterHeading from "./TypewriterHeading";

const steps = [
  {
    number: "01",
    title: "TELL IT WHAT YOU’RE TRAINING",
    copy: "Choose Push, Pull, Legs, Full Body or build your own muscle combination.",
    icon: Dumbbell,
  },
  {
    number: "02",
    title: "TELL IT HOW MUCH TIME YOU’VE GOT",
    copy: "Gymlot adapts exercise count, volume and rest to fit the time you actually have.",
    icon: TimerReset,
  },
  {
    number: "03",
    title: "LET AI BUILD THE SESSION",
    copy: "Gemini plans the workout structure while ExerciseDB supplies real exercise demos and instructions.",
    icon: Brain,
  },
  {
    number: "04",
    title: "TRAIN WITH IT",
    copy: "Complete sets, follow exercise demos, run your rest timer and move through the workout.",
    icon: PlayCircle,
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-grid" />

      <div className="how-shell">
        <div className="how-heading">
          <div>
            <span className="section-index">02</span>

            <p className="light-section-kicker">
              <span />
              HOW GYMLOT WORKS
            </p>
          </div>

          <TypewriterHeading
            text={"FROM WHAT DO I TRAIN?\nTO DONE."}
            speed={150}
          />

          <p className="how-marker">
            less thinking.
            <br />
            more lifting. ↘
          </p>
        </div>

        <div className="how-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                className={`how-step how-step-${index + 1}`}
                key={step.number}
              >
                <div className="how-step-top">
                  <span>{step.number}</span>

                  <Icon size={29} strokeWidth={1.35} />
                </div>

                <h3>{step.title}</h3>

                <p>{step.copy}</p>

                <ArrowDownRight
                  className="how-step-arrow"
                  size={27}
                  strokeWidth={1.4}
                />
              </article>
            );
          })}
        </div>

        <div className="how-flow-line">
          <span>PLAN</span>
          <i />
          <span>SEE IT</span>
          <i />
          <span>TRAIN</span>
          <i />
          <span>FINISH</span>
        </div>
      </div>
    </section>
  );
}
