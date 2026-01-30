'use client'

import { useState } from 'react'
import { TikTokParser } from '@/services/tiktokParser'
import type { TikTokVideo } from '@/types/tiktok'

interface UploadTikTokCSVProps {
  onDataLoaded: (videos: TikTokVideo[]) => void
}

export default function UploadTikTokCSV({ onDataLoaded }: UploadTikTokCSVProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const parser = new TikTokParser()
      const videos = parser.parse(text)

      if (videos.length === 0) {
        throw new Error('No se encontraron videos válidos en el CSV')
      }

      onDataLoaded(videos)
    } catch (err) {
      console.error('Error parsing TikTok CSV:', err)
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300">
      <div className="text-center">
        <span className="text-5xl mb-4 block">📹</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Analizar Correlación TikTok → Ventas
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Sube tu CSV de TikTok Analytics para ver qué videos generan más ventas
        </p>
        
        <label className="inline-block">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="hidden"
          />
          <span className={`px-6 py-3 rounded-lg font-medium cursor-pointer transition ${
            loading 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-pink-600 text-white hover:bg-pink-700'
          }`}>
            {loading ? 'Procesando...' : 'Subir CSV de TikTok'}
          </span>
        </label>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">❌ {error}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Formatos aceptados: CSV exportado desde TikTok Analytics</p>
        </div>
      </div>
    </div>
  )
}
