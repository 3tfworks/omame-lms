import Link from "next/link";
import { LoginSupportConsole } from "@/components/admin/LoginSupportConsole";
import { getSupportAccess } from "@/lib/supportAuth";

export default async function AdminLoginSupportPage() {
  const access = await getSupportAccess();

  return (
    <>
      {access?.canManageAgents && (
        <div className="mb-4 flex justify-end">
          <Link
            href="/ja/admin/support-agents"
            className="inline-flex min-h-10 items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
          >
            事務担当者管理
          </Link>
        </div>
      )}
      <LoginSupportConsole />
    </>
  );
}
