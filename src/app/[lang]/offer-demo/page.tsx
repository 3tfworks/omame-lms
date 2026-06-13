"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Heart, CheckCircle2, PlayCircle, BookOpen, Search, ArrowDown, MessageSquare } from "lucide-react";
import { getDictionary, Locale, locales } from "@/lib/i18n";
import { InteractiveLMSDemo } from "@/components/demo/InteractiveLMSDemo";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function OfferDemoPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const locale = locales.includes(lang) ? lang : "ja";
  const t = getDictionary(locale);

  // 価格は DB(system_settings.product_pricing)から取得する。
  // 初期値は i18n 辞書（フォールバック兼ちらつき防止）。
  const [pricing, setPricing] = useState({
    regularPrice: 34800,
    salePrice: 29800,
    campaignLabel: t.offer.pricing.campaignLabel,
    showCampaign: true,
  });

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setPricing((prev) => ({ ...prev, ...d }));
      })
      .catch(() => {});
  }, []);

  // 決済ボタンのアクション（Stripe Checkout へ遷移）
  // ※旧・会費ペイ版は並行運用のため残しておく（下にコメントアウト）
  const handleCheckoutMock = async () => {
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[offer-demo] checkout failed:", data);
      }
    } catch (err) {
      console.error("[offer-demo] checkout error:", err);
    }
  };

  // --- 旧・会費ペイ版（並行運用のため保持） ---
  // const handleCheckoutMock = () => {
  //   window.location.href = "https://www.kaihipay.jp/forms?form_code=3006074313979285";
  // };

  return (
    <div className="w-full bg-[#FAFAF8] text-omame-text overflow-x-hidden selection:bg-omame-accent selection:text-white font-serif">
      {/* 言語切り替えバー */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-omame-gold/20 shadow-sm font-sans">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 min-h-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Link href={`/${locale}`} className="text-xs sm:text-sm text-omame-primary font-medium tracking-wider hover:opacity-80 transition-opacity">
            OMAME SOHO LAB.
          </Link>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <Globe className="w-4 h-4 text-omame-primary/60 mr-1 hidden sm:block" />
            {locales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}/offer-demo`}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  locale === loc
                    ? "bg-omame-primary text-white"
                    : "text-omame-primary/70 hover:bg-omame-gold/30"
                }`}
              >
                {t.langSwitch[loc]}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Piano Background"
            fill
            className="object-cover opacity-[0.35] scale-105 filter sepia-[0.3]"
            style={{ animation: "pulse 15s ease-in-out infinite alternate" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/40 via-[#FAFAF8]/70 to-[#FAFAF8]"></div>
          {/* 光の差し込みエフェクト */}
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-white/30 rotate-45 blur-3xl mix-blend-overlay pointer-events-none"></div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 pt-24 sm:pt-20"
        >
          <p className="text-omame-accent tracking-[0.4em] text-sm md:text-base font-medium mb-8 uppercase">
            {t.offer.hero.catchphrase}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-relaxed md:leading-[1.8] text-omame-deep mb-12 whitespace-pre-line tracking-wide">
            {t.offer.hero.title}
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 text-omame-primary/40 animate-bounce flex justify-center"
          >
            <ArrowDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* ストーリーセクション */}
      <section className="py-16 md:py-32 relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center text-lg md:text-2xl leading-[2.2] md:leading-[2.5] space-y-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="whitespace-pre-line text-omame-deep font-medium">
              {t.offer.story.target}
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-12 text-omame-text/90">
            <p className="whitespace-pre-line">{t.offer.story.background1}</p>
            <p className="whitespace-pre-line">{t.offer.story.background2}</p>
            <p className="whitespace-pre-line">{t.offer.story.background3}</p>
          </motion.div>

          {/* ストーリーイメージ */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-2xl mx-auto">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image src="/images/story_piano.png" alt="Story Piano" fill className="object-cover" />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-omame-gold/10 border border-omame-gold/20 relative max-w-5xl mx-auto">
              <Heart className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 text-omame-accent bg-white rounded-full p-2 shadow-sm" />
              <p className="text-omame-primary font-medium text-lg md:text-xl whitespace-pre-line leading-loose">{t.offer.story.voices}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 悩みセクション */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-16">
              {t.offer.pains.map((pain, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-omame-bg/50 border border-omame-gold/10">
                  <span className="text-omame-accent text-xl mt-1 opacity-70">✔︎</span>
                  <p className="text-base md:text-lg leading-relaxed text-omame-text/80">{pain}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-12">
            <p className="text-lg md:text-2xl leading-[2.2] whitespace-pre-line text-omame-deep">
              {t.offer.solution.intro}
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-omame-primary leading-relaxed break-keep">
              {t.offer.solution.highlight}
            </p>
            <div className="max-w-5xl mx-auto space-y-8 text-lg md:text-xl leading-[2.2] text-omame-text/90">
              <p className="whitespace-pre-line">{t.offer.solution.mindset}</p>
              <p className="whitespace-pre-line bg-omame-bg p-8 md:p-12 rounded-3xl italic text-omame-deep/80 text-left md:text-center shadow-sm">
                {t.offer.solution.commonSense}
              </p>
              <p className="text-xl md:text-2xl font-bold text-omame-primary mt-12">
                {t.offer.solution.transition}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 特典コンテンツ（魔法の図書館システム） */}
      <section className="py-20 md:py-32 bg-omame-bg relative overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-omame-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-omame-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 space-y-6">
             <h2 className="text-3xl md:text-5xl font-bold text-omame-deep">ただの動画講座ではない、<br className="md:hidden" />魔法の学習システム</h2>
             <p className="text-lg text-omame-text/80 max-w-2xl mx-auto leading-relaxed">
               数百時間の動画から答えを探す無駄な時間はもう終わりです。<br className="hidden md:block"/>
               生徒全員の気づきが集まり、日々進化していく「みんなで作る魔法の辞書」へようこそ。
             </p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-16 md:space-y-32">
            
            {/* 魔法の辞書（ナビ検索） */}
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
              <div className="w-full md:w-1/2">
                <div className="aspect-[4/3] bg-white rounded-3xl shadow-2xl border border-white flex items-center justify-center p-2 relative overflow-hidden group">
                    <Image src="/images/navi_search.png" alt="魔法の辞書" fill className="object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-br from-omame-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="text-white w-20 h-20 bg-omame-accent/80 rounded-full p-6 shadow-lg backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-500">
                          <Search />
                      </div>
                    </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-omame-deep leading-relaxed">
                  魔法の辞書（お豆ナビ検索）
                </h3>
                <p className="text-lg md:text-xl leading-[2.2] text-omame-text/80 whitespace-pre-line">
                  「手が痛い」「音が硬い」などの悩みや曲名で検索すると、えりな先生がその話題を解説している動画の<strong>"ドンピシャの秒数"</strong>から自動再生されます。欲しい答えに一瞬でアクセス。
                </p>
              </div>
            </motion.div>

            {/* マイ付箋（みんなで作る辞書） */}
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-center">
              <div className="w-full md:w-1/2">
                <div className="aspect-[4/3] bg-white rounded-3xl shadow-2xl border border-white flex items-center justify-center p-2 relative overflow-hidden group">
                    <Image src="/images/lesson_note.png" alt="みんなの付箋" fill className="object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-br from-omame-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="text-white w-20 h-20 bg-omame-accent/80 rounded-full p-6 shadow-lg backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-500">
                          <MessageSquare />
                      </div>
                    </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-omame-deep leading-relaxed">
                  みんなの付箋（共創エコシステム）
                </h3>
                <p className="text-lg md:text-xl leading-[2.2] text-omame-text/80 whitespace-pre-line">
                  動画の特定の秒数に残したあなたの「気づき」が、同じ悩みを持つ仲間のナビゲーションになります。全員の気づきが集まり日々進化していく、孤独とは無縁のコミュニティ学習です。
                </p>
              </div>
            </motion.div>

          </motion.div>

          {/* 魔法の図書館 疑似体験ルーム（デモ） */}
          <div className="mt-40">
            <div className="text-center mb-16">
               <h2 className="text-2xl md:text-4xl font-bold text-omame-deep mb-6">百聞は一見に如かず。</h2>
               <p className="text-lg text-omame-text/80">
                 実際のシステムの「魔法」を、今ここで体感してみてください。
               </p>
            </div>
            
            <div className="w-full relative z-20">
              <InteractiveLMSDemo />
            </div>
          </div>
        </div>
      </section>

      {/* クロージング＆CTAセクション */}
      <section className="py-20 md:py-32 bg-white text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-16">
            
            <div className="space-y-8">
              <p className="text-2xl md:text-3xl text-omame-primary font-medium leading-loose whitespace-pre-line">
                {t.offer.closing.message}
              </p>
              
              {/* 不安払拭コピー追加 */}
              <p className="text-lg md:text-xl text-omame-text/80 leading-[2.2] max-w-2xl mx-auto mt-8 border-t border-omame-gold/20 pt-8">
                「ITが苦手で、使いこなせるか不安…」<br/>
                ご安心ください。ログインした瞬間に「今日見るべき動画」が表示される迷子にならない設計と、動画内に溢れる「先輩たちの付箋」が、あなたを孤独な挫折から守り抜きます。
              </p>
            </div>

            <div className="bg-[#FAFAF8] p-8 md:p-16 rounded-3xl shadow-2xl border border-omame-gold/30 mt-16 max-w-3xl mx-auto transform transition-all hover:scale-[1.01]">
              <h2 className="text-xl md:text-2xl text-omame-deep font-black mb-8 px-4 py-3 border-2 border-omame-accent rounded-xl bg-white shadow-sm inline-block">
                {t.offer.closing.specialOffer}
              </h2>
              
              <div className="space-y-4 mb-12 mt-4">
                {pricing.showCampaign ? (
                  <>
                    <p className="text-lg text-omame-text/80 line-through decoration-1 font-medium">
                      {t.offer.pricing.normalLabel} {pricing.regularPrice.toLocaleString()}{t.offer.pricing.taxIncluded}
                    </p>
                    <div className="flex flex-col md:flex-row items-baseline justify-center gap-2 md:gap-4 text-omame-deep">
                      <span className="font-bold text-lg md:text-xl whitespace-nowrap">{pricing.campaignLabel}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-6xl md:text-7xl font-black font-sans text-omame-deep tracking-tight">{pricing.salePrice.toLocaleString()}</span>
                        <span className="text-lg font-bold whitespace-nowrap">円（税込）❣️</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col md:flex-row items-baseline justify-center gap-2 md:gap-4 text-omame-deep">
                    <span className="font-bold text-lg md:text-xl whitespace-nowrap">{t.offer.pricing.normalLabel}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl md:text-7xl font-black font-sans text-omame-deep tracking-tight">{pricing.regularPrice.toLocaleString()}</span>
                      <span className="text-lg font-bold whitespace-nowrap">{t.offer.pricing.taxIncluded}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-10">
                <p className="text-base md:text-lg leading-loose text-omame-deep font-bold whitespace-pre-line">
                  {t.offer.cta.noRush}
                </p>
                
                <button
                  onClick={handleCheckoutMock}
                  className="w-full block bg-gradient-to-r from-omame-primary to-omame-deep text-white font-bold text-lg md:text-xl py-6 px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-sans tracking-widest"
                >
                  {t.offer.cta.button}
                </button>

                <div className="mt-12 pt-8 border-t border-omame-gold/30">
                  <p className="text-lg md:text-xl leading-loose text-omame-deep font-black whitespace-pre-line p-6 border-2 border-omame-accent/50 rounded-xl bg-white/50">
                    {t.offer.cta.wish}
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-omame-text text-white/50 py-12 text-center font-sans">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <p className="text-sm tracking-widest">{t.footer.copyright}</p>
          <div className="flex justify-center gap-6 text-xs">
            <Link href={`/${locale}/tokutei`} className="hover:text-white transition-colors">特定商取引法に基づく表記</Link>
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">プライバシーポリシー</Link>
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">利用規約</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
