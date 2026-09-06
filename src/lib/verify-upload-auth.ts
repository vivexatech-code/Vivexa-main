export async function verifyUploadToken(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return false;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      },
    );
    if (!response.ok) return false;
    const payload = (await response.json()) as { users?: unknown[] };
    return Array.isArray(payload.users) && payload.users.length > 0;
  } catch {
    return false;
  }
}
