"use client";

import React from "react";
import Link from "next/link";
import { Star, Play, ThumbsUp, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BookmarksGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* ヒーローセクション */}
      <div className="text-center space-y-4 pt-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Star size={40} className="text-amber-500" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-800">
          みんなの付箋とは？
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          「みんなの付箋」は、動画を見ている最中に得た「気づき」や「メモ」を、
          動画の秒数と一緒にコミュニティ全体に共有できる新しい機能です。
        </p>
      </div>

      {/* 3つのメリット */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={24} />
          </div>
          <h3 className="font-bold text-stone-800 mb-2">他者の気づきから学ぶ</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            一人で学んでいると見落としがちな視点も、他の受講生のリアルなつまずきや感覚の言語化を見ることで、新しい気づきを得られます。
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play size={24} />
          </div>
          <h3 className="font-bold text-stone-800 mb-2">ワンクリックで復習</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            付箋についている時間のボタンを押すだけで、動画が自動的にそのシーンまで早送りされて再生されます。
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp size={24} />
          </div>
          <h3 className="font-bold text-stone-800 mb-2">助かった！を贈る</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            他の人の付箋を見て参考になったら、「助かった！」ボタンを押して感謝を伝えましょう。モチベーションの輪が広がります。
          </p>
        </div>
      </div>

      {/* 使い方のステップ */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-stone-200 shadow-sm">
        <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">使い方はとっても簡単</h2>
        
        <div className="space-y-12">
          {/* STEP 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-block bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-sm">STEP 1</div>
              <h3 className="text-xl font-bold text-stone-800">動画を見ながらボタンを押す</h3>
              <p className="text-stone-600 leading-relaxed">
                動画を見ていて「ここが腑に落ちた！」「こういうことか！」と感じた瞬間に、プレイヤーの下にある <strong>「今のシーンに付箋を貼る」</strong> ボタンを押します。<br/>
                （今の再生時間が自動的にセットされます）
              </p>
            </div>
            <div className="flex-1 w-full bg-stone-100 rounded-2xl p-6 border border-stone-200 flex items-center justify-center">
              <button className="bg-white border-2 border-[#b8a98f] text-[#b8a98f] font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm pointer-events-none">
                <Star size={20} />
                今のシーンに付箋を貼る
              </button>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-block bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-sm">STEP 2</div>
              <h3 className="text-xl font-bold text-stone-800">気づきを入力して投稿</h3>
              <p className="text-stone-600 leading-relaxed">
                開いたフォームに、そのシーンでの気づきやメモを入力して投稿します。<br/>
                投稿者の名前には、マイページで設定した「表示名（ニックネーム）」が使われます。
              </p>
            </div>
            <div className="flex-1 w-full bg-stone-100 rounded-2xl p-6 border border-stone-200">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[#b8a98f] font-bold text-sm">
                  <Star size={16} /> 04:15 に付箋を貼る
                </div>
                <div className="h-16 bg-stone-50 border border-stone-200 rounded-lg mb-2 p-2 text-stone-400 text-sm">
                  手首の力を抜くってこういうことか！
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#b8a98f] text-white px-4 py-1.5 rounded-lg font-bold text-sm">
                    付箋を投稿する
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-block bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-sm">STEP 3</div>
              <h3 className="text-xl font-bold text-stone-800">タブからみんなの付箋を見る</h3>
              <p className="text-stone-600 leading-relaxed">
                動画下部のタブメニューから「みんなの付箋」を選ぶと、その動画についた付箋が一覧で表示されます。時間のボタンを押すと、そのシーンにジャンプします。
              </p>
            </div>
            <div className="flex-1 w-full bg-stone-100 rounded-2xl p-6 border border-stone-200">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#b8a98f]">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    <Play size={10} /> 04:15
                  </div>
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Kさん</span>
                </div>
                <p className="text-stone-800 text-sm font-medium mb-2">手首の力を抜くってこういうことか！</p>
                <div className="flex justify-end border-t border-stone-100 pt-2">
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <ThumbsUp size={12} /> 助かった！ 3
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* フッターアクション */}
      <div className="text-center pt-8">
        <Link href="/ja/lms" className="inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-white font-bold py-4 px-8 rounded-full transition-all shadow-md hover:shadow-lg">
          <CheckCircle2 size={20} />
          さっそく基礎講座の動画を見てみる
        </Link>
      </div>
    </div>
  );
}
