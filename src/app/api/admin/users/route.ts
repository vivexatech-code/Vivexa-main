import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ADMIN_USERS_COLLECTION } from "@/lib/constants";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      displayName,
      initialPassword,
      jobTitle,
      departments = [],
      reportingManagerId,
      status = "active",
      isSuperAdmin = false,
      permissions = {},
      capabilities = {},
      actor,
    } = body;

    if (!email || !displayName) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    let uid: string;
    let resetLink: string | null = null;

    if (adminAuth) {
      try {
        const userRecord = await adminAuth.createUser({
          email: cleanEmail,
          displayName: cleanName,
          password: initialPassword || `${crypto.randomUUID()}!Aa1`,
        });
        uid = userRecord.uid;

        // If no initial password was explicitly set by the admin, create a reset link
        if (!initialPassword) {
          try {
            resetLink = await adminAuth.generatePasswordResetLink(cleanEmail);
          } catch {
            // Non-fatal if reset link generation fails
          }
        }
      } catch (authError: unknown) {
        if (
          authError &&
          typeof authError === "object" &&
          "code" in authError &&
          (authError as { code: string }).code === "auth/email-already-exists"
        ) {
          const existing = await adminAuth.getUserByEmail(cleanEmail);
          uid = existing.uid;
        } else {
          throw authError;
        }
      }
    } else {
      // Fallback if Admin SDK is unconfigured in local sandbox
      uid = crypto.randomUUID();
    }

    // Write to admin_users collection
    if (adminDb) {
      await adminDb.collection(ADMIN_USERS_COLLECTION).doc(uid).set({
        email: cleanEmail,
        displayName: cleanName,
        jobTitle: jobTitle ? String(jobTitle).trim() : null,
        departments,
        reportingManagerId: reportingManagerId || null,
        status,
        isSuperAdmin: Boolean(isSuperAdmin),
        permissions: permissions || {},
        capabilities: capabilities || {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdById: actor?.id || null,
      });

      // Log audit
      if (actor) {
        await adminDb.collection("audit_logs").add({
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "user.create",
          module: "users",
          resourceType: "user",
          resourceId: uid,
          resourceName: cleanName,
          details: {
            email: cleanEmail,
            departments,
            status,
            isSuperAdmin,
          },
          timestamp: FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      uid,
      resetLink,
    });
  } catch (error: unknown) {
    console.error("Error creating admin user:", error);
    const message = error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
