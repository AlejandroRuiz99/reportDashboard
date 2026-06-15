interface MetricCardProps {
  title: string
  value: string
  trend?: number
  icon?: string
}

export default function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-brand-muted'
    return trend > 0 ? 'text-success' : 'text-error'
  }

  const getTrendIcon = () => {
    if (!trend || trend === 0) return '—'
    return trend > 0 ? '▲' : '▼'
  }

  return (
    <div className="bg-white rounded-xl shadow-brand p-4 sm:p-6 border border-gray-100 hover:shadow-brand-lg hover:border-brand-gold/40 transition">
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="text-xs sm:text-sm font-medium text-brand-muted uppercase tracking-wider truncate">{title}</p>
        {icon && <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>}
      </div>

      <p className="font-serif text-2xl sm:text-3xl font-bold text-brand-black mb-2 break-words">{value}</p>

      {trend !== undefined && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`text-xs sm:text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs sm:text-sm text-brand-muted">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
