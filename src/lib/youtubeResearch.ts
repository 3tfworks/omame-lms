export const RESEARCH_PILLARS = [
  "pain",
  "principle",
  "practice",
  "story",
  "teacher",
] as const;

export const RESEARCH_STATUSES = [
  "candidate",
  "researching",
  "script",
  "scheduled",
  "editing",
  "published",
  "measuring",
] as const;

export type ResearchPillar = (typeof RESEARCH_PILLARS)[number];
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number];

export type ResearchKeyword = {
  id: string;
  keyword: string;
  source_seed: string | null;
  status: "candidate" | "adopted" | "rejected";
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CommentAnalysis = {
  totalComments: number;
  categoryCounts: Record<string, number>;
  questions: string[];
  frequentSignals: Array<{ phrase: string; count: number }>;
  representativeComments: Record<string, string[]>;
};

export type ResearchVideo = {
  id: string;
  url: string;
  video_id: string | null;
  title: string;
  channel_name: string;
  published_at: string | null;
  view_count: number;
  channel_subscribers: number;
  duration_minutes: number;
  notes: string;
  comments_text: string;
  comment_analysis: CommentAnalysis;
  created_at: string;
  updated_at: string;
  content_format?: "standard" | "classical_shorts";
};

export type ResearchIdea = {
  id: string;
  title: string;
  pillar: ResearchPillar;
  status: ResearchStatus;
  target_audience: string;
  problem: string;
  hook: string;
  demonstration: string;
  cta: string;
  source_keyword: string;
  source_url: string;
  thumbnail_a: string;
  thumbnail_b: string;
  thumbnail_c: string;
  demand_score: number;
  fit_score: number;
  proof_score: number;
  conversion_score: number;
  ease_score: number;
  score_total: number;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  content_format: "standard" | "classical_shorts";
  composer: string;
  piece_title: string;
  difficult_passage: string;
  opening_overlay: string;
  performance_segment: string;
  shot_plan: string[];
  target_duration_seconds: number;
  rights_note: string;
};

const KEYWORD_MODIFIERS = [
  "できない",
  "なぜ",
  "コツ",
  "大人",
  "初心者",
  "ピアノ講師",
  "手首",
  "痛い",
  "ミス",
  "本番",
  "音が硬い",
  "力が抜けない",
] as const;

export function generateResearchKeywords(seed: string): string[] {
  const normalized = seed.trim().replace(/\s+/g, " ");
  if (!normalized) return [];

  return Array.from(
    new Set([
      normalized,
      ...KEYWORD_MODIFIERS.map((modifier) => `${normalized} ${modifier}`),
    ]),
  );
}

export function youtubeSearchUrl(keyword: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live"].includes(parts[0])) return parts[1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

const COMMENT_CATEGORIES: Record<string, readonly string[]> = {
  "力み・身体": ["力む", "力み", "脱力", "手首", "指", "腕", "肩", "痛", "疲れ", "固ま"],
  音色: ["音色", "音が硬", "硬い音", "響き", "きれいな音", "弱い音", "鳴ら"],
  譜読み: ["譜読み", "楽譜", "音符", "初見", "読め"],
  ミス: ["ミス", "間違", "弾けない", "止まる", "崩れ"],
  "本番・緊張": ["本番", "発表会", "緊張", "舞台", "人前"],
  練習方法: ["練習", "テンポ", "片手", "両手", "反復", "覚え"],
  生徒指導: ["生徒", "先生", "レッスン", "教え", "子ども", "宿題"],
  "不安・反論": ["不安", "心配", "本当", "必要", "だめ", "怖", "できるでしょうか"],
  "理想・願望": ["なりたい", "弾きたい", "できるよう", "楽し", "自然", "自由"],
};

const SIGNAL_PHRASES = [
  "力が抜けない",
  "音が硬い",
  "手首が痛い",
  "同じ場所でミス",
  "譜読みが遅い",
  "本番で崩れる",
  "練習してこない",
  "何が正解かわからない",
  "ピアノが苦しい",
  "きれいな音",
  "自然に弾きたい",
] as const;

function emptyAnalysis(): CommentAnalysis {
  return {
    totalComments: 0,
    categoryCounts: Object.fromEntries(Object.keys(COMMENT_CATEGORIES).map((key) => [key, 0])),
    questions: [],
    frequentSignals: [],
    representativeComments: {},
  };
}

export function analyzeResearchComments(text: string): CommentAnalysis {
  const comments = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 2);

  if (comments.length === 0) return emptyAnalysis();

  const categoryCounts: Record<string, number> = {};
  const representativeComments: Record<string, string[]> = {};

  for (const [category, terms] of Object.entries(COMMENT_CATEGORIES)) {
    const matches = comments.filter((comment) => terms.some((term) => comment.includes(term)));
    categoryCounts[category] = matches.length;
    representativeComments[category] = matches.slice(0, 3);
  }

  const frequentSignals = SIGNAL_PHRASES.map((phrase) => ({
    phrase,
    count: comments.filter((comment) => comment.includes(phrase)).length,
  }))
    .filter((signal) => signal.count > 0)
    .sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase, "ja"));

  const questions = comments
    .filter((comment) => /[?？]$/.test(comment) || /(ですか|ますか|でしょうか|なぜ|どうすれば)/.test(comment))
    .slice(0, 12);

  return {
    totalComments: comments.length,
    categoryCounts,
    questions,
    frequentSignals,
    representativeComments,
  };
}

export type IdeaScores = {
  demand_score: number;
  fit_score: number;
  proof_score: number;
  conversion_score: number;
  ease_score: number;
};

const SCORE_LIMITS: Record<keyof IdeaScores, number> = {
  demand_score: 30,
  fit_score: 30,
  proof_score: 20,
  conversion_score: 15,
  ease_score: 5,
};

export function normalizeIdeaScores(scores: IdeaScores): IdeaScores {
  return Object.fromEntries(
    (Object.keys(SCORE_LIMITS) as Array<keyof IdeaScores>).map((key) => {
      const value = Number.isFinite(scores[key]) ? Math.round(scores[key]) : 0;
      return [key, Math.min(SCORE_LIMITS[key], Math.max(0, value))];
    }),
  ) as IdeaScores;
}

export function totalIdeaScore(scores: IdeaScores): number {
  return Object.values(normalizeIdeaScores(scores)).reduce((sum, score) => sum + score, 0);
}
