export interface SalesData {
  orderId: string
  orderNumber: string
  orderDate: Date
  paidDate: Date
  status: string
  orderTotal: number
  productName: string
  productId: string
  quantity: number
  
  // UTM Attribution
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  sourceType: 'utm' | 'typein' | 'organic' | 'referral' | 'unknown'
  
  // Device & Location
  deviceType: 'Mobile' | 'Desktop' | 'unknown'
  shippingState: string
  shippingCountry: string
  
  // Payment
  paymentMethod: string
  
  // Customer
  customerEmail: string
  customerIp: string
}

export interface CollaboratorStats {
  name: string
  sales: number
  revenue: number
  percentage: number
}

export interface DailySales {
  date: string
  count: number
  revenue: number
}

export interface TrafficSource {
  source: string
  count: number
  percentage: number
}

export interface ProductStats {
  name: string
  count: number
  revenue: number
}

export interface MonthlyMetrics {
  totalSales: number
  totalRevenue: number
  avgConversion: number
  newCustomers: number
  returningCustomers: number
  
  // Comparativa mes anterior
  salesGrowth: number
  revenueGrowth: number
}
