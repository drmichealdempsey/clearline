import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session if needed. Do not run code between client creation and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isDashboard = path === "/dashboard" || path.startsWith("/dashboard/");
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isAuthPage = path === "/login" || path === "/signup";

  const redirectTo = (pathname: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search;
    const redirect = NextResponse.redirect(url);
    // Carry over any refreshed auth cookies.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!user) {
    if (isDashboard || isAdmin) {
      return redirectTo("/login", `?next=${encodeURIComponent(path)}`);
    }
    return response;
  }

  if (isDashboard || isAdmin || isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isInvestigator = profile?.role === "investigator";
    const home = isInvestigator ? "/admin" : "/dashboard";

    if (isAuthPage) return redirectTo(home);
    if (isDashboard && isInvestigator) return redirectTo("/admin");
    if (isAdmin && !isInvestigator) return redirectTo("/dashboard");
  }

  return response;
}
