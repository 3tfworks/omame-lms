"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Star } from "lucide-react";
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

      {/* 図解画像 */}
      <div className="w-full bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {/*
          TODO: ユーザーが提供した画像を public/images/bookmarks-guide.png に保存してください。
        */}
        <Image 
          src="/images/bookmarks-guide.png" 
          alt="みんなの付箋の使い方ガイド図解" 
          width={1200} 
          height={800} 
          className="w-full h-auto object-contain"
          priority
        />
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
