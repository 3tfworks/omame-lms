"use client";

import { useState, useEffect } from "react";
import { Calendar, Save, AlertCircle, CheckCircle2 } from "lucide-react";

type CampaignSettings = {
  id?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export default function AdminCampaignPage() {
  const [settings, setSettings] = useState<CampaignSettings>({
    start_date: "",
    end_date: "",
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/campaign");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            // YYYY-MM-DDThh:mm 形式に変換（datetime-local用）
            setSettings({
              start_date: new Date(data.settings.start_date).toISOString().slice(0, 16),
              end_date: new Date(data.settings.end_date).toISOString().slice(0, 16),
              is_active: data.settings.is_active
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/admin/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // UTCタイムスタンプに変換して送信
        body: JSON.stringify({
          start_date: new Date(settings.start_date).toISOString(),
          end_date: new Date(settings.end_date).toISOString(),
          is_active: settings.is_active
        }),
      });

      if (res.ok) {
        setMessage({ text: "キャンペーン設定を保存しました", type: "success" });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "保存に失敗しました", type: "error" });
      }
    } catch (e) {
      setMessage({ text: "通信エラーが発生しました", type: "error" });
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
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-omame-deep mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          キャンペーン設定
        </h2>
        <p className="text-omame-text/60 text-sm">
          アフィリエイト報酬が50%になるキャンペーン期間を設定します。<br/>
          （期間外は通常報酬35%が適用されます）
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-omame-gold/20 overflow-hidden">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h3 className="font-bold text-stone-700">期間設定</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.is_active}
                  onChange={(e) => setSettings({...settings, is_active: e.target.checked})}
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-omame-primary"></div>
                <span className="ml-3 text-sm font-bold text-stone-700">
                  {settings.is_active ? "キャンペーン機能 有効" : "キャンペーン機能 無効"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">開始日時</label>
                <input
                  type="datetime-local"
                  required
                  disabled={!settings.is_active}
                  value={settings.start_date}
                  onChange={(e) => setSettings({...settings, start_date: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary disabled:bg-stone-100 disabled:text-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">終了日時</label>
                <input
                  type="datetime-local"
                  required
                  disabled={!settings.is_active}
                  value={settings.end_date}
                  onChange={(e) => setSettings({...settings, end_date: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary disabled:bg-stone-100 disabled:text-stone-400"
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <div className="pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-omame-primary text-white font-bold rounded-xl hover:bg-omame-deep transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "保存中..." : "設定を保存する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
