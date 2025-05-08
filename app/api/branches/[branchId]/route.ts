import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler";
import { cookies } from "next/headers";

type BranchIdParams = { branchId: string };

function sanitizeString(input: unknown): string | null {
  return typeof input === "string" ? input.trim() : null;
}

function sanitizeBoolean(input: unknown, fallback: boolean): boolean {
  return typeof input === "boolean" ? input : fallback;
}

async function getBranchId(params: BranchIdParams): Promise<string | null> {
  return params?.branchId || null;
}

async function getAuthCookie() {
  const cookieStore = cookies();
  return (await cookieStore).get("auth_session");
}

async function requireAuth(): Promise<boolean> {
  const authCookie = await getAuthCookie();
  return !!authCookie;
}

export async function GET(
  request: Request,
  { params }: { params: BranchIdParams }
) {
  const branchId = await getBranchId(params);
  if (!branchId) return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
  if (!(await requireAuth())) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const supabase = await createRouteHandlerSupabaseClient();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("id", branchId)
    .single();

  if (error) return NextResponse.json({ error: "Failed to fetch branch" }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: BranchIdParams }
) {
  const branchId = await getBranchId(params);
  if (!branchId) return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
  if (!(await requireAuth())) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  let body: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
    is_main?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = sanitizeString(body.name);
  const address = sanitizeString(body.address);
  if (!name || !address) return NextResponse.json({ error: "Name and address are required" }, { status: 400 });

  const phone = sanitizeString(body.phone);
  const email = sanitizeString(body.email);
  const is_active = sanitizeBoolean(body.is_active, true);
  const is_main = typeof body.is_main === "boolean" ? body.is_main : undefined;

  const supabase = await createRouteHandlerSupabaseClient();
  const { data: currentBranch, error: fetchError } = await supabase
    .from("branches")
    .select("restaurant_id, is_main")
    .eq("id", branchId)
    .single();

  if (fetchError || !currentBranch) return NextResponse.json({ error: "Failed to fetch branch" }, { status: 500 });

  const updateData = {
    name,
    address,
    phone,
    email,
    is_active,
    is_main: is_main !== undefined ? is_main : currentBranch.is_main,
  };

  const { data, error } = await supabase
    .from("branches")
    .update(updateData)
    .eq("id", branchId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });

  if (is_main === true && !currentBranch.is_main) {
    await supabase
      .from("branches")
      .update({ is_main: false })
      .eq("restaurant_id", currentBranch.restaurant_id)
      .neq("id", branchId);
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: BranchIdParams }
) {
  const branchId = await getBranchId(params);
  if (!branchId) return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
  if (!(await requireAuth())) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const supabase = await createRouteHandlerSupabaseClient();
  const { data: branch, error: fetchError } = await supabase
    .from("branches")
    .select("is_main")
    .eq("id", branchId)
    .single();

  if (fetchError || !branch) return NextResponse.json({ error: "Failed to fetch branch" }, { status: 500 });
  if (branch.is_main) return NextResponse.json({ error: "Cannot delete the main branch" }, { status: 400 });

  const { error } = await supabase.from("branches").delete().eq("id", branchId);
  if (error) return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });

  return NextResponse.json({ success: true });
}
