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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-black">
            Reporte de Ventas
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            {data.current.length} consultas registradas
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="self-start sm:self-auto px-4 py-2 bg-brand-black text-brand-gold border border-brand-gold/40 rounded-lg hover:bg-brand-ink transition text-sm font-medium"
        >
          Nuevo Análisis
        </button>
      </div>

      {/* Insights Mejorados */}
      {enhancedInsights.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-brand-gold/30 shadow-brand">
          <h3 className="font-serif text-lg font-bold text-brand-black mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Insights del Mes</span>
          </h3>
          <ul className="space-y-2">
            {enhancedInsights.map((insight, i) => (
              <li key={i} className="text-sm text-brand-ink flex items-start">
                <span className="mr-2 text-brand-gold">•</span>
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

      {/* Comparativas Detalladas */}
      <div className="bg-white rounded-xl shadow-brand p-4 sm:p-6 lg:p-8 border border-gray-100">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-black mb-5 sm:mb-6 flex items-center">
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📊</span>
          Comparativa Detallada
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Mes Actual */}
          <div className="relative bg-brand-black text-white rounded-xl p-5 sm:p-6 border border-brand-gold/40 shadow-brand-lg">
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-brand-gold text-brand-black px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
              ACTUAL
            </div>
            <h4 className="text-xs font-medium text-brand-gold-light mb-3 uppercase tracking-wider">Mes Actual</h4>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-brand-gold mb-2 break-words">
              €{comparison.currentMonth.revenue.toFixed(2)}
            </p>
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-sm">Consultas</span>
              <span className="text-xl sm:text-2xl font-bold text-white">{comparison.currentMonth.sales}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-gold/20">
              <p className="text-xs text-gray-400">
                Promedio: €{(comparison.currentMonth.revenue / comparison.currentMonth.sales || 0).toFixed(2)} / consulta
              </p>
            </div>
          </div>

          {/* vs Mes Anterior */}
          <div className="bg-brand-cream rounded-xl p-5 sm:p-6 border border-brand-gold/30">
            <h4 className="text-xs font-medium text-brand-ink mb-3 uppercase tracking-wider">vs Mes Anterior</h4>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-brand-black mb-2 break-words">
              €{comparison.previousMonth.revenue.toFixed(2)}
            </p>
            <div className="flex items-center justify-between text-brand-muted mb-4">
              <span className="text-sm">Consultas</span>
              <span className="text-lg sm:text-xl font-bold text-brand-ink">{comparison.previousMonth.sales}</span>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-brand-gold/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-muted">Revenue:</span>
                <span className={`text-base sm:text-lg font-bold ${comparison.growth.revenueMoM > 0 ? 'text-success' : 'text-error'}`}>
                  {comparison.growth.revenueMoM > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.revenueMoM).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-muted">Consultas:</span>
                <span className={`text-base sm:text-lg font-bold ${comparison.growth.salesMoM > 0 ? 'text-success' : 'text-error'}`}>
                  {comparison.growth.salesMoM > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.salesMoM).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* vs Año Anterior */}
          <div className="bg-brand-cream rounded-xl p-5 sm:p-6 border border-brand-gold/30">
            <h4 className="text-xs font-medium text-brand-ink mb-3 uppercase tracking-wider">vs Año Anterior</h4>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-brand-black mb-2 break-words">
              €{comparison.sameMonthLastYear.revenue.toFixed(2)}
            </p>
            <div className="flex items-center justify-between text-brand-muted mb-4">
              <span className="text-sm">Consultas</span>
              <span className="text-lg sm:text-xl font-bold text-brand-ink">{comparison.sameMonthLastYear.sales}</span>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-brand-gold/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-muted">Revenue YoY:</span>
                <span className={`text-base sm:text-lg font-bold ${comparison.growth.revenueYoY > 0 ? 'text-success' : 'text-error'}`}>
                  {comparison.growth.revenueYoY > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.revenueYoY).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-muted">Consultas YoY:</span>
                <span className={`text-base sm:text-lg font-bold ${comparison.growth.salesYoY > 0 ? 'text-success' : 'text-error'}`}>
                  {comparison.growth.salesYoY > 0 ? '↑' : '↓'}
                  {Math.abs(comparison.growth.salesYoY).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolución Temporal */}
      <div className="bg-white rounded-xl shadow-brand p-4 sm:p-6 lg:p-8 border border-gray-100">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-black mb-5 sm:mb-6 flex items-center">
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📈</span>
          Evolución en el Tiempo
        </h3>
        <TimeSeriesChart data={timeSeries} />
      </div>

      {/* Predicción del Próximo Mes */}
      <PredictionCard prediction={prediction} currentMonth={nextMonthName} />

      {/* Análisis Temporal */}
      <div className="bg-white rounded-xl shadow-brand p-4 sm:p-6 lg:p-8 border border-gray-100">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-black mb-5 sm:mb-6 flex items-center">
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">⏰</span>
          Análisis Temporal de Ventas
        </h3>
        <TemporalAnalysisChart dayData={dayOfWeekData} hourData={hourData} />
      </div>

      {/* Gráfico de Ventas Diarias */}
      <div className="bg-white rounded-xl shadow-brand p-4 sm:p-6 border border-gray-100">
        <h3 className="font-serif text-base sm:text-lg font-semibold text-brand-black mb-4">
          Consultas por Día
        </h3>
        <SalesChart data={dailySales} />
      </div>

      {/* Ranking de Colaboradoras del Mes */}
      <div className="bg-white rounded-xl shadow-brand p-4 sm:p-6 border border-gray-100">
        <h3 className="font-serif text-base sm:text-lg font-semibold text-brand-black mb-4 flex items-center">
          <span className="text-xl sm:text-2xl mr-2">🏆</span>
          Ranking de Colaboradoras del Mes
        </h3>
        <CollaboratorTable collaborators={collaborators} />
      </div>

      {/* Ranking General de Colaboradoras */}
      <div className="bg-white rounded-xl shadow-brand-lg p-4 sm:p-6 lg:p-8 border border-brand-gold/30">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-black mb-5 sm:mb-6 flex items-center">
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">👑</span>
          Ranking General de Colaboradoras (Histórico)
        </h3>
        <GeneralCollaboratorRanking 
          collaborators={collaboratorsAll}
          totalSales={totalHistoricalSales}
          totalRevenue={totalHistoricalRevenue}
        />
      </div>

      {/* Ranking de Orígenes de Ventas */}
      <div className="bg-white rounded-xl shadow-brand p-4 sm:p-6 border border-gray-100">
        <h3 className="font-serif text-base sm:text-lg font-semibold text-brand-black mb-4 flex items-center">
          <span className="text-xl sm:text-2xl mr-2">📊</span>
          Ranking de Orígenes de Ventas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <TrafficSourcesChart sources={trafficSources} />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {trafficSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-brand-cream rounded-lg border border-brand-gold/10">
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xl sm:text-2xl font-bold text-brand-gold flex-shrink-0">#{index + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-ink capitalize truncate">{source.source}</p>
                    <p className="text-xs sm:text-sm text-brand-muted">{source.count} ventas</p>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-bold text-brand-black flex-shrink-0 ml-2">{source.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de TikTok */}
      <div className="bg-white rounded-xl shadow-brand-lg p-4 sm:p-6 lg:p-8 border border-brand-gold/30">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-black mb-5 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📱</span>
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-sm text-brand-muted">
                ✅ {tiktokVideos?.length} videos analizados
              </p>
              <button
                onClick={() => {
                  setTiktokVideos(null)
                  setTiktokInsights(null)
                }}
                className="self-start sm:self-auto px-4 py-2 bg-brand-black text-brand-gold border border-brand-gold/40 text-sm rounded-lg hover:bg-brand-ink transition font-medium"
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
