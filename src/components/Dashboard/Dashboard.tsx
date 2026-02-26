'use client'

import { useMemo, useState } from 'react'
import type { SalesData } from '@/types/sales'
import type { TikTokVideo, TikTokInsights } from '@/types/tiktok'
import type { ComparisonData, TimeSeriesData, PredictionData } from '@/services/supabaseService'
import { AnalyticsService } from '@/services/analyticsService'
import { TikTokCorrelationService } from '@/services/tiktokCorrelationService'
import MetricCard from './MetricCard'
import CollaboratorTable from './CollaboratorTable'
import GeneralCollaboratorRanking from './GeneralCollaboratorRanking'
import SalesChart from '../Charts/SalesChart'
import TrafficSourcesChart from '../Charts/TrafficSourcesChart'
import TimeSeriesChart from '../Charts/TimeSeriesChart'
import TemporalAnalysisChart from '../Charts/TemporalAnalysisChart'
import PredictionCard from '../Charts/PredictionCard'
import TikTokFetchForm from '../TikTok/TikTokFetchForm'
import TikTokCorrelationAnalysis from '../TikTok/TikTokCorrelationAnalysis'

interface DashboardProps {
  data: { current: SalesData[], all: SalesData[] }
  comparison: ComparisonData
  timeSeries: TimeSeriesData[]
  prediction: PredictionData
  selectedYear: number
  selectedMonth: number
}

export default function Dashboard({ data, comparison, timeSeries, prediction, selectedYear, selectedMonth }: DashboardProps) {
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[] | null>(null)
  const [tiktokInsights, setTiktokInsights] = useState<TikTokInsights | null>(null)

  const analytics = useMemo(() => new AnalyticsService(data.current), [data.current])
  const analyticsAll = useMemo(() => new AnalyticsService(data.all), [data.all])

  const collaborators = analytics.getCollaboratorStats()
  const collaboratorsAll = analyticsAll.getCollaboratorStats()
  const dailySales = analytics.getDailySales()
  const trafficSources = analytics.getTrafficSources()
  const dayOfWeekData = analytics.getSalesByDayOfWeek()
  const hourData = analytics.getSalesByHour()

  // Calcular totales históricos
  const totalHistoricalSales = data.all.filter(s => s.sourceType === 'utm' && s.utmSource).length
  const totalHistoricalRevenue = data.all
    .filter(s => s.sourceType === 'utm' && s.utmSource)
    .reduce((sum, s) => sum + s.orderTotal, 0)

  // Calcular nombre del próximo mes para predicción
  const nextMonthDate = new Date(selectedYear, selectedMonth, 1) // selectedMonth ya es 1-indexed
  const nextMonthName = nextMonthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  // Handler para cuando se carga el CSV de TikTok
  const handleTikTokDataLoaded = (videos: TikTokVideo[]) => {
    setTiktokVideos(videos)
    
    // Calcular correlación con TODAS las ventas históricas
    const correlationService = new TikTokCorrelationService(data.all, videos)
    const insights = correlationService.analyze()
    setTiktokInsights(insights)
  }

  // Generar insights con comparativas
  const generateEnhancedInsights = (): string[] => {
    const insights: string[] = []
    
    // Insights vs mes anterior
    if (comparison.growth.salesMoM > 15) {
      insights.push(`🚀 ¡Crecimiento excepcional! ${comparison.growth.salesMoM.toFixed(1)}% más ventas vs mes anterior`)
    } else if (comparison.growth.salesMoM < -15) {
      insights.push(`⚠️ Caída del ${Math.abs(comparison.growth.salesMoM).toFixed(1)}% vs mes anterior`)
    } else if (Math.abs(comparison.growth.salesMoM) < 5) {
      insights.push(`➡️ Ventas estables vs mes anterior (${comparison.growth.salesMoM > 0 ? '+' : ''}${comparison.growth.salesMoM.toFixed(1)}%)`)
    }

    // Insights vs año anterior
    if (comparison.growth.salesYoY > 20) {
      insights.push(`📈 ¡Increíble! ${comparison.growth.salesYoY.toFixed(1)}% más ventas vs mismo mes año pasado`)
    } else if (comparison.growth.salesYoY < -20) {
      insights.push(`📉 Bajada del ${Math.abs(comparison.growth.salesYoY).toFixed(1)}% vs año anterior`)
    }

    // Revenue
    if (comparison.growth.revenueMoM > 15) {
      insights.push(`💰 Ingresos aumentaron ${comparison.growth.revenueMoM.toFixed(1)}% este mes`)
    }

    // Colaboradores
    const topCollaborator = collaborators[0]
    if (topCollaborator) {
      insights.push(`⭐ ${topCollaborator.name} lidera con ${topCollaborator.percentage.toFixed(1)}% de las ventas`)
    }

    // Orígenes
    const topSource = trafficSources[0]
    if (topSource) {
      insights.push(`🎯 "${topSource.source}" es la principal fuente (${topSource.percentage.toFixed(1)}%)`)
    }

    return insights
  }

  const enhancedInsights = generateEnhancedInsights()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reporte de Ventas
          </h2>
          <p className="text-gray-600">
            {data.current.length} consultas registradas
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
        >
          Nuevo Análisis
        </button>
      </div>

      {/* Insights Mejorados */}
      {enhancedInsights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <span>💡</span>
            <span>Insights del Mes</span>
          </h3>
          <ul className="space-y-2">
            {enhancedInsights.map((insight, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue Actual"
          value={`€${comparison.currentMonth.revenue.toFixed(2)}`}
          trend={comparison.growth.revenueMoM}
          icon="💰"
        />
        <MetricCard
          title="Consultas"
          value={comparison.currentMonth.sales.toString()}
          trend={comparison.growth.salesMoM}
          icon="📋"
        />
        <MetricCard
          title="vs Mes Anterior"
          value={`${comparison.growth.salesMoM > 0 ? '+' : ''}${comparison.growth.salesMoM.toFixed(1)}%`}
          icon="📊"
        />
        <MetricCard
          title="vs Año Anterior"
          value={`${comparison.growth.salesYoY > 0 ? '+' : ''}${comparison.growth.salesYoY.toFixed(1)}%`}
          icon="📈"
        />
      </div>

      {/* Comparativas Detalladas Mejoradas */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">📊</span>
          Comparativa Detallada
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mes Actual */}
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              ACTUAL
            </div>
            <h4 className="text-sm font-medium text-blue-800 mb-3">Mes Actual</h4>
            <p className="text-4xl font-bold text-blue-900 mb-2">
              €{comparison.currentMonth.revenue.toFixed(2)}
            </p>
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-sm">Consultas</span>
              <span className="text-2xl font-bold">{comparison.currentMonth.sales}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-300">
              <p className="text-xs text-blue-600">
                Promedio: €{(comparison.currentMonth.revenue / comparison.currentMonth.sales || 0).toFixed(2)} / consulta
              </p>
            </div>
          </div>

          {/* vs Mes Anterior */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
            <h4 className="text-sm font-medium text-purple-800 mb-3">vs Mes Anterior</h4>
            <p className="text-3xl font-bold text-purple-900 mb-2">
              €{comparison.previousMonth.revenue.toFixed(2)}
            </p>
            <div className="flex items-center justify-between text-purple-700 mb-4">
              <span className="text-sm">Consultas</span>
              <span className="text-xl font-bold">{comparison.previousMonth.sales}</span>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-purple-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-700">Revenue:</span>
                <span className={`text-lg font-bold flex items-center ${comparison.growth.revenueMoM > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.growth.revenueMoM > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.revenueMoM).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-700">Consultas:</span>
                <span className={`text-lg font-bold flex items-center ${comparison.growth.salesMoM > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.growth.salesMoM > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.salesMoM).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* vs Año Anterior */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-amber-200">
            <h4 className="text-sm font-medium text-amber-800 mb-3">vs Mismo Mes Año Pasado</h4>
            <p className="text-3xl font-bold text-amber-900 mb-2">
              €{comparison.sameMonthLastYear.revenue.toFixed(2)}
            </p>
            <div className="flex items-center justify-between text-amber-700 mb-4">
              <span className="text-sm">Consultas</span>
              <span className="text-xl font-bold">{comparison.sameMonthLastYear.sales}</span>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-amber-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-700">Revenue YoY:</span>
                <span className={`text-lg font-bold flex items-center ${comparison.growth.revenueYoY > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.growth.revenueYoY > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.revenueYoY).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-700">Consultas YoY:</span>
                <span className={`text-lg font-bold flex items-center ${comparison.growth.salesYoY > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.growth.salesYoY > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.salesYoY).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolución Temporal */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">📈</span>
          Evolución en el Tiempo
        </h3>
        <TimeSeriesChart data={timeSeries} />
      </div>

      {/* Predicción del Próximo Mes */}
      <PredictionCard prediction={prediction} currentMonth={nextMonthName} />

      {/* Análisis Temporal */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">⏰</span>
          Análisis Temporal de Ventas
        </h3>
        <TemporalAnalysisChart dayData={dayOfWeekData} hourData={hourData} />
      </div>

      {/* Gráfico de Ventas Diarias */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Consultas por Día
        </h3>
        <SalesChart data={dailySales} />
      </div>

      {/* Ranking de Colaboradoras del Mes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">🏆</span>
          Ranking de Colaboradoras del Mes
        </h3>
        <CollaboratorTable collaborators={collaborators} />
      </div>

      {/* Ranking General de Colaboradoras */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-indigo-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">👑</span>
          Ranking General de Colaboradoras (Histórico)
        </h3>
        <GeneralCollaboratorRanking 
          collaborators={collaboratorsAll}
          totalSales={totalHistoricalSales}
          totalRevenue={totalHistoricalRevenue}
        />
      </div>

      {/* Ranking de Orígenes de Ventas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Ranking de Orígenes de Ventas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <TrafficSourcesChart sources={trafficSources} />
          </div>
          <div className="space-y-3">
            {trafficSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{source.source}</p>
                    <p className="text-sm text-gray-600">{source.count} ventas</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">{source.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de TikTok */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-lg p-8 border-2 border-pink-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-3xl mr-3">📱</span>
          Análisis de Correlación TikTok
        </h3>
        
        {!tiktokInsights ? (
          <TikTokFetchForm
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDataLoaded={handleTikTokDataLoaded}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                ✅ {tiktokVideos?.length} videos analizados
              </p>
              <button
                onClick={() => {
                  setTiktokVideos(null)
                  setTiktokInsights(null)
                }}
                className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition"
              >
                Cargar otro perfil
              </button>
            </div>
            <TikTokCorrelationAnalysis insights={tiktokInsights} />
          </div>
        )}
      </div>

    </div>
  )
}
