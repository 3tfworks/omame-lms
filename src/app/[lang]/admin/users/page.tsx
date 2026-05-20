"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldCheck, Crown, RefreshCw, AlertTriangle, Edit2, Check, X as XIcon } from "lucide-react";

type User = {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  created_at: string;
};

const roleLabels: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  owner: { label: "オーナー", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Crown },
  admin: { label: "管理者", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: ShieldCheck },
  salon_member: { label: "サロンメンバー", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: Shield },
  user: { label: "一般ユーザー", color: "text-stone-600 bg-stone-50 border-stone-200", icon: Shield },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [requesterRole, setRequesterRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // ロール変更用の状態
  const [confirmDialog, setConfirmDialog] = useState<{
    userId: string;
    email: string;
    currentRole: string;
    newRole: string;
  } | null>(null);

  // 名前編集用の状態
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setRequesterRole(data.requesterRole);
      }
    } catch (e) {
      console.error("ユーザー取得エラー:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // ロール変更
  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole }),
      });
      if (res.ok) {
        await fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "権限の変更に失敗しました");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
    setUpdating(null);
    setConfirmDialog(null);
  };

  // 名前変更
  const handleNameChange = async (userId: string) => {
    if (!editNameValue.trim() && users.find(u => u.id === userId)?.display_name === editNameValue) {
      setEditingNameId(null);
      return;
    }

    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newDisplayName: editNameValue.trim() || null }),
      });
      if (res.ok) {
        await fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "名前の保存に失敗しました");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
    setUpdating(null);
    setEditingNameId(null);
  };

  const isOwner = requesterRole === "owner";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-omame-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-omame-deep mb-2">ユーザー管理</h2>
        <p className="text-omame-text/60 text-sm">
          登録されているユーザーの一覧と権限・名前の管理
        </p>
      </div>

      {/* ロール説明カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {Object.entries(roleLabels).map(([key, { label, color, icon: Icon }]) => (
          <div key={key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color}`}>
            <Icon className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">{label}</p>
              <p className="text-xs opacity-70">
                {key === "owner" && "全権限（権限管理含む）"}
                {key === "admin" && "コンテンツ・ユーザー名管理"}
                {key === "salon_member" && "LMS閲覧＋アフィリエイト"}
                {key === "user" && "LMS閲覧のみ"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ユーザーテーブル */}
      <div className="bg-white rounded-2xl shadow-sm border border-omame-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600 w-[250px]">名前（表示名）</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600">メールアドレス</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600 w-[150px]">権限</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-stone-600 w-[120px]">登録日</th>
                {isOwner && (
                  <th className="text-right px-6 py-4 text-sm font-bold text-stone-600 w-[150px]">操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleInfo = roleLabels[user.role] || roleLabels.user;
                const RoleIcon = roleInfo.icon;
                const isEditing = editingNameId === user.id;

                return (
                  <tr key={user.id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50 transition-colors">
                    {/* 名前セル */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            placeholder="名前を入力..."
                            className="flex-1 text-sm border border-stone-300 rounded px-2 py-1 focus:outline-none focus:border-omame-primary focus:ring-1 focus:ring-omame-primary"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleNameChange(user.id);
                              if (e.key === "Escape") setEditingNameId(null);
                            }}
                            disabled={updating === user.id}
                          />
                          <button 
                            onClick={() => handleNameChange(user.id)}
                            disabled={updating === user.id}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingNameId(null)}
                            disabled={updating === user.id}
                            className="p-1 text-stone-400 hover:bg-stone-100 rounded"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center group">
                          <span className={`text-sm font-bold ${user.display_name ? "text-omame-deep" : "text-stone-400 italic"}`}>
                            {user.display_name || "未設定"}
                          </span>
                          <button
                            onClick={() => {
                              setEditNameValue(user.display_name || "");
                              setEditingNameId(user.id);
                            }}
                            className="ml-2 p-1 text-stone-300 opacity-0 group-hover:opacity-100 hover:text-omame-primary transition-all rounded"
                            title="名前を編集"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* メールアドレス */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-stone-600">{user.email}</span>
                    </td>

                    {/* 権限 */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.color}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {roleInfo.label}
                      </span>
                    </td>

                    {/* 登録日 */}
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {new Date(user.created_at).toLocaleDateString("ja-JP")}
                    </td>

                    {/* 操作（オーナーのみ） */}
                    {isOwner && (
                      <td className="px-6 py-4 text-right">
                        {user.role === "owner" ? (
                          <span className="text-xs text-stone-400">変更不可</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => {
                              setConfirmDialog({
                                userId: user.id,
                                email: user.email,
                                currentRole: user.role,
                                newRole: e.target.value,
                              });
                            }}
                            disabled={updating === user.id}
                            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white hover:border-omame-primary focus:outline-none focus:ring-2 focus:ring-omame-primary/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">一般ユーザー</option>
                            <option value="salon_member">サロンメンバー</option>
                            <option value="admin">管理者</option>
                            <option value="owner">オーナー</option>
                          </select>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            ユーザーが登録されていません
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-stone-400">
        合計 {users.length} 名のユーザーが登録されています
      </p>

      {/* 確認ダイアログ */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-bold text-omame-deep">権限の変更確認</h3>
            </div>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              <strong>{confirmDialog.email}</strong> の権限を
              <br />
              <span className="font-bold">{roleLabels[confirmDialog.currentRole]?.label}</span>
              {" → "}
              <span className="font-bold text-omame-primary">{roleLabels[confirmDialog.newRole]?.label}</span>
              {" "}に変更しますか？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleRoleChange(confirmDialog.userId, confirmDialog.newRole)}
                disabled={updating !== null}
                className="px-4 py-2 text-sm bg-omame-primary text-white rounded-lg hover:bg-omame-deep transition-colors disabled:opacity-50"
              >
                {updating ? "変更中..." : "変更する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
