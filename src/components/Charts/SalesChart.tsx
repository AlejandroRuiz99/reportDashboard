'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DailySales } from '@/types/sales'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface SalesChartProps {
  data: DailySales[]
}

export default function SalesChart({ data }: SalesChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: format(parseISO(item.date), 'd MMM', { locale: es }),
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="dateLabel"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
            formatter={(value, name) => {
              const v = Number(value ?? 0)
              if (name === 'count') return [v, 'Consultas']
              if (name === 'revenue') return [`€${v.toFixed(2)}`, 'Revenue']
              return [v, name]
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#6366F1"
            strokeWidth={3}
            dot={{ fill: '#6366F1', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
