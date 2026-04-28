"use client";

/**
 * Sign-in — 2-step OTP code flow.
 * Step 1: enter email → Supabase sends a 6-digit code (also includes magic link,
 * user may use either, but the primary flow is code-entry in-app).
 * Step 2: enter code → verifyOtp → session → route to onboarding.
 *
 * Why code-entry not magic-link: removes the Supabase Auth URL redirect dependency,
 * keeps user in-app on mobile (no Safari-to-app bounce), faster to 5 users.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChatterMark } from "@/components/ChatterMark";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "pending") return;
    setStatus("pending");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        // No emailRedirectTo — user enters code in-app instead of clicking a link
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStep("code");
    setStatus("idle");
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || status === "pending") return;
    setStatus("pending");
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: "email",
    });

    if (error) {
      setStatus("error");
      setMessage(error.message.includes("expired") ? "code expired · request a new one." : "code didn't match. try again.");
      return;
    }

    if (!data.session) {
      setStatus("error");
      setMessage("couldn't create session. try again.");
      return;
    }

    // Post-verify: provision the public.users row (idempotent) then route
    await fetch("/auth/bootstrap", { method: "POST" });
    router.push("/onboarding");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/" className="inline-block">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <Link href="/" className="label-text text-muted hover:text-ink transition">
          ← back
        </Link>
      </header>

      <section className="flex-1 flex items-center px-6 sm:px-10 py-16">
        <div className="max-w-md mx-auto w-full">
          {step === "email" ? (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSubmit={sendCode}
              status={status}
              message={message}
            />
          ) : (
            <CodeStep
              email={email}
              code={code}
              setCode={setCode}
              onSubmit={verifyCode}
              onBack={() => {
                setStep("email");
                setCode("");
                setMessage(null);
                setStatus("idle");
              }}
              onResend={sendCode}
              status={status}
              message={message}
            />
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 mono-text text-xs text-muted"
          >
            by continuing, you accept{" "}
            <Link href="/pact" className="text-red hover:text-ink transition">
              the chatter pact
            </Link>
            {" — 14 commitments we make to you."}
          </motion.p>
        </div>
      </section>
    </main>
  );
}

function EmailStep({
  email,
  setEmail,
  onSubmit,
  status,
  message,
}: {
  email: string;
  setEmail: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  status: "idle" | "pending" | "error";
  message: string | null;
}) {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="display-text text-3xl sm:text-4xl text-ink mb-3"
      >
        claim your handle.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="body-text text-muted mb-10"
      >
        we&rsquo;ll send a 6-digit code. no passwords. no tracking outside chatter.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={onSubmit}
        className="space-y-5"
      >
        <div>
          <label htmlFor="email" className="label-text text-muted block mb-2">
            email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-4 py-3 outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={status === "pending" || !email.trim()}
          className="btn-primary w-full justify-center"
        >
          {status === "pending" ? "sending code…" : "send code"}
          {status !== "pending" && <span>→</span>}
        </button>

        {status === "error" && message && (
          <p className="text-warn text-sm">{message}</p>
        )}
      </motion.form>
    </>
  );
}

function CodeStep({
  email,
  code,
  setCode,
  onSubmit,
  onBack,
  onResend,
  status,
  message,
}: {
  email: string;
  code: string;
  setCode: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onResend: (e: React.FormEvent) => void;
  status: "idle" | "pending" | "error";
  message: string | null;
}) {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="display-text text-3xl sm:text-4xl text-ink mb-3"
      >
        check your inbox.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="body-text text-muted mb-10"
      >
        we sent a 6-digit code to <span className="text-ink">{email}</span>. enter it below.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={onSubmit}
        className="space-y-5"
      >
        <div>
          <label htmlFor="code" className="label-text text-muted block mb-2">
            code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-4 py-3 outline-none transition-colors text-center text-3xl tracking-[0.5em] font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={status === "pending" || code.length !== 6}
          className="btn-primary w-full justify-center"
        >
          {status === "pending" ? "verifying…" : "verify & continue"}
          {status !== "pending" && <span>→</span>}
        </button>

        {status === "error" && message && (
          <p className="text-warn text-sm">{message}</p>
        )}

        <div className="flex items-center justify-between text-sm pt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-muted hover:text-ink transition-colors"
          >
            ← different email
          </button>
          <button
            type="button"
            onClick={onResend}
            className="text-red hover:text-ink transition-colors"
          >
            resend code
          </button>
        </div>
      </motion.form>
    </>
  );
}
