export type Invoice = {
  id: string
  clientName: string
  clientEmail: string | null
  issueDate: string
  dueDate: string
  currency: 'USD' | 'EUR'
  amountUSD: string
  amountEUR: string
  exchangeRate: number
  taxRate: number
  status: string
}
