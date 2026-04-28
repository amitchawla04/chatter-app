"use client";

import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action="/auth/sign-out" method="post">
      <button
        type="submit"
        aria-label="Sign out"
        className="text-muted hover:text-ink transition-colors"
      >
        <LogOut size={18} strokeWidth={1.5} />
      </button>
    </form>
  );
}
