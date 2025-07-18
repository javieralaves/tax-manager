# Audit Report: Spain Self-Employed Tax Manager

## App Architecture & Flow

- **Stack**: Next.js with React for the frontend, Tailwind CSS for styling, Prisma with PostgreSQL for persistence, and Recharts for charts.
- **Core Components**
  - `InvoiceForm` allows creating invoices via a POST request to `/api/invoices`.
  - `InvoiceList` displays stored invoices and allows deletion or marking as paid.
  - `Dashboard` aggregates invoice data to show totals, charts, and tax estimates.
- **Data Flow**
  1. User submits invoice data through `InvoiceForm` which calls the `/api/invoices` endpoint.
  2. The API persists the invoice with exchange rate information (USD/EUR) and status.
  3. `Dashboard` and `InvoiceList` fetch invoices from the API and render statistics or lists on the client.

## Tax Calculation Logic

- **IRPF Brackets** are hard-coded in `src/lib/tax.ts` for the 2024 rules:
  ```ts
  export const IRPF_BRACKETS = [
    { limit: 12450, rate: 0.19 },
    { limit: 20200, rate: 0.24 },
    { limit: 35200, rate: 0.30 },
    { limit: 60000, rate: 0.37 },
    { limit: 300000, rate: 0.45 },
    { limit: Infinity, rate: 0.47 },
  ] as const
  ```
- `calculateIrpf()` iterates over these brackets to compute total tax, while `calculateIrpfBreakdown()` returns per-bracket details.
- The `Dashboard` component totals income for the year, applies `calculateIrpf` on EUR amounts, and converts to USD when needed. It also computes quarterly advances as `income * 0.2` and provides a year‑end balance after deducting advances.

## Data Sources & Dependencies

- **Exchange Rates**: Fetched from `https://api.exchangerate.host`. The helper `getExchangeRate()` falls back to `1.1` if the request fails.
- **Libraries**: Next.js, Prisma, React, date-fns, Recharts, and several Radix UI components. Tax rules are static and not automatically updated.

## User Interface & Feedback

- `InvoiceForm` captures client details, dates, amount, currency, and status, then posts JSON to the server.
- `InvoiceList` displays tables with amounts, statuses, and actions for each invoice.
- `Dashboard` includes:
  - Summary cards for income, estimated IRPF, effective rate, and net income.
  - A bar chart of monthly income vs. estimated IRPF.
  - Quarterly summary table with 20% advance calculations.
  - Year‑end bracket breakdown showing taxable amounts per bracket and final balance after advances.
- Users can switch display currency between USD and EUR.

## Edge Cases & Error Handling

- API validates presence of required invoice fields and returns `400` for missing values. Exchange rate retrieval is retried with a default value on failure.
- GET `/api/invoices` backfills missing currency fields for older invoices by fetching historical exchange rates.
- Other complex scenarios (multiple activity types, VAT, or social security contributions) are not yet modeled. There is minimal handling for incorrect data types or late payments.

## Compliance & Transparency

- The IRPF calculation aligns with 2024 brackets but assumes a flat 20% quarterly advance and does not cover VAT (Modelo 303) or social security contributions.
- Tax assumptions and data sources (e.g., exchange rate provider) are implicit in code, not prominently displayed in the UI.
- No explicit audit trail or logs are surfaced to the user, though Prisma/Next.js can provide database-level tracking.

Overall, the application offers basic income tracking and IRPF estimation with clear visual feedback. For full compliance, future work should incorporate VAT filing, social security calculations, and clearer disclosure of underlying assumptions and data sources.
