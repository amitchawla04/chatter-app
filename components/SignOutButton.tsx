"use client";

import { LogOut } from "lucide-react";
import { useT } from "./I18nProvider";

export function SignOutButton() {
  const t = useT();
  return (
    <form action="/auth/sign-out" method="post">
      <button
        type="submit"
        aria-label={t("auth.sign_out")}
        className="text-muted hover:text-ink transition-colors"
      >
        <LogOut size={18} strokeWidth={1.5} />
      </button>
    </form>
  );
}
