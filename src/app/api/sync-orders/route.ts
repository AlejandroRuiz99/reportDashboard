import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const WC_API_URL       = process.env.WC_API_URL || ''
const WC_CONSUMER_KEY  = process.env.WC_CONSUMER_KEY || ''
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || ''
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface WCOrder {
  id: number
  number: string
  date_created: string
  status: string
  total: string
  line_items: Array<{ name: string; quantity: number }>
  meta_data: Array<{ key: string; value: string }>
  customer_note: string
  billing: { email: string }
  shipping: { state: string; country: string }
  payment_method_title: string
}

function getWCMeta(order: WCOrder, key: string): string {
  return order.meta_data?.find(m => m.key === key)?.value || ''
}

function mapWCOrderToRow(order: WCOrder) {
  return {
    order_id:         String(order.id),
    order_date:       order.date_created,
    status:           order.status,
    order_total:      parseFloat(order.total) || 0,
    product_name:     order.line_items?.[0]?.name || 'Consulta',
    product_quantity: order.line_items?.[0]?.quantity || 1,
    utm_source:       getWCMeta(order, '_wc_order_attribution_utm_source') || null,
    source_type:      getWCMeta(order, '_wc_order_attribution_source_type') || null,
    device_type:      getWCMeta(order, '_wc_order_attribution_device_type') || null,
    customer_user:    order.billing?.email || '',
    shipping_state:   order.shipping?.state || '',
    shipping_country: order.shipping?.country || 'ES',
    payment_method:   order.payment_method_title || '',
  }
}

async function fetchWCOrders(afterDate: string | null): Promise<WCOrder[]> {
  const allOrders: WCOrder[] = []
  let page = 1

  while (true) {
    const params = new URLSearchParams({
      status:   'completed',
      per_page: '100',
      page:     String(page),
      orderby:  'date',
      order:    'asc',
    })
    if (afterDate) params.set('after', afterDate)

    const url = `${WC_API_URL}/wp-json/wc/v3/orders?${params.toString()}`
    // #region agent log
    fetch('http://127.0.0.1:7415/ingest/a658ce3c-574b-44ca-9490-92d66d36c3bf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7710af'},body:JSON.stringify({sessionId:'7710af',location:'sync-orders/route.ts:63',message:'WC request URL',data:{url:url.replace(WC_CONSUMER_KEY,'ck_***').replace(WC_CONSUMER_SECRET,'cs_***'),hasKey:!!WC_CONSUMER_KEY,hasSecret:!!WC_CONSUMER_SECRET,keyPrefix:WC_CONSUMER_KEY.slice(0,6),apiUrl:WC_API_URL},timestamp:Date.now(),hypothesisId:'H-D'})}).catch(()=>{});
    // #endregion
    const basicAuth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
      },
    })

    const contentType = res.headers.get('content-type') || ''
    const resBody = await res.text()
    // #region agent log
    fetch('http://127.0.0.1:7415/ingest/a658ce3c-574b-44ca-9490-92d66d36c3bf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7710af'},body:JSON.stringify({sessionId:'7710af',location:'sync-orders/route.ts:72',message:'WC response',data:{status:res.status,contentType,bodyPreview:resBody.slice(0,500),headers:Object.fromEntries(res.headers.entries())},timestamp:Date.now(),hypothesisId:'H-B,H-C'})}).catch(()=>{});
    // #endregion

    if (!contentType.includes('application/json')) {
      throw new Error(`WooCommerce devolvio HTML (status ${res.status}). Comprueba que la REST API esta activa y las credenciales son correctas. Respuesta: ${resBody.slice(0, 200)}`)
    }

    if (!res.ok) {
      let json: any = {}
      try { json = JSON.parse(resBody) } catch {}
      throw new Error(`WooCommerce API error ${res.status}: ${json.message || resBody.slice(0, 200)}`)
    }

    const orders: WCOrder[] = JSON.parse(resBody)
    if (orders.length === 0) break

    allOrders.push(...orders)

    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1')
    if (page >= totalPages) break
    page++
  }

  return allOrders
}

export async function POST() {
  if (!WC_API_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Variables de WooCommerce no configuradas' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Obtener la fecha del ultimo pedido en Supabase
    const { data: latest } = await supabase
      .from('orders')
      .select('order_date')
      .order('order_date', { ascending: false })
      .limit(1)
      .single()

    const afterDate = latest?.order_date ?? null

    // Descargar pedidos nuevos desde WooCommerce
    const wcOrders = await fetchWCOrders(afterDate)

    if (wcOrders.length === 0) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        message: 'No hay pedidos nuevos',
        lastDate: afterDate,
      })
    }

    // Upsert en Supabase
    const rows = wcOrders.map(mapWCOrderToRow)
    const { error, count } = await supabase
      .from('orders')
      .upsert(rows, { onConflict: 'order_id', count: 'exact' })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      inserted: count ?? rows.length,
      lastDate: rows[rows.length - 1].order_date,
      message: `Se importaron ${count ?? rows.length} pedidos`,
    })
  } catch (err: any) {
    console.error('[sync-orders]', err)
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
