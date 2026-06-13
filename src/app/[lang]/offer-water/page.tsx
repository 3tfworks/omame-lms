"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, Heart, PlayCircle, BookOpen, CheckCircle2, Search, ArrowDown, Droplets, MessageSquare } from "lucide-react";
import { getDictionary, Locale, locales } from "@/lib/i18n";
import { InteractiveLMSDemo } from "@/components/demo/InteractiveLMSDemo";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function OfferWaterPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const locale = locales.includes(lang) ? lang : "ja";
  const t = getDictionary(locale);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

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
        console.error("[offer-water] checkout failed:", data);
      }
    } catch (err) {
      console.error("[offer-water] checkout error:", err);
    }
  };

  // --- 旧・会費ペイ版（並行運用のため保持） ---
  // const handleCheckoutMock = () => {
  //   window.location.href = "https://www.kaihipay.jp/forms?form_code=3006074313979285";
  // };

  return (
    <div className="w-full bg-[#E0F7FA] text-blue-950 overflow-x-hidden selection:bg-cyan-400 selection:text-white font-serif relative">
      
      {/* 画面全体に固定された波紋のパララックス背景 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div style={{ y, height: "120%", width: "100%", position: "absolute", top: "-10%" }}>
          <Image src="/images/water_ripple.png" alt="Water Ripple Background" fill className="object-cover opacity-40 mix-blend-multiply filter blur-[2px]" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA]/80 via-white/40 to-blue-950/80"></div>
      </div>

      {/* ヘッダー */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm font-sans">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Link href={`/${locale}`} className="text-sm text-cyan-800 font-medium tracking-widest hover:opacity-80 transition-opacity flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" />
            OMAME SOHO LAB.
          </Link>
          <div className="flex items-center gap-2">
            {locales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}/offer-water`}
                className={`px-3 py-1 text-xs rounded-full transition-all border ${
                  locale === loc
                    ? "bg-white/80 text-cyan-700 border-cyan-200 shadow-sm"
                    : "text-cyan-800/60 border-transparent hover:bg-white/50"
                }`}
              >
                {t.langSwitch[loc]}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* 1. ヒーローセクション（アシンメトリー） */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-12">
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="w-full md:w-3/5 text-left z-10"
          >
            <motion.p variants={fadeInUp} className="text-cyan-600 tracking-[0.5em] text-sm md:text-base font-medium mb-8 pl-1">
              {t.offer.hero.catchphrase}
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.6] text-blue-950 mb-12 drop-shadow-sm">
              {t.offer.hero.title}
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="w-16 h-[1px] bg-cyan-400 mb-12"></motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full md:w-2/5 relative aspect-square max-w-md hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200/40 to-white/40 rounded-full blur-2xl animate-pulse"></div>
            <Image src="/images/water_ripple.png" alt="Essence" fill className="object-cover rounded-full shadow-2xl opacity-80" />
          </motion.div>

        </div>

        {/* スクロールインジケーター（水滴） */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-400 to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 48, 48] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "circIn" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-white"
            ></motion.div>
          </div>
          <span className="text-[10px] tracking-widest text-cyan-700 uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* 2. 悩みセクション（バブル浮遊レイアウト） */}
      <section className="py-24 md:py-40 relative z-10 bg-white/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-20">
             <h2 className="text-2xl md:text-4xl text-blue-900 font-bold tracking-widest opacity-60">Pains</h2>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
            {t.offer.pains.map((pain, i) => {
              // バブルの大きさとアニメーションをランダム風に
              const size = i % 3 === 0 ? 'text-lg md:text-xl p-8 md:p-10' : i % 2 === 0 ? 'text-base md:text-lg p-6 md:p-8' : 'text-sm md:text-base p-5 md:p-6';
              const delay = i * 0.1;
              const yOffset = i % 2 === 0 ? 20 : -20;
              
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay, duration: 0.8, type: "spring" }}
                  animate={{ y: [yOffset, -yOffset, yOffset] }}
                  // @ts-ignore
                  transition={{ repeat: Infinity, duration: 4 + (i%3), ease: "easeInOut" }}
                  className={`bg-white/60 backdrop-blur-md rounded-full shadow-lg border border-white/80 flex items-center justify-center text-center text-blue-900 ${size}`}
                >
                  {pain}
                </motion.div>
              );
            })}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-32 text-center max-w-3xl mx-auto space-y-16">
            <Droplets className="w-12 h-12 text-cyan-400 mx-auto opacity-50" />
            <p className="text-xl md:text-3xl leading-[2.5] text-blue-950 font-medium">
              {t.offer.solution.intro}
            </p>
            <p className="text-2xl md:text-4xl font-bold text-cyan-600 leading-loose">
              {t.offer.solution.highlight}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. ストーリー＆パララックス没入レイアウト */}
      <section className="relative py-32 z-10">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto px-6 space-y-32">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center">
            <p className="text-xl md:text-3xl text-blue-900 leading-[2.5] font-medium border-l-4 border-cyan-300 pl-8 text-left">
              {t.offer.story.target}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="space-y-12 text-lg md:text-xl text-blue-900/80 leading-loose">
              <p>{t.offer.story.background1}</p>
              <p>{t.offer.story.background2}</p>
              <p>{t.offer.story.background3}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
               <div className="aspect-[3/4] relative rounded-t-full rounded-b-3xl overflow-hidden shadow-2xl">
                 <Image src="/images/story_piano.png" alt="Piano" fill className="object-cover filter hue-rotate-180 brightness-110 sepia-[0.2]" />
               </div>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="bg-gradient-to-r from-cyan-100/50 to-white/50 backdrop-blur-md p-10 md:p-16 rounded-3xl shadow-xl shadow-cyan-900/5 border border-white text-center">
              <Heart className="w-10 h-10 text-cyan-400 mx-auto mb-6" />
              <p className="text-xl text-cyan-800 font-medium leading-loose">{t.offer.story.voices}</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. 特典コンテンツ（魔法の図書館システム） */}
      <section className="py-24 md:py-40 relative z-10 bg-white/30 backdrop-blur-lg border-t border-b border-white/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 space-y-6">
             <h2 className="text-3xl md:text-5xl font-bold text-blue-900">ただの動画講座ではない、<br className="md:hidden" />魔法の学習システム</h2>
             <p className="text-lg text-blue-800/80 max-w-2xl mx-auto leading-relaxed">
               数百時間の動画から答えを探す無駄な時間はもう終わりです。<br className="hidden md:block"/>
               生徒全員の気づきが集まり、日々進化していく「みんなで作る魔法の辞書」へようこそ。
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-32">
            {/* 魔法の辞書（ナビ検索） */}
            <motion.div variants={fadeInUp} className="group relative">
              <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-white h-full transition-all duration-500 hover:shadow-2xl hover:bg-white/80 flex flex-col">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-lg shrink-0">
                      <Search />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-950 leading-snug">魔法の辞書<br/>（お豆ナビ検索）</h3>
                  </div>
                  <p className="text-base md:text-lg text-blue-900/80 leading-loose flex-grow">
                    「手が痛い」「音が硬い」などの悩みや曲名で検索すると、えりな先生がその話題を解説している動画の<strong>"ドンピシャの秒数"</strong>から自動再生されます。欲しい答えに一瞬でアクセス。
                  </p>
                </div>
              </div>
            </motion.div>

            {/* マイ付箋（みんなで作る辞書） */}
            <motion.div variants={fadeInUp} className="group relative">
              <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-white h-full transition-all duration-500 hover:shadow-2xl hover:bg-white/80 flex flex-col">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-lg shrink-0">
                      <MessageSquare />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-950 leading-snug">みんなの付箋<br/>（共創エコシステム）</h3>
                  </div>
                  <p className="text-base md:text-lg text-blue-900/80 leading-loose flex-grow">
                    動画の特定の秒数に残したあなたの「気づき」が、同じ悩みを持つ仲間のナビゲーションになります。全員の気づきが集まり日々進化していく、孤独とは無縁のコミュニティ学習です。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 魔法の図書館 疑似体験ルーム（デモ） */}
          <div className="mt-20">
            <div className="text-center mb-12">
               <h2 className="text-2xl md:text-4xl font-bold text-blue-900 mb-4">百聞は一見に如かず。</h2>
               <p className="text-lg text-blue-800/80">
                 実際のシステムの「魔法」を、今ここで体感してみてください。
               </p>
            </div>
            
            {/* 以下のInteractiveLMSDemoは別のファイルからインポートされている想定 */}
            <div className="w-full relative z-20">
              <InteractiveLMSDemo />
            </div>
          </div>
        </div>
      </section>

      {/* 5. 価格＆CTA（深海とパルスする水滴レイアウト） */}
      <section className="py-32 relative z-10 bg-gradient-to-b from-transparent to-blue-950 text-white overflow-hidden">
        {/* 深海の泡エフェクト */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { x: 10, dur: 6, del: 1 }, { x: 30, dur: 8, del: 0 }, { x: 50, dur: 5, del: 3 }, 
            { x: 70, dur: 9, del: 2 }, { x: 90, dur: 7, del: 4 }, { x: 20, dur: 6, del: 5 }, 
            { x: 40, dur: 10, del: 1 }, { x: 60, dur: 7, del: 3 }, { x: 80, dur: 8, del: 0 }, 
            { x: 15, dur: 5, del: 2 }
          ].map((bubble, i) => (
             <motion.div 
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full blur-[1px]"
                initial={{ y: "100vh", x: `${bubble.x}vw` }}
                animate={{ y: "-10vh" }}
                transition={{ duration: bubble.dur, repeat: Infinity, ease: "linear", delay: bubble.del }}
             />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-20">
            
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl text-cyan-200 font-light leading-loose tracking-wide">
                {t.offer.closing.message}
              </h2>
              <p className="text-lg md:text-xl text-white/80 leading-loose max-w-2xl mx-auto mt-8 border-t border-white/20 pt-8">
                「ITが苦手で、使いこなせるか不安…」<br/>
                ご安心ください。ログインした瞬間に「今日見るべき動画」が表示される迷子にならない設計と、動画内に溢れる「先輩たちの付箋」が、あなたを孤独な挫折から守り抜きます。
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-2xl p-10 md:p-16 rounded-[3rem] shadow-2xl border border-white/20 mt-16 max-w-3xl mx-auto">
              <h2 className="text-lg md:text-xl text-cyan-300 font-medium tracking-widest mb-12 uppercase">
                {t.offer.closing.specialOffer}
              </h2>
              
              <div className="space-y-6 mb-16">
                <p className="text-lg text-cyan-100/50 line-through decoration-1">
                  {t.offer.pricing.normalLabel} {t.offer.pricing.normalPrice}{t.offer.pricing.taxIncluded}
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <span className="font-medium text-xl text-cyan-100">{t.offer.pricing.campaignLabel}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl md:text-8xl font-black font-sans text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                      {t.offer.pricing.campaignPrice}
                    </span>
                    <span className="text-xl font-bold text-cyan-200">{t.offer.pricing.taxIncluded}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <p className="text-base md:text-lg leading-loose text-white/80 whitespace-pre-line font-light">
                  {t.offer.cta.noRush}
                </p>
                
                {/* 水滴型パルスボタン */}
                <div className="relative inline-block w-full sm:w-auto">
                   <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl animate-ping opacity-20"></div>
                   <button
                     onClick={handleCheckoutMock}
                     className="relative w-full sm:w-auto block bg-white/20 backdrop-blur-md text-white border border-white/40 font-bold text-lg md:text-xl py-6 px-16 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-white/30 hover:scale-105 transition-all duration-300 font-sans tracking-widest"
                   >
                     {t.offer.cta.button}
                   </button>
                </div>

                <p className="text-lg md:text-xl leading-loose text-cyan-200 font-medium whitespace-pre-line pt-12 border-t border-white/10">
                  {t.offer.cta.wish}
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-blue-950 text-white/30 py-12 text-center font-sans relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <p className="text-sm tracking-widest">{t.footer.copyright}</p>
          <div className="flex justify-center gap-6 text-xs">
            <Link href="#" className="hover:text-white/60 transition-colors">特定商取引法に基づく表記</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">プライバシーポリシー</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">利用規約</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
