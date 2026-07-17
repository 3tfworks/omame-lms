"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Sparkles, Heart, Star, Music, MoveRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function PracticeCoursePage() {
  return (
    <div className="w-full bg-[#faf9f6] text-stone-800 selection:bg-amber-200 selection:text-amber-900 font-serif pb-24 overflow-x-hidden">
      
      {/* 戻るリンク */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        <Link href="/ja/lms" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          <ChevronLeft size={16} />
          ホームに戻る
        </Link>
      </div>

      {/* --- セクション1: ヒーロー（感謝と振り返り） --- */}
      <section className="relative py-20 px-4 sm:px-8 overflow-hidden">
        {/* 装飾的背景 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-50/50 rounded-full blur-3xl" />
        </div>

        <motion.div 
          className="max-w-3xl mx-auto relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-center text-sm text-amber-600 font-bold tracking-[0.3em] uppercase mb-6 flex justify-center items-center gap-2">
            <Sparkles size={16} />
            Thank You
            <Sparkles size={16} />
          </motion.p>
          
          <motion.h1 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-relaxed md:leading-loose text-stone-800 mb-12">
            ここまで、<br />
            <span className="text-amber-700 relative inline-block">
              『おうちで学べるお豆奏法基礎講座』
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-amber-200/40 -rotate-1 rounded-sm" />
            </span><br />
            をご覧いただき、<br />
            本当にありがとうございました。
          </motion.h1>

          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 md:p-12 shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
            <p className="text-lg text-stone-600 leading-loose mb-8 text-center font-medium">
              ここまで進まれた方は、きっと既に、
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                "今までとの感覚の違い",
                "音の変化",
                "無理に頑張らなくても弾ける感覚",
                "\"自然に任せる\"という意味",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-stone-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-stone-700 font-bold text-xl leading-relaxed">
              その片鱗を、<br />
              感じてくださったのではないかと思います。
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* --- 装飾ライン --- */}
      <div className="flex items-center justify-center my-8 opacity-50">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-stone-300" />
        <span className="mx-6 text-stone-300 text-xl">❋</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-stone-300" />
      </div>

      {/* --- セクション2: 共感（悩み） --- */}
      <section className="py-16 px-4 sm:px-8">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-center text-lg text-stone-500 mb-10">
            ただ、人によっては、もしかすると、
          </motion.p>

          <motion.div variants={fadeInUp} className="space-y-4 max-w-2xl mx-auto">
            {[
              "「この先が知りたい」",
              "「分かった気はするけれど、合っているか分からない。」",
              "「弾ける時と戻る時の差がある」",
              "「自分ではズレに気付きにくい」",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-stone-200/60 shadow-sm hover:border-amber-200 transition-colors">
                <Heart className="text-stone-300 shrink-0" size={24} />
                <p className="text-stone-700 font-medium text-lg lg:text-xl">
                  {item}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.p variants={fadeInUp} className="text-center text-lg text-stone-500 mt-10">
            という感覚もあるかもしれません。
          </motion.p>
        </motion.div>
      </section>

      {/* --- セクション3: 原因の説明（安心させる） --- */}
      <section className="py-20 px-4 sm:px-8 relative">
        <div className="absolute inset-0 bg-[#3a3532] text-stone-100 -skew-y-2 origin-top-left z-0" />
        
        <motion.div 
          className="max-w-3xl mx-auto relative z-10 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-xl mb-4 text-stone-300">
            それは、<span className="text-white font-bold">できていないからではなく、</span>
          </motion.p>

          <motion.div variants={fadeInUp} className="my-10 bg-white/10 backdrop-blur-md rounded-2xl p-8 lg:p-12 border border-white/20 shadow-2xl">
            <p className="text-xl lg:text-2xl leading-loose font-medium text-white">
              長年積み重ねてきた身体の使い方や感覚が、<br />
              まだ新しい感覚と<span className="text-amber-400 font-bold bg-amber-400/20 px-2 py-1 mx-1 rounded">入れ替わっている途中</span>だからです。
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-6 text-lg leading-loose text-stone-300">
            <p>だからこそ、お豆奏法は、</p>
            <p className="text-stone-300">"知識を増やす"だけではなく、</p>
            <p className="text-xl lg:text-2xl text-white font-medium mt-8">
              実際に弾きながら、<br className="md:hidden" />
              身体の感覚として<br />
              <span className="text-amber-400 font-bold underline decoration-amber-500 decoration-2 underline-offset-8">自然に定着させていく</span><br />
              ことが、とても大切になります。
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* --- セクション4: 講座紹介 --- */}
      <section className="py-24 px-4 sm:px-8 bg-gradient-to-b from-[#faf9f6] to-white">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="space-y-4 text-stone-600 text-lg mb-12">
            <p>もしも、</p>
            <div className="flex flex-col items-center justify-center gap-3 my-8">
              <span className="bg-stone-100 px-6 py-2 rounded-full font-medium shadow-inner">実際に見てもらいたい</span>
              <span className="bg-stone-100 px-6 py-2 rounded-full font-medium shadow-inner">判断してもらいたい</span>
              <span className="bg-stone-100 px-6 py-2 rounded-full font-medium shadow-inner">対面で教えてもらいたい</span>
            </div>
            <p>そんな気持ちが湧いていたら、<br />動画講座のその先として、</p>
          </motion.div>

          {/* 講座名の見出し */}
          <motion.div variants={fadeInUp} className="my-16">
            <div className="inline-block bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl px-10 py-10 lg:px-16 lg:py-14 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-amber-400/30 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <Star className="text-amber-400 fill-amber-400 w-6 h-6" />
                </div>
                <p className="text-amber-400 text-sm font-bold tracking-[0.2em] mb-4">4ヶ月間の集中プログラム</p>
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight tracking-tight">
                  お豆奏法<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">実践落とし込み講座</span>
                </h2>
              </div>
            </div>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-lg text-stone-600 mb-16">
            をご用意しました。
          </motion.p>
        </motion.div>
      </section>

      {/* --- セクション5: 講座の内容 --- */}
      <section className="py-16 px-4 sm:px-8">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-center text-lg text-stone-600 mb-8">
            この講座では、<br />オンラインで実際にやり取りをしながら、
          </motion.p>

          <motion.div variants={fadeInUp} className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-amber-900/5 border border-amber-100 mb-12 relative">
            <Music className="absolute top-8 right-8 text-amber-100 w-24 h-24 rotate-12" />
            <div className="relative z-10 space-y-4">
              {[
                "今どこでズレているのか",
                "どうすると自然に戻れるのか",
                "力みが生まれる瞬間",
                "音が変わる身体の使い方",
                "練習の中での整え方",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#faf9f6] p-4 rounded-xl border border-stone-100 group hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                  <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <span className="text-stone-800 font-medium text-lg">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-center text-xl lg:text-2xl text-stone-700 font-medium leading-loose">
            などを、実践を通して、<br />
            私、<span className="font-bold text-stone-900 underline decoration-amber-300 decoration-4 underline-offset-4">舘えりな</span>と一緒に深めていきます。
          </motion.p>
        </motion.div>
      </section>

      {/* --- セクション6: 変化の約束 --- */}
      <section className="py-20 px-4 sm:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="space-y-4 mb-10">
            <p className="text-stone-500 text-lg font-medium tracking-widest">
              動画で「理解する」から、
            </p>
            <p className="text-stone-900 font-bold text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500">
              実際に「自然にできる」へ。
            </p>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-xl text-stone-600 leading-loose">
            ここで大きく変わっていく方が<br />
            本当にたくさんいらっしゃいます。
          </motion.p>
        </motion.div>
      </section>

      {/* --- セクション7: CTA --- */}
      <section className="py-24 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f4ebd0] opacity-50 z-0" />
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0" />
        
        <motion.div 
          className="max-w-3xl mx-auto text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="space-y-6 text-stone-700 leading-loose mb-16 bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white">
            <p className="text-lg">もし今、</p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto text-left">
              <p className="font-bold flex items-center gap-2"><CheckCircle2 className="text-amber-500 w-5 h-5"/>「もっと深く掴みたい」</p>
              <p className="font-bold flex items-center gap-2"><CheckCircle2 className="text-amber-500 w-5 h-5"/>「実践の中で定着させたい」</p>
              <p className="font-bold flex items-center gap-2"><CheckCircle2 className="text-amber-500 w-5 h-5"/>「一人では気付きにくい部分を見てほしい」</p>
            </div>
            <p className="text-lg">そんな感覚がある方は、</p>
            <p className="text-2xl font-bold pt-4 text-stone-900 border-t border-stone-200/60 mt-6">
              ぜひ、この4ヶ月を<br />ご一緒できたら嬉しいです。
            </p>
          </motion.div>

          {/* CTAボタン */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <Link
                href="/ja/lp-practice"
                className="relative flex items-center gap-4 bg-stone-900 text-white font-bold py-6 px-12 rounded-full text-xl hover:bg-stone-800 transition-all shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                お豆奏法 実践落とし込み講座の詳細を見る
                <MoveRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>
            <p className="text-sm text-stone-500 font-medium bg-white/50 px-4 py-2 rounded-full">
              講座内容・サポート・料金をご確認いただけます
            </p>
          </motion.div>

          {/* えりな先生の署名 */}
          <motion.div variants={fadeInUp} className="mt-20 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-2 border-white shadow-lg relative">
              <span className="text-2xl">🎹</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-center">
              <p className="text-xs text-stone-500 tracking-widest mb-1">お豆奏法 創始者</p>
              <p className="text-xl text-stone-800 font-bold font-serif tracking-widest">舘 えりな</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
