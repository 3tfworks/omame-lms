import { memoContents } from './memoContents.generated';

export interface VideoData {
  id: string;
  title: string;
  vimeoUrl: string;
  vimeoId: string;
  memoUrl: string;
  memoContent: string;
  completed: boolean;
}

export interface ChapterData {
  id: string;
  title: string;
  videos: VideoData[];
}

export const curriculumData: ChapterData[] = [
  {
    "id": "chapter-1",
    "title": "第1章：「ピアノの常識を、根底から覆します」―お豆奏法の原点と核心",
    "videos": [
      {
        "id": "video-1188100383",
        "title": "2010年に生まれた〈お豆奏法〉の原点〜発見者自身の驚き",
        "vimeoUrl": "https://vimeo.com/1188100383",
        "vimeoId": "1188100383",
        "memoUrl": "https://docs.google.com/document/d/1WIFIQyvUIhkp86RcpG9XwIrx1_YUVmWM2YKAYNQmfpU/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100452",
        "title": "なぜ「お豆」なのか",
        "vimeoUrl": "https://vimeo.com/1188100452",
        "vimeoId": "1188100452",
        "memoUrl": "https://docs.google.com/document/d/1CWS99u8bYuz6BJgB5MzqCCqKWO4V4XX9FVEnEttc97Q/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100489",
        "title": "お豆奏法は「特別な奏法」ではない ― 原則原理に従うだけ",
        "vimeoUrl": "https://vimeo.com/1188100489",
        "vimeoId": "1188100489",
        "memoUrl": "https://docs.google.com/document/d/1x5Tcjz6ecFOsfeAqPnlsBmQFL9xSsUpOmxehlseg7CU/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100547",
        "title": "やらなくていいことだらけ ― 身体を緩めて弾く",
        "vimeoUrl": "https://vimeo.com/1188100547",
        "vimeoId": "1188100547",
        "memoUrl": "https://docs.google.com/document/d/1cVwnAOTY8Ygb2kAWqhza5ub66PJm4x1wQcgzEYG9nV8/edit?usp=drive_link",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100602",
        "title": "たった1つで、全ての不調を同時に改善できる。",
        "vimeoUrl": "https://vimeo.com/1188100602",
        "vimeoId": "1188100602",
        "memoUrl": "https://docs.google.com/document/d/1MO6hbBSga5z8NzbLDIw0FTLS1WjtgTKSbGwkha4N8Ak/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100673",
        "title": "「作曲家らしく」弾くという誤解",
        "vimeoUrl": "https://vimeo.com/1188100673",
        "vimeoId": "1188100673",
        "memoUrl": "https://docs.google.com/document/d/1YhmOt6jZwHQt6Z_X6ewWs-vIgpxMJHHQss3N20GMWeA/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188099921",
        "title": "ジャンルを超えて共通する演奏の基礎",
        "vimeoUrl": "https://vimeo.com/1188099921",
        "vimeoId": "1188099921",
        "memoUrl": "https://docs.google.com/document/d/1eN3yUi7PUX8Grk8Xe0O4E-kuzt96-k779g6EcOUVtaU/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      }
    ]
  },
  {
    "id": "chapter-2",
    "title": "第2章：音の鳴る仕組みと、鍵盤の「本当の扱い方」",
    "videos": [
      {
        "id": "video-1188099976",
        "title": "ピアノの音は「打った一点」で決まる",
        "vimeoUrl": "https://vimeo.com/1188099976",
        "vimeoId": "1188099976",
        "memoUrl": "https://docs.google.com/document/d/10xNiO-yZPirXaGQA-Fo0AqbPkyHXor5zNdDzbitUvhk/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100043",
        "title": "ピアノの音を決めるのは「打鍵スピード」だけ",
        "vimeoUrl": "https://vimeo.com/1188100043",
        "vimeoId": "1188100043",
        "memoUrl": "https://docs.google.com/document/d/12b6gx_RrYUrL74Qql8BQjaU_WTCboZ8A_qEgWyBSHNs/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100103",
        "title": "打楽器としてのピアノの本当の音の保持の仕方",
        "vimeoUrl": "https://vimeo.com/1188100103",
        "vimeoId": "1188100103",
        "memoUrl": "https://docs.google.com/document/d/1Xb1njRrrCabESmnYyDhc8JWaD6xX-E7L2avDbcd-tpI/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100150",
        "title": "最小の動きで最大限に鳴らす",
        "vimeoUrl": "https://vimeo.com/1188100150",
        "vimeoId": "1188100150",
        "memoUrl": "https://docs.google.com/document/d/1uqCVDIVIBhPgFvU-SqafzmNbXPZf269JmqrjgT3ZEWk/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100195",
        "title": "音は遠くから狙わない",
        "vimeoUrl": "https://vimeo.com/1188100195",
        "vimeoId": "1188100195",
        "memoUrl": "https://docs.google.com/document/d/1D7cA7lt67BI-C0th6-PS8dCSU4X4do3sJlycLnWN-F4/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100237",
        "title": "仕事量を減らして正確さを上げる",
        "vimeoUrl": "https://vimeo.com/1188100237",
        "vimeoId": "1188100237",
        "memoUrl": "https://docs.google.com/document/d/1U56QEft41oMgipGV3RcYSrDKnkUy0wGCH8s_HkSuGfk/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100283",
        "title": "音が鳴る「瞬間」を触覚で捉える",
        "vimeoUrl": "https://vimeo.com/1188100283",
        "vimeoId": "1188100283",
        "memoUrl": "https://docs.google.com/document/d/1OF0afZe0ZCPUGVt8j-o7f4WYNRp5I966u1l_myucxSQ/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100342",
        "title": "鍵盤の深さとタッチ",
        "vimeoUrl": "https://vimeo.com/1188100342",
        "vimeoId": "1188100342",
        "memoUrl": "https://docs.google.com/document/d/1jEH33USshOozNWWaSZdTqXBnJ9RbnlH7XC_iP2eqq-I/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      }
    ]
  },
  {
    "id": "chapter-3",
    "title": "第3章：身体の本当の使い方 〜“自然体”とは",
    "videos": [
      {
        "id": "video-1188100396",
        "title": "重力に委ねる",
        "vimeoUrl": "https://vimeo.com/1188100396",
        "vimeoId": "1188100396",
        "memoUrl": "https://docs.google.com/document/d/1x_OIUR1qdlh3-QlGS18cfPxLsqU9yeEg8_K32DHgKik/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100519",
        "title": "鍵盤は50gで下がる ― 重さと重力で弾くピアノの原理",
        "vimeoUrl": "https://vimeo.com/1188100519",
        "vimeoId": "1188100519",
        "memoUrl": "https://docs.google.com/document/d/1AnfTIh_JUA2lvz09PCuJz113e0vhv9VdU3kS2Hq7Upc/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100570",
        "title": "重力で弾く ― 固めず、速く、自然に動く身体",
        "vimeoUrl": "https://vimeo.com/1188100570",
        "vimeoId": "1188100570",
        "memoUrl": "https://docs.google.com/document/d/1-egx6oM3HgtbyL13K4GFqmarUZ5PdcXO2dOXMSmKNO4/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100657",
        "title": "自然体の手と指",
        "vimeoUrl": "https://vimeo.com/1188100657",
        "vimeoId": "1188100657",
        "memoUrl": "https://docs.google.com/document/d/1BGuGNdPtHXYJTla9EdWjZaKBDHJhZMWIzDzpK12K814/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      }
    ]
  },
  {
    "id": "chapter-4",
    "title": "第4章：「たて読み」で譜読みが超楽になる",
    "videos": [
      {
        "id": "video-1188100767",
        "title": "「緩んだ手」の原理",
        "vimeoUrl": "https://vimeo.com/1188100767",
        "vimeoId": "1188100767",
        "memoUrl": "https://docs.google.com/document/d/1pjmALw0k0JBDJFTgqW15RldlW_2g7nTTULl0_rcE4Gg/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100848",
        "title": "縦読みの弾き方",
        "vimeoUrl": "https://vimeo.com/1188100848",
        "vimeoId": "1188100848",
        "memoUrl": "https://docs.google.com/document/d/1U65tc5UehZ7cR-QkocGltka480cfRb_rKi4nbEM4Z3k/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100911",
        "title": "多声音楽を攻略する点打ち読み",
        "vimeoUrl": "https://vimeo.com/1188100911",
        "vimeoId": "1188100911",
        "memoUrl": "https://docs.google.com/document/d/1eCn0qDswGfuocQclYNa_NnaV8jPujTlBmpktR7kRdTA/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100973",
        "title": "リズムの可視化と段階的解除",
        "vimeoUrl": "https://vimeo.com/1188100973",
        "vimeoId": "1188100973",
        "memoUrl": "https://docs.google.com/document/d/1UMK82djKWfg2h6fLUt_sB3Jw6Cw1sX8wQ-2fwJKcWGw/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101012",
        "title": "縦読みでポリフォニーを解きほぐす",
        "vimeoUrl": "https://vimeo.com/1188101012",
        "vimeoId": "1188101012",
        "memoUrl": "https://docs.google.com/document/d/1D5G6NYAPEoDFJ6F389PmHfx6EuxFKwbuIBPFzgOONSc/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101067",
        "title": "最初から両手で読む",
        "vimeoUrl": "https://vimeo.com/1188101067",
        "vimeoId": "1188101067",
        "memoUrl": "https://docs.google.com/document/d/1DPiNQQawuIXWK5mwCjL6ctJwvi3t0pr-QzsAZ78t_Gc/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101129",
        "title": "テンポは決めない",
        "vimeoUrl": "https://vimeo.com/1188101129",
        "vimeoId": "1188101129",
        "memoUrl": "https://docs.google.com/document/d/1WLM6AVTQhtS7R9iAqMqztugf6Rwb3nRh7hAfPmrI2Dk/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101160",
        "title": "正しい音だけを入れる練習法",
        "vimeoUrl": "https://vimeo.com/1188101160",
        "vimeoId": "1188101160",
        "memoUrl": "https://docs.google.com/document/d/14UaaNE9I3h5OqlJrJXD7Z95TZGE34dhdkvDRFcIZBtY/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101217",
        "title": "「音が覚えられない」正体",
        "vimeoUrl": "https://vimeo.com/1188101217",
        "vimeoId": "1188101217",
        "memoUrl": "https://docs.google.com/document/d/1bHJMnrSSXM6QiIdSjL6etHVBxPTlqYdMDNCm5tDMEo8/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101278",
        "title": "ミスは緩み不足のサイン",
        "vimeoUrl": "https://vimeo.com/1188101278",
        "vimeoId": "1188101278",
        "memoUrl": "https://docs.google.com/document/d/1SYPZPAOmd4GmRLJWWAmR6yZx46z4JvNROZEoN36GoeU/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      }
    ]
  },
  {
    "id": "chapter-5",
    "title": "第5章：「ズレ」の最終調整",
    "videos": [
      {
        "id": "video-1188101324",
        "title": "緩みと音楽性の正体",
        "vimeoUrl": "https://vimeo.com/1188101324",
        "vimeoId": "1188101324",
        "memoUrl": "https://docs.google.com/document/d/1c6x--CwDRWxEBE-IsDj7e5Cs6Kg13K1mbxH1fhwxp0w/edit?usp=drivesdk",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101359",
        "title": "対象に意識を100％置く ― 鍵盤との対話",
        "vimeoUrl": "https://vimeo.com/1188101359",
        "vimeoId": "1188101359",
        "memoUrl": "https://docs.google.com/document/d/1lBvGXDRY--s8Sn20wPOYjrm8aZHD3sg3aa_VhqnpQNo/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101613",
        "title": "あわいという在り方",
        "vimeoUrl": "https://vimeo.com/1188101613",
        "vimeoId": "1188101613",
        "memoUrl": "https://docs.google.com/document/d/1PbXTQhjI5_Cyw_ce7WTAB1l-kGx7vSqhQaxVZAfkTRw/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      }
    ]
  },
  {
    "id": "chapter-6",
    "title": "第6章：お豆奏法・実践テクニック集",
    "videos": [
      {
        "id": "video-1188100709",
        "title": "音階",
        "vimeoUrl": "https://vimeo.com/1188100709",
        "vimeoId": "1188100709",
        "memoUrl": "https://docs.google.com/document/d/15eNPUPHGvOMo_oPBN3V5b7XEstMbW9CjsKXxe59r0es/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100814",
        "title": "一音飛ばし",
        "vimeoUrl": "https://vimeo.com/1188100814",
        "vimeoId": "1188100814",
        "memoUrl": "https://docs.google.com/document/d/1-VGQG4gFj0b3PWgQ2XTwsDG_SEbHg31i3kPO5JhkQu0/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100866",
        "title": "3度の重音",
        "vimeoUrl": "https://vimeo.com/1188100866",
        "vimeoId": "1188100866",
        "memoUrl": "https://docs.google.com/document/d/1LGNGJ9LLvc5Ndcx8nb0WjCLtPO8IowLcnDLLigjv8j0/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100908",
        "title": "重音の弾き方",
        "vimeoUrl": "https://vimeo.com/1188100908",
        "vimeoId": "1188100908",
        "memoUrl": "https://docs.google.com/document/d/1NobFdwuDeXsVhxsMBaPnKcYTdra0J31VaRfg4Pxh8ls/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100966",
        "title": "「指遣いの自由」と「跳躍のコツ」",
        "vimeoUrl": "https://vimeo.com/1188100966",
        "vimeoId": "1188100966",
        "memoUrl": "https://docs.google.com/document/d/1alKyed57MwDaaCaGiQr_-Y_I_1JfH62kE9gXLOLnFy4/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101101",
        "title": "保持音で力まないコツ",
        "vimeoUrl": "https://vimeo.com/1188101101",
        "vimeoId": "1188101101",
        "memoUrl": "https://docs.google.com/document/d/1vxgvG5XhZSh1qLpZI1HhyfCzg6PPwSx0pHWNyXPHGHo/edit?usp=drive_link",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101139",
        "title": "指くぐり",
        "vimeoUrl": "https://vimeo.com/1188101139",
        "vimeoId": "1188101139",
        "memoUrl": "https://docs.google.com/document/d/1FTe9Cra76actkozgTI9RR89zfRszbJn1eLXPxUDSXGQ/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101187",
        "title": "速い音階",
        "vimeoUrl": "https://vimeo.com/1188101187",
        "vimeoId": "1188101187",
        "memoUrl": "https://docs.google.com/document/d/1z2sul9OhHzOLJGWdFLKckVct-4gEtyc0n9ro7oYSXo0/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101221",
        "title": "ジグザグ音型",
        "vimeoUrl": "https://vimeo.com/1188101221",
        "vimeoId": "1188101221",
        "memoUrl": "https://docs.google.com/document/d/12HhFbGRqBeIRwWIjs9-T-hZK_yrorbzxQqqPaAsYOwQ/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101262",
        "title": "連符",
        "vimeoUrl": "https://vimeo.com/1188101262",
        "vimeoId": "1188101262",
        "memoUrl": "https://docs.google.com/document/d/1lD5M1z7la0zThvX8Pm6TUvOMaohbgd_w6Z-DQLayRiw/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101295",
        "title": "2音のスラー",
        "vimeoUrl": "https://vimeo.com/1188101295",
        "vimeoId": "1188101295",
        "memoUrl": "https://docs.google.com/document/d/1R1Cs-diay7k2T6Wc1cR5r8vCPsjX4TkmmvR8YXrkC04/edit?usp=drive_link",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101332",
        "title": "アルペジオ",
        "vimeoUrl": "https://vimeo.com/1188101332",
        "vimeoId": "1188101332",
        "memoUrl": "https://docs.google.com/document/d/1TBbuMEEBfRPRvcqy-2q9clnsID1HflBPn0tXMG0iB00/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      }
    ]
  },
  {
    "id": "chapter-final",
    "title": "総まとめ：「“頑張るピアノ”に戻らないために」―お豆奏法の総仕上げ―",
    "videos": [
      {
        "id": "video-1188101434",
        "title": "まとめ①",
        "vimeoUrl": "https://vimeo.com/1188101434",
        "vimeoId": "1188101434",
        "memoUrl": "https://docs.google.com/document/d/1D5NdqbWpMcdm9eiXI5W_F3Q9bhNfx1H7Olobv9gQ8bE/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188101560",
        "title": "まとめ②",
        "vimeoUrl": "https://vimeo.com/1188101560",
        "vimeoId": "1188101560",
        "memoUrl": "https://docs.google.com/document/d/145b6YIIu4IyPTZdQT2kxghvDoDaJqcdzfU8NfS-2klc/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      },
      {
        "id": "video-1188100340",
        "title": "お豆奏法とは何だったのか ― すべてをつなぐ最後の話",
        "vimeoUrl": "https://vimeo.com/1188100340",
        "vimeoId": "1188100340",
        "memoUrl": "https://docs.google.com/document/d/1-59X9EYHk5ka5WPX0TJm_XjajH7Vy2YQHe3rppjGZyQ/edit?usp=sharing",
        "memoContent": "",
        "completed": false
      }
    ]
  }
];

// 生成ファイル（memoContents.generated.ts）から各動画の memoContent を注入。
// 本文は scripts/fetch-memos.mjs が Google Docs から取得して生成する。
for (const chapter of curriculumData) {
  for (const video of chapter.videos) {
    video.memoContent = memoContents[video.id] ?? '';
  }
}

export function getVideoById(id: string): VideoData | undefined {
  for (const chapter of curriculumData) {
    const video = chapter.videos.find(v => v.id === id);
    if (video) return video;
  }
  return undefined;
}

export function getChapterByVideoId(videoId: string): ChapterData | undefined {
  for (const chapter of curriculumData) {
    if (chapter.videos.some(v => v.id === videoId)) {
      return chapter;
    }
  }
  return undefined;
}

// 前後の動画の情報を取得するヘルパー（章をまたぐ判定つき）
export interface AdjacentVideoInfo {
  video: VideoData;
  chapter: ChapterData;
  isNewChapter: boolean; // 章が変わるかどうか
}

export function getAdjacentVideos(videoId: string): {
  prev: AdjacentVideoInfo | null;
  next: AdjacentVideoInfo | null;
  currentChapter: ChapterData | null;
  currentIndexInChapter: number;
  totalInChapter: number;
} {
  // 全動画をフラットリスト化（章情報も保持）
  const flatList: { video: VideoData; chapter: ChapterData }[] = [];
  for (const chapter of curriculumData) {
    for (const video of chapter.videos) {
      flatList.push({ video, chapter });
    }
  }

  const currentIndex = flatList.findIndex(item => item.video.id === videoId);
  if (currentIndex === -1) {
    return { prev: null, next: null, currentChapter: null, currentIndexInChapter: 0, totalInChapter: 0 };
  }

  const current = flatList[currentIndex];
  const currentChapter = current.chapter;
  const currentIndexInChapter = currentChapter.videos.findIndex(v => v.id === videoId);

  let prev: AdjacentVideoInfo | null = null;
  if (currentIndex > 0) {
    const p = flatList[currentIndex - 1];
    prev = {
      video: p.video,
      chapter: p.chapter,
      isNewChapter: p.chapter.id !== currentChapter.id,
    };
  }

  let next: AdjacentVideoInfo | null = null;
  if (currentIndex < flatList.length - 1) {
    const n = flatList[currentIndex + 1];
    next = {
      video: n.video,
      chapter: n.chapter,
      isNewChapter: n.chapter.id !== currentChapter.id,
    };
  }

  return {
    prev,
    next,
    currentChapter,
    currentIndexInChapter,
    totalInChapter: currentChapter.videos.length,
  };
}
