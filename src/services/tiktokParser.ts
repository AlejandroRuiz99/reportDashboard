import type { TikTokVideo } from '@/types/tiktok'

export class TikTokParser {
  /**
   * Parsea el CSV de TikTok Analytics
   * Formato especial: títulos multi-línea
   */
  parse(csvContent: string): TikTokVideo[] {
    const lines = csvContent.split('\n')
    const videos: TikTokVideo[] = []
    
    let i = 1 // Saltar header
    while (i < lines.length) {
      const line = lines[i].trim()
      
      if (!line) {
        i++
        continue
      }

      // Buscar línea que empiece con número (ranking)
      const match = line.match(/^(\d+),(.*)/)
      if (!match) {
        i++
        continue
      }

      const ranking = parseInt(match[1])
      let titleLines: string[] = []
      let currentLine = match[2]
      
      // Acumular título hasta encontrar la fecha
      while (!this.hasDateAtEnd(currentLine) && i < lines.length - 1) {
        titleLines.push(currentLine)
        i++
        currentLine = lines[i].trim()
      }
      
      // La última línea tiene: título,fecha,vistas,likes,comentarios,compartidos,score,url
      const parts = currentLine.split(',')
      if (parts.length >= 8) {
        // El título puede estar en parts[0] o necesitar ser concatenado
        const titlePart = parts.slice(0, parts.length - 7).join(',')
        titleLines.push(titlePart)
        
        const fullTitle = titleLines.join('\n').trim()
        const dateStr = parts[parts.length - 7]
        const views = parseInt(parts[parts.length - 6]) || 0
        const likes = parseInt(parts[parts.length - 5]) || 0
        const comments = parseInt(parts[parts.length - 4]) || 0
        const shares = parseInt(parts[parts.length - 3]) || 0
        const score = parseInt(parts[parts.length - 2]) || 0
        const url = parts[parts.length - 1]

        videos.push({
          ranking,
          title: fullTitle,
          date: this.parseDate(dateStr),
          views,
          likes,
          comments,
          shares,
          score,
          url,
        })
      }
      
      i++
    }

    return videos
  }

  private hasDateAtEnd(line: string): boolean {
    // Detectar si la línea termina con formato de fecha DD/MM/YY
    return /\d{2}\/\d{2}\/\d{2}/.test(line)
  }

  private parseDate(dateStr: string): Date {
    // Formato: DD/MM/YY
    const [day, month, year] = dateStr.split('/')
    return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
  }
}
