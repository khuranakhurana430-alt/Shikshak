import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}