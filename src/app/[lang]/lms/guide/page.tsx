"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, Play, FileText, CheckSquare, BookOpen, 
  ChevronRight, MapPin, Lightbulb, ArrowRight, Music,
  Heart, Eye, Hand
} from "lucide-react";
import { curriculumData } from "@/lib/lmsData";

export default function GuidePage() {
  // 各章のアイコンと概要を定義
  const chapterMeta: Record<string, { icon: string; summary: string }> = {
    "chapter-1": {
      icon: "🌱",
      summary: "お豆奏法が生まれた背景と、「あわい」という核心コンセプト。従来の常識を覆す発想の原点に触れます。"
    },
    "chapter-2": {
      icon: "🎹",
      summary: "ハンマーが弦を打つ「一点」を感じるタッチ。ピアノの内部構造を理解し、お豆奏法の核心に迫ります。"
    },
    "chapter-3": {
      icon: "🔔",
      summary: "音が鳴る仕組みと鍵盤の本当の扱い方。打楽器としてのピアノを理解し、響かせる打ち方を学びます。"
    },
    "chapter-4": {
      icon: "✨",
      summary: "最小の動きで最大限に鳴らす省エネ打鍵術。鍵盤近くで音をコントロールする技術を身につけます。"
    },
    "chapter-5": {
      icon: "🪨",
      summary: "重力に委ねる座り方と体の使い方。地球の重力に逆らわない、自然体の演奏姿勢を探ります。"
    },
    "chapter-6": {
      icon: "🤲",
      summary: "重力で弾く原理と自然体の手・指の作り方。腕の重さで鍵盤を下げる実践テクニックを学びます。"
    },
    "chapter-final": {
      icon: "🏁",
      summary: "お豆奏法の総仕上げ。学んだことを振り返り、「頑張るピアノ」に戻らないための心構えを確認します。"
    }
  };

  return (
    <div className="space-y-12 pb-16 max-w-3xl mx-auto">

      {/* 1. ようこそメッセージ */}
      <section className="relative bg-gradient-to-br from-amber-50 via-[#faf9f6] to-orange-50/30 rounded-2xl p-8 lg:p-10 border border-amber-200/50 overflow-hidden">
        {/* 装飾 */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 text-amber-700">
            <Music size={20} />
            <span className="text-sm font-bold tracking-widest uppercase">Welcome</span>
          </div>
          
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-6 leading-relaxed">
            ようこそ、<br className="sm:hidden" />お豆奏法の世界へ
          </h1>
          
          <div className="space-y-4 text-stone-600 leading-relaxed">
            <p>
              この講座にお申し込みいただき、本当にありがとうございます。
            </p>
            <p>
              ここでは、ピアノを弾くための「本当の身体の使い方」と「音の鳴る仕組み」を、
              基礎から順を追って丁寧にお伝えしていきます。
            </p>
            <p className="font-medium text-stone-700">
              どうか焦らず、ご自身のペースで、一つ一つの感覚を大切にしながら進めてくださいね。
            </p>
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-amber-200 shadow-sm">
              <span className="text-lg">🎹</span>
            </div>
            <span className="text-sm font-medium text-stone-500">たちえりな</span>
          </div>
        </div>
      </section>

      {/* 2. お豆奏法ってなに？ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xl">🌱</span>
          </div>
          <h2 className="text-xl font-bold text-stone-800">お豆奏法ってなに？</h2>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm space-y-4">
          <p className="text-stone-600 leading-relaxed">
            お豆奏法は、テクニックや弾き方の「方法論」ではありません。
          </p>
          <div className="grid gap-3">
            {[
              { icon: <Hand size={18} className="text-amber-600" />, text: "力を抜き、身体の自然な状態を取り戻す" },
              { icon: <Eye size={18} className="text-amber-600" />, text: "ピアノの仕組みを知り、音の鳴る原理を理解する" },
              { icon: <Heart size={18} className="text-amber-600" />, text: "ピアノと「共鳴」する感覚で、音が変わる体験をする" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-lg">
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <span className="text-stone-700 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          <p className="text-stone-500 text-sm pt-2 border-t border-stone-100">
            「どれだけ練習しても変わらない」「力んでしまう」——そんな悩みの根本にある
            <strong className="text-stone-700">「やり方」そのもの</strong>を見直すのが、お豆奏法の考え方です。
          </p>
        </div>
      </section>

      {/* 3. この講座の進め方 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xl">📖</span>
          </div>
          <h2 className="text-xl font-bold text-stone-800">この講座の進め方</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              step: 1,
              icon: <Play size={20} />,
              title: "動画を見る",
              desc: "各レッスンの動画を視聴します。えりな先生が丁寧に解説してくれるので、まずはリラックスして見てみましょう。",
              color: "bg-blue-50 text-blue-600 border-blue-200"
            },
            {
              step: 2,
              icon: <FileText size={20} />,
              title: "レバレッジメモで要点を確認",
              desc: "動画の下にある「レバレッジメモ」で、各動画の要約・重要ポイント・タイムラインをいつでも振り返ることができます。",
              color: "bg-emerald-50 text-emerald-600 border-emerald-200"
            },
            {
              step: 3,
              icon: <CheckSquare size={20} />,
              title: "行動リストにチェック ✅",
              desc: "レバレッジメモの中にある「行動リスト」を実践し、チェックを入れていきましょう。お豆が弾けるアニメーションが表示されます🌱",
              color: "bg-amber-50 text-amber-600 border-amber-200"
            },
            {
              step: 4,
              icon: <BookOpen size={20} />,
              title: "マイノートに記録",
              desc: "チェックした内容は「マイノート」に自動的に記録されます。学習の振り返りにぜひご活用ください。",
              color: "bg-purple-50 text-purple-600 border-purple-200"
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              {/* ステップ番号 */}
              <div className="shrink-0 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${item.color}`}>
                  {item.icon}
                </div>
                {item.step < 4 && (
                  <div className="w-px h-4 bg-stone-200 mt-1" />
                )}
              </div>
              
              {/* 説明 */}
              <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-stone-400 uppercase">Step {item.step}</span>
                </div>
                <h3 className="font-bold text-stone-800 mb-1">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. カリキュラム全体マップ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xl">🗺️</span>
          </div>
          <h2 className="text-xl font-bold text-stone-800">カリキュラム全体マップ</h2>
        </div>

        <div className="space-y-3">
          {curriculumData.map((chapter, index) => {
            const meta = chapterMeta[chapter.id];
            return (
              <div
                key={chapter.id}
                className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:border-amber-300 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {meta?.icon || "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 text-sm leading-snug mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-stone-400 mb-2">
                      {chapter.videos.length}本の動画
                    </p>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      {meta?.summary || ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. 学習のコツ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xl">💡</span>
          </div>
          <h2 className="text-xl font-bold text-stone-800">学習のコツ</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "1日1動画でOK",
              desc: "たくさん見る必要はありません。1日1本、じっくり味わうペースで十分です。",
              emoji: "☕"
            },
            {
              title: "完璧を目指さない",
              desc: "「すぐにできなくても大丈夫」。感覚は少しずつ育っていくものです。",
              emoji: "🌿"
            },
            {
              title: "ピアノの前で試す",
              desc: "行動リストはぜひピアノの前で実践を。体感することが一番の学びです。",
              emoji: "🎵"
            },
            {
              title: "繰り返し見てOK",
              desc: "同じ動画を何度見ても構いません。見るたびに新しい気づきが生まれます。",
              emoji: "🔄"
            },
          ].map((tip, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
              <div className="text-2xl mb-3">{tip.emoji}</div>
              <h3 className="font-bold text-stone-800 mb-1">{tip.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CTA */}
      <section className="text-center">
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-8 lg:p-10 text-white relative overflow-hidden">
          {/* 装飾 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <Sparkles className="w-10 h-10 mx-auto text-amber-400 mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-3">さあ、はじめましょう！</h2>
            <p className="text-stone-300 mb-8 leading-relaxed max-w-md mx-auto">
              最初の動画は、お豆奏法が生まれた原点のお話です。<br />
              えりな先生の物語を、リラックスしてお楽しみください。
            </p>
            
            <Link
              href="/ja/lms/video/video-1188100383"
              className="inline-flex items-center gap-3 bg-white text-stone-800 font-bold py-4 px-8 rounded-full text-lg hover:bg-amber-50 transition-colors shadow-lg group"
            >
              <Play size={22} fill="currentColor" className="text-amber-600" />
              第1章の最初の動画を見る
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
