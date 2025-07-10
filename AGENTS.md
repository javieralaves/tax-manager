# OVERVIEW: Autonomo Accounting Web App

## Purpose

This web app is designed for myself, a self-employed professional (autonomo) in Spain to manage my finances and tax declarations.
Planned scope is to include tools for invoice creation, income and expense tracking, tax calculations, deadline reminders, and PDF export.
The goal is to provide full autonomy and transparency without relying on external software or managers.

## Tech Stack

- **Framework**: Next.js (with React)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: NextAuth
- **PDF Export**: react-pdf (or similar)
- **Data Visualization**: Recharts
- **Components**: shadcn/ui
- **Deployment**: Vercel

Not all dependencies might be installed right away. Tech stack is gradually implemented as features are developed.

## Guidelines

When writing code, please follow these principles:

- Use modular and reusable components.
- Favor TypeScript and typed API responses.
- Keep code clean, readable, and commented.
- Follow Next.js file structure conventions.
- Optimize for performance and accessibility.
- Utilize shadcn/ui components as much as possible (src/components/ui).
- Make any necessary adjustments to this AGENTS.md as we make progress.

## Feature Prioritization

- Ensure financial accuracy in all calculations (especially taxes).
- Build with expandability in mind (multi-user, SaaS in the future).
- Support invoices in multiple currencies (USD and EUR).

## AI-Driven Requests

- Be precise and concise in code suggestions.
- When commenting, explain concisely **why** something is done (especially for calculations).
- If unsure about legal rules, mention it clearly in the PR for me to review in a follow up update.
- Prefer open-source or minimal-dependency solutions.
- If you run into network issues because we're operating from the browser, don't worry too much. Get as far as you can, and mention it in the PR.

## Phases

Phase 1: Invoice management
Phase 2: Invoice/expense logging
Phase 3: Tax modules (Modelo 130 & 303)
Phase 4: Notifications and deadlines
Phase 5: Annual summaries (Modelo 100 & 390)

## Folder Structure

Next.js App Router setup for pages and styling implementation

/components for reusable UI components (pre-installed on src/components/ui)
/api for backend API endpoints
/lib for utilities, helpers, etc.
/prisma for DB schema and seed files
/public for static assets

## Author Notes

- Built by and for a Spanish autonomo
- AI assistant (you) is being used continuosuly for development, testing, and refactoring

## Quick Start for Codex

- **Data flow**: invoices are submitted via `/api/invoices` routes and stored with Prisma. The dashboard fetches them and runs the calculations found in `src/lib/tax.ts` and `src/lib/socialSecurity.ts`.
- The general expense helper lives in `src/lib/deductions.ts` and is applied before Social Security and IRPF are calculated.
- Taxable income = net revenue - general expenses - Social Security.
- **External APIs**: currency rates are fetched from `https://api.exchangerate.host`.
- **Naming conventions**: React components in `PascalCase`, utility functions in `camelCase`.
- **Checks**: run `npm run lint` before committing if files change.
