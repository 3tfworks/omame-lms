"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Handshake, IdCard, Loader2, Save, UserRound } from "lucide-react";
import { DISPLAY_NAME_MAX, LEGAL_NAME_MAX } from "@/lib/displayName";

type Profile = {
  id: string;
  email: string;
  role: string;
  legal_name: string | null;
  display_name: string | null;
  referral_display_name: string | null;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function isReferralEnabled(role: string | undefined) {
  return role === "salon_member" || role === "owner";
}

function SaveButton({ state }: { state: SaveState }) {
  return (
    <button
      type="submit"
      disabled={state === "saving"}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {state === "saving" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          保存中
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          保存する
        </>
      )}
    </button>
  );
}

function StatusMessage({ state, message }: { state: SaveState; message: string }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return <p className="text-sm text-stone-500">保存しています...</p>;
  }
  if (state === "saved") {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        保存しました
      </p>
    );
  }
  return (
    <p className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700">
      <AlertCircle className="h-4 w-4" />
      {message}
    </p>
  );
}

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [referralDisplayName, setReferralDisplayName] = useState("");

  const [legalState, setLegalState] = useState<SaveState>("idle");
  const [displayState, setDisplayState] = useState<SaveState>("idle");
  const [referralState, setReferralState] = useState<SaveState>("idle");
  const [legalError, setLegalError] = useState("");
  const [displayError, setDisplayError] = useState("");
  const [referralError, setReferralError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setLoadError(data?.error || "登録情報を読み込めませんでした。");
          return;
        }
        const nextProfile = data.profile as Profile;
        setProfile(nextProfile);
        setLegalName(nextProfile.legal_name || "");
        setDisplayName(nextProfile.display_name || "");
        setReferralDisplayName(nextProfile.referral_display_name || "");
      } catch {
        setLoadError("通信エラーが発生しました。時間をおいて再度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const saveProfileField = async (
    field: "legalName" | "displayName",
    value: string,
    setState: (state: SaveState) => void,
    setError: (message: string) => void,
  ) => {
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "保存に失敗しました。");
        setState("error");
        return;
      }
      window.dispatchEvent(new Event("omame-profile-updated"));
      setState("saved");
      window.setTimeout(() => setState("idle"), 2200);
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setState("error");
    }
  };

  const saveReferralName = async () => {
    setReferralState("saving");
    setReferralError("");
    try {
      const res = await fetch("/api/user/referral-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralDisplayName: referralDisplayName.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setReferralError(data?.error || "保存に失敗しました。");
        setReferralState("error");
        return;
      }
      setReferralState("saved");
      window.setTimeout(() => setReferralState("idle"), 2200);
    } catch {
      setReferralError("通信エラーが発生しました。もう一度お試しください。");
      setReferralState("error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-omame-gold" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
        <p className="font-bold">登録情報を読み込めませんでした</p>
        <p className="mt-2 text-sm">{loadError || "時間をおいて再度お試しください。"}</p>
      </div>
    );
  }

  const referralEnabled = isReferralEnabled(profile.role);
  const referralPreview = referralDisplayName.trim() || displayName.trim() || "未設定";

  return (
    <div className="space-y-8 pb-12">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-omame-gold">My Page</p>
        <h1 className="mt-2 text-3xl font-bold text-omame-deep">マイページ</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
          登録情報と、受講ページで使うお名前を確認・変更できます。本名は購入者管理のためだけに使用し、画面上の表示にはニックネームを使います。
        </p>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <IdCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800">登録情報</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-500">
              本名は購入者管理・お問い合わせ対応のために使用します。受講ページや招待状には表示されません。
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div>
            <label className="block text-sm font-bold text-stone-700">メールアドレス</label>
            <div className="mt-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              {profile.email}
            </div>
            <p className="mt-2 text-xs text-stone-400">メールアドレスの変更は現在サポート窓口で承ります。</p>
          </div>

          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveProfileField("legalName", legalName, setLegalState, setLegalError);
            }}
          >
            <label htmlFor="legal-name" className="block text-sm font-bold text-stone-700">
              本名
            </label>
            <input
              id="legal-name"
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              maxLength={LEGAL_NAME_MAX}
              placeholder="例：山田 花子"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition-colors focus:border-omame-gold focus:ring-2 focus:ring-omame-gold/30"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage state={legalState} message={legalError} />
              <SaveButton state={legalState} />
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800">画面に表示されるお名前</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-500">
              受講ページのサイドバーや、画面上のご挨拶ではこちらのニックネームを使います。
            </p>
          </div>
        </div>

        <form
          className="mt-6 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveProfileField("displayName", displayName, setDisplayState, setDisplayError);
          }}
        >
          <label htmlFor="display-name" className="block text-sm font-bold text-stone-700">
            ニックネーム
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={DISPLAY_NAME_MAX}
            placeholder="例：えりな"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition-colors focus:border-omame-gold focus:ring-2 focus:ring-omame-gold/30"
          />
          <p className="text-xs text-stone-400">{DISPLAY_NAME_MAX}文字以内。本名でなくても大丈夫です。</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StatusMessage state={displayState} message={displayError} />
            <SaveButton state={displayState} />
          </div>
        </form>
      </section>

      {referralEnabled && (
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">紹介プログラムで表示されるお名前</h2>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                招待状など、紹介先の方に見えるお名前です。空欄にするとニックネームが使われます。
              </p>
            </div>
          </div>

          <form
            className="mt-6 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveReferralName();
            }}
          >
            <label htmlFor="referral-display-name" className="block text-sm font-bold text-stone-700">
              紹介表示名
            </label>
            <input
              id="referral-display-name"
              type="text"
              value={referralDisplayName}
              onChange={(e) => setReferralDisplayName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX}
              placeholder={`空欄の場合：${displayName || "ニックネーム"}`}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="rounded-xl bg-white/70 px-4 py-3 text-sm text-stone-600">
              現在の表示イメージ: <span className="font-bold text-stone-800">{referralPreview}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage state={referralState} message={referralError} />
              <SaveButton state={referralState} />
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
