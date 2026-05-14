"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Music, Heart, ArrowRight, Globe, ChevronUp } from "lucide-react";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import { useState, useEffect, use } from "react";

export default function OptinLP({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = (locales.includes(lang as Locale) ? lang : "ja") as Locale;
  const t = getDictionary(locale);

  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="w-full bg-omame-bg text-omame-text overflow-x-hidden selection:bg-omame-accent selection:text-white">
      {/* 言語切り替えバー */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-omame-gold/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 min-h-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-omame-primary font-medium tracking-wider">OMAME SOHO LAB.</span>
          <div className="flex items-center gap-1 flex-wrap justify-center">
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
                {t.langSwitch[loc]}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Hero Background"
            fill
            className="object-cover opacity-60 scale-105"
            style={{ animation: "pulse 10s ease-in-out infinite alternate" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-omame-bg/30 via-omame-bg/60 to-omame-bg"></div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 max-w-5xl mx-auto text-center px-3 sm:px-6 pt-24 sm:pt-20"
        >
          <p className="text-omame-primary tracking-[0.3em] text-xs sm:text-sm md:text-base font-medium mb-4 sm:mb-6 uppercase">
            {t.hero.studio}
          </p>
          <h1 className="text-[1.35rem] sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.8] sm:leading-[1.8] md:leading-[1.8] text-omame-deep mb-8 sm:mb-12 whitespace-pre-line">
            {t.hero.title}
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 text-omame-primary/60 animate-bounce flex justify-center"
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* 共感セクション */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="bg-white p-6 sm:p-8 md:p-16 rounded-2xl shadow-xl shadow-omame-primary/5 relative -mt-20 sm:-mt-32"
          >
            <div className="space-y-6 sm:space-y-8 text-center md:text-left text-base sm:text-xl leading-loose">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-omame-primary text-center pb-4 sm:pb-6 whitespace-pre-line">
                {t.empathy.quotes}
              </p>
              <p>{t.empathy.intro}</p>
              <p>{t.empathy.background}</p>

              <div className="bg-omame-bg p-5 sm:p-6 md:p-8 rounded-xl my-8 sm:my-10 space-y-4 text-left border border-omame-gold/20">
                {t.empathy.painPoints.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-7 h-7 text-omame-accent shrink-0 mt-1" />
                    <span className="text-lg md:text-xl text-omame-deep font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-6 pt-6 border-t border-omame-gold/30">
                <p className="text-2xl text-omame-primary/80 italic">
                  {t.empathy.doubt1}
                  <br />
                  {t.empathy.doubt2}
                </p>
                <p>{t.empathy.doubtFollow}</p>
                <p className="font-bold text-omame-deep text-2xl mt-8 whitespace-pre-line">
                  {t.empathy.clarify}
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl text-omame-primary font-bold mt-8 border-y border-omame-gold/20 py-8 break-keep">
                  {t.empathy.punchline}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* コア コンセプト */}
      <section className="py-16 md:py-24 bg-omame-primary text-omame-deep text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-12 sm:space-y-16"
          >
            <p className="text-xl md:text-2xl leading-[2.2] font-bold text-white drop-shadow-md">
              {t.core.cause}
              <span className="text-omame-deep font-black text-3xl mx-2 bg-white/60 px-3 py-1 rounded-md">{t.core.causeHighlight}</span>
              {t.core.causeEnd}
            </p>
            
            <div className="py-8">
              <p className="text-3xl md:text-5xl font-black tracking-widest text-omame-deep bg-white/80 inline-block px-8 py-6 rounded-2xl shadow-xl border-2 border-white">
                {t.core.relief}
              </p>
            </div>
            
            <p className="text-xl md:text-2xl leading-loose font-bold text-white drop-shadow-md">
              {t.core.solution}
            </p>

            <div className="py-12 border-y border-white/40 my-16 bg-white/10 rounded-3xl backdrop-blur-sm">
              <p className="text-sm tracking-[0.3em] text-omame-deep font-bold mb-4 uppercase">{t.core.conceptLabel}</p>
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg leading-relaxed whitespace-pre-line">
                {t.core.conceptTitle}
              </h2>
            </div>

            <div className="space-y-8 text-left max-w-4xl mx-auto bg-white/5 p-8 md:p-12 rounded-2xl backdrop-blur-sm border border-white/10 leading-loose text-lg md:text-xl">
              <p>
                {t.core.notTechnique}
                <strong className="text-omame-gold font-bold text-2xl mx-2">{t.core.letGo}</strong>
                {t.core.letGoEnd}
              </p>
              <p className="pl-4 border-l-2 border-omame-gold/50">
                {t.core.nature1}
                <br />
                {t.core.nature2}
                <br />
                {t.core.nature3}
              </p>
              <p>{t.core.surrender}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 実績・声セクション */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16 relative z-10">
              <div className="relative z-20">
                <h3 className="text-3xl md:text-4xl font-bold text-omame-deep mb-6 leading-relaxed whitespace-pre-line">
                  {t.proof.skeptic}
                </h3>
                <p className="leading-loose text-omame-text/80 text-lg md:text-xl">
                  {t.proof.evidence}
                  <br /><br />
                  {t.proof.miracle}
                </p>
              </div>
              <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/hands.png" alt="Piano hands" fill className="object-cover" />
              </div>
            </div>

            <div className="mt-24">
              <h4 className="text-center text-2xl md:text-3xl font-bold text-omame-primary mb-12 flex items-center justify-center gap-4">
                <span className="w-8 md:w-16 h-[1px] bg-omame-primary/30"></span>
                {t.proof.voicesTitle}
                <span className="w-8 md:w-16 h-[1px] bg-omame-primary/30"></span>
              </h4>

              <div className="grid md:grid-cols-2 gap-8 md:gap-10">
                {t.proof.voices.map((voice, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-xl shadow-sm border border-omame-gold/30 flex items-start gap-4 transform transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <Music className="w-6 h-6 text-omame-accent shrink-0 mt-1" />
                    <p className="text-lg md:text-xl font-medium text-omame-deep whitespace-pre-line">{voice}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-white/50 p-8 md:p-10 border-l-4 border-omame-primary rounded-r-xl shadow-sm">
                <p className="leading-loose text-omame-text/90 italic text-lg md:text-xl">
                  {t.proof.dystonia}
                  <br /><br />
                  {t.proof.dystoniaContinue}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* なぜ？ & ライフインパクト */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-16 md:space-y-20"
          >
            <div className="text-center space-y-8">
              <h3 className="text-3xl md:text-4xl font-bold text-omame-deep mb-8">{t.why.title}</h3>
              <p className="leading-loose text-xl">{t.why.answer}</p>
              <div className="inline-block text-left bg-omame-bg p-8 md:p-10 rounded-2xl border border-omame-gold/30 shadow-inner">
                <ul className="space-y-4 list-none text-omame-primary font-bold text-xl">
                  {t.why.questions.map((q, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-omame-accent"></span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="leading-loose text-lg">{t.why.realization}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 text-center pt-16 border-t border-omame-gold/30">
              <div className="p-8 bg-omame-bg/50 rounded-2xl border border-omame-gold/10">
                <p className="text-omame-primary text-2xl font-bold mb-6">{t.why.pianoTitle}</p>
                <ul className="space-y-4 text-base md:text-lg text-left text-omame-deep">
                  {t.why.pianoResults.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">✔️ <span className="pt-0.5">{r}</span></li>
                  ))}
                </ul>
              </div>
              <div className="p-8 bg-omame-primary/5 rounded-2xl border border-omame-primary/10">
                <p className="text-omame-primary text-2xl font-bold mb-6">{t.why.lifeTitle}</p>
                <ul className="space-y-4 text-base md:text-lg text-left text-omame-deep">
                  {t.why.lifeResults.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">✨ <span className="pt-0.5">{r}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center space-y-8 bg-omame-bg p-10 rounded-2xl">
              <p className="text-2xl md:text-3xl font-bold text-omame-deep leading-relaxed">{t.why.summary}</p>
              <p className="leading-loose text-omame-text/80 text-xl whitespace-pre-line">{t.why.summaryDetail}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* プロフィール */}
      <section className="py-16 md:py-24 bg-omame-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-sm tracking-[0.3em] text-omame-accent mb-4 uppercase text-center">{t.profile.label}</p>
            <div className="bg-white p-6 sm:p-8 md:p-16 rounded-2xl shadow-lg border border-omame-gold/20">
              <div className="grid md:grid-cols-[280px_1fr] gap-10 md:gap-16 items-start">
                <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden shadow-xl ring-4 ring-omame-gold/30">
                  <Image
                    src="/images/erina-profile.jpg"
                    alt={t.profile.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-omame-deep mb-6">{t.profile.name}</h3>
                  <ul className="space-y-4 text-omame-text/80 leading-relaxed text-lg">
                    {t.profile.bio.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-omame-accent mt-3 shrink-0"></span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-16 md:py-24 bg-omame-deep text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero.png')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-8 md:space-y-10"
          >
            <Heart className="w-10 h-10 md:w-12 md:h-12 mx-auto text-omame-accent opacity-90 animate-pulse" />
            <p className="leading-loose text-base sm:text-xl font-medium whitespace-pre-line">{t.cta.thanks}</p>

            <div className="bg-white text-omame-text p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl text-left my-12 md:my-16 transform transition-all hover:scale-[1.01]">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-[#00B900] mb-8 pb-6 border-b border-omame-gold/30">
                {t.cta.lineTitle}
              </h3>
              <p className="mb-6 leading-loose text-xl">{t.cta.lineIntro}</p>
              <ul className="space-y-4 mb-8 bg-omame-bg p-6 md:p-8 rounded-xl font-bold text-omame-deep text-lg">
                {t.cta.linePoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-omame-primary shrink-0"></div>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="text-lg md:text-xl leading-loose opacity-80 mb-10">
                {t.cta.lineDetail}
                <br /><br />
                {t.cta.lineExperience}
                <strong className="text-omame-primary font-bold text-2xl mx-1">{t.cta.lineHighlight}</strong>
                {t.cta.lineEnd}
                <span className="text-sm mt-4 block text-omame-primary/60">{t.cta.lineNote}</span>
              </p>

              <a
                href="#"
                id="cta-line-button"
                className="block w-full py-6 px-8 bg-[#00B900] hover:bg-[#00A000] text-white text-center font-bold rounded-full text-lg shadow-xl shadow-[#00B900]/20 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group"
              >
                {t.cta.button}
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </a>
            </div>

            <div className="space-y-8 text-white/90 pb-8 text-lg">
              <p className="leading-loose">{t.cta.closing1}</p>
              <p className="leading-loose">{t.cta.closing2}</p>
              <p className="text-2xl md:text-3xl text-omame-gold font-bold mt-12 border-t border-white/20 pt-12 leading-relaxed whitespace-pre-line">
                {t.cta.finalMessage}
              </p>
              <p className="pt-6 font-bold tracking-wide text-xl">{t.cta.farewell}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ セクション */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-2xl md:text-3xl font-medium text-omame-deep text-center mb-16">{t.faq.title}</h3>
            <div className="space-y-4">
              {t.faq.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-omame-bg rounded-xl border border-omame-gold/20 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-medium text-omame-deep text-lg flex items-center gap-3">
                      <span className="text-omame-accent font-bold text-xl">Q.</span>
                      {item.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-omame-primary shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-omame-primary shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-omame-text/80 leading-relaxed border-t border-omame-gold/10 pt-4 ml-10">
                      <span className="text-omame-primary font-bold mr-2">A.</span>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 text-center text-sm text-omame-primary/60 bg-omame-bg">
        <p>{t.footer.copyright}</p>
      </footer>

      {/* 追従型LINEボタン（スマホ・PC両対応） */}
      {showFloatingCTA && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-8 md:max-w-sm"
        >
          <a
            href="#"
            className="block w-full py-4 px-6 bg-[#00B900] hover:bg-[#00A000] text-white text-center font-bold rounded-full text-base shadow-2xl shadow-black/30 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group"
          >
            {t.cta.button}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </a>
        </motion.div>
      )}
    </div>
  );
}
