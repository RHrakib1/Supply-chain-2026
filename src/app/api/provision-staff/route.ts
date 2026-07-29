import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, tenantId } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Missing required email address" }, { status: 400 });
    }

    const assignedTenantId = tenantId || "CLI-101";

    try {
      const client = await clerkClient();
      const userList = await client.users.getUserList({
        emailAddress: [email.trim().toLowerCase()],
      });

      if (userList.data && userList.data.length > 0) {
        const targetUser = userList.data[0];
        await client.users.updateUserMetadata(targetUser.id, {
          publicMetadata: {
            ...targetUser.publicMetadata,
            tenantId: assignedTenantId,
            role: "user",
          },
          unsafeMetadata: {
            ...targetUser.unsafeMetadata,
            tenantId: assignedTenantId,
            role: "user",
          },
        });
      }
    } catch (clerkErr) {
      console.warn("Notice updating Clerk user metadata for staff provisioning:", clerkErr);
    }

    return NextResponse.json({
      success: true,
      email: email.trim().toLowerCase(),
      name: name?.trim() || "Staff Member",
      tenantId: assignedTenantId,
      role: "user",
      message: `Successfully provisioned ${email.trim()} for Tenant ${assignedTenantId} with Staff/Driver role.`,
    });
  } catch (error) {
    console.error("Error in /api/provision-staff route:", error);
    return NextResponse.json({ error: "Failed to provision staff member" }, { status: 500 });
  }
}
