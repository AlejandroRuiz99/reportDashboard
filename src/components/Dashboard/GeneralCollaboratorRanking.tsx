'use client'

interface CollaboratorStats {
  name: string
  sales: number
  revenue: number
  percentage: number
}

interface GeneralCollaboratorRankingProps {
  collaborators: CollaboratorStats[]
  totalSales: number
  totalRevenue: number
}

export default function GeneralCollaboratorRanking({ collaborators, totalSales, totalRevenue }: GeneralCollaboratorRankingProps) {
  if (collaborators.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos de colaboradoras en el histórico
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-medium mb-1">Total Histórico</p>
          <p className="text-2xl font-bold text-blue-900">{totalSales} ventas</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-700 font-medium mb-1">Revenue Total</p>
          <p className="text-2xl font-bold text-green-900">€{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-medium mb-1">Colaboradoras Activas</p>
          <p className="text-2xl font-bold text-purple-900">{collaborators.length}</p>
        </div>
      </div>

      {/* Ranking */}
      <div className="space-y-3">
        {collaborators.map((collab, index) => {
          const isTop = index === 0
          const medalColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-300'
          
          return (
            <div 
              key={collab.name} 
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                isTop 
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Posición con medalla */}
                <div className="flex flex-col items-center">
                  <span className={`text-3xl ${medalColor}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                  </span>
                  <span className={`text-sm font-bold ${isTop ? 'text-yellow-700' : 'text-gray-600'}`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Info de la colaboradora */}
                <div className="flex-1">
                  <p className={`font-bold ${isTop ? 'text-lg text-gray-900' : 'text-gray-800'}`}>
                    {collab.name}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      <strong>{collab.sales}</strong> ventas
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-green-700 font-medium">
                      €{collab.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Porcentaje */}
              <div className="flex flex-col items-end ml-4">
                <span className={`text-2xl font-bold ${isTop ? 'text-yellow-700' : 'text-blue-600'}`}>
                  {collab.percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">del total</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Promedio por Venta */}
      <div className="mt-6 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
        <h4 className="text-sm font-semibold text-indigo-900 mb-3">💰 Promedio por Venta</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {collaborators.map((collab) => (
            <div key={`avg-${collab.name}`} className="flex items-center justify-between">
              <span className="text-xs text-indigo-700">{collab.name}:</span>
              <span className="text-sm font-bold text-indigo-900">
                €{(collab.revenue / collab.sales).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
