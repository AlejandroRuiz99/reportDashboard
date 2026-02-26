'use client'

import { useState } from 'react'
import type { TikTokVideo } from '@/types/tiktok'

interface TikTokFetchFormProps {
  selectedMonth: number
  selectedYear: number
  onDataLoaded: (videos: TikTokVideo[]) => void
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function TikTokFetchForm({
  selectedMonth,
  selectedYear,
  onDataLoaded,
}: TikTokFetchFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    const user = 'compromisolegal'

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        username: user,
        month: String(selectedMonth),
        year: String(selectedYear),
      })
      const res = await fetch(`/api/tiktok-videos?${params.toString()}`)
      const data = await res.json()

      if (!data.ok) {
        throw new Error(data.error || 'Error al cargar videos')
      }

      if (!data.videos?.length) {
        throw new Error('No hay videos en este mes para ese perfil')
      }

      onDataLoaded(data.videos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos de TikTok')
    } finally {
      setLoading(false)
    }
  }

  const monthLabel = MONTH_NAMES[selectedMonth - 1]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300">
      <div className="text-center space-y-4">
        <span className="text-5xl block">📹</span>
        <h3 className="text-lg font-semibold text-gray-900">
          Analizar Correlación TikTok → Ventas
        </h3>
        <p className="text-sm text-gray-600">
          Se cargarán los videos de <strong>@compromisolegal</strong> del mes seleccionado
          ({monthLabel} {selectedYear}) desde la API.
        </p>

        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 max-w-md mx-auto">
          ⏱️ El análisis puede tardar 1-2 minutos en obtener y procesar los videos.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
          <input
            type="text"
            value="@compromisolegal"
            readOnly
            className="w-full sm:flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 bg-pink-600 text-white hover:bg-pink-700"
          >
            {loading ? 'Cargando...' : 'Cargar datos de TikTok'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">❌ {error}</p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Usa el mismo mes y año que has seleccionado arriba para el reporte de ventas.
        </p>
      </div>
    </div>
  )
}
