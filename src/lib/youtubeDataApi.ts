const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export type YouTubeResearchConfig = {
  researchMode: YouTubeResearchMode;
  keywords: string[];
  videosPerKeyword: number;
  commentsPerVideo: number;
  ideaCount: number;
};

export const YOUTUBE_RESEARCH_MODES = ["standard", "classical_shorts"] as const;
export type YouTubeResearchMode = (typeof YOUTUBE_RESEARCH_MODES)[number];

export type CollectedYouTubeVideo = {
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelId: string;
  channelName: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channelSubscribers: number;
  durationSeconds: number;
  searchKeyword: string;
  comments: string[];
};

type SearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
  };
};

type VideoItem = {
  id?: string;
  snippet?: SearchItem["snippet"];
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails?: { duration?: string };
};

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeYouTubeResearchConfig(
  input: Partial<YouTubeResearchConfig>,
): YouTubeResearchConfig {
  const keywords = Array.from(
    new Set((input.keywords ?? []).map((keyword) => keyword.trim()).filter(Boolean)),
  ).slice(0, 5);
  return {
    researchMode: YOUTUBE_RESEARCH_MODES.includes(input.researchMode as YouTubeResearchMode)
      ? (input.researchMode as YouTubeResearchMode)
      : "standard",
    keywords,
    videosPerKeyword: clampInteger(input.videosPerKeyword ?? 8, 1, 10),
    commentsPerVideo: clampInteger(input.commentsPerVideo ?? 20, 0, 50),
    ideaCount: clampInteger(input.ideaCount ?? 8, 3, 12),
  };
}

export function parseIsoDurationSeconds(duration: string): number {
  const match = duration.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/,
  );
  if (!match) return 0;
  return (
    Number(match[1] || 0) * 86_400 +
    Number(match[2] || 0) * 3_600 +
    Number(match[3] || 0) * 60 +
    Number(match[4] || 0)
  );
}

function number(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

async function youtubeRequest<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube API ${path} failed (${response.status}): ${body.slice(0, 500)}`);
  }
  return (await response.json()) as T;
}

async function fetchComments(videoId: string, maxResults: number, apiKey: string) {
  if (maxResults === 0) return [];
  try {
    const result = await youtubeRequest<{
      items?: Array<{
        snippet?: { topLevelComment?: { snippet?: { textDisplay?: string } } };
      }>;
    }>(
      "commentThreads",
      {
        part: "snippet",
        videoId,
        maxResults: String(maxResults),
        order: "relevance",
        textFormat: "plainText",
      },
      apiKey,
    );
    return (result.items ?? [])
      .map((item) => item.snippet?.topLevelComment?.snippet?.textDisplay?.trim() ?? "")
      .filter(Boolean);
  } catch (error) {
    // Disabled comments are common and should not fail the whole research run.
    console.warn(`[YouTube Research] comments skipped for ${videoId}`, error);
    return [];
  }
}

export async function collectYouTubeVideos(
  config: YouTubeResearchConfig,
  apiKey: string,
): Promise<CollectedYouTubeVideo[]> {
  const searchResults = await Promise.all(
    config.keywords.map(async (keyword) => {
      const result = await youtubeRequest<{ items?: SearchItem[] }>(
        "search",
        {
          part: "snippet",
          q: keyword,
          type: "video",
          maxResults: String(config.videosPerKeyword),
          order: "relevance",
          relevanceLanguage: "ja",
          regionCode: "JP",
          safeSearch: "moderate",
          ...(config.researchMode === "classical_shorts" ? { videoDuration: "short" } : {}),
        },
        apiKey,
      );
      return (result.items ?? []).map((item) => ({ keyword, item }));
    }),
  );

  const searchById = new Map<string, { keyword: string; item: SearchItem }>();
  searchResults.flat().forEach((entry) => {
    const id = entry.item.id?.videoId;
    if (id && !searchById.has(id)) searchById.set(id, entry);
  });
  const ids = Array.from(searchById.keys());
  if (ids.length === 0) return [];

  const details = await youtubeRequest<{ items?: VideoItem[] }>(
    "videos",
    { part: "snippet,statistics,contentDetails", id: ids.join(",") },
    apiKey,
  );
  const channelIds = Array.from(
    new Set((details.items ?? []).map((item) => item.snippet?.channelId).filter(Boolean)),
  ) as string[];
  const channels = channelIds.length
    ? await youtubeRequest<{
        items?: Array<{ id?: string; statistics?: { subscriberCount?: string } }>;
      }>("channels", { part: "statistics", id: channelIds.join(",") }, apiKey)
    : { items: [] };
  const subscribers = new Map(
    (channels.items ?? []).map((item) => [item.id ?? "", number(item.statistics?.subscriberCount)]),
  );

  const collected: CollectedYouTubeVideo[] = [];
  const detailItems = details.items ?? [];
  // Keep comment requests in small batches to avoid sudden API bursts.
  for (let index = 0; index < detailItems.length; index += 5) {
    const batch = await Promise.all(detailItems.slice(index, index + 5).map(async (item) => {
      const videoId = item.id ?? "";
      const search = searchById.get(videoId);
      const snippet = item.snippet ?? search?.item.snippet ?? {};
      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: snippet.title ?? "",
        description: snippet.description ?? "",
        channelId: snippet.channelId ?? "",
        channelName: snippet.channelTitle ?? "",
        publishedAt: snippet.publishedAt ?? new Date(0).toISOString(),
        thumbnailUrl:
          snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url ?? "",
        viewCount: number(item.statistics?.viewCount),
        likeCount: number(item.statistics?.likeCount),
        commentCount: number(item.statistics?.commentCount),
        channelSubscribers: subscribers.get(snippet.channelId ?? "") ?? 0,
        durationSeconds: parseIsoDurationSeconds(item.contentDetails?.duration ?? ""),
        searchKeyword: search?.keyword ?? "",
        comments: await fetchComments(videoId, config.commentsPerVideo, apiKey),
      };
    }));
    collected.push(...batch);
  }
  return config.researchMode === "classical_shorts"
    ? collected.filter((video) => video.durationSeconds > 0 && video.durationSeconds <= 180)
    : collected;
}

export function rankResearchVideos(
  videos: CollectedYouTubeVideo[],
  researchMode: YouTubeResearchMode = "standard",
) {
  const now = Date.now();
  return [...videos]
    .map((video) => {
      const ageDays = Math.max(1, (now - new Date(video.publishedAt).getTime()) / 86_400_000);
      const viewsPerDay = video.viewCount / ageDays;
      const subscriberOutlier =
        video.channelSubscribers > 0 ? video.viewCount / video.channelSubscribers : 0;
      const engagementRate = video.viewCount > 0
        ? (video.likeCount + video.commentCount) / video.viewCount
        : 0;
      const shortsScore = Math.log10(viewsPerDay + 1) * 0.55
        + Math.log10(subscriberOutlier + 1) * 0.25
        + Math.min(engagementRate, 0.2) * 10;
      return { ...video, viewsPerDay, subscriberOutlier, engagementRate, shortsScore };
    })
    .sort((a, b) => researchMode === "classical_shorts"
      ? b.shortsScore - a.shortsScore || b.viewsPerDay - a.viewsPerDay
      : b.viewsPerDay - a.viewsPerDay || b.subscriberOutlier - a.subscriberOutlier);
}
