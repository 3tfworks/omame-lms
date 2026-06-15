"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

// LP v2 共通プリミティブ。
// 既存 LP（/lp）の世界観トークンを踏襲しつつ、v2 用に再構築したもの。

// ── フェードインアップ（スクロール連動）─────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
} as const;

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── セクション外枠 ───────────────────────────────────
// 上端に細いゴールドの装飾線（境界）を引く。max は 2xl / 3xl を選択可能。
export function SectionShell({
  id,
  children,
  width = "2xl",
  divider = true,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  width?: "2xl" | "3xl";
  divider?: boolean;
  className?: string;
}) {
  const maxW = width === "3xl" ? "max-w-3xl" : "max-w-2xl";
  return (
    <section
      id={id}
      className={`scroll-mt-16 px-5 py-20 md:py-28 ${className}`}
    >
      <div className={`${maxW} mx-auto`}>
        {divider && (
          <div className="mx-auto mb-14 h-px w-16 bg-omame-gold/40 md:mb-20" />
        )}
        {children}
      </div>
    </section>
  );
}

// ── Eyebrow（英字の小ラベル）─────────────────────────
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 text-center font-sans text-[0.7rem] uppercase tracking-[0.3em] text-omame-gold">
      {children}
    </p>
  );
}

// ── 見出し ──────────────────────────────────────────
export function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-2xl font-bold leading-relaxed text-omame-deep md:text-3xl md:leading-relaxed whitespace-pre-line">
      {children}
    </h2>
  );
}

// ── CTA ボタン ───────────────────────────────────────
// 受講申込導線。Stripe Checkout への入り口（/[lang]/offer-demo）。
export function CtaButton({
  lang,
  children,
  size = "md",
}: {
  lang: string;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  const pad = size === "lg" ? "px-12 py-5 text-lg" : "px-10 py-4 text-base";
  return (
    <div className="flex justify-center">
      <a
        href={`/${lang}/offer-demo`}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-omame-gold font-bold text-white shadow-lg shadow-omame-gold/20 transition-all hover:-translate-y-0.5 hover:bg-omame-gold/90 active:translate-y-0 ${pad}`}
      >
        {children}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  );
}

// ── Vimeo 埋め込み ───────────────────────────────────
// 甲斐さんが実装後に VIMEO ID を差し替える前提のプレースホルダー対応。
// id が "PLACEHOLDER" のときは差し替え待ちの枠を表示する。
export function VimeoEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  if (!videoId || videoId === "PLACEHOLDER") {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-omame-gold/40 bg-omame-accent/40">
        <p className="px-6 text-center font-sans text-xs tracking-wider text-omame-deep/60">
          動画を準備中です
          <br />
          <span className="text-[0.65rem]">{title}</span>
        </p>
      </div>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg shadow-md shadow-omame-deep/10">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}`}
        title={title}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
