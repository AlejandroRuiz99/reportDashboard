'use client'

interface PredictionData {
  predictedRevenue: number
  predictedSales: number
  confidence: 'high' | 'medium' | 'low'
  trend: 'up' | 'down' | 'stable'
  growthRate: number
}

interface PredictionCardProps {
  prediction: PredictionData
  currentMonth: string
}

export default function PredictionCard({ prediction, currentMonth }: PredictionCardProps) {
  const confidenceColors = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-red-100 text-red-800 border-red-300',
  }

  const confidenceLabels = {
    high: 'Alta Confianza',
    medium: 'Confianza Media',
    low: 'Baja Confianza',
  }

  const trendIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️',
  }

  const trendLabels = {
    up: 'Tendencia Alcista',
    down: 'Tendencia Bajista',
    stable: 'Tendencia Estable',
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-lg p-8 border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-indigo-900 flex items-center">
          <span className="text-3xl mr-3">🔮</span>
          Predicción {currentMonth}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${confidenceColors[prediction.confidence]}`}>
          {confidenceLabels[prediction.confidence]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Revenue Predicho */}
        <div className="bg-white/60 backdrop-blur rounded-lg p-5 border border-indigo-200">
          <p className="text-sm text-indigo-700 font-medium mb-2">Revenue Estimado</p>
          <p className="text-4xl font-bold text-indigo-900">
            €{prediction.predictedRevenue.toFixed(2)}
          </p>
          <p className={`text-sm font-medium mt-2 flex items-center ${prediction.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {prediction.growthRate > 0 ? '↑' : '↓'} {Math.abs(prediction.growthRate).toFixed(1)}% vs promedio
          </p>
        </div>

        {/* Consultas Predichas */}
        <div className="bg-white/60 backdrop-blur rounded-lg p-5 border border-indigo-200">
          <p className="text-sm text-indigo-700 font-medium mb-2">Consultas Estimadas</p>
          <p className="text-4xl font-bold text-indigo-900">
            {Math.round(prediction.predictedSales)}
          </p>
          <p className="text-sm text-indigo-600 mt-2">
            Promedio: €{(prediction.predictedRevenue / prediction.predictedSales).toFixed(2)} / consulta
          </p>
        </div>
      </div>

      {/* Indicadores de Tendencia */}
      <div className="bg-white/60 backdrop-blur rounded-lg p-5 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{trendIcons[prediction.trend]}</span>
            <div>
              <p className="text-sm font-bold text-indigo-900">{trendLabels[prediction.trend]}</p>
              <p className="text-xs text-indigo-600">Basado en últimos 6 meses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-indigo-900/10 rounded-lg p-4">
        <p className="text-xs text-indigo-800">
          ℹ️ <strong>Nota:</strong> Esta predicción se basa en el análisis de tendencias históricas y puede variar según factores externos. 
          {prediction.confidence === 'low' && ' Datos históricos insuficientes para alta precisión.'}
        </p>
      </div>
    </div>
  )
}
