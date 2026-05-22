"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";

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

  // 今後のタスク：お豆ナビ（付箋承認）機能の実装予定

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



    </div>
  );
}
