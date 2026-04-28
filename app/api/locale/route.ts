import { NextResponse } from "next/server";
import { isSupportedLocale } from "@/lib/i18n";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { locale?: string };
  if (!isSupportedLocale(body.locale)) {
    return NextResponse.json({ ok: false, error: "unsupported locale" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale: body.locale });
  res.cookies.set("chatter_locale", body.locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return res;
}
