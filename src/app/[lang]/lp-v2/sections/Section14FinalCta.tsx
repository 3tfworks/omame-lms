"use client";

import Link from "next/link";
import { CtaButton, Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §14 最終 CTA
// 最後のひと押し。すべての要素を凝縮した申込導線。
// 価格は §11 と同じく getProductPricing 由来。コンパクト表示版。
const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export function Section14FinalCta({
  lang,
  regularPrice,
  salePrice,
  campaignLabel,
  showCampaign,
}: {
  lang: string;
  regularPrice: number;
  salePrice: number;
  campaignLabel: string;
  showCampaign: boolean;
}) {
  return (
    <SectionShell>
      <Reveal>
        <Eyebrow>One Last Thing</Eyebrow>
        <Heading>{"もし今、\n「何か違う」と\n感じているなら。"}</Heading>

        <p className="mt-10 text-center text-base leading-loose text-omame-text md:text-lg">
          その感覚は、
          <br />
          間違っていないかもしれません。
          <br />
          <br />
          「もっと頑張らなきゃ」ではなく、
          <br />
          「何かを手放す」ことが
          <br />
          答えかもしれません。
          <br />
          <br />
          その入り口を、
          <br />
          お豆奏法 基礎講座でご用意しています。
        </p>

        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-omame-gold/50 bg-white p-8 text-center shadow-sm shadow-omame-gold/10">
          <p className="text-sm tracking-wide text-omame-deep">お豆奏法 基礎講座</p>
          {showCampaign ? (
            <>
              <p className="mt-3 text-3xl font-bold text-omame-deep md:text-4xl">
                <span className="mr-2 align-middle text-lg font-normal text-omame-text/50 line-through">
                  {yen(regularPrice)}
                </span>
                {yen(salePrice)}
              </p>
              <p className="mt-1 text-xs text-omame-text/70">
                税込{campaignLabel ? `・${campaignLabel}` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-3xl font-bold text-omame-deep md:text-4xl">
                {yen(regularPrice)}
              </p>
              <p className="mt-1 text-xs text-omame-text/70">税込</p>
            </>
          )}
        </div>

        <div className="mt-10">
          <CtaButton lang={lang} size="lg">
            今すぐ受講する
          </CtaButton>
        </div>

        <div className="mt-12 space-y-2 text-center text-xs leading-relaxed text-omame-text/60">
          <p>視聴期限: 受講開始から無期限</p>
          <p>決済方法: クレジットカード（Stripe）</p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-2">
            <Link href={`/${lang}/tokutei`} className="underline hover:text-omame-deep">
              特定商取引法に基づく表記
            </Link>
            <span aria-hidden>／</span>
            <Link href={`/${lang}/privacy`} className="underline hover:text-omame-deep">
              プライバシーポリシー
            </Link>
            <span aria-hidden>／</span>
            <Link href={`/${lang}/terms`} className="underline hover:text-omame-deep">
              利用規約
            </Link>
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}
