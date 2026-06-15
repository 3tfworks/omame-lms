# LP v2 画像素材 差し替えガイド

`/ja/lp-v2`（販売LP v2）で使用する画像です。以下のファイル名でこのフォルダに配置してください。
コード側はこのパスを参照済みなので、同名で置けば自動で反映されます。

| ファイル名 | 内容 | 使用セクション |
|---|---|---|
| `fv-bg.jpg` | グランドピアノを前にした女性。暗めの色調（上に黒 45% オーバーレイがかかる） | §1 ファーストビュー |
| `research-notes.jpg` | えりな先生の研究ノート 20 冊（手書きメモが大量に写った写真） | §4 ストーリー |
| `lms-screenshot.jpg` | 会員サイト（LMS）の動画一覧スクリーンショット | §9 講座内容 |
| `erina-smiling.jpg` | ピアノ前で微笑むえりな先生（丸くトリミング表示される） | §13 メッセージ |

## Vimeo 動画の差し替え

動画 ID は各セクションファイル内の `PLACEHOLDER` を実 ID に置き換えてください。
`PLACEHOLDER` のままだと「動画を準備中です」の枠が表示されます。

```
src/app/[lang]/lp-v2/sections/Section04Story.tsx   VIMEO_ID_ERINA_INTRO       えりな先生自己紹介
src/app/[lang]/lp-v2/sections/Section07Voices.tsx  voices[].videoId（4本）     柴田 / Y / 金子 / 才賀崎 各先生インタビュー
```

`videoId` を grep する場合は `PLACEHOLDER` で検索すると該当箇所がまとめて見つかります。
