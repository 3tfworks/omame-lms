"use client";

import { useState, useEffect } from "react";
import { Calendar, Save, Trash2, Plus, AlertCircle, CheckCircle2, Pause, Play, X } from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  start_at: string;
  end_at: string;
  reward_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  name: string;
  start_at: string; // datetime-local（ローカル/JST 壁時計）
  end_at: string;
  reward_rate: number;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  start_at: "",
  end_at: "",
  reward_rate: 50,
  is_active: true,
};

// ISO(UTC) → datetime-local 用のローカル壁時計文字列 "YYYY-MM-DDTHH:mm"
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

// 表示用：ISO → "YYYY/MM/DD HH:mm"（JST）
function fmt(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 現在時刻に対するキャンペーンの状態を判定。
function statusOf(c: Campaign): { label: string; cls: string } {
  const now = Date.now();
  const start = new Date(c.start_at).getTime();
  const end = new Date(c.end_at).getTime();

  if (!c.is_active) return { label: "停止中", cls: "bg-stone-200 text-stone-600" };
  if (now < start) return { label: "予定", cls: "bg-sky-100 text-sky-700" };
  if (now >= end) return { label: "終了", cls: "bg-stone-200 text-stone-500" };
  return { label: "実施中", cls: "bg-emerald-100 text-emerald-700" };
}

export default function AdminCampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaign");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns ?? []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage({ text: "", type: "" });
  };

  const startEdit = (c: Campaign) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      start_at: isoToLocalInput(c.start_at),
      end_at: isoToLocalInput(c.end_at),
      reward_rate: c.reward_rate,
      is_active: c.is_active,
    });
    setMessage({ text: "", type: "" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // datetime-local（ローカル壁時計）→ ISO(UTC)
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      start_at: form.start_at ? new Date(form.start_at).toISOString() : "",
      end_at: form.end_at ? new Date(form.end_at).toISOString() : "",
      reward_rate: Number(form.reward_rate),
      is_active: form.is_active,
    };

    try {
      const res = await fetch("/api/admin/campaign", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage({ text: editingId ? "キャンペーンを更新しました" : "キャンペーンを追加しました", type: "success" });
        resetForm();
        await fetchCampaigns();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ text: data.error || "保存に失敗しました", type: "error" });
      }
    } catch {
      setMessage({ text: "通信エラーが発生しました", type: "error" });
    }
    setSaving(false);
  };

  // 停止/再開（is_active を反転して PUT）。
  const toggleActive = async (c: Campaign) => {
    try {
      const res = await fetch("/api/admin/campaign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: c.id,
          name: c.name,
          start_at: c.start_at,
          end_at: c.end_at,
          reward_rate: c.reward_rate,
          is_active: !c.is_active,
        }),
      });
      if (res.ok) {
        await fetchCampaigns();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "更新に失敗しました");
      }
    } catch {
      alert("通信エラーが発生しました");
    }
  };

  const handleDelete = async (c: Campaign) => {
    if (!confirm(`「${c.name}」を削除しますか？この操作は元に戻せません。`)) return;
    try {
      const res = await fetch("/api/admin/campaign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });
      if (res.ok) {
        if (editingId === c.id) resetForm();
        await fetchCampaigns();
      } else {
        alert("削除に失敗しました");
      }
    } catch {
      alert("通信エラーが発生しました");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-omame-deep mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          キャンペーン設定
        </h2>
        <p className="text-omame-text/60 text-sm">
          アフィリエイト報酬率を期間で切り替えるキャンペーンを管理します。<br />
          決済成立日時が期間内なら、その報酬率が自動適用されます（期間外は通常報酬率）。
        </p>
      </div>

      {/* 追加 / 編集フォーム */}
      <div className="bg-white rounded-2xl shadow-sm border border-omame-gold/20 overflow-hidden mb-8">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-stone-700 flex items-center gap-2">
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "キャンペーンを編集" : "新しいキャンペーンを追加"}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> 編集をやめる
            </button>
          )}
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">キャンペーン名</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例：夏の友だち紹介キャンペーン"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">開始日時（JST）</label>
                <input
                  type="datetime-local"
                  required
                  value={form.start_at}
                  onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">終了日時（JST）</label>
                <input
                  type="datetime-local"
                  required
                  value={form.end_at}
                  onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-omame-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">報酬率（%）</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={form.reward_rate}
                  onChange={(e) =>
                    setForm({ ...form, reward_rate: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })
                  }
                  className="w-32 border border-stone-300 rounded-lg px-4 py-2.5 text-lg font-bold text-omame-deep focus:outline-none focus:border-omame-primary"
                />
              </div>
              <div className="flex items-center gap-3 pb-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-omame-primary"></div>
                  <span className="ml-3 text-sm font-bold text-stone-700">
                    {form.is_active ? "有効" : "停止（is_active=false）"}
                  </span>
                </label>
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
                {saving ? "保存中..." : editingId ? "更新する" : "追加する"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 一覧（タイムライン） */}
      <div className="bg-white rounded-2xl shadow-sm border border-omame-gold/20 overflow-hidden">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h3 className="font-bold text-stone-700">登録済みキャンペーン</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-omame-primary"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-stone-400">キャンペーンはまだありません</div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {campaigns.map((c) => {
              const st = statusOf(c);
              return (
                <li key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      <span className="font-bold text-omame-deep">{c.name}</span>
                      <span className="text-sm font-bold text-amber-600">{c.reward_rate}%</span>
                    </div>
                    <div className="text-xs text-stone-500">
                      {fmt(c.start_at)} 〜 {fmt(c.end_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => toggleActive(c)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors flex items-center gap-1"
                    >
                      {c.is_active ? <><Pause className="w-3.5 h-3.5" /> 停止</> : <><Play className="w-3.5 h-3.5" /> 再開</>}
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 削除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
