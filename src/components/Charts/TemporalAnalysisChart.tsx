'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DayData {
  day: string
  sales: number
  revenue: number
}

interface HourData {
  hour: string
  sales: number
}

interface TemporalAnalysisProps {
  dayData: DayData[]
  hourData: HourData[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444']

export default function TemporalAnalysisChart({ dayData, hourData }: TemporalAnalysisProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ventas por Día de la Semana */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Ventas por Día de la Semana</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'sales') return [value, 'Ventas']
                if (name === 'revenue') return [`€${value.toFixed(2)}`, 'Revenue']
                return [value, name]
              }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="sales" radius={[8, 8, 0, 0]} name="Ventas">
              {dayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {dayData.map((day, index) => (
            <div key={day.day} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-gray-600">{day.day}: {day.sales} ventas (€{day.revenue.toFixed(0)})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ventas por Hora del Día */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Ventas por Hora del Día</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Ventas']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Ventas" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4">
          <p className="text-xs text-gray-600">
            💡 <strong>Hora pico:</strong> {hourData.reduce((max, h) => h.sales > max.sales ? h : max, hourData[0]).hour}h 
            con {hourData.reduce((max, h) => h.sales > max.sales ? h : max, hourData[0]).sales} ventas
          </p>
        </div>
      </div>
    </div>
  )
}
