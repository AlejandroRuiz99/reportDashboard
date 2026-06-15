import type { CollaboratorStats } from '@/types/sales'

interface CollaboratorTableProps {
  collaborators: CollaboratorStats[]
}

export default function CollaboratorTable({ collaborators }: CollaboratorTableProps) {
  if (collaborators.length === 0) {
    return (
      <div className="text-center py-8 text-brand-muted">
        No hay datos de colaboradores con UTM
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-brand-gold/30">
            <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-brand-ink uppercase tracking-wider">
              Colaborador
            </th>
            <th className="text-right py-3 px-2 text-xs sm:text-sm font-semibold text-brand-ink uppercase tracking-wider">
              Ventas
            </th>
            <th className="text-right py-3 px-2 text-xs sm:text-sm font-semibold text-brand-ink uppercase tracking-wider">
              Revenue
            </th>
            <th className="text-right py-3 px-2 text-xs sm:text-sm font-semibold text-brand-ink uppercase tracking-wider">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {collaborators.map((collab, index) => (
            <tr
              key={collab.name}
              className={`border-b border-gray-100 ${
                index === 0 ? 'bg-brand-cream' : ''
              }`}
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {index === 0 && <span className="text-base sm:text-lg">🏆</span>}
                  <span className="font-medium text-brand-ink">
                    {collab.name}
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-2 text-brand-ink">
                {collab.sales}
              </td>
              <td className="text-right py-3 px-2 text-brand-ink font-medium whitespace-nowrap">
                €{collab.revenue.toFixed(2)}
              </td>
              <td className="text-right py-3 px-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-black text-brand-gold">
                  {collab.percentage.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
