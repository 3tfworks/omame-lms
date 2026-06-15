"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// §1 ファーストビュー
// LINE から流入したユーザーに「あなたのための場所だ」と即座に伝える。
export function Section01Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 背景画像 + 暗いオーバーレイ */}
      <div className="absolute inset-0 z-0">
        {/* [IMAGE_FV_背景] グランドピアノを前にした女性、暗めの色調 */}
        <Image
          src="/images/lp-v2/fv-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-2xl px-6 py-24 text-center text-white"
      >
        <p className="mb-8 font-sans text-[0.7rem] uppercase tracking-[0.4em] text-white/80">
          A New Way of Playing
        </p>

        <h1 className="text-3xl font-bold leading-[1.7] md:text-5xl md:leading-[1.7]">
          頑張るほど
          <br />
          弾けなくなる。
          <br />
          <span className="mt-4 inline-block">その理由を、</span>
          <br />
          知っていますか？
        </h1>

        <p className="mt-10 text-base leading-[2.2] text-white/90 md:text-lg">
          練習量を増やしても
          <br />
          脱力を学んでも
          <br />
          奏法を研究しても
          <br />
          <span className="mt-3 inline-block">変わらなかった方へ。</span>
        </p>

        <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-omame-gold/50 bg-black/20 px-6 py-7 backdrop-blur-sm">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-omame-gold">
            お豆奏法 基礎講座
          </p>
          <p className="mt-4 text-sm leading-[2] text-white/90">
            音色・脱力・読譜・本番力。
            <br />
            すべての土台を変える、
            <br />
            ピアノ演奏の「原理・原則」を学ぶ講座。
          </p>
        </div>

        <a
          href="#course"
          className="group mt-12 inline-flex flex-col items-center gap-2 text-sm tracking-wide text-white/90 transition-colors hover:text-white"
        >
          講座の中身を見る
          <ChevronDown className="h-6 w-6 animate-bounce text-omame-gold" />
        </a>
      </motion.div>
    </section>
  );
}
