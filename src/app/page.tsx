'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null)

  const [lastDataDate, setLastDataDate] = useState<Date | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const service = new SupabaseService()
      const data = await service.getSalesByMonth(selectedYear, selectedMonth)
      const allData = await service.getAllSales()
      const comparisonData = await getComparisonData(selectedYear, selectedMonth)
      const timeSeriesData = await getTimeSeriesData(selectedYear, selectedMonth, 6)
      const predictionData = await getPrediction(selectedYear, selectedMonth)
      
      const latestDate = allData.reduce((latest, sale) => {
        const d = new Date(sale.orderDate)
        return d > latest ? d : latest
      }, new Date(0))
      setLastDataDate(latestDate.getTime() > 0 ? latestDate : null)

      setSalesData({ current: data, all: allData })
      setComparison(comparisonData)
      setTimeSeries(timeSeriesData)
      setPrediction(predictionData)
    } catch (err: any) {
      console.error('Error:', err)
      const detail = err?.message || err?.details || String(err)
      setError(`Error al cargar datos: ${detail}`)
    } finally {
      setLoading(false)
    }
  }

  const syncData = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/sync-orders', { method: 'POST' })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Error desconocido')
      setSyncResult({ ok: true, message: json.message || `Se importaron ${json.inserted} pedidos` })
      await loadData()
    } catch (err: any) {
      setSyncResult({ ok: false, message: `Error al sincronizar: ${err.message}` })
    } finally {
      setSyncing(false)
    }
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Top brand bar */}
      <header className="bg-brand-black text-white shadow-brand-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <Image
                src="/logo-mono.png"
                alt="Compromiso Legal"
                fill
                className="object-contain invert"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-base sm:text-xl font-bold text-brand-gold leading-tight truncate">
                Compromiso Legal
              </p>
              <p className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest truncate">
                Dashboard de Reportes
              </p>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-brand-gold/30" />
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Período</p>
            <p className="text-sm font-medium text-brand-gold-light">
              {months[selectedMonth - 1]} {selectedYear}
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 sm:mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-black mb-2 text-center">
            Dashboard de Ventas
          </h1>
          <p className="text-brand-muted text-center mb-5 text-sm sm:text-base">
            Análisis mensual con comparativas
          </p>
          <div className="flex justify-center mb-6">
            <div className="brand-divider w-24" />
          </div>

          {lastDataDate && (
            <div className="flex justify-center mb-5 px-2">
              <div className="inline-flex items-center gap-2 bg-white border border-brand-gold/30 text-brand-ink px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm shadow-brand max-w-full">
                <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse flex-shrink-0" />
                <span className="truncate">
                  Últimos datos:{' '}
                  <strong>
                    {lastDataDate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Boton sincronizar */}
          <div className="flex justify-center mb-4 px-2">
            <button
              onClick={syncData}
              disabled={syncing || loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-black text-brand-gold border border-brand-gold/40 rounded-lg hover:bg-brand-ink hover:border-brand-gold transition disabled:opacity-50 text-sm font-medium shadow-brand"
            >
              {syncing ? (
                <>
                  <span className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                  Sincronizando con WooCommerce...
                </>
              ) : (
                <>
                  <span>↻</span>
                  Actualizar datos desde WooCommerce
                </>
              )}
            </button>
          </div>

          {syncResult && (
            <div className={`max-w-xl mx-auto mb-4 px-4 py-3 rounded-lg text-sm font-medium text-center border ${
              syncResult.ok
                ? 'bg-white border-brand-gold/40 text-brand-ink'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {syncResult.ok ? '✓' : '⚠️'} {syncResult.message}
            </div>
          )}

          {/* Selector de mes/año - responsive grid en mobile, flex en desktop */}
          <div className="grid grid-cols-2 sm:flex sm:justify-center gap-2 sm:gap-4 mb-6 max-w-xl mx-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              onClick={loadData}
              disabled={loading}
              className="col-span-2 sm:col-span-1 px-6 py-2 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-brand-gold-dark transition disabled:opacity-50 shadow-gold text-sm"
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-gold"></div>
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

      <footer className="mt-12 border-t border-brand-gold/20 bg-brand-black text-gray-400 py-6">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="font-serif text-brand-gold text-sm sm:text-base">Compromiso Legal</p>
          <p className="text-xs mt-1">Dashboard de reportes © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  )
}
