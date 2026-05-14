"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Heart, CheckCircle2, PlayCircle, BookOpen, Search, ArrowDown } from "lucide-react";
import { getDictionary, Locale, locales } from "@/lib/i18n";

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

export default function OfferPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const locale = locales.includes(lang) ? lang : "ja";
  const t = getDictionary(locale);

  // 決済ボタンのアクション（会費ペイへ遷移）
  const handleCheckoutMock = () => {
    window.location.href = "https://www.kaihipay.jp/forms?form_code=3006074313979285";
  };

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
                href={`/${loc}/offer`}
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

      {/* コンテンツ詳細セクション */}
      <section className="py-20 md:py-32 bg-omame-bg relative overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-omame-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-omame-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-16 md:space-y-32">
            
            {t.offer.products.map((product, idx) => {
              const images = [
                "/images/lesson_video.png",
                "/images/lesson_note.png",
                "/images/checklist.png",
                "/images/navi_search.png"
              ];
              const icons = [<PlayCircle key="0"/>, <BookOpen key="1"/>, <CheckCircle2 key="2"/>, <Search key="3"/>];
              const isEven = idx % 2 !== 0;

              return (
                <motion.div key={product.id} variants={fadeInUp} className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center`}>
                  <div className="w-full md:w-1/2">
                    <div className="aspect-[4/3] bg-white rounded-3xl shadow-2xl border border-white flex items-center justify-center p-2 relative overflow-hidden group">
                       <Image src={images[idx]} alt={product.title} fill className="object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-br from-omame-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="text-white w-20 h-20 bg-omame-accent/80 rounded-full p-6 shadow-lg backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-500">
                             {icons[idx]}
                          </div>
                       </div>
                       <div className="absolute -top-4 -left-4 text-7xl font-black text-white/90 drop-shadow-xl font-sans z-10">
                          {product.id}
                       </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-omame-deep leading-relaxed">
                      {product.title}
                    </h3>
                    <p className="text-lg md:text-xl leading-[2.2] text-omame-text/80 whitespace-pre-line">
                      {product.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}

          </motion.div>
        </div>
      </section>

      {/* クロージング＆CTAセクション */}
      <section className="py-20 md:py-32 bg-white text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-16">
            
            <p className="text-2xl md:text-3xl text-omame-primary font-medium leading-loose whitespace-pre-line">
              {t.offer.closing.message}
            </p>

            <div className="bg-[#FAFAF8] p-8 md:p-16 rounded-3xl shadow-2xl border border-omame-gold/30 mt-16 max-w-3xl mx-auto transform transition-all hover:scale-[1.01]">
              <h2 className="text-xl md:text-2xl text-omame-accent font-bold mb-8">
                {t.offer.closing.specialOffer}
              </h2>
              
              <div className="space-y-4 mb-12">
                <p className="text-lg text-omame-text/60 line-through decoration-1">
                  {t.offer.pricing.normalLabel} {t.offer.pricing.normalPrice}{t.offer.pricing.taxIncluded}
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-omame-deep">
                  <span className="font-bold text-lg">{t.offer.pricing.campaignLabel}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-black font-sans">{t.offer.pricing.campaignPrice}</span>
                    <span className="text-lg font-bold">{t.offer.pricing.taxIncluded}❣️</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-base md:text-lg leading-loose text-omame-text/80 whitespace-pre-line">
                  {t.offer.cta.noRush}
                </p>
                
                <button
                  onClick={handleCheckoutMock}
                  className="w-full block bg-gradient-to-r from-omame-primary to-omame-deep text-white font-bold text-lg md:text-xl py-6 px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-sans tracking-widest"
                >
                  {t.offer.cta.button}
                </button>

                <p className="text-lg md:text-xl leading-loose text-omame-primary font-medium whitespace-pre-line pt-8 border-t border-omame-gold/20">
                  {t.offer.cta.wish}
                </p>
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
            <Link href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</Link>
            <Link href="#" className="hover:text-white transition-colors">プライバシーポリシー</Link>
            <Link href="#" className="hover:text-white transition-colors">利用規約</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
