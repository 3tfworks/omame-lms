"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Sparkles, BookOpen, MessageSquare, ChevronRight, Check } from "lucide-react";
import Player from "@vimeo/player";
import { PixieDust } from "@/components/decorations/PixieDust";
import { Watermark } from "@/components/decorations/Watermark";

export function InteractiveLMSDemo() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "fusen" | "theme">("dictionary");
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // テーマ切り替えステート
  const [isMagicTheme, setIsMagicTheme] = useState(true);

  // ダミーのタイムスタンプデータ
  const timestamps = [
    { time: "00:00", seconds: 0, desc: "オープニング：今日のテーマ" },
    { time: "02:15", seconds: 135, desc: "ピアノの音を決める「打鍵スピード」の解説" },
    { time: "05:30", seconds: 330, desc: "【実演】力で弾いた音と、スピードで弾いた音の違い" },
  ];

  // みんなの付箋（ダミーデータ）
  const fusens = [
    { showAt: 3, text: "あ！手首の力が完全に抜けてる…！", author: "Aさん" },
    { showAt: 10, text: "「重力に従う」ってこういうことか！", author: "Bさん" },
    { showAt: 140, text: "ここ、今までの弾き方と全然違う。", author: "Cさん" },
  ];

  // 現在表示すべき付箋
  const [activeFusens, setActiveFusens] = useState<{ text: string; author: string }[]>([]);

  useEffect(() => {
    if (iframeRef.current && !player) {
      const vimeoPlayer = new Player(iframeRef.current);
      setPlayer(vimeoPlayer);

      vimeoPlayer.on("timeupdate", (data) => {
        setCurrentTime(data.seconds);
      });
    }
  }, [player]);

  // 時間に応じて付箋をポップアップさせるロジック
  useEffect(() => {
    if (activeTab === "fusen") {
      const current = fusens.filter(f => currentTime >= f.showAt && currentTime < f.showAt + 5);
      setActiveFusens(current.map(f => ({ text: f.text, author: f.author })));
    } else {
      setActiveFusens([]);
    }
  }, [currentTime, activeTab]);

  const handleJump = (seconds: number) => {
    if (player) {
      player.setCurrentTime(seconds);
      player.play();
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl transition-colors duration-1000 border ${isMagicTheme ? 'bg-omame-bg border-omame-primary/30' : 'bg-slate-50 border-slate-200'} relative`}>
      
      {/* 動的テーマ（魔法の図書館モード）の装飾 */}
      {isMagicTheme && (
        <>
          <PixieDust particleCount={20} color="bg-omame-gold" className="opacity-80" />
          <Watermark imageUrl="/images/decorations/feather-watermark.png" position="right" opacity={0.03} />
        </>
      )}

      {/* ヘッダー（タブ切り替え） */}
      <div className={`flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-b relative z-10 ${isMagicTheme ? 'border-omame-primary/20' : 'border-slate-200'}`}>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar mb-4 md:mb-0">
          <button 
            onClick={() => setActiveTab("dictionary")}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === "dictionary" ? (isMagicTheme ? 'bg-omame-primary text-white shadow-md' : 'bg-blue-600 text-white shadow-md') : (isMagicTheme ? 'text-omame-text hover:bg-omame-accent/50' : 'text-slate-600 hover:bg-slate-100')}`}
          >
            <Sparkles className="inline-block w-4 h-4 mr-2" />
            魔法の辞書（ジャンプ）体験
          </button>
          <button 
            onClick={() => setActiveTab("fusen")}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === "fusen" ? (isMagicTheme ? 'bg-omame-primary text-white shadow-md' : 'bg-blue-600 text-white shadow-md') : (isMagicTheme ? 'text-omame-text hover:bg-omame-accent/50' : 'text-slate-600 hover:bg-slate-100')}`}
          >
            <MessageSquare className="inline-block w-4 h-4 mr-2" />
            みんなの付箋体験
          </button>
          <button 
            onClick={() => setActiveTab("theme")}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === "theme" ? (isMagicTheme ? 'bg-omame-primary text-white shadow-md' : 'bg-blue-600 text-white shadow-md') : (isMagicTheme ? 'text-omame-text hover:bg-omame-accent/50' : 'text-slate-600 hover:bg-slate-100')}`}
          >
            <BookOpen className="inline-block w-4 h-4 mr-2" />
            テーマ着せ替え体験
          </button>
        </div>
      </div>

      {/* メイン画面（デモの中身） */}
      <div className="p-4 md:p-8 relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* 左側：動画エリア */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black aspect-video group">
            {/* Vimeo Player */}
            <iframe 
              ref={iframeRef}
              src="https://player.vimeo.com/video/76979871?h=8272103f6e&title=0&byline=0&portrait=0" 
              className="absolute top-0 left-0 w-full h-full" 
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture" 
              allowFullScreen
            ></iframe>
            
            {/* 付箋ポップアップUI */}
            {activeTab === "fusen" && activeFusens.map((f, i) => (
              <div 
                key={i} 
                className="absolute right-4 bottom-16 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-2xl animate-fade-in-up border-l-4 border-amber-400 max-w-[200px]"
              >
                <p className="text-xs font-bold text-stone-500 mb-1">{f.author}の付箋</p>
                <p className="text-sm font-medium text-stone-800">{f.text}</p>
              </div>
            ))}
          </div>
          
          {/* 進捗バーのモック */}
          <div className="flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-stone-200">
            <button className="bg-stone-800 text-white p-2 rounded-lg hover:bg-stone-700 transition-colors">
              <Play className="w-4 h-4" fill="currentColor" />
            </button>
            <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 w-1/3"></div>
            </div>
            <span className="text-xs font-bold text-stone-500">15 / 44 本完了</span>
          </div>
        </div>

        {/* 右側：インタラクションエリア */}
        <div className="lg:col-span-2">
          
          {/* タブ1: 魔法の辞書（ジャンプ） */}
          {activeTab === "dictionary" && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-6 rounded-2xl ${isMagicTheme ? 'bg-white/80 border border-omame-primary/20' : 'bg-white border border-slate-200'} shadow-sm`}>
                <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isMagicTheme ? 'text-omame-text' : 'text-slate-800'}`}>
                  <Sparkles className={isMagicTheme ? 'text-omame-primary' : 'text-blue-500'} />
                  魔法の辞書（動画の目次）
                </h3>
                <p className={`text-sm mb-6 ${isMagicTheme ? 'text-omame-text/70' : 'text-slate-500'}`}>
                  下の目次をクリックすると、魔法のように**その秒数へジャンプ**して動画が再生されます。もう「あの解説どこだっけ？」と探す必要はありません。
                </p>
                <div className="space-y-3">
                  {timestamps.map((ts, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleJump(ts.seconds)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${isMagicTheme ? 'bg-white hover:border-omame-primary border border-omame-primary/10 shadow-sm' : 'bg-slate-50 hover:border-blue-500 border border-slate-200'}`}
                    >
                      <span className={`font-mono font-bold px-2 py-1 rounded text-xs shrink-0 ${isMagicTheme ? 'bg-omame-accent/50 text-omame-primary' : 'bg-blue-100 text-blue-700'}`}>
                        {ts.time}
                      </span>
                      <span className={`text-sm font-medium ${isMagicTheme ? 'text-omame-text' : 'text-slate-700'}`}>{ts.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* タブ2: みんなの付箋 */}
          {activeTab === "fusen" && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-6 rounded-2xl ${isMagicTheme ? 'bg-white/80 border border-omame-primary/20' : 'bg-white border border-slate-200'} shadow-sm`}>
                <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isMagicTheme ? 'text-omame-text' : 'text-slate-800'}`}>
                  <MessageSquare className={isMagicTheme ? 'text-omame-primary' : 'text-blue-500'} />
                  みんなで作る魔法の辞書
                </h3>
                <p className={`text-sm mb-6 ${isMagicTheme ? 'text-omame-text/70' : 'text-slate-500'}`}>
                  左の動画を再生してみてください（音が出ます）。数秒待つと、他の生徒が残した**「気づきの付箋」**が動画上に浮かび上がります。<br/><br/>
                  あなたが一人の悩みを解決する付箋を貼れば、それがみんなの「魔法の辞書」の一部になり、未来の誰かを救います。
                </p>
                <div className={`p-4 rounded-xl ${isMagicTheme ? 'bg-omame-accent/30' : 'bg-blue-50'}`}>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Check className="text-green-500 w-4 h-4" />
                    孤独な通信講座はもう終わりです。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* タブ3: テーマ着せ替え */}
          {activeTab === "theme" && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-6 rounded-2xl ${isMagicTheme ? 'bg-white/80 border border-omame-primary/20' : 'bg-white border border-slate-200'} shadow-sm`}>
                <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isMagicTheme ? 'text-omame-text' : 'text-slate-800'}`}>
                  <BookOpen className={isMagicTheme ? 'text-omame-primary' : 'text-blue-500'} />
                  SaaSテナント着せ替え機能
                </h3>
                <p className={`text-sm mb-6 ${isMagicTheme ? 'text-omame-text/70' : 'text-slate-500'}`}>
                  このLMSは、あなたのビジネスに合わせて「デザイン」と「デコレーション（装飾）」を一瞬で着せ替えることができます。<br/>
                  下のスイッチを押してみてください。
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setIsMagicTheme(true)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isMagicTheme ? 'border-omame-primary bg-omame-accent/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className="text-left">
                      <p className="font-bold">基礎講座モード</p>
                      <p className="text-xs text-stone-500">お豆サロン用。魔法の粉が舞います。</p>
                    </div>
                    {isMagicTheme && <Check className="text-omame-primary" />}
                  </button>
                  
                  <button 
                    onClick={() => setIsMagicTheme(false)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${!isMagicTheme ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className="text-left">
                      <p className="font-bold">ビジネスモード</p>
                      <p className="text-xs text-slate-500">装飾なしのシンプルなデザイン。</p>
                    </div>
                    {!isMagicTheme && <Check className="text-blue-500" />}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
