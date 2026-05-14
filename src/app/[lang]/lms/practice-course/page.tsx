"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export default function PracticeCoursePage() {
  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* 戻るリンク */}
      <Link href="/ja/lms" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-8">
        <ChevronLeft size={16} />
        ホームに戻る
      </Link>

      {/* --- セクション1: 感謝と振り返り --- */}
      <section className="mb-16">
        <p className="text-center text-sm text-amber-600 font-bold tracking-widest uppercase mb-6">
          Thank You
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 text-center leading-relaxed mb-10">
          ここまで、<br />
          <span className="text-amber-700">『おうちで学べるお豆奏法基礎講座』</span><br />
          をご覧いただき、<br />
          本当にありがとうございました。
        </h1>

        <div className="space-y-6 text-stone-600 leading-[2]">
          <p>
            ここまで進まれた方は、きっと既に、
          </p>

          <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100 space-y-3">
            {[
              "今までとの感覚の違い",
              "音の変化",
              "無理に頑張らなくても弾ける感覚",
              "\"自然に任せる\"という意味",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-amber-600 font-bold mt-0.5 shrink-0">✔</span>
                <span className="text-stone-700">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-stone-700 font-medium text-lg leading-relaxed pt-2">
            その片鱗を、<br />
            感じてくださったのではないかと思います。
          </p>
        </div>
      </section>

      {/* --- 装飾ライン --- */}
      <div className="flex items-center justify-center mb-16">
        <div className="h-px w-16 bg-stone-200" />
        <span className="mx-4 text-stone-300 text-xl">❋</span>
        <div className="h-px w-16 bg-stone-200" />
      </div>

      {/* --- セクション2: 共感（悩み） --- */}
      <section className="mb-16">
        <div className="space-y-6 text-stone-600 leading-[2]">
          <p>
            ただ、人によっては、もしかすると、
          </p>

          <div className="space-y-4 pl-2">
            {[
              "「この先が知りたい」",
              "「分かった気はするけれど、合っているか分からない。」",
              "「弾ける時と戻る時の差がある」",
              "「自分ではズレに気付きにくい」",
            ].map((item, i) => (
              <p key={i} className="text-stone-700 font-medium text-lg">
                {item}
              </p>
            ))}
          </div>

          <p className="pt-4">
            という感覚もあるかもしれません。
          </p>
        </div>
      </section>

      {/* --- セクション3: 原因の説明（安心させる） --- */}
      <section className="mb-16">
        <div className="space-y-6 text-stone-600 leading-[2]">
          <p>
            それは、<br />
            <span className="text-stone-800 font-bold">できていないからではなく、</span>
          </p>

          <div className="bg-stone-50 rounded-xl p-6 lg:p-8 border border-stone-200">
            <p className="text-stone-700 leading-[2] text-center">
              長年積み重ねてきた身体の使い方や感覚が、<br />
              まだ新しい感覚と<span className="font-bold text-stone-800">入れ替わっている途中</span>だからです。
            </p>
          </div>

          <p>
            だからこそ、お豆奏法は、
          </p>
          <p>
            <span className="text-stone-400">"知識を増やす"だけではなく、</span>
          </p>
          <p className="text-stone-700 font-medium">
            実際に弾きながら、<br />
            身体の感覚として<span className="underline decoration-amber-300 decoration-2 underline-offset-4">自然に定着させていく</span>ことが、<br />
            とても大切になります。
          </p>
        </div>
      </section>

      {/* --- 装飾ライン --- */}
      <div className="flex items-center justify-center mb-16">
        <div className="h-px w-16 bg-stone-200" />
        <span className="mx-4 text-stone-300 text-xl">❋</span>
        <div className="h-px w-16 bg-stone-200" />
      </div>

      {/* --- セクション4: 講座紹介 --- */}
      <section className="mb-16">
        <div className="space-y-6 text-stone-600 leading-[2]">
          <p>
            もしも、
          </p>
          <div className="space-y-2 pl-2 text-stone-700 font-medium">
            <p>実際に見てもらいたい、</p>
            <p>判断してもらいたい、</p>
            <p>対面で教えてもらいたい、</p>
          </div>
          <p>
            そんな気持ちが湧いていたら、
          </p>
          <p>
            そんな方に向けて、
          </p>
          <p>
            動画講座のその先として、
          </p>
        </div>

        {/* 講座名の見出し */}
        <div className="my-10 text-center">
          <div className="inline-block bg-gradient-to-br from-stone-800 to-stone-900 text-white rounded-2xl px-8 py-6 lg:px-12 lg:py-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-amber-400 text-xs font-bold tracking-widest mb-2">4ヶ月間の集中プログラム</p>
              <h2 className="text-xl lg:text-2xl font-bold leading-relaxed">
                お豆奏法<br />基礎実践講座
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-stone-600 leading-[2]">
          <p className="text-center">
            をご用意しました。
          </p>
        </div>
      </section>

      {/* --- セクション5: 講座の内容 --- */}
      <section className="mb-16">
        <div className="space-y-6 text-stone-600 leading-[2]">
          <p>
            この講座では、
          </p>
          <p>
            オンラインで実際にやり取りをしながら、
          </p>

          <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100 space-y-3">
            {[
              "今どこでズレているのか",
              "どうすると自然に戻れるのか",
              "力みが生まれる瞬間",
              "音が変わる身体の使い方",
              "練習の中での整え方",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-amber-600 font-bold mt-0.5 shrink-0">✔</span>
                <span className="text-stone-700">{item}</span>
              </div>
            ))}
          </div>

          <p>
            などを、
          </p>
          <p className="text-stone-700 font-medium">
            実践を通して、<br />
            私、<span className="font-bold text-stone-800">舘えりな</span>と一緒に深めていきます。
          </p>
        </div>
      </section>

      {/* --- セクション6: 変化の約束 --- */}
      <section className="mb-16">
        <div className="space-y-6 text-stone-600 leading-[2]">
          <div className="text-center space-y-2">
            <p className="text-stone-400">
              動画で「理解する」から、
            </p>
            <p className="text-stone-800 font-bold text-xl">
              実際に「自然にできる」へ。
            </p>
          </div>

          <p className="text-center pt-2">
            ここで大きく変わっていく方が<br />
            本当にたくさんいらっしゃいます。
          </p>
        </div>
      </section>

      {/* --- 装飾ライン --- */}
      <div className="flex items-center justify-center mb-16">
        <div className="h-px w-16 bg-stone-200" />
        <span className="mx-4 text-stone-300 text-xl">❋</span>
        <div className="h-px w-16 bg-stone-200" />
      </div>

      {/* --- セクション7: CTA --- */}
      <section className="text-center">
        <div className="space-y-6 text-stone-600 leading-[2] mb-10">
          <p>
            もし今、
          </p>
          <div className="space-y-2 text-stone-700 font-medium text-lg">
            <p>「もっと深く掴みたい」</p>
            <p>「実践の中で定着させたい」</p>
            <p>「一人では気付きにくい部分を見てほしい」</p>
          </div>
          <p>
            そんな感覚がある方は、
          </p>
          <p className="text-stone-800 font-bold text-lg pt-2">
            ぜひ、この4ヶ月を<br />
            ご一緒できたら嬉しいです。
          </p>
        </div>

        {/* CTAボタン */}
        <div className="space-y-4">
          <a
            href="#apply"
            className="inline-flex items-center gap-3 bg-stone-800 text-white font-bold py-5 px-10 rounded-full text-lg hover:bg-stone-700 transition-all shadow-xl group"
          >
            基礎実践講座に申し込む
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-xs text-stone-400">
            ※ お申し込み後、詳細のご案内をお送りいたします。
          </p>
        </div>

        {/* えりな先生の署名 */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
            <span className="text-lg">🎹</span>
          </div>
          <span className="text-sm text-stone-500 font-medium">舘えりな</span>
        </div>
      </section>

    </div>
  );
}
