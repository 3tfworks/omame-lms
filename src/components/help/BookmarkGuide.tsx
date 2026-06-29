// ブックマーク登録手順の共有コンポーネント（SP・iPhone Safari の例）。
// help ページ（/ja/help/login の §3-1）と LMS トップのご案内バナーの両方から呼ばれる。
// hooks を使わない純表示コンポーネントのため "use client" 不要（server / client どちらからも利用可）。

import Image from "next/image";

// 4 ステップ（画像 + キャプション）。文面・alt は仕様書 v4 §3-1 / §6 通り。
const BOOKMARK_STEPS = [
  {
    img: "/images/help/omame-bookmark-step1-sp.png",
    alt: "iPhone Safari の画面下にある共有ボタン",
    cap: "① 画面下の「共有ボタン」（□に↑のマーク）を押します",
  },
  {
    img: "/images/help/omame-bookmark-step2-sp.png",
    alt: "共有メニューに表示された「ブックマークを追加」",
    cap: "② 表示されるメニューから「ブックマークを追加」を選びます",
  },
  {
    img: "/images/help/omame-bookmark-step3-sp.png",
    alt: "ブックマーク保存画面。名前を確認して保存する画面",
    cap: "③ お好きな名前（例:「お豆奏法」）を確認して、右上の「保存」を押します",
  },
  {
    img: "/images/help/omame-bookmark-step4-sp.png",
    alt: "Safari のブックマーク一覧に登録されたお豆奏法",
    cap: "④ 次回からは、Safari のブックマーク一覧から一発でアクセスできます",
  },
];

export function BookmarkGuide() {
  return (
    <div className="space-y-8">
      {BOOKMARK_STEPS.map((s) => (
        <div key={s.img}>
          <Image
            src={s.img}
            alt={s.alt}
            width={390}
            height={844}
            className="mx-auto h-auto w-full max-w-xs rounded-2xl border border-omame-gold/20 shadow-sm"
          />
          <p className="mt-3 text-center text-base leading-relaxed text-omame-text/90 md:text-lg">
            {s.cap}
          </p>
        </div>
      ))}

      {/* Android 端末ユーザー向け補足 */}
      <p className="mt-6 rounded-2xl bg-omame-bg p-4 text-sm leading-relaxed text-omame-text/80 md:text-base">
        Android 端末で Chrome をお使いの方は、画面右上の「メニュー（︙）」から「ブックマーク」または「ホーム画面に追加」を選んでいただくと、同じように登録できます。
      </p>
    </div>
  );
}
