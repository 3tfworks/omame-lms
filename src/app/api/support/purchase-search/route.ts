import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/authUsers";
import { getSupportAccess } from "@/lib/supportAuth";
import { searchStripePurchases } from "@/lib/stripePurchaseSearch";

export async function GET(request: Request) {
  const access = await getSupportAccess();
  if (!access?.canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: access ? 403 : 401 });
  }

  const params = new URL(request.url).searchParams;
  const inquiryEmail = normalizeEmail(params.get("email") || "");
  const customerName = (params.get("name") || "").trim();
  const purchaseDate = (params.get("date") || "").trim();
  const amountText = (params.get("amount") || "").trim();
  const amount = amountText ? Number(amountText) : undefined;

  if (!purchaseDate || (!customerName && amount === undefined)) {
    return NextResponse.json(
      { error: "別のメールアドレスを探すには、購入日と、氏名または金額を入力してください。" },
      { status: 400 },
    );
  }
  if (amount !== undefined && (!Number.isInteger(amount) || amount <= 0 || amount > 10_000_000)) {
    return NextResponse.json({ error: "購入金額を正しく入力してください。" }, { status: 400 });
  }
  if (inquiryEmail && (!inquiryEmail.includes("@") || inquiryEmail.length > 320)) {
    return NextResponse.json({ error: "メールアドレスを正しく入力してください。" }, { status: 400 });
  }
  if (customerName.length > 100) {
    return NextResponse.json({ error: "氏名が長すぎます。" }, { status: 400 });
  }

  try {
    const candidates = await searchStripePurchases({
      inquiryEmail: inquiryEmail || undefined,
      customerName: customerName || undefined,
      purchaseDate,
      amount,
    });
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("[Support Purchase Search] Failed:", error);
    return NextResponse.json({ error: "購入記録の検索に失敗しました。" }, { status: 500 });
  }
}
