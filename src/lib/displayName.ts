// 表示名（display_name / referral_display_name）の検証ルール。
// クライアント（入力UI）とサーバ（API）で同じ基準を使うため共通化する。
// サーバ側はこの validateDisplayName を必ず通し、クライアント検証だけに頼らない。

export const DISPLAY_NAME_MAX = 20;

// 改行・タブ等の制御文字（C0 制御文字 + DEL）
const CONTROL_CHARS = /[\x00-\x1f\x7f]/;

export type DisplayNameResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

// 必須の表示名（setup-name 用）。空白のみ・空文字は不可。
export function validateDisplayName(input: unknown): DisplayNameResult {
  if (typeof input !== "string") {
    return { ok: false, message: "お名前を入力してください。" };
  }
  const trimmed = input.trim();
  if (trimmed === "") {
    return { ok: false, message: "お名前を入力してください。" };
  }
  if (CONTROL_CHARS.test(trimmed)) {
    return { ok: false, message: "お名前に使用できない文字が含まれています。" };
  }
  if (trimmed.length > DISPLAY_NAME_MAX) {
    return { ok: false, message: `お名前は${DISPLAY_NAME_MAX}文字以内で入力してください。` };
  }
  return { ok: true, value: trimmed };
}
