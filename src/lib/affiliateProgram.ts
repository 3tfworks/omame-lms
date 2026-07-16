export const AFFILIATE_TERMS_VERSION = "2026-07-16-v1";
export const AFFILIATE_TERMS_TITLE = "お豆メッセンジャープログラム利用規約";

// 2026-09-01 00:00 JST。これ以降は紹介購入も通常販売価格と同額にする。
export const REFERRAL_DISCOUNT_END_AT = new Date("2026-08-31T15:00:00.000Z");
export const REFERRAL_DISCOUNT_PERCENT = 10;
export const AFFILIATE_COOKIE_DAYS = 30;
export const REWARD_HOLD_DAYS = 30;
export const MINIMUM_PAYOUT_YEN = 5_000;

export const AFFILIATE_CONFIRMATIONS = [
  {
    id: "private_sharing_only",
    title: "紹介は知人への個別連絡に限ります",
    body:
      "LINE、メール、対面などで知人へ個別に紹介できます。ブログ、YouTube、公開SNSなど、不特定多数が見られる場所での募集・リンク掲載は、運営から許可されるまでできません。",
    checkbox: "公開の場所には掲載せず、知人への個別紹介だけに利用します",
  },
  {
    id: "no_improper_referrals",
    title: "自分や家族の購入には利用できません",
    body:
      "自分で購入する場合や、家族などの名義を使った実質的な自己購入は紹介成果になりません。すでに運営へ相談・問い合わせをしている方を、後から紹介扱いにすることもできません。",
    checkbox: "自己購入、家族名義の利用、後から紹介扱いにする行為をしません",
  },
  {
    id: "reward_adjustments",
    title: "購入が取り消された場合、報酬も取り消されます",
    body:
      "購入者への返金、カード決済の取消、支払いの未完了などがあった場合、紹介報酬は発生しません。不正や規約違反が確認された場合も、報酬の保留・取消や紹介資格の停止を行うことがあります。",
    checkbox: "報酬の保留・取消条件を確認しました",
  },
  {
    id: "transfer_fee",
    title: "振込手数料は紹介者負担です",
    body:
      "報酬を振り込む際の振込手数料は、確定した紹介報酬から差し引きます。最低振込額に満たない報酬は翌月以降へ繰り越します。",
    checkbox: "振込手数料が紹介報酬から差し引かれることを確認しました",
  },
] as const;

export type AffiliateConfirmationId = (typeof AFFILIATE_CONFIRMATIONS)[number]["id"];
export type AffiliateConfirmationState = Record<AffiliateConfirmationId, boolean>;

export const AFFILIATE_TERMS_SECTIONS = [
  {
    title: "第1条（参加資格と適用）",
    paragraphs: [
      "本規約は、お豆奏法が運営するお豆メッセンジャープログラムに適用されます。参加できるのは、運営が認めたサロンメンバー、オーナーおよび管理者です。",
      "紹介リンクを利用するには、画面上で本規約に同意する必要があります。",
    ],
  },
  {
    title: "第2条（紹介できる方法）",
    paragraphs: [
      "LINE、メール、対面などによる、知人への個別紹介ができます。相手が望んでいない連絡や、不特定多数へのメッセージの一斉送信はできません。",
      "ブログ、YouTube、公開SNSその他不特定多数が閲覧できる場所での募集・紹介リンク掲載は、運営が別途許可するまでできません。",
      "紹介者は、運営や講師、購入者向け問い合わせ窓口を装ってはいけません。購入後の問い合わせは、運営の窓口をご案内ください。",
    ],
  },
  {
    title: "第3条（価格と期間限定キャンペーン）",
    paragraphs: [
      "2026年8月31日までは、有効な紹介リンクを経由した購入者に受講料10%OFFを適用します。2026年9月1日以降は、公式・紹介経由ともに講座本体価格29,800円です。",
      "紹介報酬50%は期間限定キャンペーンです。キャンペーン終了後は、その時点で運営が案内する通常報酬率を適用します。",
    ],
  },
  {
    title: "第4条（紹介成果の認定）",
    paragraphs: [
      `紹介リンクをクリックしてから${AFFILIATE_COOKIE_DAYS}日以内に所定の購入が完了した場合、紹介成果の候補として記録します。複数の紹介リンクが利用された場合は、最後に有効な紹介リンクを基準とします。`,
      "紹介リンクのクリック以前に、公式LINE、問い合わせフォーム、個別相談その他運営が記録できる方法で購入相談が始まっていた場合は、原則として紹介成果の対象外です。記録をもとに運営が最終判断します。",
      "自己購入、家族・同居人・知人の名義を利用した実質的な自己購入、購入後に紹介リンクを踏ませる行為は成果の対象外です。",
    ],
  },
  {
    title: "第5条（報酬の確定・振込）",
    paragraphs: [
      `購入後${REWARD_HOLD_DAYS}日間は確認期間とし、その間に返金、カード決済の取消、支払いの未完了、不正などがなければ報酬を確定します。`,
      `報酬は月末締め・翌月末振込とします。確定報酬が${MINIMUM_PAYOUT_YEN.toLocaleString("ja-JP")}円未満の場合は、翌月以降へ繰り越します。`,
      "振込手数料は紹介者負担とし、確定した紹介報酬から差し引きます。振込先情報が正しく登録されていない場合、振込を保留します。",
    ],
  },
  {
    title: "第6条（禁止事項と対応）",
    paragraphs: [
      "虚偽・誇大な説明、効果の保証、独自値引き、現金や金券による還元、報酬の一部還元、迷惑な勧誘、無断投稿、その他運営が不適切と判断する紹介行為を禁止します。",
      "不正または規約違反の疑いがある場合、確認が終わるまで報酬を保留できます。違反が確認された場合は、報酬の取消、紹介リンクの停止、参加資格の停止または取消を行うことがあります。",
      "運営から紹介内容の修正または削除を依頼された場合は、速やかに対応してください。",
    ],
  },
  {
    title: "第7条（独自特典）",
    paragraphs: [
      "紹介者が独自特典を提供する場合は、事前に運営の承認を受けてください。特典の内容、提供方法および履行については紹介者が責任を負います。",
      "独自特典に関する問い合わせは紹介者が対応し、運営が提供する特典であるかのような表示をしてはいけません。",
    ],
  },
  {
    title: "第8条（サロン退会時）",
    paragraphs: [
      "サロン退会日をもって、新しい紹介成果の受付を停止します。退会前に正当に発生した成果は、返金や規約違反などがなければ通常どおり確定・振込します。",
      "規約違反による資格取消の場合、未確定報酬は運営が個別に確認します。",
    ],
  },
  {
    title: "第9条（規約の変更）",
    paragraphs: [
      "運営は必要に応じて本規約を変更できます。紹介方法、成果条件、報酬などの重要な変更を行う場合は、再同意をお願いすることがあります。",
    ],
  },
] as const;

export function isReferralDiscountActive(at: Date = new Date()): boolean {
  return at.getTime() < REFERRAL_DISCOUNT_END_AT.getTime();
}
export function getReferralPrice(salePrice: number, at: Date = new Date()): number {
  if (!isReferralDiscountActive(at)) return salePrice;
  return Math.floor(salePrice * (100 - REFERRAL_DISCOUNT_PERCENT) / 100);
}

export function createAffiliateTermsSnapshot() {
  return {
    version: AFFILIATE_TERMS_VERSION,
    title: AFFILIATE_TERMS_TITLE,
    confirmations: AFFILIATE_CONFIRMATIONS,
    sections: AFFILIATE_TERMS_SECTIONS,
  };
}
