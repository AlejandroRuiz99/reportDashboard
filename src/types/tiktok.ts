export interface TikTokVideo {
  ranking: number
  title: string
  date: Date
  views: number
  likes: number
  comments: number
  shares: number
  score: number
  url: string
}

export interface VideoSalesCorrelation {
  video: TikTokVideo
  salesInWindow: number
  revenueInWindow: number
  conversionRate: number
  daysToConvert: number[]
  impactScore: number
}

export interface TikTokInsights {
  topConvertingVideos: VideoSalesCorrelation[]
  averageConversionWindow: number
  bestPublishingDays: { day: string; avgSales: number }[]
  engagementVsConversion: {
    highEngagementLowSales: TikTokVideo[]
    highSalesLowEngagement: TikTokVideo[]
  }
  recommendations: string[]
}
