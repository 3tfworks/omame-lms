"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, CheckCircle2, Info, Siren, X } from "lucide-react";
import type { InfoBarVariant } from "@/lib/announcements";

type ActiveInfoBar = {
  id: string;
  title: string;
  body: string;
  info_bar_variant: InfoBarVariant;
  info_bar_ends_at: string | null;
  info_bar_dismissible: boolean;
  published_at: string;
};

const variantStyles: Record<InfoBarVariant, { container: string; icon: typeof Info; label: string }> = {
  info: { container: "border-sky-200 bg-sky-50 text-sky-950", icon: Info, label: "ご案内" },
  warning: { container: "border-amber-300 bg-amber-50 text-amber-950", icon: AlertTriangle, label: "ご注意" },
  incident: { container: "border-rose-300 bg-rose-50 text-rose-950", icon: Siren, label: "障害発生中" },
  resolved: { container: "border-emerald-300 bg-emerald-50 text-emerald-950", icon: CheckCircle2, label: "復旧済み" },
};

const DISMISSED_STORAGE_KEY = "omame:lms-info-bar-dismissed:v1";

export function LmsInfoBar() {
  const pathname = usePathname();
  const [infoBar, setInfoBar] = useState<ActiveInfoBar | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/announcements/info-bar", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        const nextInfoBar = (result.infoBar ?? null) as ActiveInfoBar | null;
        if (!nextInfoBar || cancelled) return;
        const dismissedIds = JSON.parse(window.localStorage.getItem(DISMISSED_STORAGE_KEY) || "[]") as string[];
        if (!dismissedIds.includes(nextInfoBar.id)) setInfoBar(nextInfoBar);
      } catch (error) {
        console.error("インフォバーの取得エラー:", error);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!infoBar) return null;

  const style = variantStyles[infoBar.info_bar_variant] ?? variantStyles.info;
  const Icon = style.icon;
  const lang = pathname.split("/")[1] || "ja";

  const dismiss = () => {
    let dismissedIds: string[] = [];
    try {
      dismissedIds = JSON.parse(window.localStorage.getItem(DISMISSED_STORAGE_KEY) || "[]") as string[];
    } catch {
      dismissedIds = [];
    }
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...new Set([...dismissedIds, infoBar.id])].slice(-30)));
    setInfoBar(null);
  };

  return (
    <section role={infoBar.info_bar_variant === "incident" ? "alert" : "status"} className={`mb-6 rounded-2xl border p-4 shadow-sm md:p-5 ${style.container}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-wider opacity-70">{style.label}</p>
          <h2 className="mt-1 font-bold leading-relaxed">{infoBar.title}</h2>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed opacity-85">{infoBar.body}</p>
          <Link href={`/${lang}/lms/announcements/${infoBar.id}`} className="mt-2 inline-flex text-sm font-bold underline underline-offset-4 hover:no-underline">
            詳細を見る
          </Link>
        </div>
        {infoBar.info_bar_dismissible ? (
          <button type="button" onClick={dismiss} aria-label="このお知らせを閉じる" className="shrink-0 rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100">
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
