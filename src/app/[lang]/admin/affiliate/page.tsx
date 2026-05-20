"use client";

import { useState, useEffect } from "react";
import { Handshake, Download, RefreshCw, CheckCircle2, Clock } from "lucide-react";

type AffiliateReward = {
  id: string;
  amount: number;
  reward_rate: number;
  status: string;
  created_at: string;
  referrer: {
    id: string;
    email: string;
    display_name: string | null;
    bank_info: any | null;
  };
  buyer: {
    email: string;
    display_name: string | null;
  };
};

export default function AdminAffiliatePage() {
  const [rewards, setRewards] = useState<AffiliateReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/affiliate");
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleStatusChange = async (rewardId: string, newStatus: string) => {
    setUpdatingId(rewardId);
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId, newStatus }),
      });
      if (res.ok) {
        await fetchRewards();
      } else {
        alert("ステータスの更新に失敗しました");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
    setUpdatingId(null);
  };

  const handleDownloadCSV = () => {
    // 未払いのものだけを抽出（または全て抽出するかは要件次第だが、一旦全部出力しつつフィルタもできるように）
    const pendingRewards = rewards.filter(r => r.status === 'pending');
    if (pendingRewards.length === 0) {
      alert("未払いの成果はありません");
      return;
    }

    // CSVヘッダー
    const headers = ["成果ID", "発生日", "紹介者名", "紹介者Email", "購入者Email", "報酬率", "報酬金額", "銀行名", "支店名", "口座種別", "口座番号", "口座名義"];
    
    // CSVデータ行
    const rows = pendingRewards.map(r => {
      const bank = r.referrer.bank_info || {};
      return [
        r.id,
        new Date(r.created_at).toLocaleDateString("ja-JP"),
        r.referrer.display_name || "未設定",
        r.referrer.email,
        r.buyer.email,
        `${r.reward_rate}%`,
        r.amount,
        bank.bankName || "",
        bank.branchName || "",
        bank.accountType || "",
        bank.accountNumber || "",
        bank.accountName || ""
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // BOM付きでExcel対応
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `affiliate_pending_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-8 h-8 text-omame-primary animate-spin" />
      </div>
    );
  }

  const pendingTotal = rewards.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-omame-deep mb-2 flex items-center gap-2">
            <Handshake className="w-6 h-6" />
            アフィリエイト管理
          </h2>
          <p className="text-omame-text/60 text-sm">
            紹介による購入履歴の確認と、報酬支払いの管理を行います。
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-stone-500 font-bold mb-1">未払い報酬合計</p>
            <p className="text-2xl font-bold text-amber-600">¥{pendingTotal.toLocaleString()}</p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white font-bold rounded-lg hover:bg-black transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            未払いリスト(CSV)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-omame-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600">発生日</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600">紹介者 (支払先)</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600">購入者</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600">報酬額</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600 w-[150px]">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward) => (
                <tr key={reward.id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50">
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {new Date(reward.created_at).toLocaleDateString("ja-JP")}
                    <div className="text-xs text-stone-400 mt-1">
                      {new Date(reward.created_at).toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-omame-deep text-sm mb-1">
                      {reward.referrer.display_name || "未設定"}
                    </div>
                    <div className="text-xs text-stone-500 mb-1">{reward.referrer.email}</div>
                    {reward.referrer.bank_info ? (
                      <div className="text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded">
                        口座登録済
                      </div>
                    ) : (
                      <div className="text-xs text-red-500 bg-red-50 inline-block px-2 py-0.5 rounded">
                        口座未登録
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-700 text-sm mb-1">
                      {reward.buyer.display_name || "未設定"}
                    </div>
                    <div className="text-xs text-stone-500">{reward.buyer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-omame-deep">¥{reward.amount.toLocaleString()}</div>
                    <div className="text-xs text-stone-400">レート: {reward.reward_rate}%</div>
                  </td>
                  <td className="px-6 py-4">
                    {reward.status === 'paid' ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          支払済
                        </span>
                        <button
                          onClick={() => handleStatusChange(reward.id, 'pending')}
                          disabled={updatingId === reward.id}
                          className="text-xs text-stone-400 hover:text-omame-primary underline ml-2"
                        >
                          戻す
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          未払い
                        </span>
                        <button
                          onClick={() => handleStatusChange(reward.id, 'paid')}
                          disabled={updatingId === reward.id}
                          className="text-xs bg-omame-primary text-white px-2 py-1 rounded hover:bg-omame-deep transition-colors ml-2"
                        >
                          支払完了にする
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rewards.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              アフィリエイト成果はまだありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
