"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Crown,
  Edit3,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";
import { DISPLAY_NAME_MAX, LEGAL_NAME_MAX } from "@/lib/displayName";

type Role = "owner" | "admin" | "salon_member" | "user";
type RoleFilter = Role | "all";
type SortKey = "newest" | "oldest" | "name";

type User = {
  id: string;
  email: string;
  role: Role;
  legal_name: string | null;
  display_name: string | null;
  created_at: string;
};

type EditForm = {
  legalName: string;
  displayName: string;
  role: Role;
};

const roleLabels: Record<Role, { label: string; short: string; color: string; icon: typeof Shield; description: string }> = {
  owner: {
    label: "オーナー",
    short: "オーナー",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Crown,
    description: "全権限。権限変更も可能",
  },
  admin: {
    label: "管理者",
    short: "管理者",
    color: "border-indigo-200 bg-indigo-50 text-indigo-700",
    icon: ShieldCheck,
    description: "管理画面の閲覧・ユーザー名管理",
  },
  salon_member: {
    label: "サロンメンバー",
    short: "サロン",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: Shield,
    description: "LMS閲覧 + 紹介プログラム",
  },
  user: {
    label: "一般ユーザー",
    short: "一般",
    color: "border-stone-200 bg-stone-50 text-stone-600",
    icon: Shield,
    description: "LMS閲覧のみ",
  },
};

const roleOptions: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "user", label: "一般" },
  { value: "salon_member", label: "サロン" },
  { value: "admin", label: "管理者" },
  { value: "owner", label: "オーナー" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function normalize(value: string | null | undefined) {
  return value?.trim() || "";
}

function RoleBadge({ role }: { role: Role }) {
  const roleInfo = roleLabels[role] || roleLabels.user;
  const Icon = roleInfo.icon;

  return (
    <span className={`inline-flex min-w-16 items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs font-bold ${roleInfo.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {roleInfo.short}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [requesterRole, setRequesterRole] = useState<Role | "">("");
  const [requesterId, setRequesterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ legalName: "", displayName: "", role: "user" });

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setFetchError("");
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (!cancelled) setFetchError(data?.error || "ユーザー一覧を取得できませんでした。");
          return;
        }
        if (!cancelled) {
          setUsers(data.users || []);
          setRequesterRole(data.requesterRole || "");
          setRequesterId(data.requesterId || "");
        }
      } catch {
        if (!cancelled) setFetchError("通信エラーが発生しました。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const isOwner = requesterRole === "owner";

  const roleCounts = useMemo(() => {
    return users.reduce<Record<Role, number>>(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      { owner: 0, admin: 0, salon_member: 0, user: 0 },
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const next = users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!keyword) return true;
      const target = [
        user.legal_name,
        user.display_name,
        user.email,
        roleLabels[user.role]?.label,
        roleLabels[user.role]?.short,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return target.includes(keyword);
    });

    return [...next].sort((a, b) => {
      if (sortKey === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortKey === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      const aName = normalize(a.legal_name) || normalize(a.display_name) || a.email;
      const bName = normalize(b.legal_name) || normalize(b.display_name) || b.email;
      return aName.localeCompare(bName, "ja");
    });
  }, [query, roleFilter, sortKey, users]);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      legalName: user.legal_name || "",
      displayName: user.display_name || "",
      role: user.role,
    });
    setUpdateError("");
  };

  const closeEditModal = () => {
    if (updating) return;
    setEditingUser(null);
    setUpdateError("");
  };

  const refreshUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "ユーザー一覧を取得できませんでした。");
    setUsers(data.users || []);
    setRequesterRole(data.requesterRole || "");
    setRequesterId(data.requesterId || "");
  };

  const handleSave = async () => {
    if (!editingUser) return;
    if (editForm.role !== editingUser.role) {
      const confirmed = window.confirm(
        `${editingUser.email} の権限を「${roleLabels[editingUser.role].label}」から「${roleLabels[editForm.role].label}」に変更します。よろしいですか？`,
      );
      if (!confirmed) return;
    }

    setUpdating(true);
    setUpdateError("");
    try {
      const body: {
        targetUserId: string;
        newLegalName: string;
        newDisplayName: string;
        newRole?: Role;
      } = {
        targetUserId: editingUser.id,
        newLegalName: editForm.legalName,
        newDisplayName: editForm.displayName,
      };

      if (isOwner && editingUser.id !== requesterId && editForm.role !== editingUser.role) {
        body.newRole = editForm.role;
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setUpdateError(data?.error || "保存に失敗しました。");
        return;
      }
      await refreshUsers();
      setEditingUser(null);
    } catch {
      setUpdateError("通信エラーが発生しました。");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-omame-primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
        <p className="font-bold">ユーザー一覧を読み込めませんでした</p>
        <p className="mt-2 text-sm">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-omame-gold">Users</p>
        <h2 className="text-2xl font-bold text-omame-deep">ユーザー管理</h2>
        <p className="text-sm leading-relaxed text-stone-500">
          購入者管理用の本名、画面表示名、権限を一覧で確認できます。
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
          <p className="text-xs text-stone-400">登録ユーザー</p>
          <p className="mt-1 text-2xl font-bold text-stone-800">{users.length}</p>
        </div>
        {(["user", "salon_member", "admin", "owner"] as Role[]).map((role) => {
          const roleInfo = roleLabels[role];
          return (
            <div key={role} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-xs text-stone-400">{roleInfo.short}</p>
              <p className="mt-1 text-2xl font-bold text-stone-800">{roleCounts[role]}</p>
            </div>
          );
        })}
      </section>

      <details className="rounded-xl border border-stone-200 bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-bold text-stone-600">権限について</summary>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {(Object.keys(roleLabels) as Role[]).map((role) => {
            const roleInfo = roleLabels[role];
            return (
              <div key={role} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm">
                <RoleBadge role={role} />
                <span className="ml-3 flex-1 text-stone-500">{roleInfo.description}</span>
              </div>
            );
          })}
        </div>
      </details>

      <section className="rounded-2xl border border-omame-gold/20 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="本名・表示名・メールで検索"
              className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm outline-none transition-colors focus:border-omame-gold focus:bg-white focus:ring-2 focus:ring-omame-gold/20"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRoleFilter(option.value)}
                  className={`min-h-9 rounded-lg px-3 text-sm font-bold transition-colors ${
                    roleFilter === option.value
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-500">
              <Filter className="h-4 w-4" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-omame-gold focus:ring-2 focus:ring-omame-gold/20"
              >
                <option value="newest">登録日 新しい順</option>
                <option value="oldest">登録日 古い順</option>
                <option value="name">名前順</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-y border-stone-100 bg-stone-50/80">
                <th className="w-[190px] px-4 py-3 text-left text-xs font-bold text-stone-500">本名</th>
                <th className="w-[170px] px-4 py-3 text-left text-xs font-bold text-stone-500">表示名</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500">メール</th>
                <th className="w-[110px] px-4 py-3 text-left text-xs font-bold text-stone-500">権限</th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-bold text-stone-500">登録日</th>
                <th className="w-[100px] px-4 py-3 text-right text-xs font-bold text-stone-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-stone-100 last:border-b-0 hover:bg-omame-accent/20">
                  <td className="px-4 py-3">
                    <div className={`text-sm font-bold ${user.legal_name ? "text-stone-800" : "text-stone-400"}`}>
                      {user.legal_name || "未登録"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm ${user.display_name ? "text-stone-700" : "text-stone-400"}`}>
                      {user.display_name || "未設定"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate text-sm font-medium text-stone-600">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-sm font-bold text-stone-600 transition-colors hover:border-omame-gold hover:text-omame-deep"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-400">
            条件に一致するユーザーはいません。
          </div>
        )}

        <p className="mt-4 text-xs text-stone-400">
          表示中 {filteredUsers.length} 名 / 全 {users.length} 名
        </p>
      </section>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-omame-gold">Edit User</p>
                <h3 className="mt-1 text-xl font-bold text-omame-deep">ユーザー情報の編集</h3>
                <p className="mt-2 break-all text-sm text-stone-500">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-stone-700">本名</span>
                <input
                  type="text"
                  value={editForm.legalName}
                  onChange={(e) => setEditForm((current) => ({ ...current, legalName: e.target.value }))}
                  maxLength={LEGAL_NAME_MAX}
                  placeholder="例：山田 花子"
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition-colors focus:border-omame-gold focus:ring-2 focus:ring-omame-gold/20"
                />
                <span className="mt-1 block text-xs text-stone-400">購入者管理・問い合わせ対応用。画面には表示されません。</span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-stone-700">表示名</span>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm((current) => ({ ...current, displayName: e.target.value }))}
                  maxLength={DISPLAY_NAME_MAX}
                  placeholder="例：はな"
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition-colors focus:border-omame-gold focus:ring-2 focus:ring-omame-gold/20"
                />
                <span className="mt-1 block text-xs text-stone-400">LMS 画面で使うニックネームです。</span>
              </label>

              {isOwner && editingUser.id !== requesterId && (
                <label className="block">
                  <span className="text-sm font-bold text-stone-700">権限</span>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((current) => ({ ...current, role: e.target.value as Role }))}
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-omame-gold focus:ring-2 focus:ring-omame-gold/20"
                  >
                    <option value="user">一般ユーザー</option>
                    <option value="salon_member">サロンメンバー</option>
                    <option value="admin">管理者</option>
                    <option value="owner">オーナー</option>
                  </select>
                </label>
              )}

              {isOwner && editingUser.id === requesterId && (
                <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
                  自分自身の権限は変更できません。
                </div>
              )}

              {editForm.role !== editingUser.role && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    権限が {roleLabels[editingUser.role].label} から {roleLabels[editForm.role].label} に変わります。
                  </span>
                </div>
              )}

              {updateError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {updateError}
                </div>
              )}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={updating}
                className="min-h-10 rounded-xl px-4 text-sm font-bold text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={updating}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-stone-800 px-5 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
