import type { SalesData } from '@/types/sales'
import type { TikTokVideo, VideoSalesCorrelation, TikTokInsights } from '@/types/tiktok'

export class TikTokCorrelationService {
  private sales: SalesData[]
  private videos: TikTokVideo[]

  constructor(sales: SalesData[], videos: TikTokVideo[]) {
    this.sales = sales
    this.videos = videos
  }

  /**
   * Calcula correlación entre videos y ventas
   * Asume ventana de conversión de 7 días después del video
   */
  analyze(): TikTokInsights {
    const correlations = this.calculateVideoCorrelations()
    const publishingDays = this.analyzeBestPublishingDays()
    const engagementAnalysis = this.analyzeEngagementVsConversion(correlations)
    
    return {
      topConvertingVideos: correlations.slice(0, 10),
      averageConversionWindow: this.calculateAverageConversionWindow(correlations),
      bestPublishingDays: publishingDays,
      engagementVsConversion: engagementAnalysis,
      recommendations: this.generateRecommendations(correlations, publishingDays),
    }
  }

  private calculateVideoCorrelations(): VideoSalesCorrelation[] {
    const conversionWindowDays = 7
    const correlations: VideoSalesCorrelation[] = []

    this.videos.forEach(video => {
      const videoDate = new Date(video.date)
      const windowStart = new Date(videoDate)
      const windowEnd = new Date(videoDate)
      windowEnd.setDate(windowEnd.getDate() + conversionWindowDays)

      // Ventas dentro de la ventana
      const salesInWindow = this.sales.filter(sale => {
        const saleDate = new Date(sale.orderDate)
        return saleDate >= windowStart && saleDate <= windowEnd
      })

      const salesCount = salesInWindow.length
      const revenue = salesInWindow.reduce((sum, s) => sum + s.orderTotal, 0)

      // Días hasta conversión
      const daysToConvert = salesInWindow.map(sale => {
        const saleDate = new Date(sale.orderDate)
        const diffTime = saleDate.getTime() - videoDate.getTime()
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
      })

      // Tasa de conversión estimada (ventas / vistas * 10000)
      const conversionRate = video.views > 0 ? (salesCount / video.views) * 10000 : 0

      // Score de impacto: combina ventas, revenue y engagement
      const engagementRate = (video.likes + video.comments + video.shares) / video.views
      const impactScore = salesCount * 10 + revenue * 0.1 + engagementRate * 100

      correlations.push({
        video,
        salesInWindow: salesCount,
        revenueInWindow: revenue,
        conversionRate,
        daysToConvert,
        impactScore,
      })
    })

    // Ordenar por impacto
    return correlations.sort((a, b) => b.impactScore - a.impactScore)
  }

  private calculateAverageConversionWindow(correlations: VideoSalesCorrelation[]): number {
    const allDays = correlations.flatMap(c => c.daysToConvert)
    if (allDays.length === 0) return 0
    return allDays.reduce((sum, d) => sum + d, 0) / allDays.length
  }

  private analyzeBestPublishingDays(): { day: string; avgSales: number }[] {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayStats = new Map<string, { totalSales: number; count: number }>()

    // Inicializar
    dayNames.forEach(day => dayStats.set(day, { totalSales: 0, count: 0 }))

    // Calcular ventas promedio por día de publicación
    this.videos.forEach(video => {
      const dayIndex = new Date(video.date).getDay()
      const dayName = dayNames[dayIndex]
      
      const windowEnd = new Date(video.date)
      windowEnd.setDate(windowEnd.getDate() + 7)
      
      const salesInWindow = this.sales.filter(sale => {
        const saleDate = new Date(sale.orderDate)
        return saleDate >= video.date && saleDate <= windowEnd
      }).length

      const current = dayStats.get(dayName)!
      dayStats.set(dayName, {
        totalSales: current.totalSales + salesInWindow,
        count: current.count + 1,
      })
    })

    return Array.from(dayStats.entries())
      .map(([day, stats]) => ({
        day,
        avgSales: stats.count > 0 ? stats.totalSales / stats.count : 0,
      }))
      .sort((a, b) => b.avgSales - a.avgSales)
  }

  private analyzeEngagementVsConversion(correlations: VideoSalesCorrelation[]) {
    const avgEngagement = this.videos.reduce((sum, v) => 
      sum + (v.likes + v.comments + v.shares) / v.views, 0) / this.videos.length
    
    const avgSales = correlations.reduce((sum, c) => sum + c.salesInWindow, 0) / correlations.length

    const highEngagementLowSales = correlations
      .filter(c => {
        const engagement = (c.video.likes + c.video.comments + c.video.shares) / c.video.views
        return engagement > avgEngagement && c.salesInWindow < avgSales
      })
      .map(c => c.video)
      .slice(0, 5)

    const highSalesLowEngagement = correlations
      .filter(c => {
        const engagement = (c.video.likes + c.video.comments + c.video.shares) / c.video.views
        return engagement < avgEngagement && c.salesInWindow > avgSales
      })
      .map(c => c.video)
      .slice(0, 5)

    return {
      highEngagementLowSales,
      highSalesLowEngagement,
    }
  }

  private generateRecommendations(
    correlations: VideoSalesCorrelation[],
    publishingDays: { day: string; avgSales: number }[]
  ): string[] {
    const recommendations: string[] = []

    // Mejor día para publicar
    const bestDay = publishingDays[0]
    if (bestDay && bestDay.avgSales > 0) {
      recommendations.push(
        `📅 Publica en ${bestDay.day} - genera ${bestDay.avgSales.toFixed(1)} ventas promedio por video`
      )
    }

    // Videos con mejor conversión
    const topVideo = correlations[0]
    if (topVideo && topVideo.salesInWindow > 0) {
      recommendations.push(
        `🎯 Replica el estilo del video #${topVideo.video.ranking} - generó ${topVideo.salesInWindow} ventas`
      )
    }

    // Ventana de conversión
    const avgWindow = this.calculateAverageConversionWindow(correlations)
    if (avgWindow > 0) {
      recommendations.push(
        `⏰ Las conversiones ocurren ~${avgWindow.toFixed(1)} días después del video`
      )
    }

    // Engagement vs conversión
    const highEngagementVideos = correlations.filter(c => c.video.likes > 500)
    if (highEngagementVideos.length > 0) {
      const avgSalesHighEngagement = highEngagementVideos.reduce((s, c) => s + c.salesInWindow, 0) / highEngagementVideos.length
      recommendations.push(
        `💡 Videos con +500 likes generan ${avgSalesHighEngagement.toFixed(1)} ventas promedio`
      )
    }

    return recommendations
  }
}
