import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

/**
 * Normalize a Firebase service-account private key from .env / Vercel / JSON paste.
 * Common failure modes: escaped \n, wrapping quotes, trailing JSON `",`.
 */
export function normalizePrivateKey(raw: string): string {
  let key = raw.trim();

  // Trailing comma from pasting a JSON property line
  if (key.endsWith(",")) {
    key = key.slice(0, -1).trim();
  }

  const peelQuotes = (value: string) => {
    let next = value;
    while (
      (next.startsWith('"') && next.endsWith('"')) ||
      (next.startsWith("'") && next.endsWith("'"))
    ) {
      next = next.slice(1, -1).trim();
    }
    return next;
  };

  key = peelQuotes(key);
  key = key
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\"/g, '"')
    .replace(/\r\n/g, "\n")
    .trim();
  key = peelQuotes(key);

  // Prefer the PEM block if we can find it — ignores leading/trailing junk
  const pem = key.match(
    /-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/
  );
  if (pem) {
    return `${pem[0].trim()}\n`;
  }

  return key;
}

function normalizeClientEmail(raw: string): string {
  let email = raw.trim().replace(/\r/g, "");
  if (email.endsWith(",")) email = email.slice(0, -1).trim();
  while (
    (email.startsWith('"') && email.endsWith('"')) ||
    (email.startsWith("'") && email.endsWith("'"))
  ) {
    email = email.slice(1, -1).trim();
  }
  // Unclosed quote in .env can swallow the next variable into this value
  const newline = email.search(/[\r\n]/);
  if (newline !== -1) {
    email = email.slice(0, newline).trim();
  }
  if (email.startsWith('"') || email.startsWith("'")) {
    email = email.slice(1).trim();
  }
  if (email.endsWith('"') || email.endsWith("'")) {
    email = email.slice(0, -1).trim();
  }
  return email;
}

function getAdminCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^["']|["']$/g, "");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    ? normalizeClientEmail(process.env.FIREBASE_CLIENT_EMAIL)
    : undefined;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey ? normalizePrivateKey(rawKey) : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  if (!clientEmail.endsWith(".gserviceaccount.com") || clientEmail.includes("BEGIN")) {
    throw new Error(
      'FIREBASE_CLIENT_EMAIL is malformed. Use only the service account email (close the quote on its own line), e.g. FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"'
    );
  }

  if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("\n")) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY is malformed. Paste the private_key value only (no JSON quotes/comma), e.g. "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"'
    );
  }

  return { projectId, clientEmail, privateKey };
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;

  const credentials = getAdminCredentials();
  if (!credentials) return null;

  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert(credentials),
      projectId: credentials.projectId,
    });
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
  return adminDb;
}
