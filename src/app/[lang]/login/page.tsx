"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // すでにログインしている場合は自動的に受講画面へ飛ばす
        router.push("/ja/lms");
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    
    // 現在のホストURLを取得（window.location.originを使うことで一番確実にする）
    const getUrl = () => {
      let url = "http://localhost:3000";
      if (typeof window !== "undefined") {
        url = window.location.origin;
      }
      return `${url}/api/auth/callback?next=/ja/lms`;
    };

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getUrl(),
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error("Login error:", error);
      setStatus("error");
      setErrorMessage("ログイン用リンクの送信に失敗しました。メールアドレスをご確認ください。");
    } else {
      setStatus("success");
    }
  };

  return (
    <div className="min-h-screen bg-omame-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* 背景の装飾 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-omame-accent/10 blur-[80px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-omame-gold/10 blur-[80px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="mt-6 text-center text-3xl font-serif font-bold tracking-tight text-omame-primary">
          おうちで学べるお豆奏法基礎講座へようこそ
        </h2>
        <p className="mt-2 text-center text-sm text-omame-primary/70">
          OMAME SOHO LAB.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow-xl shadow-omame-primary/5 sm:rounded-2xl sm:px-10 border border-omame-gold/20">
          {status === "success" ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
              <h3 className="text-lg font-medium text-omame-primary mb-2">
                メールを送信しました！
              </h3>
              <p className="text-sm text-omame-primary/70 mb-6">
                <strong>{email}</strong> 宛にログイン用のメールをお送りしました。
                メールを開いて、中のボタンをクリックしてください。
              </p>
              <div className="bg-omame-gold/10 rounded-lg p-3 mb-6 text-xs text-omame-primary/80 text-left">
                <p className="font-semibold mb-1">※メールが見当たらない場合：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>迷惑メールフォルダをご確認ください</li>
                  <li>Gmailの場合は「すべてのメール」や「プロモーション」タブに振り分けられていることがあります</li>
                </ul>
              </div>
              <button
                onClick={() => setStatus("idle")}
                className="text-sm text-omame-accent hover:text-omame-primary transition-colors underline"
              >
                別のメールアドレスを試す
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-omame-primary mb-2">
                  ご登録のメールアドレス
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-omame-primary/40" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-omame-gold/30 rounded-xl focus:ring-omame-accent focus:border-omame-accent sm:text-sm bg-white/50 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-rose-500 bg-rose-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-omame-primary hover:bg-omame-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-omame-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      メールでログインする
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-omame-primary/50 space-y-2">
                <p>パスワードは不要です。入力したメールアドレス宛にログイン用のボタンが届きます。</p>
                <p className="text-omame-primary/40 mt-2">※数分待っても届かない場合は、迷惑メールフォルダや「すべてのメール」「プロモーション」タブ等をご確認ください。</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
