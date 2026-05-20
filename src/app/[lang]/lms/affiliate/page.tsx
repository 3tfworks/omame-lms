"use client";

import { useState, useEffect } from "react";
import { Handshake, Copy, CheckCircle2, TrendingUp, Wallet, Banknote, Save, AlertCircle } from "lucide-react";

type AffiliateStats = {
  totalReferrals: number;
  totalEarned: number;
  unpaidAmount: number;
};

type BankInfo = {
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountName: string;
};

export default function AffiliatePage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "", branchName: "", accountType: "普通", accountNumber: "", accountName: ""
  });
  
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/affiliate");
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
          setStats(data.stats);
          if (data.bankInfo) {
            setBankInfo(data.bankInfo);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const affiliateUrl = userId ? `https://omamepiano.com/ja/offer?ref=${userId}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleSaveBankInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/user/affiliate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankInfo }),
      });
      
      if (res.ok) {
        setSaveMessage({ text: "口座情報を保存しました", type: "success" });
      } else {
        setSaveMessage({ text: "保存に失敗しました", type: "error" });
      }
    } catch (e) {
      setSaveMessage({ text: "通信エラーが発生しました", type: "error" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-omame-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Handshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-omame-deep font-serif">紹介プログラム（アフィリエイト）</h1>
        </div>
        <p className="text-stone-600">
          あなた専用のリンクをお友達やSNSで紹介してください。<br/>
          リンク経由で基礎講座の購入が発生した場合、紹介報酬をお支払いします。
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-stone-500 mb-1">紹介人数</p>
            <p className="text-2xl font-bold text-omame-deep">{stats?.totalReferrals || 0} <span className="text-sm font-normal text-stone-500">人</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Banknote className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-stone-500 mb-1">未払い報酬</p>
            <p className="text-2xl font-bold text-omame-deep">¥{(stats?.unpaidAmount || 0).toLocaleString()} <span className="text-sm font-normal text-stone-500">（今月振込予定）</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Wallet className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-stone-500 mb-1">累計獲得報酬</p>
            <p className="text-2xl font-bold text-omame-deep">¥{(stats?.totalEarned || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 紹介リンク */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-10">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h2 className="font-bold text-omame-deep">あなた専用の紹介リンク</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-600 mb-4">
            このURLをSNSやブログに貼り付けて紹介してください。リンクをクリックしてから30日以内の購入が成果の対象となります。
          </p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={affiliateUrl}
              className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-4 py-3 text-stone-600 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 bg-omame-primary text-white font-bold rounded-lg hover:bg-omame-deep transition-colors"
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? "コピーしました！" : "コピー"}
            </button>
          </div>
        </div>
      </div>

      {/* 振込先口座の登録 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h2 className="font-bold text-omame-deep">振込先口座情報</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveBankInfo} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">金融機関名</label>
                <input 
                  type="text" required placeholder="例：お豆銀行"
                  value={bankInfo.bankName} onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:border-omame-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">支店名</label>
                <input 
                  type="text" required placeholder="例：本店営業部"
                  value={bankInfo.branchName} onChange={e => setBankInfo({...bankInfo, branchName: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:border-omame-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">口座種別</label>
                <select 
                  value={bankInfo.accountType} onChange={e => setBankInfo({...bankInfo, accountType: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:border-omame-primary bg-white"
                >
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                  <option value="貯蓄">貯蓄</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">口座番号</label>
                <input 
                  type="text" required pattern="[0-9]+" placeholder="半角数字のみ"
                  value={bankInfo.accountNumber} onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:border-omame-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">口座名義（カナ）</label>
              <input 
                type="text" required placeholder="例：ヤマダ タロウ"
                value={bankInfo.accountName} onChange={e => setBankInfo({...bankInfo, accountName: e.target.value})}
                className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:border-omame-primary"
              />
            </div>

            {saveMessage.text && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${saveMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                <AlertCircle className="w-4 h-4" />
                {saveMessage.text}
              </div>
            )}

            <button 
              type="submit" disabled={saving}
              className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-stone-800 text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "保存中..." : "口座情報を保存する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
