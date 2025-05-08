import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    const cookieStore = cookies();
    const authCookie = (await cookieStore).get("auth_session");

    if (!authCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(authCookie.value);
    } catch {
      return NextResponse.json({ authenticated: false }, { status:401 });
    }

    const userId = sessionData?.userId;
    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
