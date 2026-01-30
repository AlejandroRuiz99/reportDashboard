import type { 
  SalesData, 
  CollaboratorStats, 
  DailySales, 
  TrafficSource,
  ProductStats,
  MonthlyMetrics 
} from '@/types/sales'
import { format, parseISO, startOfDay, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

export class AnalyticsService {
  private data: SalesData[]

  constructor(data: SalesData[]) {
    this.data = data
  }

  getMonthlyMetrics(): MonthlyMetrics {
    const totalSales = this.data.length
    const totalRevenue = this.data.reduce((sum, sale) => sum + sale.orderTotal, 0)

    // Calcular métricas comparativas con mes anterior
    const comparison = this.calculateComparison()

    // Calcular clientes nuevos vs recurrentes
    const customerStats = this.calculateCustomerStats()

    return {
      totalSales,
      totalRevenue,
      avgConversion: 0, // Se calculará con datos de GA
      newCustomers: customerStats.new,
      returningCustomers: customerStats.returning,
      salesGrowth: comparison.salesGrowth,
      revenueGrowth: comparison.revenueGrowth,
    }
  }

  /**
   * Calcula estadísticas de clientes nuevos vs recurrentes
   */
  private calculateCustomerStats() {
    const emailCounts = new Map<string, number>()
    
    this.data.forEach(sale => {
      const email = sale.customerEmail
      if (email) {
        emailCounts.set(email, (emailCounts.get(email) || 0) + 1)
      }
    })

    let newCustomers = 0
    let returningCustomers = 0

    emailCounts.forEach(count => {
      if (count === 1) {
        newCustomers++
      } else {
        returningCustomers++
      }
    })

    return { new: newCustomers, returning: returningCustomers }
  }

  /**
   * Calcula crecimiento comparado con mes anterior
   */
  private calculateComparison() {
    if (this.data.length === 0) {
      return { salesGrowth: 0, revenueGrowth: 0 }
    }

    // Obtener el mes más reciente en los datos
    const latestDate = new Date(Math.max(...this.data.map(s => new Date(s.orderDate).getTime())))
    const currentMonthStart = startOfMonth(latestDate)
    const currentMonthEnd = endOfMonth(latestDate)

    // Obtener el mes anterior
    const previousMonthDate = subMonths(latestDate, 1)
    const previousMonthStart = startOfMonth(previousMonthDate)
    const previousMonthEnd = endOfMonth(previousMonthDate)

    // Filtrar datos del mes actual
    const currentMonthData = this.data.filter(sale => {
      const saleDate = new Date(sale.orderDate)
      return isWithinInterval(saleDate, { start: currentMonthStart, end: currentMonthEnd })
    })

    // Filtrar datos del mes anterior
    const previousMonthData = this.data.filter(sale => {
      const saleDate = new Date(sale.orderDate)
      return isWithinInterval(saleDate, { start: previousMonthStart, end: previousMonthEnd })
    })

    // Si no hay datos del mes anterior, no podemos calcular crecimiento
    if (previousMonthData.length === 0) {
      return { salesGrowth: 0, revenueGrowth: 0 }
    }

    const currentSales = currentMonthData.length
    const previousSales = previousMonthData.length
    const currentRevenue = currentMonthData.reduce((sum, s) => sum + s.orderTotal, 0)
    const previousRevenue = previousMonthData.reduce((sum, s) => sum + s.orderTotal, 0)

    const salesGrowth = ((currentSales - previousSales) / previousSales) * 100
    const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100

    return {
      salesGrowth: isFinite(salesGrowth) ? salesGrowth : 0,
      revenueGrowth: isFinite(revenueGrowth) ? revenueGrowth : 0,
    }
  }

  getCollaboratorStats(): CollaboratorStats[] {
    const collaboratorMap = new Map<string, { sales: number; revenue: number }>()
    
    // Filtrar solo ventas con UTM (colaboradores)
    const utmSales = this.data.filter(sale => sale.sourceType === 'utm' && sale.utmSource)

    utmSales.forEach(sale => {
      const name = sale.utmSource!
      const current = collaboratorMap.get(name) || { sales: 0, revenue: 0 }
      
      collaboratorMap.set(name, {
        sales: current.sales + 1,
        revenue: current.revenue + sale.orderTotal,
      })
    })

    const totalSales = utmSales.length
    
    return Array.from(collaboratorMap.entries())
      .map(([name, stats]) => ({
        name,
        sales: stats.sales,
        revenue: stats.revenue,
        percentage: totalSales > 0 ? (stats.sales / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
  }

  getDailySales(): DailySales[] {
    const dailyMap = new Map<string, { count: number; revenue: number }>()

    this.data.forEach(sale => {
      const dateKey = format(sale.orderDate, 'yyyy-MM-dd')
      const current = dailyMap.get(dateKey) || { count: 0, revenue: 0 }
      
      dailyMap.set(dateKey, {
        count: current.count + 1,
        revenue: current.revenue + sale.orderTotal,
      })
    })

    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  getTrafficSources(): TrafficSource[] {
    const sourceMap = new Map<string, number>()

    this.data.forEach(sale => {
      let source = 'Desconocido'
      
      if (sale.sourceType === 'utm' && sale.utmSource) {
        // Colaboradores específicos
        source = sale.utmSource
      } else if (sale.sourceType === 'organic') {
        source = 'Google (Orgánico)'
      } else if (sale.sourceType === 'typein') {
        source = 'Directo'
      } else if (sale.sourceType === 'referral') {
        source = 'Referencias'
      }

      sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
    })

    const total = this.data.length

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
  }

  getProductStats(): ProductStats[] {
    const productMap = new Map<string, { count: number; revenue: number }>()

    this.data.forEach(sale => {
      const name = sale.productName || 'Sin nombre'
      const current = productMap.get(name) || { count: 0, revenue: 0 }
      
      productMap.set(name, {
        count: current.count + sale.quantity,
        revenue: current.revenue + sale.orderTotal,
      })
    })

    return Array.from(productMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.count - a.count)
  }

  getDeviceStats() {
    const deviceMap = new Map<string, number>()

    this.data.forEach(sale => {
      const device = sale.deviceType === 'unknown' ? 'Desconocido' : sale.deviceType
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })

    const total = this.data.length

    return Array.from(deviceMap.entries())
      .map(([device, count]) => ({
        device,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
  }

  getTopProvinces(limit: number = 10) {
    const provinceMap = new Map<string, number>()

    this.data.forEach(sale => {
      if (sale.shippingState) {
        provinceMap.set(sale.shippingState, (provinceMap.get(sale.shippingState) || 0) + 1)
      }
    })

    return Array.from(provinceMap.entries())
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  getPaymentMethods() {
    const methodMap = new Map<string, number>()

    this.data.forEach(sale => {
      const method = sale.paymentMethod || 'Desconocido'
      methodMap.set(method, (methodMap.get(method) || 0) + 1)
    })

    const total = this.data.length

    return Array.from(methodMap.entries())
      .map(([method, count]) => ({
        method,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Análisis por día de la semana
   */
  getSalesByDayOfWeek() {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayMap = new Map<string, { sales: number; revenue: number }>()

    // Inicializar todos los días
    dayNames.forEach(day => dayMap.set(day, { sales: 0, revenue: 0 }))

    this.data.forEach(sale => {
      const date = new Date(sale.orderDate)
      const dayIndex = date.getDay()
      const dayName = dayNames[dayIndex]
      const current = dayMap.get(dayName)!
      
      dayMap.set(dayName, {
        sales: current.sales + 1,
        revenue: current.revenue + sale.orderTotal,
      })
    })

    return Array.from(dayMap.entries()).map(([day, stats]) => ({
      day,
      sales: stats.sales,
      revenue: stats.revenue,
    }))
  }

  /**
   * Análisis por hora del día
   */
  getSalesByHour() {
    const hourMap = new Map<number, number>()

    // Inicializar todas las horas
    for (let i = 0; i < 24; i++) {
      hourMap.set(i, 0)
    }

    this.data.forEach(sale => {
      const date = new Date(sale.orderDate)
      const hour = date.getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
    })

    return Array.from(hourMap.entries())
      .map(([hour, sales]) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        sales,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
  }
}
