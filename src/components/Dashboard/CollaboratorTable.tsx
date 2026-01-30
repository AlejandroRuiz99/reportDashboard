import type { CollaboratorStats } from '@/types/sales'

interface CollaboratorTableProps {
  collaborators: CollaboratorStats[]
}

export default function CollaboratorTable({ collaborators }: CollaboratorTableProps) {
  if (collaborators.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos de colaboradores con UTM
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
              Colaborador
            </th>
            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
              Ventas
            </th>
            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
              Revenue
            </th>
            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {collaborators.map((collab, index) => (
            <tr
              key={collab.name}
              className={`border-b border-gray-100 ${
                index === 0 ? 'bg-blue-50' : ''
              }`}
            >
              <td className="py-3 px-2">
                <div className="flex items-center space-x-2">
                  {index === 0 && <span className="text-lg">🏆</span>}
                  <span className="font-medium text-gray-900">
                    {collab.name}
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-2 text-gray-900">
                {collab.sales}
              </td>
              <td className="text-right py-3 px-2 text-gray-900 font-medium">
                €{collab.revenue.toFixed(2)}
              </td>
              <td className="text-right py-3 px-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
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
