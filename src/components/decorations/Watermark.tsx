import React from "react";
import Image from "next/image";

interface WatermarkProps {
  imageUrl: string;
  opacity?: number;
  position?: "right" | "left" | "center";
  className?: string;
}

export function Watermark({ imageUrl, opacity = 0.05, position = "right", className = "" }: WatermarkProps) {
  // 位置に応じたクラス
  const positionClasses = {
    right: "right-[-5%] top-[10%] w-[50%] h-[120%]",
    left: "left-[-5%] top-[10%] w-[50%] h-[120%]",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%]",
  };

  return (
    <div className={`absolute pointer-events-none z-0 ${positionClasses[position]} ${className}`} style={{ opacity }}>
      <Image
        src={imageUrl}
        alt="Background Watermark"
        fill
        className="object-contain"
      />
    </div>
  );
}
