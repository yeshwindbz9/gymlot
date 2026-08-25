"use client";

import { Dumbbell, ArrowUpRight } from "lucide-react";

export default function Header() {
  const scrollToBuilder = () => {
    document
      .getElementById("workout-builder")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="site-header">
      <a href="/" className="brand" aria-label="Gymlot home">
        <span className="brand-icon">
          <Dumbbell size={20} strokeWidth={2.4} />
        </span>

        <span className="brand-text">GYMLOT</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
        <a href="#why-gymlot">Why Gymlot</a>
      </nav>

      <button className="header-cta" onClick={scrollToBuilder}>
        Build a workout
        <ArrowUpRight size={18} />
      </button>
    </header>
  );
}
