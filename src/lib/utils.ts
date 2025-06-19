import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: 'USD' | 'EUR' = 'USD'
): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US')
}

// Fetches EUR to USD exchange rate for the given date.
// Falls back to 1.1 if the request fails.
export async function getExchangeRate(date: Date = new Date()): Promise<number> {
  const d = date.toISOString().split('T')[0]
  try {
    const res = await fetch(
      `https://api.exchangerate.host/${d}?base=EUR&symbols=USD`
    )
    if (!res.ok) throw new Error('Failed to fetch rate')
    const json = await res.json()
    return json.rates.USD as number
  } catch (e) {
    console.error('Exchange rate fetch failed', e)
    return 1.1
  }
}
