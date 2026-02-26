'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { TrafficSource } from '@/types/sales'

interface TrafficSourcesChartProps {
  sources: TrafficSource[]
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

export default function TrafficSourcesChart({ sources }: TrafficSourcesChartProps) {
  const data = sources.map(source => ({
    name: source.source,
    value: source.count,
    percentage: source.percentage,
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, payload }: any) => `${name} (${(payload?.percentage ?? 0).toFixed(1)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, props: any) => [
              `${Number(value ?? 0)} consultas (${props.payload.percentage.toFixed(1)}%)`,
              props.payload.name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
