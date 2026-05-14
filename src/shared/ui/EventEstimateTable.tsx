import type { EstimateRow } from '../lib/estimate'
import { formatRub } from '../lib/estimate'

interface EventEstimateTableProps {
  rows: EstimateRow[]
  compact?: boolean
}

export function EventEstimateTable({ rows, compact }: EventEstimateTableProps) {
  const totals = rows.reduce(
    (acc, r) => ({
      netto: acc.netto + r.netto,
      vat: acc.vat + r.vat,
      withVat: acc.withVat + r.withVat,
    }),
    { netto: 0, vat: 0, withVat: 0 },
  )

  const th = compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
  const td = compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left">
        <thead className="bg-slate-100 text-slate-800">
          <tr>
            <th className={th}>Статья</th>
            <th className={`${th} text-right`}>Нетто</th>
            <th className={`${th} text-right`}>НДС</th>
            <th className={`${th} text-right`}>Сумма с НДС</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className={`${td} text-slate-800`}>{row.name}</td>
              <td className={`${td} text-right tabular-nums`}>{formatRub(row.netto)} ₽</td>
              <td className={`${td} text-right tabular-nums`}>{formatRub(row.vat)} ₽</td>
              <td className={`${td} text-right font-medium tabular-nums text-slate-900`}>
                {formatRub(row.withVat)} ₽
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
          <tr>
            <td className={td}>Итого</td>
            <td className={`${td} text-right tabular-nums`}>{formatRub(totals.netto)} ₽</td>
            <td className={`${td} text-right tabular-nums`}>{formatRub(totals.vat)} ₽</td>
            <td className={`${td} text-right tabular-nums`}>{formatRub(totals.withVat)} ₽</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
