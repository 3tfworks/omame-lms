"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck, UserPlus, UserX } from "lucide-react";

type SupportAgent = {
  user_id: string;
  enabled: boolean;
  can_view_auth_status: boolean;
  can_resend_login_email: boolean;
  can_repair_profile: boolean;
  can_manage_announcements: boolean;
  created_at: string;
  updated_at: string;
  user: { email: string; display_name: string | null; role: string } | null;
};

export function SupportAgentManager() {
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [email, setEmail] = useState("");
  const [canViewAuth, setCanViewAuth] = useState(false);
  const [canManageAnnouncements, setCanManageAnnouncements] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/support-agents");
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "事務担当者一覧を取得できませんでした。");
      setAgents(result.agents || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "事務担当者一覧を取得できませんでした。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial synchronization with the owner-only management API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAgents();
  }, []);

  const updateAccess = async (
    targetEmail: string,
    enabled: boolean,
    permissions: { canViewAuth: boolean; canManageAnnouncements: boolean },
  ) => {
    const verb = enabled ? "付与" : "停止";
    const warning = enabled
      ? `${targetEmail} の事務担当アクセスを更新します。\n\nログインサポート：${permissions.canViewAuth ? "許可" : "許可しない"}\nお知らせ管理：${permissions.canManageAnnouncements ? "許可" : "許可しない"}\n\nよろしいですか？`
      : `${targetEmail} の事務担当アクセスを停止します。よろしいですか？`;
    if (!window.confirm(warning)) return;

    setUpdatingEmail(targetEmail);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin/support-agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...permissions, email: targetEmail, enabled, canResend: permissions.canViewAuth }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || `アクセスの${verb}に失敗しました。`);
      setNotice(result.message);
      setEmail("");
      setCanViewAuth(false);
      setCanManageAnnouncements(true);
      await loadAgents();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : `アクセスの${verb}に失敗しました。`);
    } finally {
      setUpdatingEmail("");
    }
  };

  const submitAgent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (normalized && (canViewAuth || canManageAnnouncements)) {
      void updateAccess(normalized, true, { canViewAuth, canManageAnnouncements });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-omame-gold">Owner Only</p>
        <h2 className="text-2xl font-bold text-omame-deep">事務担当者管理</h2>
        <p className="text-sm leading-relaxed text-stone-500">
          顧客ではなく、事務業務を担当するスタッフ本人のアカウントだけを登録してください。業務ごとに必要な権限だけを付与できます。
        </p>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
        <p className="font-bold">付与される権限</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>顧客の決済・登録・認証・メール配信状態の確認</li>
          <li>本人確認後の登録メールアドレス変更</li>
          <li>ログインメールの再送</li>
          <li>受講者向けのお知らせ・インフォバーの作成と公開（選択時のみ）</li>
        </ul>
        <p className="mt-3">すべての変更・再送・権限操作は監査ログに記録されます。</p>
      </section>

      <form onSubmit={submitAgent} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-bold text-stone-700">
          事務担当者本人の登録メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="staff@example.com"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </label>
        <fieldset className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <legend className="px-2 text-sm font-bold text-stone-700">担当業務</legend>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-stone-700">
              <input type="checkbox" checked={canManageAnnouncements} onChange={(event) => setCanManageAnnouncements(event.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="block">お知らせ・インフォバー管理</strong><span className="text-xs text-stone-500">障害・復旧案内などの作成、編集、公開</span></span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-stone-700">
              <input type="checkbox" checked={canViewAuth} onChange={(event) => setCanViewAuth(event.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="block">ログインサポート</strong><span className="text-xs text-stone-500">顧客の認証状態確認、メール変更、ログインメール再送</span></span>
            </label>
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={!email.trim() || (!canViewAuth && !canManageAnnouncements) || Boolean(updatingEmail)}
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-bold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {updatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          選択した権限を付与
        </button>
      </form>

      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{notice}</div>}
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h3 className="font-bold text-stone-800">登録済み事務担当者</h3>
          <button type="button" onClick={() => void loadAgents()} disabled={loading} className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 disabled:opacity-40">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            更新
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-stone-400" /></div>
        ) : agents.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">事務担当者はまだ登録されていません。</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {agents.map((agent) => {
              const targetEmail = agent.user?.email || "不明なアカウント";
              return (
                <div key={agent.user_id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-stone-800">
                      <ShieldCheck className={`h-5 w-5 ${agent.enabled ? "text-emerald-600" : "text-stone-300"}`} />
                      {agent.user?.display_name || "表示名未設定"}
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{targetEmail}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {agent.enabled ? "アクセス有効" : "アクセス停止中"}・最終更新 {new Date(agent.updated_at).toLocaleString("ja-JP")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                      {agent.can_manage_announcements ? <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-800">お知らせ管理</span> : null}
                      {agent.can_view_auth_status ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">ログインサポート</span> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void updateAccess(targetEmail, !agent.enabled, { canViewAuth: agent.can_view_auth_status, canManageAnnouncements: agent.can_manage_announcements })}
                    disabled={!agent.user?.email || Boolean(updatingEmail)}
                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold disabled:opacity-40 ${
                      agent.enabled
                        ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {updatingEmail === targetEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : agent.enabled ? <UserX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    {agent.enabled ? "アクセスを停止" : "アクセスを再開"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
