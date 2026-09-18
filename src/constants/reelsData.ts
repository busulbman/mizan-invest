import { LocalVideoKey, Images } from './images';
import { CityId } from './mockData';

export interface Reel {
  id: string;
  videoKey: LocalVideoKey;
  propertyId: string;
  partnerId: string;
  cityId: CityId;
  title: string;
  caption: string;
  poster: string;
  likeCount: string;
  publishedAt: string;
  instagramUrl?: string;
}

// The feed deliberately contains only these bundled, real-estate demo clips.
// Keep this order stable: Madinah → land → Dubai → villa tour.
const DEMO_REELS: Reel[] = [
  {
    id: 'reel-madinah',
    videoKey: 'madinah',
    propertyId: '2',
    partnerId: 'p1',
    cityId: 'madinah',
    title: 'Современная резиденция в Медине',
    caption: 'Премиальная резиденция с приватным садом и продуманной инвестиционной моделью.',
    poster: Images.properties.madinah1,
    likeCount: '2,4 тыс.',
    publishedAt: '12 июн. 2026',
    instagramUrl: 'https://www.instagram.com/reel/DafiaVOt9bs/?igsh=Z3g1bWN1ZDZnN3My',
  },
  {
    id: 'reel-land',
    videoKey: 'land',
    propertyId: '9',
    partnerId: 'p2',
    cityId: 'riyadh',
    title: 'Инвестиционный земельный участок',
    caption: 'Участок в растущем районе с перспективой развития инфраструктуры.',
    poster: Images.properties.land1,
    likeCount: '1,8 тыс.',
    publishedAt: '8 июн. 2026',
  },
  {
    id: 'reel-dubai',
    videoKey: 'dubai',
    propertyId: '21',
    partnerId: 'p5',
    cityId: 'dubai',
    title: 'Премиальная недвижимость в Дубае',
    caption: 'Современный проект для международного инвестиционного портфеля.',
    poster: Images.properties.penthouse1,
    likeCount: '3,1 тыс.',
    publishedAt: '3 июн. 2026',
  },
  {
    id: 'property-tour',
    videoKey: 'propertyTour',
    propertyId: '3',
    partnerId: 'p1',
    cityId: 'madinah',
    title: 'Полный обзор виллы',
    caption: 'Детальный тур по пространствам, отделке и приватной территории виллы.',
    poster: Images.properties.villa1,
    likeCount: '1,2 тыс.',
    publishedAt: '28 мая 2026',
  },
];

/**
 * The Reels feed.
 *
 * PRE-TESTFLIGHT: cut to the first demo clip only. The remaining entries are
 * kept above rather than deleted so the full demo set is one number away when
 * real partner reels replace it — restoring the feed is a slice change, not a
 * data re-entry job.
 *
 * This is a mock/demo layer and nothing else: Reels does not read Supabase, so
 * narrowing it touches no production row, no storage object and no
 * property_media record.
 */
export const reels: Reel[] = DEMO_REELS.slice(0, 1);
