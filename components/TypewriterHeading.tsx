"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
  speed?: number;
  as?: "h1" | "h2" | "h3";
};

export default function TypewriterHeading({
  text,
  className = "",
  speed = 45,
  as = "h2",
}: Props) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  const [started, setStarted] = useState(false);

  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);

          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!started) {
      return;
    }

    let index = 0;

    const timer = window.setInterval(() => {
      index++;

      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speed);

    return () => {
      window.clearInterval(timer);
    };
  }, [started, text, speed]);

  const Tag = as;

  return (
    <Tag
      ref={ref}
      className={`typewriter-heading ${className}`}
      aria-label={text}
    >
      <span aria-hidden="true">{visibleText}</span>

      <span
        className={`typewriter-cursor ${
          visibleText.length >= text.length ? "typewriter-cursor-done" : ""
        }`}
        aria-hidden="true"
      >
        |
      </span>
    </Tag>
  );
}
