"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

// 区切り線コンポーネント
function Divider() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-px w-16 bg-stone-200" />
      <span className="mx-4 text-stone-300 text-xl">⸻</span>
      <div className="h-px w-16 bg-stone-200" />
    </div>
  );
}

// チェックリストコンポーネント
function CheckList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3 text-left max-w-lg mx-auto">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="text-amber-600 font-bold mt-0.5 shrink-0">✔</span>
          <span className="text-stone-700">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function OfferPage() {
  return (
    <div className="w-full bg-[#FAFAF8] text-stone-700 overflow-x-hidden selection:bg-amber-500 selection:text-white font-serif">

      {/* ナビバー */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/ja" className="text-sm text-stone-700 font-medium tracking-wider hover:opacity-80 transition-opacity">
            OMAME SOHO LAB.
          </Link>
        </div>
      </nav>

      {/* ===== ヒーロー ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Piano Background"
            fill
            className="object-cover opacity-[0.25] scale-105 filter sepia-[0.3]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/30 via-[#FAFAF8]/70 to-[#FAFAF8]" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 max-w-3xl mx-auto text-center px-6 pt-24"
        >
          <p className="text-4xl mb-8">🎹</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-[2] text-stone-800 mb-8">
            一生懸命やっているのに、<br />
            なぜかうまくいかない人へ
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 leading-relaxed mb-4">
            もう頑張らなくていい。
          </p>
          <p className="text-base sm:text-lg text-stone-500 leading-relaxed mt-6">
            「たった一つ」のことで、全てが同時に調います。
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16 text-stone-300 animate-bounce flex justify-center"
          >
            <ArrowDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 悩みリスト ===== */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="bg-white rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm">
              <CheckList items={[
                "練習しているのに上達しない",
                "力が抜けない",
                "音が外れる",
                "手が痛い・疲れる",
                "ジストニア、腱鞘炎、へバーデン結節など、手の病がある",
                "思い通りに弾けない",
                "音が響かない",
                "本番になると崩れる",
              ]} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="mt-12 space-y-8 text-center leading-[2]"
          >
            <p className="text-stone-600">
              ずっと頑張ってきた人ほど、<br />
              この状態にハマりやすいんです。
            </p>
            <p className="text-stone-500">
              ——もしひとつでも当てはまるなら、
            </p>
            <p className="text-xl font-bold text-stone-800">
              それ、あなたのせいじゃない。
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ===== 本当の原因 ===== */}
      <section className="py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center leading-[2]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-800">
              本当の原因は、たった一つ。
            </h2>
            <div className="space-y-4 text-stone-600">
              <p>それは、</p>
              <p>
                努力が足りないわけではなく、才能でもなく<br />
                もっと根本的な<span className="font-bold text-stone-800">"あるズレ"</span>です。
              </p>
            </div>

            <p className="text-stone-600 pt-4">
              そして——<br />
              その「たった一つ」を変えるだけで、
            </p>

            <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
              <CheckList items={[
                "テクニックの悩み",
                "脱力の問題",
                "表現の壁",
                "身体の不調",
                "本番の悩み",
                "生徒さんの悩み",
              ]} />
            </div>

            <p className="text-lg font-bold text-stone-800 pt-4">
              すべてが同時に整います。
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ===== お豆奏法とは ===== */}
      <section className="py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center leading-[2]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-8">
            <p className="text-3xl">🎼</p>
            <p className="text-stone-500">ピアノの常識を、根底から覆す</p>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800">
              「お豆奏法」
            </h2>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6 text-stone-600">
            <p>
              これは、<br />
              よくある"テクニック"ではありません。
            </p>
            <p>
              ピアノの構造、<br />
              身体の自然な感覚、<br />
              そして重力、
            </p>
            <p>
              全てに逆らわず、<br />
              そのまま預けるだけ。
            </p>
            <p className="font-medium text-stone-700">
              世の中の演奏法と真逆の、「本来の在り方」です。
            </p>

            <div className="pt-4 space-y-6">
              <p>
                そしてこの考え方は、
              </p>
              <p>
                これまで15年以上、<br />
                多くの方の演奏の変化を通して<br />
                繰り返し確かめられてきました。
              </p>
              <p className="font-medium text-stone-700">
                初めて体験したその場で<br />
                変化が起きることも少なくありません。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ===== セミナーの声 ===== */}
      <section className="py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="text-center text-stone-500 mb-8 leading-[2]">
              実際のセミナーでは、
            </p>
            <div className="bg-white rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm space-y-4">
              {[
                "目からウロコの連続でした",
                "今まで余計なことをしすぎていたと気づいた",
                "音がその場で変わった",
                "弾けなかったパッセージがいきなり弾けるようになった",
                "テンポが勝手に上がった",
                "とても楽に弾けるようになった",
                "ピアノがこんなに自由だと思わなかった",
                "もっと早く知りたかった",
                "今までの自分の演奏や指導を覆す、感動的な体験でした。",
              ].map((voice, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-amber-500 mt-0.5 shrink-0">●</span>
                  <span className="text-stone-700 leading-relaxed">{voice}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="mt-12 text-center leading-[2] space-y-6"
          >
            <p className="text-stone-600">そして、</p>
            <div className="bg-stone-50 rounded-xl p-6 md:p-8 border border-stone-200">
              <p className="text-stone-600 mb-3">
                何をしても改善されなかった
              </p>
              <p className="text-stone-800 font-bold text-lg">
                👉 ジストニアの方が
              </p>
              <p className="text-stone-800 font-bold text-lg mt-2">
                その場で症状が出ずに演奏できた。
              </p>
            </div>
            <p className="text-stone-600 font-medium">
              セミナー会場が涙に包まれました。
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ===== なぜそんなことが起きるのか ===== */}
      <section className="py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center leading-[2]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-8">
            <p className="text-3xl">💡</p>
            <h2 className="text-xl md:text-2xl font-bold text-stone-800">
              なぜそんなことが起きるのか？
            </h2>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-8 text-stone-600">
            <p>それは、</p>
            <p className="text-stone-400">
              「人が頑張って覚えた弾き方」ではなく
            </p>
            <p className="font-medium text-stone-700">
              ピアノの仕組みそのものに従っているから。<br />
              すべての自然の法則に従っているから。
            </p>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-8">
            <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
              <CheckList items={[
                "鍵盤はどう動くのか",
                "音はどう生まれるのか",
                "体は本来どうあるべきか",
              ]} />
            </div>
            <p className="text-stone-600">
              これを"本当の意味で理解する"と、
            </p>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-4">
            <p className="text-stone-800 font-bold text-lg">
              👉 何をすればいいかが<br />
              👉 勝手に分かるようになります
            </p>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
            <p className="text-stone-500">その結果…</p>
            <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
              <CheckList items={[
                "指が勝手に動く",
                "音が自然に歌い出す",
                "無理が一切なくなる",
                "練習が楽になる",
                "痛みがその場で出なくなる",
                "生徒さんの演奏が変わる",
                "レッスンが楽になる",
              ]} />
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ===== ピアノだけの話じゃない ===== */}
      <section className="py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center leading-[2]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-8">
            <p className="text-3xl">🌍</p>
            <h2 className="text-xl md:text-2xl font-bold text-stone-800">
              これは、ピアノだけの話じゃない
            </h2>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
            <p className="text-stone-500 mb-4">セミナーでは多くの方がこう言いました。</p>
            <div className="space-y-4">
              {[
                "「人生そのものに通じていると感じた」",
                "「身体の賢さに驚いた」",
                "「家族や人間関係が良くなった」",
              ].map((quote, i) => (
                <p key={i} className="text-stone-700 font-medium text-lg">
                  👉{quote}
                </p>
              ))}
            </div>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
            <p className="text-stone-600">
              無理をやめて、<br />
              本来の流れに戻る。
            </p>
            <p className="text-stone-600">
              それだけで、
            </p>
            <p className="text-lg font-bold text-stone-800">
              音も、身体も、人生も、整っていく。
            </p>
          </motion.div>

          <Divider />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="text-stone-500">
              これは知識を増やす話というより、<br />
              自分の感覚のズレに気づいていく話だから。
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ===== CTA（LINE登録） ===== */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 text-center leading-[2] space-y-8">
                <p className="text-3xl">🎹</p>
                <p className="text-stone-300">
                  ここまで読んでいただいて、<br />
                  お豆奏法が気になってきた方もいるかもしれませんね^_^
                </p>

                <div className="text-left bg-white/10 rounded-xl p-6 space-y-4">
                  <p className="text-white/90">この公式LINEでは</p>
                  <div className="space-y-2">
                    <p className="text-white/80">・頑張らなくても弾けるようになる感覚</p>
                    <p className="text-white/80">・音・身体・演奏が一気に整う"たった一つのポイント"</p>
                  </div>
                  <p className="text-white/90">
                    を、<br />
                    実際に変わった人の体験談を交えて<br />
                    順番にお届けしています。
                  </p>
                </div>

                <p className="text-amber-300 font-medium">
                  これは「学ぶ」というより、<br />
                  "気づいた瞬間に変わる"体験です。
                </p>

                <p className="text-xs text-stone-400">
                  ※この内容は、LINEでのみお届けしています。
                </p>

                {/* LINEボタン */}
                <a
                  href="https://www.kaihipay.jp/forms?form_code=3006074313979285"
                  className="inline-flex items-center gap-3 bg-[#06C755] text-white font-bold py-5 px-10 rounded-full text-lg hover:bg-[#05b34d] transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  公式LINEで受け取る
                </a>

                <div className="space-y-4 text-stone-300 text-sm leading-relaxed pt-4">
                  <p>
                    無理に変わる必要はありません。<br />
                    ただ、知るだけで自然に変わっていけるのです。
                  </p>
                  <p>
                    まずは少しだけ知ってみてください。<br />
                    いきなり弾き方を全部変える必要も、何かを決める必要もありません。
                  </p>
                  <p>
                    「少し気になるかも」と感じたなら、<br />
                    続きは、是非LINEで受け取ってくださいね^_^
                  </p>
                </div>

                <p className="text-amber-400/80 font-medium text-lg pt-4">
                  "次元の違う演奏"と"より幸せな人生"は、<br />
                  ほんの少しの気づきから始まります。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-stone-800 text-white/50 py-12 text-center font-sans">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <p className="text-sm tracking-widest">© 2026 OMAME SOHO LAB. All rights reserved.</p>
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
