"use client";

import { useEffect, useState } from 'react';

export const MeshGradient = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mesh-float-1 {
          0%, 100% { transform: scale(1) translate3d(0, 0, 0); }
          50% { transform: scale(1.2) translate3d(80px, 40px, 0); }
        }
        @keyframes mesh-float-2 {
          0%, 100% { transform: scale(1) translate3d(0, 0, 0); }
          50% { transform: scale(1.1) translate3d(-60px, 80px, 0); }
        }
        @keyframes mesh-float-3 {
          0%, 100% { transform: scale(1) translate3d(0, 0, 0); }
          50% { transform: scale(1.25) translate3d(40px, -60px, 0); }
        }
        .mesh-gradient-1 {
          animation: mesh-float-1 20s linear infinite;
          will-change: transform;
        }
        .mesh-gradient-2 {
          animation: mesh-float-2 25s linear infinite;
          will-change: transform;
        }
        .mesh-gradient-3 {
          animation: mesh-float-3 18s linear infinite;
          will-change: transform;
        }
      `}} />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[100px] mesh-gradient-1" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/8 rounded-full blur-[90px] mesh-gradient-2" />
      <div className="absolute top-[20%] right-[15%] w-[20%] h-[20%] bg-purple-600/10 rounded-full blur-[70px] mesh-gradient-3" />
    </div>
  );
};

export const FloatingParticles = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    // Generate randomized styling parameters exactly once on client mount to ensure stable rendering
    const list = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${Math.random() * 12 + 12}s`,
      size: `${Math.random() * 2 + 2}px`, // 2px to 4px
    }));
    setParticles(list);
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes particle-rise {
          0% {
            transform: translate3d(0, 110vh, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translate3d(0, -10vh, 0);
            opacity: 0;
          }
        }
        .bg-particle {
          animation: particle-rise linear infinite;
          will-change: transform;
        }
      `}} />
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-blue-400/40 bg-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
