import Papa from 'papaparse'
import type { SalesData } from '@/types/sales'

interface WooCommerceRow {
  order_id: string
  order_date: string
  status: string
  order_total: string
  'Product Item 1 Name': string
  'Product Item 1 Quantity': string
  'meta:_wc_order_attribution_utm_source': string
  'meta:_wc_order_attribution_utm_medium': string
  'meta:_wc_order_attribution_utm_campaign': string
  'meta:_wc_order_attribution_source_type': string
  'meta:_wc_order_attribution_device_type': string
  shipping_state: string
  shipping_country: string
  payment_method_title: string
  customer_email: string
}

export function parseWooCommerceCSV(file: File): Promise<SalesData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<WooCommerceRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const salesData: SalesData[] = results.data.map((row) => ({
            orderId:         row.order_id || '',
            orderDate:       new Date(row.order_date),
            status:          row.status || '',
            orderTotal:      parseFloat(row.order_total) || 0,
            productName:     row['Product Item 1 Name'] || '',
            quantity:        parseInt(row['Product Item 1 Quantity']) || 1,
            utmSource:       normalizeCollaborator(row['meta:_wc_order_attribution_utm_source']),
            utmMedium:       row['meta:_wc_order_attribution_utm_medium'] || null,
            utmCampaign:     row['meta:_wc_order_attribution_utm_campaign'] || null,
            sourceType:      parseSourceType(row['meta:_wc_order_attribution_source_type']),
            deviceType:      parseDeviceType(row['meta:_wc_order_attribution_device_type']),
            shippingState:   row.shipping_state || '',
            shippingCountry: row.shipping_country || '',
            paymentMethod:   row.payment_method_title || '',
            customerEmail:   row.customer_email || '',
          }))

          // Filtrar solo pedidos completados
          const completedSales = salesData.filter(
            sale => sale.status === 'completed' && sale.orderTotal > 0
          )

          resolve(completedSales)
        } catch (error) {
          reject(new Error(`Error al procesar CSV: ${error}`))
        }
      },
      error: (error) => {
        reject(new Error(`Error al leer CSV: ${error.message}`))
      },
    })
  })
}

function normalizeCollaborator(source: string | null): string | null {
  if (!source) return null
  
  const normalized = source.toLowerCase()
  
  // Normalizar variaciones de nombres
  if (normalized.includes('margareth') || normalized.includes('margare')) {
    return 'Margareth'
  }
  if (normalized.includes('inma')) {
    return 'Inma'
  }
  if (normalized.includes('mariajose') || normalized.includes('maria') || normalized.includes('jose')) {
    return 'María José'
  }
  if (normalized === 'google' || normalized === '(direct)') {
    return source
  }
  
  return source
}

function parseSourceType(type: string): SalesData['sourceType'] {
  const normalized = type?.toLowerCase() || ''
  
  if (normalized === 'utm') return 'utm'
  if (normalized === 'typein') return 'typein'
  if (normalized === 'organic') return 'organic'
  if (normalized === 'referral') return 'referral'
  
  return 'unknown'
}

function parseDeviceType(device: string): SalesData['deviceType'] {
  const normalized = device?.toLowerCase() || ''
  
  if (normalized === 'mobile') return 'Mobile'
  if (normalized === 'desktop') return 'Desktop'
  
  return 'unknown'
}
