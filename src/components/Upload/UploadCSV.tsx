'use client'

import { useState, useRef } from 'react'
import { parseWooCommerceCSV } from '@/services/csvParser'
import type { SalesData } from '@/types/sales'

interface UploadCSVProps {
  onDataLoaded: (data: SalesData[]) => void
}

export default function UploadCSV({ onDataLoaded }: UploadCSVProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Por favor, selecciona un archivo CSV')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await parseWooCommerceCSV(file)
      
      if (data.length === 0) {
        setError('No se encontraron datos válidos en el archivo')
        return
      }

      onDataLoaded(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          border-4 border-dashed rounded-2xl p-12 text-center transition-all
          ${isDragging 
            ? 'border-primary bg-blue-50' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto" />
              <p className="text-lg font-medium text-gray-700">
                Procesando archivo...
              </p>
            </>
          ) : (
            <>
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Arrastra tu archivo CSV aquí
                </p>
                <p className="text-gray-600">
                  o haz clic para seleccionar
                </p>
              </div>

              <div className="text-sm text-gray-500">
                <p>Export de ventas de WooCommerce</p>
                <p className="mt-1">Formato: order_export_*.csv</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
