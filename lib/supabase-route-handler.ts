import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export async function createRouteHandlerSupabaseClient() {
  const cookieStore = cookies();
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const authSessionCookie = (await cookieStore).get("auth_session")?.value;

  if (authSessionCookie) {
    try {
      const session = JSON.parse(authSessionCookie);
      if (session.token) {
        await supabase.auth.setSession({
          access_token: session.token,
          refresh_token: session.refreshToken || "",
        });
      }
    } catch {
      // Silently fail to avoid leaking sensitive info
    }
  }

  return supabase;
}

export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
