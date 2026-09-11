# SpendWise

**Track • Plan • Save • Grow** — a mobile-first personal expense tracker built with React, TypeScript, Tailwind CSS, and Recharts. All data is stored locally on-device via `localStorage`, so it works fully offline with no backend or account required.

## What's included

- **Home** — greeting, this month's total with % change vs last month, quick actions, spending-by-category, recent transactions
- **Add / Edit Expense** — amount, category, date, payment method, optional note, validation, delete
- **Analytics** — month selector, total spend, donut chart + weekly bar chart, Money Score, Smart Insights
- **Budget** — overall + per-category budgets, progress bars, 80% warning / 100% over-budget alerts
- **Profile** — avatar, Go Pro card, My Wallet, Transaction History, Recurring Expenses, Export Data, Settings (incl. Clear All Data), Logout
- **Pro upgrade screen** — ₹99/mo, ₹499/yr, ₹999 lifetime, free-vs-pro comparison, clearly marked **payment placeholder** (no real payment provider is wired up — see `src/screens/ProUpgrade.tsx`)
- **PWA support** — installable on Android as a home-screen app via `vite-plugin-pwa`
- **"Load Demo Data"** — generates two months of realistic sample transactions so every screen has something to show immediately

## Project structure

```
src/
  components/     shared UI: BottomNav, TransactionItem, ProgressBar, ConfirmDialog, Toast, OverlayScreen, Logo
  context/        AppContext.tsx — all state + localStorage persistence + CRUD actions
  screens/        one file per screen
  types/          shared TypeScript types (Expense, Category, PaymentMethod, Budget, Profile)
  utils/          storage.ts, format.ts (₹ + dates), analytics.ts (totals/insights/money score), demoData.ts, categoryStyle.ts
public/icons/     generated app icons (192/512/maskable) used for the PWA manifest & Android home-screen icon
```

## Run it locally (any computer with Node.js 18+)

```bash
cd spendwise
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

> ⚠️ This project was written and organized in a sandboxed environment without internet access, so `npm install` / the dev server could not be run or tested here. Please run the two commands above and let me know if you hit any dependency or type errors — I can fix them immediately from the error output.

## Run it on your Android phone (dev mode, over Wi-Fi)

1. Make sure your computer and Android phone are on the **same Wi-Fi network**.
2. Start the dev server so it's reachable on your LAN:
   ```bash
   npm run dev -- --host
   ```
3. Vite will print a "Network" URL like `http://192.168.1.23:5173`.
4. On your Android phone, open Chrome and go to that URL.
5. The app will load full-screen and mobile-optimized — try adding an expense, checking Analytics, and setting a budget.

## Install it as a real app (PWA) on Android

1. Build the production bundle (needs internet once, to install dependencies):
   ```bash
   npm run build
   npm run preview -- --host
   ```
2. On your Android phone's Chrome, open the "Network" URL `npm run preview` prints.
3. Tap the **⋮ menu → "Add to Home screen"** (or Chrome may show an "Install app" banner automatically).
4. Confirm — SpendWise now appears on your home screen with its own icon and opens full-screen, like a native app.

For a permanent install (not just on your local network), deploy the `dist/` folder from `npm run build` to any static host (Vercel, Netlify, GitHub Pages, Firebase Hosting) — PWA install works the same way once it's on a public HTTPS URL.

## Suggested test flow

1. Profile tab → **Load Demo Data** (or do this from the Home empty state) to populate two months of transactions.
2. Home: confirm the monthly total, % change, and category breakdown look right.
3. Tap **+** → add a new expense → confirm the success toast, and that Home/Analytics/Budget all reflect it immediately.
4. Tap a transaction → edit the amount → confirm it updates everywhere.
5. Delete a transaction → confirm it disappears everywhere.
6. Refresh the browser tab → confirm all data is still there (this is the `localStorage` persistence check).
7. Budget tab → Edit → set a monthly + category budget → spend past 80% and then past 100% of a category to see the warning/alert banners.
8. Profile → Settings → **Clear All Data** → confirm the confirmation dialog, then that everything resets to empty states.

## Notes on the Pro tier

Recurring Expenses and Export Data are gated behind `profile.isPro`. The "Go Pro" screen sets `isPro: true` locally when you tap a plan — **no real payment is charged**. Before shipping, replace the placeholder in `src/screens/ProUpgrade.tsx` (`handleUpgrade`) with real Razorpay / Stripe / Google Play Billing checkout, and only call `setPro()` after a verified successful payment.
