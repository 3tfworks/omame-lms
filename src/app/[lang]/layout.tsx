import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Outfit } from "next/font/google";
import "../globals.css";
import { getDictionary, isValidLocale, locales, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

const shipporiMincho = Shippori_Mincho({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400"],
});

// viewport を明示的に宣言（Next のデフォルトと同等だが、こちらで所有して確実に出力する）。
// viewportFit: "cover" は FV の全面背景がノッチ端末でも端まで届くようにするため。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// 各言語のページを事前に生成
export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// 言語ごとに適切なメタデータを設定
export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isValidLocale(lang) ? lang : "ja";
  const dict = getDictionary(locale);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  return (
    <html lang={lang} className={`${shipporiMincho.variable} ${outfit.variable} scroll-smooth`}>
      <body className="min-h-full flex flex-col font-serif antialiased bg-omame-bg text-omame-text overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
