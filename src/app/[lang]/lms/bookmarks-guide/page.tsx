"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";

// 各ステップのデータ定義
const steps = [
  {
    number: "01",
    title: "他人の気づきから学ぶ",
    description: "「みんなの付箋」では、同じ動画を見た他の受講生が、どの瞬間に何を感じたかを共有しています。自分では気づかなかった視点やポイントに出会えます。",
    image: "/images/bookmarks-guide-01.png",
  },
  {
    number: "02",
    title: "ワンクリックで復習",
    description: "付箋に表示されている時間ボタンを押すだけで、その動画の該当シーンにジャンプできます。気になるポイントをすぐに確認できるので、復習がとてもスムーズです。",
    image: "/images/bookmarks-guide-02.png",
  },
  {
    number: "03",
    title: "みんなの付箋が一覧で見られる",
    description: "動画下部のタブメニューから「みんなの付箋」を選ぶと、その動画について投稿された付箋が一覧で表示されます。時間のボタンを押すと、該当のシーンにジャンプできます。",
    image: "/images/bookmarks-guide-03.png",
  },
  {
    number: "04",
    title: "「助かった！」を贈る",
    description: "他の人の付箋を見て「これは参考になった！」と思ったら、「助かった！」ボタンを押して共感を伝えましょう。みんなの力で、特に役立つ付箋が見つけやすくなります。",
    image: "/images/bookmarks-guide-04.png",
  },
];

export default function BookmarksGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-24">
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

      {/* ステップ一覧（1枚ずつ大きく表示） */}
      <div className="space-y-16">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-6"
          >
            {/* ステップ番号とタイトル */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d4c5b0] text-white font-bold text-lg flex items-center justify-center shrink-0">
                {step.number}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-800">
                  {step.title}
                </h2>
                <p className="text-stone-600 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* 図解画像（大きく表示） */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <Image 
                src={step.image} 
                alt={`${step.title}の図解`} 
                width={1200} 
                height={600} 
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* フッターアクション */}
      <div className="text-center pt-8 border-t border-stone-200">
        <Link href="/ja/lms" className="inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-white font-bold py-4 px-8 rounded-full transition-all shadow-md hover:shadow-lg">
          <CheckCircle2 size={20} />
          さっそく基礎講座の動画を見てみる
        </Link>
      </div>
    </div>
  );
}
