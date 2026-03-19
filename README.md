This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Demo / Setup notes (quick):

- Run the development server:

```bash
npm run dev
```

- App demo walkthrough:
	1. Open Home (dashboard) to view resources and quick actions.
 2. Go to Defend: select a building, take the upgrade challenge, or instant finish upgrades with Quiz Tokens.
 3. Take Quiz: earn Quiz Tokens (reward +10 for correct, -2 for incorrect).
 4. Run Audit from Defend to get study recommendations.
 5. Go Attack: pick an AI base, answer attack questions to damage targets, earn crypto rewards.
 6. Review Home and Study to reinforce learning and check progression.

Notes:
- Firebase is optional for persistence; the app uses local in-memory + localStorage fallback for demo mode. To enable Firestore, set `NEXT_PUBLIC_FIREBASE_CONFIG` to a JSON string in your environment.

