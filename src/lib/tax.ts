/** Calculates Spanish IRPF tax for a given income using 2024 brackets. */
export function calculateIrpf(income: number): number {
  const brackets = [
    { limit: 12450, rate: 0.19 },
    { limit: 20200, rate: 0.24 },
    { limit: 35200, rate: 0.30 },
    { limit: 60000, rate: 0.37 },
    { limit: 300000, rate: 0.45 },
    { limit: Infinity, rate: 0.47 },
  ]

  let tax = 0
  let previous = 0

  for (const { limit, rate } of brackets) {
    if (income <= previous) break
    const taxable = Math.min(income, limit) - previous
    tax += taxable * rate
    previous = limit
  }
  return tax
}
