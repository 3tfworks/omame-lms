import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeYouTubeResearchConfig,
  parseIsoDurationSeconds,
  rankResearchVideos,
  type CollectedYouTubeVideo,
} from "./youtubeDataApi.ts";

test("normalizes research limits and removes duplicate keywords", () => {
  assert.deepEqual(
    normalizeYouTubeResearchConfig({
      keywords: [" ピアノ 脱力 ", "ピアノ 脱力", "音が硬い"],
      videosPerKeyword: 99,
      commentsPerVideo: -3,
      ideaCount: 1,
    }),
    {
      researchMode: "standard",
      keywords: ["ピアノ 脱力", "音が硬い"],
      videosPerKeyword: 10,
      commentsPerVideo: 0,
      ideaCount: 3,
    },
  );
});

test("normalizes classical Shorts mode", () => {
  const config = normalizeYouTubeResearchConfig({
    researchMode: "classical_shorts",
    keywords: ["ショパン shorts"],
  });
  assert.equal(config.researchMode, "classical_shorts");
});

test("parses YouTube ISO 8601 durations", () => {
  assert.equal(parseIsoDurationSeconds("PT12M34S"), 754);
  assert.equal(parseIsoDurationSeconds("PT1H2M3S"), 3_723);
  assert.equal(parseIsoDurationSeconds("invalid"), 0);
});

test("ranks recent videos by views per day", () => {
  const base: CollectedYouTubeVideo = {
    videoId: "a",
    url: "https://youtube.com/watch?v=a",
    title: "A",
    description: "",
    channelId: "c",
    channelName: "C",
    publishedAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    thumbnailUrl: "",
    viewCount: 1_000,
    likeCount: 10,
    commentCount: 2,
    channelSubscribers: 100,
    durationSeconds: 60,
    searchKeyword: "ピアノ",
    comments: [],
  };
  const ranked = rankResearchVideos([
    base,
    { ...base, videoId: "b", viewCount: 5_000 },
  ]);
  assert.equal(ranked[0].videoId, "b");
  assert.ok(ranked[0].viewsPerDay > ranked[1].viewsPerDay);
});

test("Shorts ranking rewards engagement", () => {
  const base: CollectedYouTubeVideo = {
    videoId: "a",
    url: "https://youtube.com/shorts/a",
    title: "A",
    description: "",
    channelId: "c",
    channelName: "C",
    publishedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    thumbnailUrl: "",
    viewCount: 10_000,
    likeCount: 100,
    commentCount: 10,
    channelSubscribers: 10_000,
    durationSeconds: 30,
    searchKeyword: "クラシック shorts",
    comments: [],
  };
  const ranked = rankResearchVideos([
    base,
    { ...base, videoId: "b", likeCount: 1_000, commentCount: 100 },
  ], "classical_shorts");
  assert.equal(ranked[0].videoId, "b");
});
