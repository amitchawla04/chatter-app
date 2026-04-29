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
import { useT } from "@/components/I18nProvider";

type Step = "input" | "code";
type Channel = "email" | "phone";

export default function SignInPage() {
  const router = useRouter();
  const t = useT();
  const [channel, setChannel] = useState<Channel>("email");
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const normalizedPhone = () => {
    const digits = phone.replace(/[^\d+]/g, "");
    return digits.startsWith("+") ? digits : `+${digits}`;
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const ready =
      channel === "email" ? email.trim() : normalizedPhone().length >= 9;
    if (!ready || status === "pending") return;
    setStatus("pending");
    setMessage(null);

    const supabase = createClient();
    const { error } =
      channel === "email"
        ? await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: { shouldCreateUser: true },
          })
        : await supabase.auth.signInWithOtp({
            phone: normalizedPhone(),
            options: { shouldCreateUser: true },
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
    const { data, error } =
      channel === "email"
        ? await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: code,
            type: "email",
          })
        : await supabase.auth.verifyOtp({
            phone: normalizedPhone(),
            token: code,
            type: "sms",
          });

    if (error) {
      setStatus("error");
      setMessage(
        error.message.includes("expired")
          ? "code expired · request a new one."
          : "code didn't match. try again.",
      );
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
          {t("signin.back")}
        </Link>
      </header>

      <section className="flex-1 flex items-center px-6 sm:px-10 py-16">
        <div className="max-w-md mx-auto w-full">
          {step === "input" ? (
            <InputStep
              t={t}
              channel={channel}
              setChannel={(c) => {
                setChannel(c);
                setMessage(null);
                setStatus("idle");
              }}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              onSubmit={sendCode}
              status={status}
              message={message}
            />
          ) : (
            <CodeStep
              t={t}
              channel={channel}
              contact={channel === "email" ? email : normalizedPhone()}
              code={code}
              setCode={setCode}
              onSubmit={verifyCode}
              onBack={() => {
                setStep("input");
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
            {t("signin.pact_lead")}{" "}
            <Link href="/pact" className="text-red hover:text-ink transition">
              {t("signin.pact_link")}
            </Link>
            {" "}{t("signin.pact_tail")}
          </motion.p>
        </div>
      </section>
    </main>
  );
}

function InputStep({
  t,
  channel,
  setChannel,
  email,
  setEmail,
  phone,
  setPhone,
  onSubmit,
  status,
  message,
}: {
  t: (k: string) => string;
  channel: "email" | "phone";
  setChannel: (c: "email" | "phone") => void;
  email: string;
  setEmail: (s: string) => void;
  phone: string;
  setPhone: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  status: "idle" | "pending" | "error";
  message: string | null;
}) {
  const isReady =
    channel === "email" ? email.trim().length > 0 : phone.replace(/[^\d]/g, "").length >= 9;

  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="display-text text-3xl sm:text-4xl text-ink mb-3"
      >
        {t("signin.heading_email")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="body-text text-muted mb-8"
      >
        {t("signin.sub_email")}
      </motion.p>

      {/* Channel toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        role="tablist"
        aria-label="Sign-in method"
        className="grid grid-cols-2 mb-6 border border-line"
      >
        <button
          type="button"
          role="tab"
          aria-selected={channel === "email"}
          onClick={() => setChannel("email")}
          className={`px-4 py-2.5 mono-text text-xs uppercase tracking-wider transition-colors ${
            channel === "email" ? "bg-red text-paper" : "text-muted hover:text-ink"
          }`}
        >
          email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={channel === "phone"}
          onClick={() => setChannel("phone")}
          className={`px-4 py-2.5 mono-text text-xs uppercase tracking-wider transition-colors border-l border-line ${
            channel === "phone" ? "bg-red text-paper" : "text-muted hover:text-ink"
          }`}
        >
          phone
        </button>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={onSubmit}
        className="space-y-5"
      >
        {channel === "email" ? (
          <div>
            <label htmlFor="email" className="label-text text-muted block mb-2">
              {t("signin.email_label")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("signin.email_placeholder")}
              className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-4 py-3 outline-none transition-colors"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="label-text text-muted block mb-2">
              phone
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 555 5555"
              className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-4 py-3 outline-none transition-colors"
            />
            <p className="mono-text text-[10px] text-muted mt-1.5">
              include country code (+1 for US, +44 UK, +91 IN)
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "pending" || !isReady}
          className="btn-primary w-full justify-center"
        >
          {status === "pending" ? t("signin.sending") : t("signin.send_code")}
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
  t,
  channel,
  contact,
  code,
  setCode,
  onSubmit,
  onBack,
  onResend,
  status,
  message,
}: {
  t: (k: string) => string;
  channel: "email" | "phone";
  contact: string;
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
        {channel === "phone" ? "check your messages." : t("signin.heading_code")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="body-text text-muted mb-10"
      >
        {channel === "phone"
          ? `we sent a 6-digit code to`
          : t("signin.sub_code")}{" "}
        <span className="text-ink">{contact}</span>.
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
            {t("signin.code_label")}
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
          {status === "pending" ? t("signin.verifying") : t("signin.verify")}
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
            {t("signin.different_email")}
          </button>
          <button
            type="button"
            onClick={onResend}
            className="text-red hover:text-ink transition-colors"
          >
            {t("signin.resend")}
          </button>
        </div>
      </motion.form>
    </>
  );
}
