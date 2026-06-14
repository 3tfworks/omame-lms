import { getReferrerInviteName } from "@/lib/invite";
import InviteClient from "./InviteClient";

// Server Component: 紹介者名をサーバ側で取得し、クライアントへ name 文字列のみを渡す。
// referrer 取得は admin client（サーバ専用）で行い、email 等はクライアントへ渡さない。
export default async function InvitePage({
  params,
}: {
  params: Promise<{ lang: string; userId: string }>;
}) {
  const { lang, userId } = await params;
  const referrerName = await getReferrerInviteName(userId);

  return <InviteClient lang={lang} userId={userId} referrerName={referrerName} />;
}
