"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle, XCircle, Clock, Video, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMsg, setIsLoadingMsg] = useState(true);

  // 初回ロード時にメッセージを取得
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch("/api/admin/message");
        if (res.ok) {
          const data = await res.json();
          setMessage(data.message);
        }
      } catch (e) {
        console.error("Failed to fetch message", e);
      } finally {
        setIsLoadingMsg(false);
      }
    };
    fetchMessage();
  }, []);

  const handleSaveMessage = async () => {
    if (!message.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("保存に失敗しました");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  // モックデータ：生徒から届いた付箋提案
  const pendingTags = [
    {
      id: "req-1",
      student: "A子さん",
      videoTitle: "第2章：ピアノの音を決めるのは「打鍵スピード」だけ",
      timestamp: "12:30",
      description: "フォルテを弾く時に手が痛くならない重力の乗せ方",
      category: "手が痛い",
    },
    {
      id: "req-2",
      student: "K先生",
      videoTitle: "第3章：脱力の本当の意味",
      timestamp: "05:15",
      description: "オクターブ連続で腕がパンパンになる時の対処法",
      category: "脱力",
    },
    {
      id: "req-3",
      student: "Sさん",
      videoTitle: "基礎講座・第1回",
      timestamp: "22:10",
      description: "暗譜が飛んでしまう原因は「指先の記憶」に頼るから",
      category: "暗譜",
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      
      {/* 1. 今日の一言（激励メッセージ）編集 */}
      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold text-stone-800 mb-2 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          生徒のみんなへ「今日の一言」を送る
        </h2>
        <p className="text-stone-500 mb-6">
          ここで書いたメッセージが、生徒全員のトップ画面に表示されます。「今日もお疲れ様！」など、温かい言葉でモチベーションを上げてあげましょう！
        </p>

        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoadingMsg || isSaving}
            className="w-full h-32 p-4 bg-[#faf9f6] border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8a98f] resize-none text-stone-800 text-lg leading-relaxed disabled:opacity-50"
            placeholder={isLoadingMsg ? "読み込み中..." : "例：今日も練習がんばってね！無理せず休むことも大切だよ。"}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">
              ※保存ボタンを押すと、すぐに全員の画面に反映されます。
            </span>
            <button 
              onClick={handleSaveMessage}
              disabled={isLoadingMsg || isSaving || !message.trim()}
              className={`font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 ${
                saved 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                  : "bg-stone-800 text-white hover:bg-stone-700"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  保存中...
                </>
              ) : saved ? (
                <>
                  <CheckCircle size={20} />
                  保存しました！
                </>
              ) : (
                <>
                  <Send size={20} />
                  メッセージを更新する
                </>
              )}
            </button>
          </div>
        </div>
      </section>


      {/* 2. 生徒からの付箋（タイムスタンプ）承認 */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              生徒から届いた「お豆ナビ」の提案
            </h2>
            <p className="text-stone-500 mt-1">
              生徒が動画を見て「ここ大事！」と付けた付箋です。「承認」を押すと、公式目次として全員に見えるようになります。
            </p>
          </div>
          <div className="bg-amber-100 text-amber-900 font-bold px-4 py-2 rounded-lg text-sm border border-amber-200 shadow-sm">
            未確認が {pendingTags.length} 件あります
          </div>
        </div>

        <div className="grid gap-4">
          {pendingTags.map((tag) => (
            <div key={tag.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col lg:flex-row gap-6 justify-between lg:items-center hover:border-[#d4c5b0] transition-colors">
              
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="bg-stone-100 text-stone-700 font-bold px-3 py-1 rounded-full text-sm">
                    {tag.student} さんからの提案
                  </span>
                  <span className="text-sm text-stone-400 flex items-center gap-1">
                    <Video size={14} /> {tag.videoTitle}
                  </span>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-[#faf9f6] border border-[#d4c5b0] text-amber-900 font-mono font-bold px-3 py-2 rounded-lg text-lg shrink-0 flex items-center gap-1">
                    <Clock size={18} />
                    {tag.timestamp}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800 leading-tight">
                      {tag.description}
                    </h3>
                    <div className="text-sm font-bold text-[#b8a98f] mt-1">
                      設定カテゴリ：【{tag.category}】
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 border-t lg:border-t-0 border-stone-100 pt-4 lg:pt-0 mt-2 lg:mt-0">
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#fcfbf9] text-stone-500 font-bold py-3 px-6 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors">
                  <XCircle size={20} />
                  非公開（自分専用にする）
                </button>
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-stone-800 text-white font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-stone-700 transition-colors">
                  <CheckCircle size={20} className="text-amber-400" />
                  承認（公式にする）
                </button>
              </div>

            </div>
          ))}

          {pendingTags.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-400">
              現在、新しい提案はありません。
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
