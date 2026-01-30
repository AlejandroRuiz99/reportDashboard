import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { SalesData } from '@/types/sales'

export class SupabaseService {
  /**
   * Obtiene ventas de un mes específico
   */
  async getSalesByMonth(year: number, month: number): Promise<SalesData[]> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase no está configurado')
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('order_date', startDate.toISOString())
      .lte('order_date', endDate.toISOString())
      .eq('status', 'completed')

    if (error) {
      console.error('Error fetching from Supabase:', error)
      throw error
    }

    return this.mapToSalesData(data || [])
  }

  /**
   * Obtiene TODAS las ventas (histórico completo)
   */
  async getAllSales(): Promise<SalesData[]> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase no está configurado')
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('order_date', { ascending: false })

    if (error) {
      console.error('Error fetching from Supabase:', error)
      throw error
    }

    return this.mapToSalesData(data || [])
  }

  /**
   * Mapea datos de Supabase (formato WooCommerce) a SalesData
   */
  private mapToSalesData(rows: any[]): SalesData[] {
    return rows.map(row => ({
      orderId: row.order_id || row.id,
      orderNumber: row.order_number || row.order_id,
      orderDate: new Date(row.order_date),
      paidDate: new Date(row.paid_date || row.order_date),
      status: row.status,
      orderTotal: parseFloat(row.order_total || 0),
      productName: row['Product Item 1 Name'] || 'Consulta',
      productId: row['Product Item 1 id'] || '',
      quantity: parseInt(row['Product Item 1 Quantity'] || '1'),
      utmSource: this.normalizeCollaborator(row['meta:_wc_order_attribution_utm_source']),
      utmMedium: null,
      utmCampaign: null,
      sourceType: this.mapSourceType(row['meta:_wc_order_attribution_source_type']),
      deviceType: row['meta:_wc_order_attribution_device_type'] === 'Mobile' ? 'Mobile' : 
                  row['meta:_wc_order_attribution_device_type'] === 'Desktop' ? 'Desktop' : 'unknown',
      shippingState: row.shipping_state || '',
      shippingCountry: row.shipping_country || 'ES',
      paymentMethod: row.payment_method_title || '',
      customerEmail: row.customer_user || '',
      customerIp: row.customer_ip_address || '',
    }))
  }

  private normalizeCollaborator(source: string | null): string | null {
    if (!source) return null
    const lower = source.toLowerCase().trim()
    
    // Colaboradoras válidas
    if (lower === 'mariajose' || lower === 'maria jose' || lower === 'maria_jose') return 'MariaJose'
    if (lower === 'margareth') return 'Margareth'
    
    // Filtrar fuentes que NO son colaboradoras
    const nonCollaborators = ['ig', 'instagram', 'facebook', 'fb', 'tiktok', 'google', 'youtube', 'direct', 'organic', 'typein']
    if (nonCollaborators.includes(lower)) return null
    
    return null // Si no es una colaboradora reconocida, devolver null
  }

  private mapSourceType(type: string | null): 'utm' | 'typein' | 'organic' | 'referral' | 'unknown' {
    if (!type) return 'unknown'
    const lower = type.toLowerCase()
    if (lower === 'utm') return 'utm'
    if (lower === 'typein') return 'typein'
    if (lower === 'organic') return 'organic'
    if (lower === 'referral') return 'referral'
    return 'unknown'
  }
}

export interface ComparisonData {
  currentMonth: {
    revenue: number
    sales: number
  }
  previousMonth: {
    revenue: number
    sales: number
  }
  sameMonthLastYear: {
    revenue: number
    sales: number
  }
  growth: {
    revenueMoM: number
    salesMoM: number
    revenueYoY: number
    salesYoY: number
  }
}

export async function getComparisonData(year: number, month: number): Promise<ComparisonData> {
  const service = new SupabaseService()

  // Mes actual
  const current = await service.getSalesByMonth(year, month)

  // Mes anterior
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const previous = await service.getSalesByMonth(prevYear, prevMonth)

  // Mismo mes año anterior
  const lastYear = await service.getSalesByMonth(year - 1, month)

  const currentRevenue = current.reduce((sum, s) => sum + s.orderTotal, 0)
  const previousRevenue = previous.reduce((sum, s) => sum + s.orderTotal, 0)
  const lastYearRevenue = lastYear.reduce((sum, s) => sum + s.orderTotal, 0)

  return {
    currentMonth: {
      revenue: currentRevenue,
      sales: current.length,
    },
    previousMonth: {
      revenue: previousRevenue,
      sales: previous.length,
    },
    sameMonthLastYear: {
      revenue: lastYearRevenue,
      sales: lastYear.length,
    },
    growth: {
      revenueMoM: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      salesMoM: previous.length > 0 ? ((current.length - previous.length) / previous.length) * 100 : 0,
      revenueYoY: lastYearRevenue > 0 ? ((currentRevenue - lastYearRevenue) / lastYearRevenue) * 100 : 0,
      salesYoY: lastYear.length > 0 ? ((current.length - lastYear.length) / lastYear.length) * 100 : 0,
    },
  }
}

export interface TimeSeriesData {
  month: string
  revenue: number
  sales: number
}

export async function getTimeSeriesData(year: number, month: number, months: number = 6): Promise<TimeSeriesData[]> {
  const service = new SupabaseService()
  const result: TimeSeriesData[] = []

  // Obtener datos de los últimos N meses
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(year, month - 1 - i, 1)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth() + 1

    try {
      const data = await service.getSalesByMonth(targetYear, targetMonth)
      const revenue = data.reduce((sum, s) => sum + s.orderTotal, 0)
      
      result.push({
        month: targetDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        revenue: parseFloat(revenue.toFixed(2)),
        sales: data.length,
      })
    } catch (error) {
      // Si no hay datos, agregar 0
      result.push({
        month: targetDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        revenue: 0,
        sales: 0,
      })
    }
  }

  return result
}

export interface PredictionData {
  predictedRevenue: number
  predictedSales: number
  confidence: 'high' | 'medium' | 'low'
  trend: 'up' | 'down' | 'stable'
  growthRate: number
}

export async function getPrediction(year: number, month: number): Promise<PredictionData> {
  // Obtener datos históricos de 6 meses
  const timeSeriesData = await getTimeSeriesData(year, month, 6)
  
  // Filtrar meses con datos
  const validMonths = timeSeriesData.filter(m => m.sales > 0)
  
  if (validMonths.length < 2) {
    // No hay suficientes datos para predicción
    return {
      predictedRevenue: 0,
      predictedSales: 0,
      confidence: 'low',
      trend: 'stable',
      growthRate: 0,
    }
  }

  // Calcular mediana y promedio (usar mediana como base más robusta)
  const revenues = validMonths.map(m => m.revenue).sort((a, b) => a - b)
  const sales = validMonths.map(m => m.sales).sort((a, b) => a - b)
  
  const medianRevenue = revenues[Math.floor(revenues.length / 2)]
  const medianSales = sales[Math.floor(sales.length / 2)]
  const avgRevenue = validMonths.reduce((sum, m) => sum + m.revenue, 0) / validMonths.length
  const avgSales = validMonths.reduce((sum, m) => sum + m.sales, 0) / validMonths.length

  // Usar promedio entre mediana y media para ser más conservador
  const baseRevenue = (medianRevenue + avgRevenue) / 2
  const baseSales = (medianSales + avgSales) / 2

  // Calcular tendencia más conservadora (solo últimos 3 meses vs previos)
  const recentMonths = validMonths.slice(-3)
  const olderMonths = validMonths.slice(0, -3)
  
  let trendGrowth = 0
  if (olderMonths.length > 0) {
    const recentAvg = recentMonths.reduce((sum, m) => sum + m.revenue, 0) / recentMonths.length
    const olderAvg = olderMonths.reduce((sum, m) => sum + m.revenue, 0) / olderMonths.length
    trendGrowth = ((recentAvg - olderAvg) / olderAvg) * 100
  }

  // Determinar tendencia
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (trendGrowth > 10) trend = 'up'
  else if (trendGrowth < -10) trend = 'down'

  // Aplicar tendencia de forma MUY conservadora (solo 30% del crecimiento detectado)
  const conservativeTrendMultiplier = 1 + ((trendGrowth * 0.3) / 100)
  
  // Aplicar regresión a la media (tender hacia el promedio histórico)
  const predictedRevenue = baseRevenue * conservativeTrendMultiplier
  const predictedSales = Math.round(baseSales * conservativeTrendMultiplier)

  // Determinar confianza basada en cantidad de datos y estabilidad
  const dataVariability = calculateVariability(validMonths.map(m => m.revenue))
  let confidence: 'high' | 'medium' | 'low' = 'medium'
  
  if (validMonths.length >= 5 && dataVariability < 15) confidence = 'high'
  else if (validMonths.length < 3 || dataVariability > 35) confidence = 'low'

  return {
    predictedRevenue: parseFloat(predictedRevenue.toFixed(2)),
    predictedSales,
    confidence,
    trend,
    growthRate: trendGrowth * 0.3, // Mostrar el crecimiento real aplicado (30% del detectado)
  }
}

function calculateVariability(values: number[]): number {
  if (values.length < 2) return 0
  
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  return (stdDev / avg) * 100 // Coeficiente de variación en %
}
