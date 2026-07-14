import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { PublicEmployee } from "@/types/employee";

export const runtime = "nodejs";

type Params = { params: Promise<{ employeeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { employeeId } = await params;
  const normalized = employeeId.trim();

  if (!normalized) {
    return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
  }

  try {
    const db = getAdminDb();

    if (db) {
      const snapshot = await db.collection("employees").doc(normalized).get();
      if (!snapshot.exists) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      const data = snapshot.data()!;
      const publicEmployee: PublicEmployee = {
        employeeId: String(data.employeeId ?? normalized),
        name: String(data.name ?? ""),
        designation: String(data.designation ?? ""),
        employeeType: data.employeeType === "Intern" ? "Intern" : "Employee",
        profilePhoto: String(data.profilePhoto ?? ""),
        joinedDate:
          typeof data.joinedDate === "string"
            ? data.joinedDate
            : data.joinedDate?.toDate?.()?.toISOString?.() ?? "",
        status: data.status === "Inactive" ? "Inactive" : "Active",
      };

      return NextResponse.json(publicEmployee);
    }

    // Fallback: client-readable Firestore via REST is not used here.
    // Without Admin credentials, instruct to configure env.
    return NextResponse.json(
      {
        error: "admin_not_configured",
        message:
          "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY for public verification.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Verify API error:", error);
    return NextResponse.json(
      { error: "verification_failed" },
      { status: 500 }
    );
  }
}
