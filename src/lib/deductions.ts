export function calculateGeneralExpenses(netRevenue: number): number {
  const deduction = netRevenue * 0.05
  return Math.min(deduction, 2000)
}

