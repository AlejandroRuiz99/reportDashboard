'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import type { TikTokInsights } from '@/types/tiktok'

interface TikTokCorrelationAnalysisProps {
  insights: TikTokInsights
}

export default function TikTokCorrelationAnalysis({ insights }: TikTokCorrelationAnalysisProps) {
  return (
    <div className="space-y-8">
      {/* Recomendaciones */}
      {insights.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <span className="text-2xl">💡</span>
            <span>Recomendaciones Basadas en Datos</span>
          </h3>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPIs de Conversión */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <p className="text-sm text-blue-700 font-medium mb-2">Videos Analizados</p>
          <p className="text-4xl font-bold text-blue-900">{insights.topConvertingVideos.length}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-200">
          <p className="text-sm text-green-700 font-medium mb-2">Ventana de Conversión</p>
          <p className="text-4xl font-bold text-green-900">
            {insights.averageConversionWindow.toFixed(1)} días
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-200">
          <p className="text-sm text-purple-700 font-medium mb-2">Ventas Totales</p>
          <p className="text-4xl font-bold text-purple-900">
            {insights.topConvertingVideos.reduce((sum, v) => sum + v.salesInWindow, 0)}
          </p>
        </div>
      </div>

      {/* Top Videos que Generaron Ventas */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🎥</span>
          Top 10 Videos por Impacto en Ventas
        </h3>
        <div className="space-y-4">
          {insights.topConvertingVideos.map((correlation, index) => (
            <div 
              key={correlation.video.url}
              className={`flex items-start space-x-4 p-4 rounded-xl border-2 transition-all ${
                index < 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex flex-col items-center min-w-[80px]">
                <span className={`text-3xl ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📹'}`}>
                  {index < 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : ''}
                </span>
                <span className="text-sm font-bold text-gray-600">#{correlation.video.ranking}</span>
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {correlation.video.title.split('\n')[0]}
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    👁️ {correlation.video.views.toLocaleString()} vistas
                  </span>
                  <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">
                    ❤️ {correlation.video.likes.toLocaleString()} likes
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    🛒 {correlation.salesInWindow} ventas
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    💰 €{correlation.revenueInWindow.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                  <span>📅 {new Date(correlation.video.date).toLocaleDateString('es-ES')}</span>
                  <span>•</span>
                  <span>📊 Conversión: {correlation.conversionRate.toFixed(2)}‱</span>
                  {correlation.daysToConvert.length > 0 && (
                    <>
                      <span>•</span>
                      <span>⏱️ Avg: {(correlation.daysToConvert.reduce((a, b) => a + b, 0) / correlation.daysToConvert.length).toFixed(1)} días</span>
                    </>
                  )}
                </div>
              </div>

              <a 
                href={correlation.video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-900 transition"
              >
                Ver Video
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Mejores Días para Publicar */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">📅</span>
          Mejores Días para Publicar
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={insights.bestPublishingDays}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip 
              formatter={(value: number) => [value.toFixed(1), 'Ventas promedio']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="avgSales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement vs Conversión */}
      {(insights.engagementVsConversion.highEngagementLowSales.length > 0 || 
        insights.engagementVsConversion.highSalesLowEngagement.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alto engagement, bajas ventas */}
          {insights.engagementVsConversion.highEngagementLowSales.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                Alto Engagement, Pocas Ventas
              </h4>
              <p className="text-xs text-gray-600 mb-4">
                Videos virales que no convirtieron - considera añadir call-to-action más claro
              </p>
              <div className="space-y-3">
                {insights.engagementVsConversion.highEngagementLowSales.slice(0, 3).map(video => (
                  <div key={video.url} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{video.title.split('\n')[0]}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">
                        👁️ {video.views.toLocaleString()} | ❤️ {video.likes.toLocaleString()}
                      </p>
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition flex items-center space-x-1"
                      >
                        <span>Ver Video</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bajas views, buenas ventas */}
          {insights.engagementVsConversion.highSalesLowEngagement.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-green-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">✅</span>
                Alto ROI, Poco Engagement
              </h4>
              <p className="text-xs text-gray-600 mb-4">
                Videos que convierten muy bien - replica este contenido
              </p>
              <div className="space-y-3">
                {insights.engagementVsConversion.highSalesLowEngagement.slice(0, 3).map(video => (
                  <div key={video.url} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{video.title.split('\n')[0]}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">
                        👁️ {video.views.toLocaleString()} | ❤️ {video.likes.toLocaleString()}
                      </p>
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition flex items-center space-x-1"
                      >
                        <span>Ver Video</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
