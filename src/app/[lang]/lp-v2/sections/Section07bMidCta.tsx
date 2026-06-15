"use client";

import { ArrowDown } from "lucide-react";

// §7b 中間CTA
// 受講者の声（§7）の直後に、価格セクションへ誘導するアンカーCTAを置く。
// 既存 CTA ボタンとデザインを統一（gold + rounded-full + shadow）。
export function Section07bMidCta() {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto flex max-w-md justify-center">
        <a
          href="#price-section"
          className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-omame-gold px-10 py-4 text-base font-bold text-white shadow-lg shadow-omame-gold/20 transition-all hover:-translate-y-0.5 hover:bg-omame-gold/90 active:translate-y-0"
        >
          今すぐ受講する
          <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
