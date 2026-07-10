"use client";

import Image from "next/image";
import { CtaButton, Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §11 価格
// 価格競争の商品ではなく「数十年の研究の末に辿り着いた原理＝答えへの地図」を渡す講座として位置づける。
// 価値積み上げ方式は撤去。価格は pricing.ts（getProductPricing）由来で、ハードコードしない。
const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

// えりな先生の道のり（経歴ブロック）。
const career = [
  "音大での学び。",
  "留学経験。",
  "国際コンクールへの挑戦。",
  "20冊以上の研究ノート。",
  "数十年にわたる試行錯誤。",
];

export function Section11Price({
  regularPrice,
  salePrice,
  referralPrice,
  campaignLabel,
  showCampaign,
  showReferralDiscount,
  priceType = "general",
}: {
  regularPrice: number;
  salePrice: number;
  referralPrice: number;
  campaignLabel: string;
  showCampaign: boolean;
  showReferralDiscount: boolean;
  priceType?: "general" | "salon";
}) {
  return (
    <SectionShell id="price-section" className="bg-white">
      <Reveal>
        <Eyebrow>The Value</Eyebrow>
        <Heading>{"この講座は、\n47本の動画を販売するものではありません。"}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          お豆奏法は、ただの「ピアノ教材」ではありません。
          <br />
          <br />
          えりな先生が数十年をかけて
          <br />
          たどり着いた、
          <br />
          ピアノ演奏の原理・原則。
          <br />
          <br />
          その答えを、あなたに
          <br />
          直接お渡しする講座です。
        </p>

        {/* 経歴ブロック（控えめな gold 縦罫線・リズム感） */}
        <div className="mx-auto mt-12 max-w-xs">
          <div className="space-y-3 border-l-2 border-omame-gold/30 pl-5 text-base leading-relaxed text-omame-text/90">
            {career.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-8 space-y-2 text-center text-base leading-relaxed text-omame-deep">
            <p className="text-omame-gold/70">——</p>
            <p>すべての道のりを経て、</p>
            <p>ようやくたどり着いた、</p>
            <p className="font-bold">一つの答え。</p>
          </div>
        </div>
      </Reveal>

      {/* 図解：遠回りの学び方 vs お豆奏法（最短距離） */}
      <Reveal>
        <div className="py-10 md:py-16">
          <Image
            src="/images/omame-shortcut-road.png"
            alt="遠回りの学び方とお豆奏法の学び方を比較した図解"
            width={1536}
            height={1024}
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto w-full max-w-[1000px] rounded-2xl shadow-md"
          />
          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-loose text-omame-text/60">
            本やセミナー、レッスンを重ねても、答えに辿り着けるとは限りません。
            本講座は、えりな先生が長年の試行錯誤の末に見つけた“原理”から学ぶための講座です。
          </p>
        </div>
      </Reveal>

      {/* 直前メッセージ（LP 全体で最も印象的に） */}
      <Reveal>
        <div className="my-20 text-center">
          <span className="block font-serif text-5xl leading-none text-omame-gold/60">❝</span>
          <p className="mx-auto mt-4 max-w-md text-2xl font-bold leading-relaxed text-omame-deep md:text-3xl md:leading-relaxed">
            あなたが購入するのは
            <br />
            47本の動画ではなく、
            <br />
            <br />
            遠回りをしないための
            <br />
            地図です。
          </p>
          <span className="mt-4 block font-serif text-5xl leading-none text-omame-gold/60">❞</span>
        </div>
      </Reveal>

      {/* 価格表示。キャンペーン ON/OFF で表示ロジックを切り替える。 */}
      <Reveal>
        <div className="mx-auto max-w-md rounded-2xl border border-omame-gold/50 bg-omame-bg p-8 text-center shadow-sm shadow-omame-gold/10">
          {/* サロン専用バッジ（salon 時のみ・¥価格表示の直上） */}
          {priceType === "salon" && (
            <p className="mb-3 inline-block rounded-full border border-omame-gold/50 px-4 py-1 text-sm text-omame-deep">
              サロンメンバー特別価格
            </p>
          )}
          {showReferralDiscount ? (
            <>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-emerald-700">
                ご紹介特典 10%OFF
              </p>
              <p className="mt-3 text-sm text-omame-text/60">
                通常価格 <span className="line-through">{yen(regularPrice)}</span>
              </p>
              <p className="mt-1 text-sm text-omame-text/60">
                キャンペーン価格 <span className="line-through">{yen(salePrice)}</span>
              </p>
              <p className="mt-2 text-4xl font-bold text-omame-deep md:text-5xl">
                <span className="bg-gradient-to-b from-transparent to-emerald-200/50 px-1">
                  {yen(referralPrice)}
                </span>
                <span className="ml-1 text-base font-normal text-omame-text/70">（税込）</span>
              </p>
              <p className="mt-3 text-xs font-bold text-emerald-700">
                紹介リンク経由の方だけの自動割引価格です。
              </p>
            </>
          ) : showCampaign ? (
            <>
              {/* キャンペーン文言（campaignLabel をそのまま表示） */}
              {campaignLabel && (
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-omame-gold">
                  {campaignLabel}
                </p>
              )}
              {/* 通常価格は控えめに取り消し線で */}
              <p className="mt-3 text-sm text-omame-text/60">
                通常価格 <span className="line-through">{yen(regularPrice)}</span>
              </p>
              {/* 販売価格を gold アクセントで強調 */}
              <p className="mt-2 text-4xl font-bold text-omame-deep md:text-5xl">
                <span className="bg-gradient-to-b from-transparent to-omame-gold/20 px-1">
                  {yen(salePrice)}
                </span>
                <span className="ml-1 text-base font-normal text-omame-text/70">（税込）</span>
              </p>
            </>
          ) : (
            // キャンペーン OFF：通常価格のみ通常表示
            <p className="text-4xl font-bold text-omame-deep md:text-5xl">
              {yen(regularPrice)}
              <span className="ml-1 text-base font-normal text-omame-text/70">（税込）</span>
            </p>
          )}
        </div>

        <div className="mt-10">
          <CtaButton priceType={priceType}>
            {showReferralDiscount ? "10%OFFで受講する" : "今すぐ受講する"}
          </CtaButton>
        </div>
      </Reveal>
    </SectionShell>
  );
}
