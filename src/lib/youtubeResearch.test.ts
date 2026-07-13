import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeResearchComments,
  extractYouTubeVideoId,
  generateResearchKeywords,
  normalizeIdeaScores,
  totalIdeaScore,
} from "./youtubeResearch.ts";

test("generateResearchKeywords creates unique Japanese research queries", () => {
  const keywords = generateResearchKeywords("  ピアノ   脱力  ");
  assert.equal(keywords[0], "ピアノ 脱力");
  assert.ok(keywords.includes("ピアノ 脱力 力が抜けない"));
  assert.equal(new Set(keywords).size, keywords.length);
});

test("extractYouTubeVideoId supports watch, short and share URLs", () => {
  assert.equal(extractYouTubeVideoId("https://www.youtube.com/watch?v=abcdefghijk"), "abcdefghijk");
  assert.equal(extractYouTubeVideoId("https://youtu.be/abcdefghijk"), "abcdefghijk");
  assert.equal(extractYouTubeVideoId("https://www.youtube.com/shorts/abcdefghijk"), "abcdefghijk");
  assert.equal(extractYouTubeVideoId("not-a-url"), null);
});

test("analyzeResearchComments categorizes pain and extracts questions", () => {
  const analysis = analyzeResearchComments([
    "力が抜けないので手首が痛いです",
    "本番になると同じ場所でミスします",
    "どうすれば自然に弾けますか？",
  ].join("\n"));

  assert.equal(analysis.totalComments, 3);
  assert.equal(analysis.categoryCounts["力み・身体"], 1);
  assert.equal(analysis.categoryCounts["本番・緊張"], 1);
  assert.equal(analysis.questions.length, 1);
  assert.ok(analysis.frequentSignals.some((signal) => signal.phrase === "力が抜けない"));
  assert.ok(analysis.frequentSignals.some((signal) => signal.phrase === "手首が痛い"));
});

test("idea scores are rounded and clamped to the configured maximums", () => {
  const normalized = normalizeIdeaScores({
    demand_score: 99,
    fit_score: 25.4,
    proof_score: -3,
    conversion_score: 14.6,
    ease_score: 9,
  });
  assert.deepEqual(normalized, {
    demand_score: 30,
    fit_score: 25,
    proof_score: 0,
    conversion_score: 15,
    ease_score: 5,
  });
  assert.equal(totalIdeaScore(normalized), 75);
});
