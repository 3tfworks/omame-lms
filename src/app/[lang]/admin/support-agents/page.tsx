import { redirect } from "next/navigation";
import { SupportAgentManager } from "@/components/admin/SupportAgentManager";
import { getSupportAccess } from "@/lib/supportAuth";

export default async function AdminSupportAgentsPage() {
  const access = await getSupportAccess();
  if (!access?.canManageAgents) redirect("/ja/admin/support");

  return <SupportAgentManager />;
}
