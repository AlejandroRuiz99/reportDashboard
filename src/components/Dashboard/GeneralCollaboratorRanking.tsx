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
      <div className="text-center py-8 text-brand-muted">
        No hay datos de colaboradoras en el histórico
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-brand-black text-white rounded-lg p-4 border border-brand-gold/30">
          <p className="text-xs text-brand-gold-light font-medium mb-1 uppercase tracking-wider">Total Histórico</p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-brand-gold">{totalSales} ventas</p>
        </div>
        <div className="bg-brand-cream rounded-lg p-4 border border-brand-gold/30">
          <p className="text-xs text-brand-ink font-medium mb-1 uppercase tracking-wider">Revenue Total</p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-brand-black break-words">€{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-brand-cream rounded-lg p-4 border border-brand-gold/30">
          <p className="text-xs text-brand-ink font-medium mb-1 uppercase tracking-wider">Colaboradoras Activas</p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-brand-black">{collaborators.length}</p>
        </div>
      </div>

      {/* Ranking */}
      <div className="space-y-2 sm:space-y-3">
        {collaborators.map((collab, index) => {
          const isTop = index === 0

          return (
            <div
              key={collab.name}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all gap-3 ${
                isTop
                  ? 'bg-brand-black text-white border border-brand-gold/40 shadow-brand-lg'
                  : 'bg-brand-cream hover:bg-white border border-brand-gold/15'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Posición con medalla */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-2xl sm:text-3xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                  </span>
                  <span className={`text-xs sm:text-sm font-bold ${isTop ? 'text-brand-gold' : 'text-brand-muted'}`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${isTop ? 'text-base sm:text-lg text-brand-gold' : 'text-brand-ink'}`}>
                    {collab.name}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                    <span className={`text-xs sm:text-sm ${isTop ? 'text-gray-300' : 'text-brand-muted'}`}>
                      <strong>{collab.sales}</strong> ventas
                    </span>
                    <span className={`text-xs ${isTop ? 'text-gray-500' : 'text-brand-muted'} hidden sm:inline`}>•</span>
                    <span className={`text-xs sm:text-sm font-medium ${isTop ? 'text-brand-gold-light' : 'text-success'}`}>
                      €{collab.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Porcentaje */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className={`font-serif text-xl sm:text-2xl font-bold ${isTop ? 'text-brand-gold' : 'text-brand-black'}`}>
                  {collab.percentage.toFixed(1)}%
                </span>
                <span className={`text-[10px] sm:text-xs ${isTop ? 'text-gray-400' : 'text-brand-muted'}`}>del total</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Promedio por Venta */}
      <div className="mt-5 sm:mt-6 bg-brand-cream rounded-lg p-4 border border-brand-gold/20">
        <h4 className="text-sm font-semibold text-brand-black mb-3">💰 Promedio por Venta</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {collaborators.map((collab) => (
            <div key={`avg-${collab.name}`} className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-xs text-brand-muted truncate">{collab.name}:</span>
              <span className="text-sm font-bold text-brand-black whitespace-nowrap">
                €{(collab.revenue / collab.sales).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
