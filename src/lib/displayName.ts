// 表示名（display_name / referral_display_name）の検証ルール。
// クライアント（入力UI）とサーバ（API）で同じ基準を使うため共通化する。
// サーバ側はこの validateDisplayName を必ず通し、クライアント検証だけに頼らない。

export const DISPLAY_NAME_MAX = 20;
export const LEGAL_NAME_MAX = 50;

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

// 任意の表示名（招待用 referral_display_name 用）。
// 空文字・空白のみは「上書き解除」として null を返す（許可）。値があれば必須版と同じ基準で検証。
export type OptionalDisplayNameResult =
  | { ok: true; value: string | null }
  | { ok: false; message: string };

export function validateOptionalDisplayName(input: unknown): OptionalDisplayNameResult {
  // 未指定・空は「解除」として許可
  if (input === undefined || input === null) {
    return { ok: true, value: null };
  }
  if (typeof input !== "string") {
    return { ok: false, message: "お名前に使用できない値です。" };
  }
  if (input.trim() === "") {
    return { ok: true, value: null };
  }
  const result = validateDisplayName(input);
  if (!result.ok) return result;
  return { ok: true, value: result.value };
}

export type LegalNameResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

// 購入者管理用の本名。画面表示名とは別管理にし、空白のみ・空文字は不可。
export function validateLegalName(input: unknown): LegalNameResult {
  if (typeof input !== "string") {
    return { ok: false, message: "本名を入力してください。" };
  }
  const trimmed = input.trim();
  if (trimmed === "") {
    return { ok: false, message: "本名を入力してください。" };
  }
  if (CONTROL_CHARS.test(trimmed)) {
    return { ok: false, message: "本名に使用できない文字が含まれています。" };
  }
  if (trimmed.length > LEGAL_NAME_MAX) {
    return { ok: false, message: `本名は${LEGAL_NAME_MAX}文字以内で入力してください。` };
  }
  return { ok: true, value: trimmed };
}

export type OptionalLegalNameResult =
  | { ok: true; value: string | null }
  | { ok: false; message: string };

// 管理者画面など、既存ユーザーの本名を後から整備する用途。
// 空文字・空白のみは「未登録」に戻すため null として許可する。
export function validateOptionalLegalName(input: unknown): OptionalLegalNameResult {
  if (input === undefined || input === null) {
    return { ok: true, value: null };
  }
  if (typeof input !== "string") {
    return { ok: false, message: "本名に使用できない値です。" };
  }
  if (input.trim() === "") {
    return { ok: true, value: null };
  }
  const result = validateLegalName(input);
  if (!result.ok) return result;
  return { ok: true, value: result.value };
}
