export enum SentimentLabel {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral'
}

export enum Platform {
  TWITTER = 'Twitter',
  REDDIT = 'Reddit',
  FACEBOOK = 'Facebook',
  LINKEDIN = 'LinkedIn'
}

export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  content: string;
  platform: Platform;
  timestamp: string; // ISO string
  sentimentScore: number; // -1 to 1
  sentimentLabel: SentimentLabel;
  likes: number;
}

export interface SentimentStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
}

export interface ChartDataPoint {
  time: string;
  score: number;
  volume: number;
}