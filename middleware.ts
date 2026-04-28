/**
 * Next.js middleware — runs on every request to refresh the Supabase session.
 * Without this, auth tokens don't refresh in server components.
 */
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This refreshes the session cookie — must be called on every request
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except:
    // - _next/static, _next/image, favicon.ico
    // - public assets, api routes where not needed
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
