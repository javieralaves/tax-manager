"use client"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Modelo130Quarter } from '@/lib/modelo130'
import type { IrpfBreakdownEntry } from '@/lib/tax'
import { getTaxBreakdown } from '@/lib/taxSummary'

export default function AdvancedInsights({
  currency,
  filings,
  breakdown,
  data,
  tax,
  ssAnnual,
  advancePaid,
  finalBalance,
  nextBracketMsg,
  ssNextMsg,
  totalIncome,
}: {
  currency: 'USD' | 'EUR'
  filings: Modelo130Quarter[]
  breakdown: IrpfBreakdownEntry[]
  data: { name: string; income: number; tax: number }[]
  tax: number
  ssAnnual: number
  advancePaid: number
  finalBalance: number
  nextBracketMsg: string
  ssNextMsg: string
  totalIncome: number
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Advanced Insights</h2>
      <Accordion type="multiple" className="w-full space-y-2">
        <AccordionItem value="filings">
          <AccordionTrigger className="text-lg">Quarterly Filings</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Modelo 130</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Estimated IRPF</TableHead>
                      <TableHead>Amount Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filings.map((q) => (
                      <TableRow key={q.quarter}>
                        <TableCell>{`Q${q.quarter}`}</TableCell>
                        <TableCell>{formatCurrency(q.income, currency)}</TableCell>
                        <TableCell>{formatCurrency(q.deductions, currency)}</TableCell>
                        <TableCell>{formatCurrency(q.estimatedIrpf, currency)}</TableCell>
                        <TableCell>{formatCurrency(q.amountDue, currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="brackets">
          <AccordionTrigger className="text-lg">Year-End Tax Brackets</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Tax Bracket Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bracket</TableHead>
                      <TableHead>Taxable</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdown.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {`${formatCurrency(b.from, currency)} - ${formatCurrency(b.to, currency)}`}
                        </TableCell>
                        <TableCell>{formatCurrency(b.taxable, currency)}</TableCell>
                        <TableCell>{(b.rate * 100).toFixed(0)}%</TableCell>
                        <TableCell>{formatCurrency(b.tax, currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 space-y-1 text-sm">
                  <p>Final IRPF Liability: {formatCurrency(tax, currency)}</p>
                  <p>Quarterly Advances Paid: {formatCurrency(advancePaid, currency)}</p>
                  <p className="font-semibold">
                    {finalBalance >= 0
                      ? `Balance Due: ${formatCurrency(finalBalance, currency)}`
                      : `Refund: ${formatCurrency(Math.abs(finalBalance), currency)}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="charts">
          <AccordionTrigger className="text-lg">Charts & Visuals</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    <Bar dataKey="income" fill="#8884d8" name="Income" />
                    <Bar dataKey="tax" fill="#82ca9d" name="Tax" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tax vs Take-Home</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    <Pie data={getTaxBreakdown(totalIncome, tax, ssAnnual)} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="sm:col-span-3">
              <CardHeader>
                <CardTitle>Income Until Next Bracket</CardTitle>
              </CardHeader>
              <CardContent>{nextBracketMsg}</CardContent>
            </Card>
            <Card className="sm:col-span-3">
              <CardHeader>
                <CardTitle>SS Band Info</CardTitle>
              </CardHeader>
              <CardContent>{ssNextMsg}</CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
