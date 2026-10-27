export interface Product {
  id: string;
  nameBn: string;
  nameEn: string;
  sellingPrice: number;
  regularPrice?: number;
  imageUrl?: string;
  images?: Array<{ url: string }>;
  descriptionEn?: string;
  descriptionBn?: string;
  category?: string;
  brand?: string;
}

export interface CampaignToVideoData {
  posterUrl: string;
  aspectRatio: '1:1' | '4:5';
  generatedPosterUrls?: string[];
  productTitle?: string;
  sellingPrice?: number;
  regularPrice?: number;
  brandName?: string;
  brandTagline?: string;
  customLogoUrl?: string | null;
  offerTitle?: string;
  allImages?: string[];
}

export interface RenderedVideoCampaign {
  id: string;
  title: string;
  durationLabel: string;
  durationSeconds: number;
  resolution: string;
  fps: number;
  aspectRatio: '9:16' | '4:5';
  videoBlobUrl: string;
  thumbnailUrl: string;
}

export type MusicGenre = 'upbeat_pop' | 'luxury_chill' | 'viral_reels' | 'soft_acoustic' | 'custom' | 'none';
