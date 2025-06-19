export type Invoice = {
  id: string
  clientName: string
  clientEmail: string | null
  issueDate: string
  dueDate: string
  amount: string
  taxRate: number
  status: string
}
