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
  referralPrice,
  campaignLabel,
  showCampaign,
  showReferralDiscount,
  priceType = "general",
}: {
  lang: string;
  regularPrice: number;
  salePrice: number;
  referralPrice: number;
  campaignLabel: string;
  showCampaign: boolean;
  showReferralDiscount: boolean;
  priceType?: "general" | "salon";
}) {
  return (
    <SectionShell>
      <Reveal>
        <Eyebrow>One Last Thing</Eyebrow>
        <Heading>{"もし今、\n頑張っているのに変わらない、\nそう感じているなら。"}</Heading>

        <p className="mt-10 text-center text-base leading-loose text-omame-text md:text-lg">
          その原因は、才能ではなく、
          <br />
          前提そのものかもしれません。
          <br />
          <br />
          「もっと頑張らなきゃ」ではなく、
          <br />
          「何かを手放す」こと。
          <br />
          <br />
          その入り口を、
          <br />
          ここにご用意しています。
        </p>

        <div className="mx-auto mt-8 max-w-[340px] rounded-2xl border border-omame-gold/50 bg-white px-5 py-7 text-center shadow-sm shadow-omame-gold/10 md:mt-12 md:max-w-md md:p-8">
          <p className="text-sm tracking-wide text-omame-deep">お豆奏法 基礎講座</p>
          {/* サロン専用バッジ（salon 時のみ・¥価格表示の直上） */}
          {priceType === "salon" && (
            <p className="mt-3 mb-3 inline-block rounded-full border border-omame-gold/50 px-4 py-1 text-sm text-omame-deep">
              サロンメンバー特別価格
            </p>
          )}
          {showReferralDiscount ? (
            <>
              <p className="mt-3 text-xs font-bold text-emerald-700">
                ご紹介特典 10%OFF
              </p>
              <p className="mt-2 text-4xl font-bold text-omame-deep">
                <span className="mr-2 align-middle text-lg font-normal text-omame-text/50 line-through">
                  {yen(salePrice)}
                </span>
                {yen(referralPrice)}
              </p>
              <p className="mt-1 text-xs font-bold text-emerald-700">
                税込・紹介リンク経由の自動割引価格
              </p>
            </>
          ) : showCampaign ? (
            <>
              <p className="mt-3 text-4xl font-bold text-omame-deep">
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
              <p className="mt-3 text-4xl font-bold text-omame-deep">
                {yen(regularPrice)}
              </p>
              <p className="mt-1 text-xs text-omame-text/70">税込</p>
            </>
          )}
        </div>

        <div className="mt-8 md:mt-10">
          <CtaButton
            size="lg"
            priceType={priceType}
            className="h-14 w-[85%] max-w-[320px] md:h-auto md:w-auto md:max-w-none"
          >
            {showReferralDiscount ? "10%OFFで受講する" : "今すぐ受講する"}
          </CtaButton>
        </div>

        <div className="mt-7 space-y-2 text-center text-xs leading-7 text-omame-text/60 md:mt-12">
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
