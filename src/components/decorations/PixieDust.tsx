"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PixieDustProps {
  particleCount?: number;
  color?: string;
  className?: string;
}

export function PixieDust({ particleCount = 15, color = "bg-white", className = "" }: PixieDustProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // サーバーサイドレンダリングとのハイドレーション不一致を防ぐため、マウント後にパーティクルを生成
    const generatedParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // 0-100%
      y: Math.random() * 100, // 0-100%
      size: Math.random() * 4 + 2, // 2-6px
      duration: Math.random() * 3 + 2, // 2-5s
      delay: Math.random() * 2, // 0-2s
    }));
    setParticles(generatedParticles);
  }, [particleCount]);

  if (particles.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${color}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size * 1.5}px`, // サイズを少し大きく
            height: `${p.size * 1.5}px`,
            filter: "blur(1px)",
            boxShadow: "0 0 8px 2px rgba(255,255,255,0.4)" // 光彩を追加
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0.9, 0], y: -40, x: (Math.random() - 0.5) * 40 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
