// 多言語管理の統合ファイル
import { ja } from "./ja";
import { en } from "./en";
import { fr } from "./fr";

// サポートする言語一覧
export const locales = ["ja", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

// デフォルト言語
export const defaultLocale: Locale = "ja";

// 翻訳データのマッピング
const dictionaries: Record<Locale, any> = {
  ja,
  en,
  fr,
};

// 指定された言語の翻訳データを取得する関数
export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

// URLのパスが有効な言語コードかチェックする関数
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
