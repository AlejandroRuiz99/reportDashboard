'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard/Dashboard'
import type { SalesData } from '@/types/sales'
import { 
  SupabaseService, 
  getComparisonData, 
  getTimeSeriesData, 
  getPrediction,
  type ComparisonData, 
  type TimeSeriesData,
  type PredictionData 
} from '@/services/supabaseService'

export default function Home() {
  const [salesData, setSalesData] = useState<{ current: SalesData[], all: SalesData[] } | null>(null)
  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[] | null>(null)
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const service = new SupabaseService()
      const data = await service.getSalesByMonth(selectedYear, selectedMonth)
      const allData = await service.getAllSales() // Para ranking general
      const comparisonData = await getComparisonData(selectedYear, selectedMonth)
      const timeSeriesData = await getTimeSeriesData(selectedYear, selectedMonth, 6)
      const predictionData = await getPrediction(selectedYear, selectedMonth)
      
      // Pasar tanto datos del mes como datos históricos al dashboard
      setSalesData({ current: data, all: allData })
      setComparison(comparisonData)
      setTimeSeries(timeSeriesData)
      setPrediction(predictionData)
    } catch (err) {
      console.error('Error:', err)
      setError('Error al cargar datos de Supabase. Verifica tu configuración.')
    } finally {
      setLoading(false)
    }
  }

  // No cargar automáticamente, esperar a que el usuario configure y haga clic

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
            Dashboard de Ventas
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Análisis mensual con comparativas
          </p>

          {/* Selector de mes/año */}
          <div className="flex justify-center gap-4 mb-6">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Cargar'}
            </button>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm font-medium mb-2">⚠️ {error}</p>
              <div className="text-red-700 text-xs space-y-1">
                <p><strong>Para configurar Supabase:</strong></p>
                <p>1. Crea un proyecto en https://supabase.com</p>
                <p>2. Ve a Settings → API</p>
                <p>3. Copia la URL del proyecto y la Anon key</p>
                <p>4. Pégalas en <code className="bg-red-100 px-1">.env.local</code></p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
          </div>
        ) : salesData && comparison && timeSeries && prediction ? (
          <Dashboard 
            data={salesData} 
            comparison={comparison} 
            timeSeries={timeSeries}
            prediction={prediction}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        ) : null}
      </div>
    </main>
  )
}
