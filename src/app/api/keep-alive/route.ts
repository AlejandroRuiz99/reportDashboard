import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      rows: count,
    })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
