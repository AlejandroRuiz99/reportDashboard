interface MetricCardProps {
  title: string
  value: string
  trend?: number
  icon?: string
}

export default function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-500'
    return trend > 0 ? 'text-success' : 'text-error'
  }

  const getTrendIcon = () => {
    if (!trend || trend === 0) return '—'
    return trend > 0 ? '▲' : '▼'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      
      {trend !== undefined && (
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
