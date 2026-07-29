import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { insertSupabaseClient } from "@/lib/supabaseService";
import { ClientBusiness } from "@/context/DashboardContext";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, ownerName, ownerEmail, plan, maxUsers, tenantId } = body;

    if (!name || !ownerEmail || !ownerName) {
      return NextResponse.json({ error: "Missing required onboarding fields" }, { status: 400 });
    }

    const assignedTenantId = tenantId || `CLI-${Date.now()}`;
    const planMrrMap: Record<string, number> = {
      Starter: 35000,
      Professional: 95000,
      Enterprise: 250000,
    };

    const newClient: ClientBusiness = {
      id: assignedTenantId,
      name,
      ownerName,
      ownerEmail,
      plan: plan || "Professional",
      maxUsers: Number(maxUsers) || 20,
      activeUsers: 1,
      status: "Active",
      mrr: planMrrMap[plan] || 95000,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // 1. Insert into Supabase clients table
    await insertSupabaseClient(newClient);

    // 2. Attempt updating Clerk publicMetadata for the user matching ownerEmail (if already registered)
    try {
      const client = await clerkClient();
      const userList = await client.users.getUserList({
        emailAddress: [ownerEmail],
      });

      if (userList.data && userList.data.length > 0) {
        const targetUser = userList.data[0];
        const isMaster = ownerEmail.toLowerCase() === "rakibhasanmd457@gmail.com";
        const assignedRole = isMaster ? "super_admin" : "admin";

        const cleanUnsafe = { ...(targetUser.unsafeMetadata as Record<string, unknown>) };
        if (!isMaster && cleanUnsafe.role === "super_admin") {
          cleanUnsafe.role = "admin";
        }

        await client.users.updateUserMetadata(targetUser.id, {
          publicMetadata: {
            ...targetUser.publicMetadata,
            tenantId: assignedTenantId,
            role: assignedRole,
          },
          unsafeMetadata: cleanUnsafe,
        });
      }
    } catch (clerkErr) {
      console.warn("Notice updating Clerk user metadata during onboarding:", clerkErr);
    }

    return NextResponse.json({
      success: true,
      client: newClient,
      tenantId: assignedTenantId,
    });
  } catch (error) {
    console.error("Error in /api/onboard-tenant route:", error);
    return NextResponse.json({ error: "Failed to onboard tenant" }, { status: 500 });
  }
}
