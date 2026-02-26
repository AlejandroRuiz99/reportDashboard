import { NextRequest, NextResponse } from 'next/server'
import type { TikTokVideo } from '@/types/tiktok'

const TIKTOK_SCRAPER_URL = process.env.TIKTOK_SCRAPER_URL || 'https://tiktok-scraper-ebon.vercel.app'

/** Convierte respuesta del tiktokScraper al formato TikTokVideo del dashboard */
function mapScraperVideoToTikTokVideo(item: {
  id: string
  url: string
  title: string
  publishedAt: string
  views: number
  likes: number
  comments: number
  shares: number
  score: number
  rank?: number
}): TikTokVideo {
  return {
    ranking: item.rank ?? 0,
    title: item.title || 'Sin título',
    date: new Date(item.publishedAt),
    views: item.views || 0,
    likes: item.likes || 0,
    comments: item.comments || 0,
    shares: item.shares || 0,
    score: item.score || 0,
    url: item.url || '',
  }
}

/**
 * GET /api/tiktok-videos?username=xxx&month=1&year=2026
 * Obtiene videos del perfil de TikTok para el mes indicado llamando al tiktokScraper.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')?.trim()
  const monthParam = searchParams.get('month')
  const yearParam = searchParams.get('year')

  if (!username || username.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Falta el parámetro username' },
      { status: 400 }
    )
  }

  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()
  const month1Based = monthParam ? parseInt(monthParam, 10) : new Date().getMonth() + 1
  if (isNaN(year) || isNaN(month1Based) || month1Based < 1 || month1Based > 12) {
    return NextResponse.json(
      { ok: false, error: 'Parámetros month (1-12) y year inválidos' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(`${TIKTOK_SCRAPER_URL}/api/scrape-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        dateFilter: {
          type: 'month',
          month: month1Based - 1,
          year,
        },
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: json.message || json.error || 'Error al obtener videos de TikTok' },
        { status: res.status }
      )
    }

    if (!json.success || !Array.isArray(json.data)) {
      return NextResponse.json(
        { ok: false, error: 'La API de TikTok no devolvió datos válidos' },
        { status: 502 }
      )
    }

    const videos: TikTokVideo[] = json.data.map(mapScraperVideoToTikTokVideo)

    return NextResponse.json({ ok: true, videos })
  } catch (err: any) {
    console.error('[tiktok-videos]', err)
    return NextResponse.json(
      { ok: false, error: err.message || 'Error de conexión con el scraper de TikTok' },
      { status: 500 }
    )
  }
}
