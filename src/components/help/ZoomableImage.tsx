"use client";

// タップで拡大できる画像（ライトボックス）。
// Step 4（Gmail 全体）/ Step 5（メール本文）のような PC 横長スクショは、SP の縦長前提だと
// 小さく見えてしまうため、通常表示は大きめ（max-w-2xl）にしつつ、タップで全画面拡大できるようにする。
// クリックで状態を持つため client component。

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export function ZoomableImage({ src, alt, width, height, caption }: Props) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setZoomed(true)}
        className="mx-auto block w-full max-w-2xl cursor-zoom-in"
        aria-label={`${alt}（タップで拡大）`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full rounded-2xl border border-omame-gold/20 shadow-sm"
        />
        <span className="mt-1 block text-center text-xs text-omame-text/60">
          🔍 タップで拡大できます
        </span>
      </button>

      {caption && (
        <p className="mt-2 text-center text-sm text-omame-text/70 md:text-base">
          {caption}
        </p>
      )}

      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="画像拡大表示"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
          <button
            type="button"
            className="fixed right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl text-black"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
