"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string; // e.g. "25+", "50K+", "0.8s", "4.9/5"
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    // Parse the number from the string
    // e.g. "25+" -> 25, "50K+" -> 50, "0.8s" -> 0.8, "4.9/5" -> 4.9
    const match = value.match(/([0-9.]+)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const targetNum = parseFloat(match[1]);
    const isDecimal = match[1].includes(".");
    const suffix = value.replace(match[1], "");

    let start = 0;
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const currentVal = start + (targetNum - start) * easeProgress;

      if (isDecimal) {
        setDisplayValue(`${currentVal.toFixed(1)}${suffix}`);
      } else {
        setDisplayValue(`${Math.floor(currentVal)}${suffix}`);
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
    </span>
  );
}
