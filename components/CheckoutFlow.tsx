"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { requestTicketOTP, confirmTicketPurchase } from "@/lib/ticket-actions";

type Step = "review" | "otp" | "processing" | "success";

interface Props {
  eventId: string;
  eventTitle: string;
  eventSubtitle: string | null;
  priceCents: number;
  defaultPhone?: string | null;
}

export function CheckoutFlow({ eventId, eventTitle, eventSubtitle, priceCents, defaultPhone }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("review");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [normalizedPhone, setNormalizedPhone] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const priceLabel = `$${(priceCents / 100).toFixed(2)}`;

  function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestTicketOTP(eventId, phone);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNormalizedPhone(result.phone);
      setStep("otp");
    });
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await confirmTicketPurchase(eventId, normalizedPhone, code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep("processing");
      // Brief simulated processing for psychological realism
      setTimeout(() => {
        setStep("success");
        setTimeout(() => router.push(`/live/${eventId}?ticket=ok`), 1500);
      }, 1800);
    });
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8">
      {/* Order summary card */}
      <div className="border border-line bg-paper p-5 mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs mono-text text-muted uppercase tracking-wider">
          <Ticket size={14} strokeWidth={1.5} />
          <span>Ticketed Space</span>
        </div>
        <h2 className="display-italic text-2xl text-ink leading-tight mb-1">{eventTitle}</h2>
        {eventSubtitle && <p className="text-muted text-sm mb-4">{eventSubtitle}</p>}
        <div className="border-t border-line pt-3 flex items-baseline justify-between">
          <span className="text-muted text-sm">Total</span>
          <span className="display-text text-3xl text-ink mono-text">{priceLabel}</span>
        </div>
      </div>

      {step === "review" && (
        <form onSubmit={handleSendOTP} className="space-y-5">
          <div>
            <label htmlFor="phone" className="block text-xs mono-text text-muted uppercase tracking-wider mb-2">
              Mobile number for purchase OTP
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98800 12345"
              className="w-full border border-line bg-canvas px-4 py-3 text-ink mono-text focus:outline-none focus:border-red"
            />
            <p className="text-muted text-xs mt-2">
              We&apos;ll text a 6-digit code. India numbers default to +91.
            </p>
          </div>

          {error && <p className="text-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={pending || !phone.trim()}
            className="w-full bg-red text-canvas mono-text uppercase tracking-wider text-sm py-4 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} strokeWidth={2} />}
            <span>Continue · {priceLabel}</span>
          </button>

          <p className="text-muted text-[11px] text-center">
            <span className="font-semibold">Beta:</span> no real payment is taken. Real purchase OTP via your carrier; access grants on verify.
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleConfirm} className="space-y-5">
          <div>
            <p className="text-ink text-sm mb-1">
              Code sent to <span className="mono-text">{normalizedPhone}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("review");
                setCode("");
                setError(null);
              }}
              className="text-muted text-xs underline hover:text-ink"
            >
              Wrong number? Edit
            </button>
          </div>

          <div>
            <label htmlFor="otp" className="block text-xs mono-text text-muted uppercase tracking-wider mb-2">
              6-digit code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full border border-line bg-canvas px-4 py-4 text-ink mono-text text-2xl text-center tracking-[0.4em] focus:outline-none focus:border-red"
              autoFocus
            />
          </div>

          {error && <p className="text-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={pending || code.length < 4}
            className="w-full bg-red text-canvas mono-text uppercase tracking-wider text-sm py-4 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>Confirm purchase</span>
          </button>
        </form>
      )}

      {step === "processing" && (
        <div className="text-center py-12 space-y-4">
          <Loader2 size={32} className="animate-spin mx-auto text-red" strokeWidth={1.5} />
          <p className="text-ink text-sm">Authorising payment…</p>
          <p className="text-muted text-xs mono-text">simulated · no real charge</p>
        </div>
      )}

      {step === "success" && (
        <div className="text-center py-12 space-y-4">
          <CheckCircle2 size={48} className="mx-auto text-red" strokeWidth={1.5} />
          <p className="display-italic text-2xl text-ink">You&apos;re in.</p>
          <p className="text-muted text-sm">Ticket granted. Loading the space…</p>
        </div>
      )}
    </div>
  );
}
