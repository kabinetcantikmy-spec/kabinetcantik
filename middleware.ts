import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });
  if (!url || !anon) return res;

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: Record<string, unknown>) {
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  const area = path.startsWith("/admin")
    ? "admin"
    : path.startsWith("/portal")
    ? "portal"
    : path.startsWith("/pembekal")
    ? "pembekal"
    : null;
  if (!area) return res;

  const loginPath = `/${area}/login`;
  const isLogin = path === loginPath;
  // Halaman awam dalam kawasan yang tak perlu auth (cth pendaftaran pembekal).
  const isPublic = isLogin || path === "/pembekal/daftar";

  if (!isPublic && !user) {
    return NextResponse.redirect(new URL(loginPath, req.url));
  }
  if (isLogin && user) {
    return NextResponse.redirect(new URL(`/${area}`, req.url));
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
