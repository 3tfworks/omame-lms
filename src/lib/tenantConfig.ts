export type AnimationStyle = "pixie-dust" | "shimmer" | "none";

export interface TenantDecorationConfig {
  todaysMessage: {
    watermarkImage: string | null;
    stampImage: string | null;
    animationStyle: AnimationStyle;
  };
}

export interface TenantConfig {
  id: string;
  name: string;
  theme: string;
  decorations: TenantDecorationConfig;
}

// データベースから取得する設定データのモック（将来的にはSupabaseから取得）
export const currentTenantConfig: TenantConfig = {
  id: "omame-salon",
  name: "おうちで学べるお豆奏法基礎講座",
  theme: "omame-hybrid",
  decorations: {
    todaysMessage: {
      watermarkImage: "/images/decorations/feather-watermark.png",
      stampImage: "/images/decorations/wax-stamp.png",
      animationStyle: "pixie-dust",
    },
  },
};
