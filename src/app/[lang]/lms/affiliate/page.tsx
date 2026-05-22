"use client";

import { useState, useEffect } from "react";
import { Handshake, Copy, CheckCircle2, TrendingUp, Wallet, Banknote, Save, AlertCircle, Mail, Heart, Sparkles, Gift } from "lucide-react";
import Image from "next/image";

type AffiliateStats = {
  totalReferrals: number;
  totalEarned: number;
  unpaidAmount: number;
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
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "", branchName: "", accountType: "普通", accountNumber: "", accountName: ""
  });
  
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/affiliate");
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
          setStats(data.stats);
          if (data.bankInfo) {
            setBankInfo(data.bankInfo);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const affiliateUrl = userId ? `https://omamepiano.com/ja/offer?ref=${userId}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
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
        setSaveMessage({ text: "保存に失敗しました", type: "error" });
      }
    } catch (e) {
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* ページタイトル */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shadow-sm">
          <Heart className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-omame-deep font-serif">お豆メッセンジャー</h1>
      </div>

      {/* えりな先生からのお手紙 */}
      <div className="mb-12 bg-[#faf9f6] rounded-3xl p-6 sm:p-10 md:p-12 shadow-md border border-[#e8dfce] relative overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif leading-relaxed">
              お豆の響きを、大切な人へ――<br className="hidden sm:block" />
              「お豆メッセンジャー」の輪を広げませんか？
            </h2>
          </div>
          
          <div className="space-y-6 text-stone-700 leading-loose font-serif">
            <p>サロンのみなさん、こんにちは。えりなです。</p>
            <p>いつもこの場所で、みなさんと一緒に「お豆奏法」を深め、一人ひとりの音や心がふわっと緩んでいく様子を近くで見守らせていただけること、本当に幸せに感じています。</p>
            <p>ふと思い返すと、お豆奏法が生まれたのは、「頑張りすぎて、ピアノが苦しくなってしまった人」を一人でも救いたいという、小さくて切実な願いからでした。</p>
            <p>でも最近、このサロンを通してみなさんと触れ合うなかで、確信していることがあります。<br/>
            それは、<strong>「この奏法は、ピアノの技術だけではなく、その人の人生そのものを調えてくれる魔法なんだ」</strong>ということです。</p>
            <p>身体の力が抜けて、本来持っている美しい響きが溢れ出すとき、その人の周りの空気が一瞬で変わる。その感動を、私はもっともっと多くの人に知ってほしい。そう願わずにはいられません。</p>
            <p>けれど、私の手だけで届く範囲には、どうしても限界があります。<br/>
            そこで、一番近くでこの喜びを知ってくださっているサロンのみなさんに、お力をお借りしたいなと思うようになりました。</p>
            <div className="bg-white/60 p-6 rounded-2xl border border-stone-200/50 my-6">
              <p className="mb-2">もし、みなさんの周りに</p>
              <ul className="list-disc pl-5 space-y-2 text-stone-800 font-medium">
                <li>一生懸命練習しているけれど、どこか苦しそうにしている生徒さん</li>
                <li>昔のようにピアノと仲良くしたいと願っているお友達</li>
                <li>もっと楽に、美しい音を出したいと探求しているピアノ仲間</li>
              </ul>
              <p className="mt-4">がいらっしゃったら、ぜひ、その方に「お豆奏法」という新しい選択肢をそっと手渡してあげてほしいのです。</p>
            </div>
            <p>押し付けるのではなく、「こんなに楽になれる方法があるよ」と、みなさんの言葉で伝えていただくこと。それが、何よりも心強い「お豆のメッセンジャー」の活動になります。</p>
            <p>そして、その感謝の気持ちを、形にしてお返ししたいと考えました。</p>
            <p>今回、動画コンテンツを購入してくださったサロンメンバーの方お一人おひとりに、<strong>「お豆奏法・おすそ分けリンク」</strong>を発行させていただきます。</p>
            <p className="bg-amber-50/50 p-4 rounded-xl border-l-4 border-amber-300">
              あなた専用のリンクから動画が売れると、販売額の35％を感謝の気持ちとしてお返しします。<br/>
              キャンペーン期間など、特別なときには、50％をお返しさせていただきます。
            </p>
            <p>これは「宣伝」ではありません。<br/>
            みなさんがお豆奏法を広めてくださることで、より多くの人がピアノと心地よい関係を築けるようになる。それに対する、私からの<strong>「ありがとう」のギフト（還元）</strong>だと思って受け取っていただけたら嬉しいです。</p>
            <p>一番近くにいてくれるみなさんに、経済的にも、そして心もプラスになってほしい。<br/>
            そして一緒に、この温かな「響きの輪」を大きく広げていきたい。</p>
            <p>そんな想いで、この仕組みをつくりました。</p>
            <p>詳しい参加方法については、このあとの案内を確認してくださいね。<br/>
            これからも、優しい音のあふれる世界を、みなさんと共に創っていけるのを楽しみにしています。</p>
            
            <div className="pt-8 mt-8 border-t border-[#e8dfce]/60 text-right">
              <p className="text-lg">心を込めて。 えりな <Heart className="inline w-5 h-5 text-rose-400 mb-1" /></p>
            </div>
          </div>
        </div>
      </div>

      {/* お豆メッセンジャーのステップ図解 */}
      <div className="mb-14">
        <h3 className="text-xl font-bold text-stone-800 text-center mb-8 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-500" />
          お豆メッセンジャーのはじめ方
          <Sparkles className="text-amber-500" />
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="aspect-video relative bg-stone-100 flex items-center justify-center">
              {/* NOTE: 拡張子は保存されたもの(.png/.jpg等)に合わせて読み込めるようにします */}
              <Image src="/images/messenger-step1.png" alt="STEP 1" fill className="object-cover" 
                onError={(e) => {
                  // 画像がない場合のフォールバック（pngではなくjpgで保存されていた場合など）
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
            <div className="p-4 text-center">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full mb-2">STEP 1</span>
              <p className="font-bold text-stone-700">あなた専用のリンクをシェア</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
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
            <div className="p-4 text-center">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full mb-2">STEP 2</span>
              <p className="font-bold text-stone-700">お友達がお豆奏法をスタート！</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
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
            <div className="p-4 text-center">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full mb-2">STEP 3</span>
              <p className="font-bold text-stone-700">お互いに嬉しいギフトが届く</p>
            </div>
          </div>
        </div>
      </div>

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

      {/* 紹介リンク */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-10">
        <div className="bg-[#faf9f6] px-6 py-4 border-b border-stone-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-omame-deep text-lg">あなた専用のおすそ分けリンク</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-600 mb-4 leading-relaxed">
            このURLをLINEやブログに貼り付けて、お友達にそっと手渡してあげてください。<br/>
            リンクをクリックしてから30日以内の受講スタートが対象となります。
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
          </div>
        </div>
      </div>

      {/* 振込先口座の登録 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="bg-[#faf9f6] px-6 py-4 border-b border-stone-200 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-omame-deep text-lg">えりな先生からのギフトお受取り口座</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            還元（ギフト）をお届けするための口座情報を登録してください。
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
