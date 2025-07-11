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

### Database setup

Prisma is used for database access. Copy `.env.example` to `.env` and adjust the
`DATABASE_URL` for your PostgreSQL instance. Then run:

```bash
npx prisma migrate dev --name init
```

### Building for production

Before deploying, generate the Prisma client and build the app:

```bash
npm run build
```

The `build` script runs `prisma generate` automatically so the latest client is included in your production bundle.

## Social Security calculations

This project now includes a helper to estimate Social Security (Seguridad Social) contributions for Spanish autónomos. The logic lives in `src/lib/socialSecurity.ts` and is used in the dashboard to show the current monthly quota, annual total and how far you are from the next band.

## General expense deduction

Official general expenses are now calculated with `src/lib/deductions.ts`. The deduction is 5% of net revenues capped at €2,000 per year. Taxable income is computed as:

```
net revenue → - general expenses → - Social Security → taxable income
```

Both IRPF and Social Security calculations rely on this pipeline.

### IRPF split into state and regional portions

IRPF is calculated using separate national and regional brackets. Madrid's 2024/2025 regional rates are built in by default:

| Bracket up to (€) | State Rate | Madrid Rate |
| ---------------- | ---------- | ----------- |
| 12,450           | 19%        | 8.5%        |
| 17,707           | 24%        | 9.5%        |
| 33,407           | 30%        | 12%         |
| 53,407           | 37%        | 18.5%       |
| 240,000          | 45%        | 21.5%       |
| ∞                | 47%        | 23.5%       |

The dashboard now shows state IRPF, Madrid regional IRPF and the combined total.

## Tax summary and take-home visualization

The dashboard also displays your total annual and monthly tax burden (IRPF + Social Security), effective tax rate and take-home income. A donut chart illustrates how income splits between taxes and what you keep. Calculations live in `src/lib/taxSummary.ts`.

## Modelo 130 quarterly filings

Quarterly income is now grouped to estimate IRPF advances (20% of net income after deductions). Logic lives in `src/lib/modelo130.ts` and the dashboard lists each quarter's expected payment.

## Dashboard layout

The dashboard is organized into three zones that progressively reveal information:

1. **This Quarter — Action Required** (`QuarterSummary`)
   - Shows quarterly income, deduction, Social Security, IRPF advance and net take‑home.
2. **Yearly Summary — Reference Only** (`YearlyOverview`)
   - Displays totals for income, taxable income, IRPF (state/Madrid/total), Social Security, effective rate and take‑home.
3. **Advanced Insights** (`AdvancedInsights`)
   - Accordion panels for quarterly filings, year-end brackets and charts/visuals.

The first zone stays visible so you immediately know what you owe. Other data is still available but separated for clarity.

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
