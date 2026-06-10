"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
      style={{ scaleX }}
    />
  );
}
