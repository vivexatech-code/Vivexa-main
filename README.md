# Vivexa Employee Management System

Production-ready admin panel for managing Vivexa employees and interns, generating print-ready ID cards, and public QR verification.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Firebase Authentication + Firestore
- Cloudinary (profile photos)
- Framer Motion, Lucide, Sonner

## Setup

1. **Install**

```bash
npm install
```

2. **Environment**

Copy `.env.example` to `.env.local` and fill in values.

3. **Firebase**

- Create a Firebase project
- Enable **Email/Password** authentication
- Create the first admin from the login page (**No admin user yet? Create one**), or add a user under Authentication → Users in the Firebase console
- Turn off `NEXT_PUBLIC_ALLOW_ADMIN_SIGNUP` after the first admin exists (leave it off in production)
- Create a Firestore database
- Deploy `firestore.rules` (or paste into Firestore → Rules)
- Optional but recommended: create a service account and add `FIREBASE_*` admin env vars for the secure `/api/verify` endpoint

4. **Cloudinary**

- Create a Cloudinary account
- Add cloud name, API key, and API secret

5. **ID Card SVGs**

Drop your Figma exports here (do **not** edit the SVG contents):

- `public/id-card/front.svg`
- `public/id-card/back.svg`

Dynamic overlays (photo, name, designation, ID, QR) are positioned in:

- `src/components/id-card/id-card.module.css`

Adjust percentages there to match your design.

6. **Run**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to login.

## Features

- Admin login (Firebase Auth) with protected dashboard
- Dashboard stats + recent employees + quick actions
- Add / edit / delete / search / filter employees
- Project management (published to the public website)
- Service management (published to the public website)
- Auto employee IDs: `12701`, `12702`, `12703`, …
- Profile photo upload to Cloudinary
- ID card preview + print-ready PDF (front + back)
- Public verification: `/verify/12701` with QR on card back

## Deploy (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add the same env vars
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy

## Security notes

- Firestore writes require authentication
- Public verification prefers `/api/verify/[employeeId]` (Admin SDK) so phone numbers are never returned
- Without Admin credentials, the verify page falls back to a public Firestore `get` (configure rules carefully)
