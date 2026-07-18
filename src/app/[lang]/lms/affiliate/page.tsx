"use client";

import { useState, useEffect } from "react";
import { Handshake, Copy, CheckCircle2, Wallet, Banknote, Save, AlertCircle, Mail, Heart, Sparkles, Gift, ChevronDown, ShieldCheck, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  AFFILIATE_CONFIRMATIONS,
  AFFILIATE_TERMS_VERSION,
  type AffiliateConfirmationState,
} from "@/lib/affiliateProgram";

type AffiliateStats = {
  totalReferrals: number;
  totalEarned: number;
  unpaidAmount: number;
};

type CurrentRate = {
  rate: number;
  source: "campaign" | "default";
  campaign: { id: string; name: string; endAt: string } | null;
};

type BankInfo = {
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountName: string;
};

export default function AffiliatePage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [currentRate, setCurrentRate] = useState<CurrentRate | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const [confirmations, setConfirmations] = useState<AffiliateConfirmationState>(() =>
    Object.fromEntries(AFFILIATE_CONFIRMATIONS.map(({ id }) => [id, false])) as AffiliateConfirmationState,
  );
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [fullTermsAccepted, setFullTermsAccepted] = useState(false);
  const [referralDiscountActive, setReferralDiscountActive] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "", branchName: "", accountType: "普通", accountNumber: "", accountName: ""
  });
  
  const [copied, setCopied] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  // 紹介ページ用表示名（任意の上書き）。displayName は placeholder と補助文に使う。
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [referralName, setReferralName] = useState("");
  const [savingReferral, setSavingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/affiliate");
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
          setStats(data.stats);
          setCurrentRate(data.currentRate ?? null);
          setTermsAccepted(data.terms?.accepted === true);
          setTermsAcceptedAt(data.terms?.acceptedAt ?? null);
          setReferralDiscountActive(data.referralDiscountActive === true);
          if (data.bankInfo) {
            setBankInfo(data.bankInfo);
          }
          setDisplayName(data.displayName ?? null);
          setReferralName(data.referralDisplayName ?? "");
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSaveReferralName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReferral(true);
    setReferralMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/user/referral-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralDisplayName: referralName }),
      });
      if (res.ok) {
        setReferralMessage({ text: "紹介ページのお名前を保存しました", type: "success" });
      } else {
        const data = await res.json().catch(() => null);
        setReferralMessage({ text: data?.error || "保存に失敗しました", type: "error" });
      }
    } catch {
      setReferralMessage({ text: "通信エラーが発生しました", type: "error" });
    }
    setSavingReferral(false);
  };

  const allTermsConfirmed =
    AFFILIATE_CONFIRMATIONS.every(({ id }) => confirmations[id]) && fullTermsAccepted;
  const handleAcceptTerms = async () => {
    if (!allTermsConfirmed) return;
    setAcceptingTerms(true);
    setTermsError("");
    try {
      const res = await fetch("/api/user/affiliate/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termsVersion: AFFILIATE_TERMS_VERSION,
          confirmations,
          fullTermsAccepted,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setTermsError(data?.error || "同意内容を保存できませんでした。");
      } else {
        setTermsAccepted(true);
        setTermsAcceptedAt(data.acceptedAt ?? new Date().toISOString());
      }
    } catch {
      setTermsError("通信エラーが発生しました。時間をおいてもう一度お試しください。");
    }
    setAcceptingTerms(false);
  };

  const affiliateUrl = userId ? `https://omamepiano.com/ja/invite/${userId}` : "";
  const lineShareText = `ピアノの弾き方や脱力で悩んでいたら、えりな先生のお豆奏法おすすめです。私も学んでいて、身体の使い方の見方が変わりました。紹介リンクから見ると特典があるみたいなので、よかったら見てみてください☺️\n${affiliateUrl}`;
  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(lineShareText)}`;
  const messageTemplates = [
    `ピアノの弾き方や脱力で悩んでいたら、えりな先生のお豆奏法おすすめです。私も学んでいて、身体の使い方の見方が変わりました。紹介リンクから見ると特典があるみたいなので、よかったら見てみてください☺️\n${affiliateUrl}`,
    `無理にすすめたいわけではないんだけど、ピアノで手や腕が疲れる話をしていたので思い出しました。お豆奏法、普通の脱力の話とは少し違って面白いです。よかったらこのリンクから見てみてください。\n${affiliateUrl}`,
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleTemplateCopy = async (template: string, index: number) => {
    try {
      await navigator.clipboard.writeText(template);
      setCopiedTemplate(index);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error("Failed to copy template", err);
    }
  };

  const handleSaveBankInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/user/affiliate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankInfo }),
      });
      
      if (res.ok) {
        setSaveMessage({ text: "口座情報を保存しました", type: "success" });
      } else {
        // サーバ側バリデーション等のエラーメッセージがあれば表示する
        const data = await res.json().catch(() => null);
        setSaveMessage({ text: data?.error || "保存に失敗しました", type: "error" });
      }
    } catch {
      setSaveMessage({ text: "通信エラーが発生しました", type: "error" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-omame-primary"></div>
      </div>
    );
  }

  if (!termsAccepted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-700 shadow-sm">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-omame-deep">お豆メッセンジャー</h1>
            <p className="mt-1 text-sm font-bold text-stone-500">紹介リンク・特典</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-7 text-center sm:px-10">
            <ShieldCheck className="mx-auto h-10 w-10 text-amber-700" />
            <p className="mt-3 text-xs font-bold tracking-[0.22em] text-amber-700">1分で確認できます</p>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">参加前に必ずご確認ください</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              大切な4つのルールを確認すると、紹介リンクを利用できます。
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-8">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900">
              <p className="font-bold">価格・報酬のご案内</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {referralDiscountActive && <li>10%割引で購入できる期限は、2026年8月31日まで</li>}
                {referralDiscountActive && <li>紹介報酬50%は期間限定キャンペーン</li>}
                <li>2026年9月1日以降は、公式・紹介経由ともに29,800円</li>
                {!referralDiscountActive && currentRate && <li>現在の紹介報酬率は{currentRate.rate}%</li>}
                <li>紹介として確認できるのは、紹介リンクを最後に開いてから30日以内の購入</li>
              </ul>
            </div>

            {AFFILIATE_CONFIRMATIONS.map((item) => (
              <label
                key={item.id}
                className={`block cursor-pointer rounded-2xl border p-5 transition-colors ${
                  confirmations[item.id] ? "border-amber-400 bg-amber-50/60" : "border-stone-200 bg-white"
                }`}
              >
                <span className="block font-bold text-stone-900">{item.title}</span>
                <span className="mt-2 block text-sm leading-7 text-stone-600">{item.body}</span>
                <span className="mt-4 flex items-start gap-3 rounded-xl bg-white p-3 text-sm font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={confirmations[item.id]}
                    onChange={(event) =>
                      setConfirmations((current) => ({ ...current, [item.id]: event.target.checked }))
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 accent-amber-600"
                  />
                  <span>{item.checkbox}</span>
                </span>
              </label>
            ))}

            <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm font-bold leading-7 text-stone-700">
              <input
                type="checkbox"
                checked={fullTermsAccepted}
                onChange={(event) => setFullTermsAccepted(event.target.checked)}
                aria-label="お豆メッセンジャープログラム利用規約に同意する"
                className="mt-1 h-5 w-5 shrink-0 accent-amber-600"
              />
              <span>
                <Link
                  href="/ja/lms/affiliate/terms"
                  target="_blank"
                  className="mx-1 inline-flex items-center gap-1 font-bold text-amber-800 underline underline-offset-4"
                >
                  お豆メッセンジャープログラム利用規約
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                を確認し、内容に同意します。
              </span>
            </div>

            {termsError && (
              <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{termsError}</p>
            )}

            <button
              type="button"
              onClick={handleAcceptTerms}
              disabled={!allTermsConfirmed || acceptingTerms}
              className="w-full rounded-xl bg-stone-900 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {acceptingTerms ? "同意内容を保存しています…" : "同意して紹介リンクを利用する"}
            </button>
            <p className="text-center text-xs leading-6 text-stone-400">
              同意した日時と規約バージョンを、運営側で記録します。
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* ページタイトル */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shadow-sm">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-omame-deep font-serif">お豆メッセンジャー</h1>
          <p className="mt-1 text-sm font-bold text-stone-500">紹介リンク・特典</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold">
          規約同意済み
          {termsAcceptedAt ? `（${new Date(termsAcceptedAt).toLocaleDateString("ja-JP")}）` : ""}
        </p>
        <Link href="/ja/lms/affiliate/terms" className="font-bold underline underline-offset-4">
          利用規約を確認する
        </Link>
      </div>

      {/* ファーストビュー：今すぐやること */}
      <div className="mb-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-amber-700">OMAME MESSENGER</p>
          <h2 className="mt-3 text-2xl font-bold leading-relaxed text-stone-900 font-serif md:text-3xl">
            やることは、あなた専用リンクを<br className="hidden sm:block" />
            LINEで送るだけです。
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-loose text-stone-700">
            お豆メッセンジャーは、紹介リンクを送るだけで、
            お友達にもあなたにも嬉しい特典が届く仕組みです。
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["STEP 1", "リンクをコピー", "下のあなた専用リンクをコピーします"],
            ["STEP 2", "お友達へ送る", "ピアノに悩んでいる方へそっとシェア"],
            ["STEP 3", "お互いに特典", "お友達が受講するとあなたにもギフト"],
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-2xl border border-amber-100 bg-white/85 p-5 text-center shadow-sm">
              <p className="text-xs font-bold tracking-widest text-amber-700">{step}</p>
              <p className="mt-2 text-lg font-bold text-stone-900">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-5 text-center text-emerald-800">
            <p className="text-sm font-bold">紹介されたお友達</p>
            <p className="mt-1 text-2xl font-black">
              {referralDiscountActive ? "受講料 10%OFF" : "公式と同じ 29,800円"}
            </p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-5 text-center text-rose-800">
            <p className="text-sm font-bold">紹介したあなた</p>
            <p className="mt-1 text-2xl font-black">
              {currentRate ? `${currentRate.rate}%` : "紹介"}ギフト
            </p>
          </div>
        </div>
      </div>

      {/* 紹介リンク */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-10">
        <div className="bg-[#faf9f6] px-6 py-4 border-b border-stone-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-omame-deep text-lg">あなた専用のおすそ分けリンク</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-600 mb-4 leading-relaxed">
            まずはこのリンクをコピーして、LINEやメッセージでお友達へ送ってください。<br/>
            お友達が購入するときは、このリンクをもう一度開き、表示されたページからそのまま申し込んでもらってください。<br/>
            紹介として確認できるのは、このリンクを最後に開いてから30日以内の購入です。
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              readOnly
              value={affiliateUrl}
              className="w-full sm:flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-3.5 text-stone-600 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3.5 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? "コピーしました！" : "リンクをコピー"}
            </button>
            <a
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3.5 bg-[#06C755] text-white font-bold rounded-xl hover:bg-[#05ad49] transition-colors"
            >
              LINEで送る
            </a>
          </div>
        </div>
      </div>

      {/* 送る相手の例 */}
      <div className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-omame-deep">こんな方がいたら、そっと送ってあげてください</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            "ピアノを弾くと手や腕が疲れやすい方",
            "脱力が分からず悩んでいる方",
            "レッスンで言われても身体で再現できない方",
            "大人になってからピアノを再開した方",
            "生徒さんの身体の使い方を見てあげたい先生",
            "ジストニアや腱鞘炎などで演奏に不安がある方",
          ].map(item => (
            <div key={item} className="flex gap-3 rounded-xl bg-amber-50/60 p-4 text-stone-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-bold leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 紹介文テンプレート */}
      <div className="mb-12 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-omame-deep">そのままLINEに貼れる紹介文</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          文章を考えるのが大変なときは、このままコピーしてお使いください。押し売り感が出にくい文面にしています。
        </p>
        <div className="mt-5 space-y-4">
          {messageTemplates.map((template, index) => (
            <div key={index} className="rounded-2xl bg-[#faf9f6] p-5">
              <p className="whitespace-pre-wrap text-sm leading-loose text-stone-700">{template}</p>
              <button
                onClick={() => handleTemplateCopy(template, index)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-800 px-5 py-3 text-sm font-bold text-white hover:bg-stone-700"
              >
                {copiedTemplate === index ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedTemplate === index ? "コピーしました！" : "この文章をコピー"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* お豆メッセンジャーのステップ図解 */}
      <div className="mb-14 max-w-2xl mx-auto">
        <h3 className="text-xl md:text-2xl font-bold text-stone-800 text-center mb-6 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-500" />
          お豆メッセンジャーのはじめ方
          <Sparkles className="text-amber-500" />
        </h3>
        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm border border-stone-200">
          <p className="text-center font-bold text-stone-800">やることは3つだけ</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["紹介リンクを送る", "お友達が登録・受講", "お互いに特典が届く"].map((item, index) => (
              <div key={item} className="rounded-xl bg-amber-50 p-3 text-center text-sm font-bold text-amber-900">
                {index + 1}. {item}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* STEP 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200">
            <div className="aspect-video relative bg-stone-100 flex items-center justify-center">
              <Image src="/images/messenger-step1.png" alt="STEP 1" fill className="object-cover" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.png')) {
                    target.src = '/images/messenger-step1.jpg';
                  } else if (target.src.endsWith('.jpg')) {
                    target.src = '/images/messenger-step1.jpeg';
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </div>
            <div className="p-5 text-center">
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 font-bold text-sm rounded-full mb-3 tracking-wider">STEP 1</span>
              <p className="font-bold text-stone-800 text-lg">あなた専用のリンクをシェア</p>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <ChevronDown size={36} className="text-[#b8a98f] opacity-50" />
          </div>

          {/* STEP 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200">
            <div className="aspect-video relative bg-stone-100 flex items-center justify-center">
              <Image src="/images/messenger-step2.png" alt="STEP 2" fill className="object-cover" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.png')) target.src = '/images/messenger-step2.jpg';
                  else if (target.src.endsWith('.jpg')) target.src = '/images/messenger-step2.jpeg';
                  else target.style.display = 'none';
                }}
              />
            </div>
            <div className="p-5 text-center">
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 font-bold text-sm rounded-full mb-3 tracking-wider">STEP 2</span>
              <p className="font-bold text-stone-800 text-lg">お友達がお豆奏法をスタート！</p>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <ChevronDown size={36} className="text-[#b8a98f] opacity-50" />
          </div>

          {/* STEP 3 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200">
            <div className="aspect-video relative bg-stone-100 flex items-center justify-center">
              <Image src="/images/messenger-step3.png" alt="STEP 3" fill className="object-cover" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.png')) target.src = '/images/messenger-step3.jpg';
                  else if (target.src.endsWith('.jpg')) target.src = '/images/messenger-step3.jpeg';
                  else target.style.display = 'none';
                }}
              />
            </div>
            <div className="p-5 text-center">
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 font-bold text-sm rounded-full mb-3 tracking-wider">STEP 3</span>
              <p className="font-bold text-stone-800 text-lg">お互いに嬉しいギフトが届く</p>
            </div>
          </div>
        </div>
      </div>

      {/* えりな先生からのお手紙 */}
      <details className="mb-12 bg-[#faf9f6] rounded-3xl p-6 sm:p-10 md:p-12 shadow-md border border-[#e8dfce] relative overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
        
        <summary className="relative z-10 cursor-pointer list-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.28em] text-amber-700 uppercase mb-2">MESSAGE FROM ERINA</p>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif leading-relaxed">
                えりな先生からのメッセージを読む
              </h2>
            </div>
            <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-[#e8dfce] text-sm font-bold text-stone-700 shadow-sm">
              開く <ChevronDown className="w-5 h-5 text-amber-600" />
            </span>
          </div>
        </summary>

        <div className="relative z-10 mt-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif leading-relaxed">
              【重要❣️ 皆さんに、お豆メッセンジャーになっていただきたい‼️‼️<br />
              お願いです🙇‍♀️🙇‍♀️🙇‍♀️】
            </h2>
          </div>
          
          <div className="space-y-6 text-stone-700 leading-loose font-serif">
            <p className="text-lg font-bold text-stone-800">
              【お豆奏法を広めたい❣️<br />
              「おうちで学べる動画教材」がとうとう完成しました〜〜💕】
            </p>
            <p>サロンの皆様ーーー</p>
            <p>いつもこの場所で、みなさんと一緒に「お豆奏法」を深め、一人ひとりの音や心がふわっと緩んでいく様子を近くで見守らせていただけること、本当ーーーーに幸せに感じています‼️</p>
            <p>
              本当ーーーーに、<br />
              ありがとうございます。
            </p>
            <p>今日は皆さまにお願いがあります🙇</p>
            <p>
              そのお願いというのは、<br />
              皆さまに、「お豆メッセンジャー」になっていただきたい、ということです。
            </p>
            <p>
              数年前までは、<br />
              「ひたすら怪しい‼️」と思われがちだったお豆奏法でしたが、
            </p>
            <p>皆さまのおかげで、世の中に少しずつ認知度が上がってきて、潜在的に気になっている方が増えているような気がしませんか？</p>
            <p>そこで、一番近くでお豆の良さや喜びを知ってくださっているサロンのみなさんに、お力をお借りしたいと思っています‼️‼️</p>
            <p>
              お豆奏法、気になるけどどうなんだろう、もっと楽に弾けるようになりたい、手が痛くて辛い、と今もどこで悩んでいるピアノ人たちに、
            </p>
            <p>価格的にも内容的にも取っ付きやすいと思われる「一人で学べるお豆奏法基礎講座」の動画教材をオススメしてほしいのです！！</p>
            <p>押し付けでなく、「こんなに楽になれる方法があるよ」「私もこれで救われた！」と、みなさんの言葉で伝えていただくこと。それが、何よりも心強い「お豆のメッセンジャー」の活動になります。</p>
            <p>そして、その感謝の気持ちを形にしてお返ししたいと、運営チームが考えてくださいました！！</p>
            <p>
              その内容は、<br />
              ⬇️⬇️⬇️
            </p>
            <p>今回もし、動画コンテンツを購入してくださったなら、</p>
            <p>サロンメンバーの方お一人おひとりに、「お豆奏法・紹介リンク」を発行させていただきます。</p>
            <p>その専用のリンクから動画が売れたなら、販売額の50％を感謝の気持ちとして受け取っていただきたいのです！</p>
            <p className="bg-amber-50/50 p-4 rounded-xl border-l-4 border-amber-300">
              {currentRate && currentRate.source === "campaign" && currentRate.campaign ? (
                <>
                  ただいま<strong>{currentRate.campaign.name}</strong>を実施中です。<br/>
                  あなた専用のリンクから動画が売れると、販売額の<strong>{currentRate.rate}％</strong>を感謝の気持ちとしてお返しします（
                  {new Date(currentRate.campaign.endAt).toLocaleDateString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                  まで）。
                </>
              ) : (
                <>
                  あなた専用のリンクから動画が売れると、販売額の
                  <strong>{currentRate ? `${currentRate.rate}％` : "一定割合"}</strong>
                  を感謝の気持ちとしてお返しします。
                </>
              )}
            </p>
            <p>⬆️⬆️⬆️</p>
            <p>これは単なる「宣伝」ではありません。</p>
            <p>みなさんがお豆奏法を広めてくださることで、より多くの人がピアノと心地よい関係を築けるようになる。</p>
            <p>それに対する、私からの「ありがとう」のギフト（還元）だと思って受け取っていただけたら嬉しいのです。</p>
            <p>一番近くにいてくれるみなさんに、経済的にも、そして心にもプラスになってほしい。そして一緒に、この温かな「響きの輪」を大きく広げていきたい。</p>
            <p>そんな想いで、この仕組みを考えてもらいました！</p>
            <p>詳しい参加方法については、このあとの案内を確認してくださいね。これからも、お豆奏法と共に在る本物の世界を、みなさんと一緒に創っていけることをますます楽しみにしています。</p>
            
            <div className="pt-8 mt-8 border-t border-[#e8dfce]/60 text-right">
              <p className="text-lg">心を込めて。<br />えりな <Heart className="inline w-5 h-5 text-rose-400 mb-1" /></p>
            </div>
          </div>
        </div>
      </details>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-start gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Handshake className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-stone-500 mb-1">おすそ分けした人数</p>
            <p className="text-2xl font-bold text-omame-deep">{stats?.totalReferrals || 0} <span className="text-sm font-normal text-stone-500">人</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Gift className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-stone-500 mb-1">お届け予定のギフト額</p>
            <p className="text-2xl font-bold text-omame-deep">¥{(stats?.unpaidAmount || 0).toLocaleString()} <span className="text-sm font-normal text-stone-500">（今月振込予定）</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Wallet className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-stone-500 mb-1">これまでに受け取ったギフト</p>
            <p className="text-2xl font-bold text-omame-deep">¥{(stats?.totalEarned || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 紹介ページで表示されるお名前（任意の上書き） */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-10">
        <div className="bg-[#faf9f6] px-6 py-4 border-b border-stone-200 flex items-center gap-2">
          <Mail className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-omame-deep text-lg">紹介ページに表示されるお名前（任意）</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6 leading-relaxed">
            {displayName
              ? `未入力の場合は「${displayName}」が紹介ページに表示されます。お友達に分かりやすいお名前にしたい方は、こちらでご変更ください。`
              : "お友達が見る紹介ページに表示されるお名前です。分かりやすいお名前をご登録ください。"}
          </p>
          <form onSubmit={handleSaveReferralName} className="space-y-5 max-w-xl">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5">紹介ページでのお名前</label>
              <input
                type="text"
                maxLength={20}
                placeholder={displayName || "あなたのお名前"}
                value={referralName}
                onChange={e => setReferralName(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
              />
              <p className="mt-2 text-xs text-stone-400">20文字以内。空欄で保存すると上書きが解除されます。</p>
            </div>

            {referralMessage.text && (
              <div className={`p-4 rounded-xl text-sm flex items-center gap-2 font-bold ${referralMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                <AlertCircle className="w-4 h-4" />
                {referralMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingReferral}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <Save className="w-5 h-5" />
              {savingReferral ? "保存中..." : "お名前を保存する"}
            </button>
          </form>
        </div>
      </div>

      {/* 振込先口座の登録 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="bg-[#faf9f6] px-6 py-4 border-b border-stone-200 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-omame-deep text-lg">特典受け取り用の口座情報</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            紹介特典（ギフト）をお届けするための口座情報を登録してください。
          </p>
          <form onSubmit={handleSaveBankInfo} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">金融機関名</label>
                <input 
                  type="text" required placeholder="例：お豆銀行"
                  value={bankInfo.bankName} onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">支店名</label>
                <input 
                  type="text" required placeholder="例：本店営業部"
                  value={bankInfo.branchName} onChange={e => setBankInfo({...bankInfo, branchName: e.target.value})}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">口座種別</label>
                <select 
                  value={bankInfo.accountType} onChange={e => setBankInfo({...bankInfo, accountType: e.target.value})}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all bg-white"
                >
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                  <option value="貯蓄">貯蓄</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">口座番号</label>
                <input 
                  type="text" required pattern="[0-9]+" placeholder="半角数字のみ"
                  value={bankInfo.accountNumber} onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5">口座名義（カナ）</label>
              <input 
                type="text" required placeholder="例：ヤマダ タロウ"
                value={bankInfo.accountName} onChange={e => setBankInfo({...bankInfo, accountName: e.target.value})}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
              />
            </div>

            {saveMessage.text && (
              <div className={`p-4 rounded-xl text-sm flex items-center gap-2 font-bold ${saveMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                <AlertCircle className="w-4 h-4" />
                {saveMessage.text}
              </div>
            )}

            <button 
              type="submit" disabled={saving}
              className="mt-6 flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <Save className="w-5 h-5" />
              {saving ? "保存中..." : "口座情報を保存する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
