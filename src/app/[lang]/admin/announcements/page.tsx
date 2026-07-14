"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { announcementAudienceLabels, type Announcement, type AnnouncementAudience } from "@/lib/announcements";

type FormState = {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  publishedAt: string;
  isImportant: boolean;
  isPublished: boolean;
};

function toLocalDateTime(value = new Date().toISOString()) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const emptyForm = (): FormState => ({
  title: "",
  body: "",
  audience: "all",
  publishedAt: toLocalDateTime(),
  isImportant: false,
  isPublished: false,
});

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadItems = async () => {
    const response = await fetch("/api/admin/announcements");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "お知らせを取得できませんでした");
    setItems(data.announcements ?? []);
  };

  useEffect(() => {
    const loadInitialItems = async () => {
      try {
        const response = await fetch("/api/admin/announcements");
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "お知らせを取得できませんでした");
        setItems(data.announcements ?? []);
      } catch (error) {
        setMessage({ text: error instanceof Error ? error.message : "お知らせを取得できませんでした", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    void loadInitialItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setMessage(null);
  };

  const editItem = (item: Announcement) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      audience: item.audience,
      publishedAt: toLocalDateTime(item.published_at),
      isImportant: item.is_important,
      isPublished: item.is_published,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, publishedAt: new Date(form.publishedAt).toISOString() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "保存できませんでした");
      await loadItems();
      setMessage({ text: editingId ? "お知らせを更新しました" : "お知らせを作成しました", type: "success" });
      setEditingId(null);
      setForm(emptyForm());
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "保存できませんでした", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("このお知らせを削除しますか？既読記録も削除されます。")) return;
    const response = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (response.ok) {
      await loadItems();
      if (editingId === id) resetForm();
    } else {
      setMessage({ text: "削除できませんでした", type: "error" });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-omame-deep"><Bell size={24} />お知らせ管理</h2>
        <p className="mt-2 text-sm text-stone-500">受講者へ表示するお知らせを作成し、公開日時と対象を管理します。</p>
      </header>

      <form onSubmit={save} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-800">{editingId ? "お知らせを編集" : "新しいお知らせ"}</h3>
          {editingId ? <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"><X size={16} />編集をやめる</button> : null}
        </div>
        <div>
          <label htmlFor="announcement-title" className="mb-2 block text-sm font-bold text-stone-700">タイトル</label>
          <input id="announcement-title" required maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:border-amber-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="announcement-body" className="mb-2 block text-sm font-bold text-stone-700">本文</label>
          <textarea id="announcement-body" required maxLength={10000} rows={8} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 leading-relaxed focus:border-amber-500 focus:outline-none" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="announcement-audience" className="mb-2 block text-sm font-bold text-stone-700">公開対象</label>
            <select id="announcement-audience" value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value as AnnouncementAudience }))} className="w-full rounded-xl border border-stone-300 px-4 py-3">
              {Object.entries(announcementAudienceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="announcement-published-at" className="mb-2 block text-sm font-bold text-stone-700">公開日時</label>
            <input id="announcement-published-at" type="datetime-local" required value={form.publishedAt} onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-stone-700"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))} className="h-4 w-4" />公開する</label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-stone-700"><input type="checkbox" checked={form.isImportant} onChange={(event) => setForm((current) => ({ ...current, isImportant: event.target.checked }))} className="h-4 w-4" />重要なお知らせ</label>
        </div>
        {message ? <div role="status" className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-bold ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}{message.text}</div> : null}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-stone-800 px-6 py-3 font-bold text-white hover:bg-stone-700 disabled:opacity-50">{editingId ? <Save size={18} /> : <Plus size={18} />}{saving ? "保存中…" : editingId ? "変更を保存" : "お知らせを作成"}</button>
      </form>

      <section className="space-y-3">
        <h3 className="font-bold text-stone-800">登録済みのお知らせ</h3>
        {loading ? <p className="py-8 text-center text-stone-500">読み込み中…</p> : items.length === 0 ? <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500">まだお知らせはありません。</p> : items.map((item) => (
          <article key={item.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2 text-xs"><span className={`rounded-full px-2 py-1 font-bold ${item.is_published ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{item.is_published ? "公開" : "下書き"}</span>{item.is_important ? <span className="rounded-full bg-amber-100 px-2 py-1 font-bold text-amber-800">重要</span> : null}<span className="px-2 py-1 text-stone-400">{announcementAudienceLabels[item.audience]}</span></div>
                <h4 className="mt-2 font-bold text-stone-800">{item.title}</h4>
                <p className="mt-2 text-xs text-stone-400">公開日時：{new Date(item.published_at).toLocaleString("ja-JP")}</p>
              </div>
              <div className="flex shrink-0 gap-2"><button type="button" onClick={() => editItem(item)} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-sm font-bold text-stone-600 hover:bg-stone-50"><Edit3 size={15} />編集</button><button type="button" onClick={() => remove(item.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 size={15} />削除</button></div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
