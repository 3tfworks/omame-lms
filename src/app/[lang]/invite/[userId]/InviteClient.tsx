"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Heart, Mail, User, ArrowDown } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

export default function InviteClient({
  lang,
  userId,
  referrerName,
  regularPrice,
  referralPrice,
  referralDiscountActive,
}: {
  lang: string;
  userId: string;
  referrerName: string | null;
  regularPrice: number;
  referralPrice: number;
  referralDiscountActive: boolean;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/invite/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, referrerId: userId }),
      });
      if (res.ok) {
        router.push(`/${lang}/invite/${userId}/thanks`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "エラーが発生しました。もう一度お試しください。");
        setSubmitting(false);
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FAFAF8] text-omame-text overflow-x-hidden font-serif">

      {/* ナビゲーションバー */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-omame-gold/20 shadow-sm font-sans">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-omame-primary font-medium tracking-wider">
            OMAME SOHO LAB.
          </span>
          <div className="flex items-center gap-1.5 text-xs text-omame-primary/60">
            <Heart className="w-3.5 h-3.5 fill-omame-primary/40 text-omame-primary/40" />
            <span>特別なご招待</span>
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/40 via-[#FAFAF8]/70 to-[#FAFAF8]" />
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-white/30 rotate-45 blur-3xl mix-blend-overlay pointer-events-none" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 pt-20 sm:pt-20"
        >
          <p className="text-omame-primary tracking-[0.2em] sm:tracking-[0.35em] md:tracking-[0.4em] text-xs sm:text-sm md:text-base font-medium mb-8 uppercase font-sans break-words">
            A Letter, Hand-Delivered
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-relaxed md:leading-[1.8] text-omame-deep mb-6 tracking-wide [text-wrap:balance] break-words">
            {referrerName ? `${referrerName}さんから` : "大切な方からの"}<br />
            あなたへの招待状
          </h1>
          <p className="text-omame-text/70 text-lg md:text-xl leading-loose max-w-xl mx-auto">
            大切な人にだけ、そっと手渡される一通。
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-10 md:mt-16 text-omame-primary/40 animate-bounce flex justify-center"
          >
            <ArrowDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* えりな先生からのメッセージ */}
      <section className="py-12 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto px-5 md:px-6 text-base md:text-xl leading-loose md:leading-[2.5] space-y-10 md:space-y-16">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="text-center text-omame-deep font-medium text-xl md:text-2xl">
              はじめまして。たちえりなです。
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6 md:space-y-10 text-omame-text/90">
            <p>
              あなたに、この奏法を知っていただきたくてお声がけしました。
            </p>
            <p>
              「頑張らなくていい」「力まなくていい」——<br className="hidden md:block" />
              ただ重力に任せるだけで、ピアノの音はびっくりするほど美しく変わります。
            </p>
            <p>
              いつも一生懸命なのに、どこかしんどいな…と感じているピアノ好きな方に、ぜひ一度体験してほしいのです。
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="bg-white p-6 md:p-12 rounded-3xl shadow-xl shadow-omame-gold/10 border border-omame-gold/20 relative">
              <Heart className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 text-omame-primary bg-white rounded-full p-2 shadow-sm" />
              <p className="text-omame-deep font-medium text-lg md:text-xl leading-loose text-center">
                「力んでいたのが嘘みたい。<br className="hidden md:block" />弾くのがこんなに楽しかったんだ、と思いました」<br />
                「手の痛みがなくなって、もっとピアノが好きになりました」<br />
                「弾けなかった曲なのに、満足出来る演奏になった。」
              </p>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="text-omame-text/90">
              まずは下の動画をご覧になってみてください。
            </p>
          </motion.div>

        </div>
      </section>

      {/* ご招待された方だけの特別な5本 */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 md:px-6">

          {/* セクション見出し（eyebrow は hero のトーンに統一） */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-10 md:mb-16">
            <p className="text-omame-gold tracking-[0.2em] sm:tracking-[0.35em] md:tracking-[0.4em] text-xs sm:text-sm md:text-base font-medium mb-4 uppercase font-sans break-words">
              Five Films, For Invited Guests
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-omame-deep leading-snug">
              ご招待された方にだけ<br />お届けする5つの動画
            </h2>
          </motion.div>

          {/* 5本の縦スタック */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12 md:space-y-20"
          >
            {[
              { no: "01", title: "2010年に生まれた〈お豆奏法〉の原点〜発見者自身の驚き", vimeoId: "1188100383" },
              { no: "02", title: "なぜ「お豆」なのか", vimeoId: "1188100452" },
              { no: "03", title: "お豆奏法は「特別な奏法」ではない ― 原則原理に従うだけ", vimeoId: "1188100489" },
              { no: "04", title: "やらなくていいことだらけ ― 身体を緩めて弾く", vimeoId: "1188100547" },
              { no: "05", title: "たった1つで、全ての不調を同時に改善できる。", vimeoId: "1188100602" },
            ].map((video) => (
              <motion.div key={video.no} variants={fadeInUp} className="flex flex-col items-center text-center">
                {/* 番号バッジ */}
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-omame-gold/10 text-omame-gold border border-omame-gold/30 text-sm font-bold tracking-wider font-sans">
                  {video.no}
                </span>
                {/* タイトル */}
                <h3 className="text-lg md:text-xl font-bold text-omame-text mt-4 mb-5 max-w-2xl leading-snug">
                  {video.title}
                </h3>
                {/* Vimeo iframe */}
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <iframe
                    src={`https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0`}
                    title={video.title}
                    loading="lazy"
                    className="w-full h-full"
                    allow="fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* お豆奏法で変わること */}
      <section className="pt-14 pb-12 md:py-32 bg-omame-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-omame-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-omame-accent/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-10 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-omame-deep leading-snug md:leading-normal">
              お豆奏法で、こんな変化が起きます
            </h2>
            <p className="text-omame-text/70 text-lg max-w-2xl mx-auto leading-loose md:leading-relaxed">
              技術より先に、「体の感覚」を見る。<br />それだけで、音も、気持ちも、驚くほど変わります。
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: "🎹",
                title: "手が痛くならない",
                body: "力みゼロで弾けるから、長時間弾いても疲れません。腱鞘炎など手の悩みがある方からも喜びの声が届いています。",
              },
              {
                icon: "✨",
                title: "音が自然に輝く",
                body: "重力を使った奏法で、芯のある美しい響きが生まれます。同じ曲でも、全く別の音になります。",
              },
              {
                icon: "🌿",
                title: "心も軽くなる",
                body: "ピアノを弾く時間が、心をほどく休息の時間に変わります。「また弾きたい」が自然と生まれます。",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-omame-gold/10 border border-omame-gold/20 flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-3 md:mb-5">{item.icon}</div>
                <h3 className="text-lg font-bold text-omame-deep mb-3">{item.title}</h3>
                <p className="text-omame-text/80 leading-loose md:leading-relaxed text-base">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 登録セクション（CTA） */}
      <section className="py-12 md:py-32 bg-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-10 md:space-y-16">

            <div className="text-center space-y-4">
              <p className="text-2xl md:text-3xl text-omame-primary font-medium leading-loose">
                気になりましたか？
              </p>
              <p className="text-omame-text/85 text-lg leading-loose max-w-xl mx-auto">
                ご紹介特典の受け取りには、<br className="md:hidden" />
                <span className="font-bold text-omame-primary">LINE公式アカウントの友だち追加が必要です。</span><br />
                えりな先生からの最新情報や、特典動画をLINEでお届けします。
              </p>
            </div>

            <div className="bg-[#FAFAF8] px-5 py-7 md:p-14 rounded-3xl shadow-2xl border border-omame-gold/30">
              <div className="mb-8 border border-emerald-200 bg-emerald-50 px-5 py-4 text-center font-sans">
                {referralDiscountActive ? (
                  <>
                    <p className="font-bold text-emerald-800">ご紹介特典 10%OFF（2026年8月31日まで）</p>
                    <p className="mt-2 text-sm text-emerald-700">
                      <span className="line-through">{regularPrice.toLocaleString("ja-JP")}円</span>
                      <span className="mx-2">→</span>
                      <strong className="text-lg">{referralPrice.toLocaleString("ja-JP")}円</strong>
                    </p>
                    <p className="mt-2 text-xs text-emerald-700">
                      クーポンコードの入力は不要です。この紹介ページから自動で適用されます。
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-emerald-800">ご紹介者から届いた専用ページです</p>
                    <p className="mt-2 text-lg font-bold text-emerald-900">
                      受講料 {regularPrice.toLocaleString("ja-JP")}円（税込）
                    </p>
                    <p className="mt-2 text-xs text-emerald-700">講座本体の価格は公式サイトと同一です。</p>
                  </>
                )}
              </div>

              {/* LINE友達追加ボタン */}
              <a
                href="https://lin.ee/RmeCAtQ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-5 rounded-full text-white font-bold text-lg font-sans transition-all shadow-xl hover:shadow-2xl hover:scale-105 duration-300 mb-8 md:mb-10"
                style={{ background: "linear-gradient(135deg, #06C755, #05a847)" }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.19 2 11.33c0 2.92 1.45 5.52 3.73 7.24-.16.6-.53 2.17-.61 2.51-.1.41.15.4.31.29.13-.09 1.68-1.14 2.36-1.6.71.1 1.44.16 2.21.16 5.52 0 10-4.19 10-9.33S17.52 2 12 2z" />
                </svg>
                【必須】LINE公式アカウントを友だち追加する
              </a>

              <p className="-mt-5 mb-8 text-center text-sm font-bold leading-relaxed text-omame-deep md:-mt-7 md:mb-10">
                ※LINE追加後、下のお名前・メールアドレス登録へお進みください。
              </p>

              <div className="flex items-center gap-4 mb-8 md:mb-10">
                <div className="flex-1 h-px bg-omame-gold/30" />
                <span className="text-sm text-omame-text/80 font-sans font-bold tracking-wider shrink-0">STEP2 お名前・メール登録へ</span>
                <div className="flex-1 h-px bg-omame-gold/30" />
              </div>

              {/* 登録フォーム */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-omame-deep mb-2 font-sans">
                    <User className="w-4 h-4 text-omame-primary" />
                    お名前
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：山田 花子"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-omame-gold/40 rounded-2xl px-5 py-4 text-omame-text placeholder:text-omame-text/30 focus:outline-none focus:ring-2 focus:ring-omame-gold/50 focus:border-transparent transition-all bg-white font-sans"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-omame-deep mb-2 font-sans">
                    <Mail className="w-4 h-4 text-omame-primary" />
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="例：hanako@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-omame-gold/40 rounded-2xl px-5 py-4 text-omame-text placeholder:text-omame-text/30 focus:outline-none focus:ring-2 focus:ring-omame-gold/50 focus:border-transparent transition-all bg-white font-sans"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl font-sans">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full block bg-gradient-to-r from-omame-primary to-omame-deep text-white font-bold text-lg py-5 px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-sans tracking-widest disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? "送信中..." : "登録して特典を受け取る →"}
                </button>

                <p className="text-xs text-omame-text/40 text-center leading-relaxed font-sans">
                  登録情報は第三者に提供することはありません。いつでも配信停止できます。
                </p>
              </form>

              <div className="mt-10 md:mt-12 pt-8 border-t border-omame-gold/20 text-center">
                <p className="text-omame-primary font-medium text-lg leading-loose">
                  一緒に、魂がよろこぶ音の世界を<br />創っていけることを楽しみにしています。
                </p>
                <p className="text-omame-text/50 mt-4 font-serif">
                  <Heart className="inline w-4 h-4 fill-omame-primary/40 text-omame-primary/40 mb-0.5 mr-1" />
                  たちえりな
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-omame-text text-white/50 py-12 text-center font-sans">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <p className="text-sm tracking-widest">© OMAME SOHO LAB. / たちえりな</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <Link href={`/${lang}/tokutei`} className="inline-flex items-center min-h-[44px] px-1 hover:text-white transition-colors">特定商取引法に基づく表記</Link>
            <Link href={`/${lang}/privacy`} className="inline-flex items-center min-h-[44px] px-1 hover:text-white transition-colors">プライバシーポリシー</Link>
            <Link href={`/${lang}/terms`} className="inline-flex items-center min-h-[44px] px-1 hover:text-white transition-colors">利用規約</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
