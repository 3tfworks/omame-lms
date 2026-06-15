"use client";

import { CtaButton, Eyebrow, Heading, Reveal, SectionShell } from "../ui";

// §11 価格
// 価格を出す前に、価値を積み上げる。「29,800 円」が安く見えるように構成。
// 価格は pricing.ts（getProductPricing）由来の値を props で受け取り、ハードコードしない。
const valueItems = [
  { label: "動画講座（全 5 章 47 本）", amount: 39800 },
  { label: "レバメモ（学習サポート資料）", amount: 9800 },
  { label: "マイノート機能", amount: 3000 },
  { label: "質問・相談サポート", amount: 16600 },
];

const valueTotal = valueItems.reduce((sum, v) => sum + v.amount, 0);

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export function Section11Price({
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
    <SectionShell className="bg-white">
      <Reveal>
        <Eyebrow>Investment</Eyebrow>
        <Heading>{`この講座を、\n${(showCampaign ? salePrice : regularPrice).toLocaleString("ja-JP")}円でお届けします。`}</Heading>

        <p className="mt-8 text-center text-base leading-loose text-omame-text md:text-lg">
          通常、これだけのコンテンツと
          <br />
          サポートを受けようとすれば、
          <br />
          決して安くはない金額になります。
          <br />
          <br />
          実際の価値の内訳を、
          <br />
          正直にお伝えします。
        </p>

        {/* 価値の内訳 */}
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-omame-gold/20 bg-omame-bg p-6 md:p-8">
          <ul className="space-y-3">
            {valueItems.map((v) => (
              <li
                key={v.label}
                className="flex items-baseline justify-between gap-4 text-sm md:text-base"
              >
                <span className="text-omame-text/80">{v.label}</span>
                <span className="shrink-0 text-omame-text/60">
                  {yen(v.amount)}相当
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-omame-gold/30 pt-4 font-bold text-omame-deep">
            <span>合計</span>
            <span>{yen(valueTotal)}相当</span>
          </div>
        </div>

        {/* 価格表示。キャンペーン ON/OFF で表示ロジックを切り替える。 */}
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-omame-gold/50 bg-omame-bg p-8 text-center shadow-sm shadow-omame-gold/10">
          {showCampaign ? (
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
          <CtaButton lang={lang}>今すぐ受講する</CtaButton>
        </div>
      </Reveal>
    </SectionShell>
  );
}
