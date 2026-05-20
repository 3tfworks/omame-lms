"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Music, ArrowRight, Globe } from "lucide-react";
import { locales, type Locale } from "@/lib/i18n";
import { use } from "react";

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = (locales.includes(lang as Locale) ? lang : "ja") as Locale;

  return (
    <div className="w-full min-h-screen bg-omame-bg text-omame-text flex flex-col">
      {/* ナビゲーションバー */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-omame-gold/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 min-h-12 flex items-center justify-between">
          <span className="text-sm text-omame-primary font-medium tracking-wider">OMAME SOHO LAB.</span>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-omame-primary/60 mr-1 hidden sm:block" />
            {locales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}`}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  locale === loc
                    ? "bg-omame-primary text-white"
                    : "text-omame-primary/70 hover:bg-omame-gold/30"
                }`}
              >
                {loc === "ja" ? "日本語" : loc === "en" ? "English" : "Français"}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center pt-12">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          {/* ロゴ・タイトル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-xl ring-4 ring-omame-gold/30">
              <Image
                src="/images/erina-profile.jpg"
                alt="えりな先生"
                fill
                className="object-cover object-top"
                priority
              />
            </div>

            <p className="text-omame-primary tracking-[0.3em] text-xs font-medium mb-4 uppercase">
              OMAME SOHO LAB.
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-omame-deep leading-relaxed mb-6">
              お豆奏法
            </h1>
            <p className="text-lg text-omame-text/70 mb-2">
              ピアニスト・お豆奏法考案者
            </p>
            <p className="text-2xl font-medium text-omame-primary mb-12">
              えりな
            </p>
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="inline-block bg-white px-8 py-4 rounded-2xl shadow-lg border border-omame-gold/20 mb-12">
              <p className="text-omame-primary/60 tracking-[0.2em] text-sm font-medium mb-1">
                COMING SOON
              </p>
              <p className="text-omame-deep text-lg font-medium">
                公式サイト準備中
              </p>
            </div>
          </motion.div>

          {/* 装飾ライン */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-24 h-[1px] bg-omame-gold/40 mx-auto mb-12"
          />

          {/* LMSリンク */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-omame-text/60 text-sm mb-4">
              受講生の方はこちら
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-omame-primary hover:bg-omame-deep text-white rounded-full text-lg font-medium shadow-xl shadow-omame-primary/20 transition-all hover:-translate-y-1 active:translate-y-0 group"
            >
              <Music className="w-5 h-5" />
              学習ページへログイン
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* フッター */}
      <footer className="py-8 text-center text-sm text-omame-primary/40 border-t border-omame-gold/10">
        <p>© {new Date().getFullYear()} OMAME SOHO LAB. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
