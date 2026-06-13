"use client";

import { useState, useEffect } from "react";
import { Tag, Save, AlertCircle, CheckCircle2 } from "lucide-react";

type PricingSettings = {
  regularPrice: number;
  salePrice: number;
  campaignLabel: string;
  showCampaign: boolean;
};

export default function AdminPricingPage() {
  const [settings, setSettings] = useState<PricingSettings>({
    regularPrice: 34800,
    salePrice: 29800,
    campaignLabel: "発売記念キャンペーン特別価格",
    showCampaign: true,
  });
  const [initialSalePrice, setInitialSalePrice] = useState<number>(29800);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/pricing");
        if (res.ok) {
          const data = await res.json();
          if (data.pricing) {
            setSettings({
              regularPrice: data.pricing.regularPrice,
              salePrice: data.pricing.salePrice,
              campaignLabel: data.pricing.campaignLabel,
              showCampaign: data.pricing.showCampaign,
            });
            setInitialSalePrice(data.pricing.salePrice);
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
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regularPrice: Number(settings.regularPrice),
          salePrice: Number(settings.salePrice),
          campaignLabel: settings.campaignLabel,
          showCampaign: settings.showCampaign,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const priceChanged = Number(settings.salePrice) !== initialSalePrice;
        setMessage({
          text: priceChanged
            ? "価格設定を保存し、Stripeの新しい価格に切り替えました"
            : "価格設定を保存しました",
          type: "success",
        });
        if (data.pricing) {
          setInitialSalePrice(data.pricing.salePrice);
        }
      } else {
        const data = await res.json().catch(() => ({}));
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

  const salePriceChanged = Number(settings.salePrice) !== initialSalePrice;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-omame-deep mb-2 flex items-center gap-2">
          <Tag className="w-6 h-6" />
          価格設定
        </h2>
        <p className="text-omame-text/60 text-sm">
          販売ページ（offer）に表示される価格を設定します。<br />
          販売価格を変更すると、決済システム（Stripe）にも自動で反映されます。
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-omame-gold/20 overflow-hidden">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h3 className="font-bold text-stone-700">商品価格</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* キャンペーン表示トグル */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showCampaign}
                  onChange={(e) => setSettings({ ...settings, showCampaign: e.target.checked })}
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-omame-primary"></div>
                <span className="ml-3 text-sm font-bold text-stone-700">
                  {settings.showCampaign
                    ? "キャンペーン表示 ON（通常価格に取り消し線＋特別価格）"
                    : "キャンペーン表示 OFF（通常価格のみ表示）"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  通常価格（円・税込）
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={settings.regularPrice}
                  onChange={(e) =>
                    setSettings({ ...settings, regularPrice: Number(e.target.value) })
                  }
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary"
                />
                <p className="text-xs text-stone-400 mt-1">表示用（取り消し線）。決済額には影響しません。</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  販売価格（円・税込）
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={settings.salePrice}
                  onChange={(e) =>
                    setSettings({ ...settings, salePrice: Number(e.target.value) })
                  }
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary"
                />
                <p className="text-xs text-stone-400 mt-1">実際の決済額。変更するとStripeに新価格を作成します。</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                キャンペーン文言
              </label>
              <input
                type="text"
                value={settings.campaignLabel}
                disabled={!settings.showCampaign}
                onChange={(e) => setSettings({ ...settings, campaignLabel: e.target.value })}
                placeholder="例：発売記念キャンペーン特別価格"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary disabled:bg-stone-100 disabled:text-stone-400"
              />
            </div>

            {salePriceChanged && (
              <div className="p-4 rounded-xl text-sm flex items-start gap-2 bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  販売価格を変更しています。保存すると Stripe に新しい価格（Price）が作成され、
                  以降の決済はこの金額になります。旧価格はアーカイブされます。
                </span>
              </div>
            )}

            {message.text && (
              <div
                className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
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
                {saving ? "保存中..." : "変更を保存する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
