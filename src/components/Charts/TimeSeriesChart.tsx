'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TimeSeriesData {
  month: string
  revenue: number
  sales: number
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  showRevenue?: boolean
  showSales?: boolean
}

export default function TimeSeriesChart({ data, showRevenue = true, showSales = true }: TimeSeriesChartProps) {
  return (
    <div className="space-y-6">
      {/* Gráfica de Facturación */}
      {showRevenue && (
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-3">Evolución de Facturación</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [`€${value.toFixed(2)}`, 'Revenue']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Facturación"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfica de Ventas */}
      {showSales && (
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-3">Evolución de Consultas</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Consultas']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="sales" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
                name="Consultas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
