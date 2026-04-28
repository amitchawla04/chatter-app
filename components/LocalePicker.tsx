"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  hi: "हिन्दी",
  fr: "Français",
  de: "Deutsch",
};

export function LocalePicker({ initialLocale }: { initialLocale: Locale }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const change = (next: Locale) => {
    setLocale(next);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <div className="px-5 py-5 space-y-3">
      <p className="mono-text text-[11px] text-muted">
        translation scaffold · 6 locales · {Object.keys(LABELS).length}{" "}
        languages with a small set of UI keys translated. extending coverage is a
        per-string job; falls back to English when a key isn&rsquo;t translated.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => change(code)}
            disabled={pending && locale === code}
            className={`px-3 py-2 border text-sm transition ${
              locale === code
                ? "border-red bg-paper text-red"
                : "border-line text-ink hover:border-ink"
            }`}
          >
            <span className="mono-text text-[10px] uppercase tracking-wider mr-2 opacity-60">
              {code}
            </span>
            {LABELS[code]}
          </button>
        ))}
      </div>
      {saved && (
        <p className="mono-text text-[11px] text-red">saved · refresh to see translated strings</p>
      )}
    </div>
  );
}
