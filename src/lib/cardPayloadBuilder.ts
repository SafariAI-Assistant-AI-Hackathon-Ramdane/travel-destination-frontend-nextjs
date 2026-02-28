// Safari AI — Card Payload Builder
// Transforms Attraction[] from existing services into card-specific payloads.

import { Attraction } from '../services/attraction.service';
import { IntentType } from './intentDetector';

export interface DestinationPayload {
  id: string;
  attractionIndex: number; // index in the CSV array — used for router.push("/attraction/:id")
  name: string;
  type: string;
  rating: number;
  reviewCount: number;
  address: string;
  imageUrl: string;
  matchScore: number;
  price?: string;
}

export interface GuidePayload {
  id: string;
  name: string;
  languages: string[];
  speciality: string;
  pricePerDay: number;
  rating: number;
  imageUrl: string;
}

export interface DriverPayload {
  id: string;
  name: string;
  vehicle: string;
  distanceKm: number;
  etaMinutes: number;
  pricePerKm: number;
  rating: number;
  imageUrl: string;
}

export interface RestaurantPayload {
  id: string;
  name: string;
  cuisine: string;
  distanceKm: number;
  rating: number;
  imageUrl: string;
  address: string;
}

export interface ItineraryPayload {
  days: { day: number; title: string; activities: string[] }[];
  totalBudget: string;
  destinations: string[];
}

export interface ActivityPayload {
  id: string;
  name: string;
  duration: string;
  price: number;
  availabilities: string[];
  rating: number;
  imageUrl: string;
}

export type CardPayload =
  | { type: 'destination'; data: DestinationPayload }
  | { type: 'guide'; data: GuidePayload }
  | { type: 'driver'; data: DriverPayload }
  | { type: 'restaurant'; data: RestaurantPayload }
  | { type: 'itinerary'; data: ItineraryPayload }
  | { type: 'activity'; data: ActivityPayload };

// ─── helpers ──────────────────────────────────────────────────────────────────

function getFolderName(name: string): string {
  return name ? name.replace(/[^\w\s-]/g, '').trim() : '';
}

function getFirstImageFilename(imagesStr: string): string {
  if (!imagesStr || imagesStr === '[]') return '';
  const match = imagesStr.match(/'([^']+)'/);
  if (match) return match[1].trim();
  const matchDouble = imagesStr.match(/"([^"]+)"/);
  if (matchDouble) return matchDouble[1].trim();
  return '';
}

export function buildAttractionImageUrl(attraction: Attraction): string {
  const folder = getFolderName(attraction.attraction_name);
  const filename = getFirstImageFilename(attraction.images_list || '');
  if (filename) {
    return `/data/attractions_images/${encodeURIComponent(folder)}/${filename}`;
  }
  const slug = (attraction.attraction_name || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
  return `/data/attractions_images/${encodeURIComponent(folder)}/${slug}01.jpg`;
}

function computeMatchScore(attraction: Attraction, userPrefs?: any): number {
  // Simple heuristic: prioritize highly-rated attractions
  const ratingScore = Math.min((parseFloat(attraction.rating || '0') / 5) * 0.6, 0.6);
  const reviewBoost = Math.min((parseInt(attraction.review_count || '0') / 5000) * 0.3, 0.3);
  const randomVariance = Math.random() * 0.1;
  return Math.round((ratingScore + reviewBoost + randomVariance) * 100);
}

// ─── builders ─────────────────────────────────────────────────────────────────

export function buildDestinationPayloads(
  attractions: Attraction[],
  limit = 3,
  userPrefs?: any,
  /** Global CSV indices — if provided, used for card navigation */
  globalIndices?: number[]
): CardPayload[] {
  return attractions.slice(0, limit).map((attr, i) => ({
    type: 'destination' as const,
    data: {
      id: String(i),
      attractionIndex: globalIndices ? globalIndices[i] : i,
      name: attr.attraction_name || 'Destination',
      type: attr.attraction_type || 'Attraction',
      rating: parseFloat(attr.rating || '0'),
      reviewCount: parseInt(attr.review_count || '0'),
      address: attr.address || 'Marrakech',
      imageUrl: buildAttractionImageUrl(attr),
      matchScore: computeMatchScore(attr, userPrefs),
      price: attr.price || undefined,
    },
  }));
}

// Simulate guide payloads from attraction data (guides not in dataset)
const MOCK_GUIDES: GuidePayload[] = [
  { id: 'g1', name: 'Youssef El Fassi', languages: ['FR', 'EN', 'AR'], speciality: 'Médina & Souks', pricePerDay: 350, rating: 4.9, imageUrl: '/data/guide1.jpg' },
  { id: 'g2', name: 'Salma Nachit', languages: ['FR', 'ES', 'AR'], speciality: 'Gastronomie & Culture', pricePerDay: 280, rating: 4.7, imageUrl: '/data/guide2.jpg' },
  { id: 'g3', name: 'Hassan Belmekki', languages: ['EN', 'AR'], speciality: 'Atlas & Treks', pricePerDay: 400, rating: 4.8, imageUrl: '/data/guide3.jpg' },
];

export function buildGuidePayloads(limit = 2): CardPayload[] {
  return MOCK_GUIDES.slice(0, limit).map((g) => ({
    type: 'guide' as const,
    data: g,
  }));
}

const MOCK_DRIVERS: DriverPayload[] = [
  { id: 'd1', name: 'Omar Regragui', vehicle: 'Mercedes Classe E', distanceKm: 1.2, etaMinutes: 4, pricePerKm: 8, rating: 4.8, imageUrl: '/data/driver1.jpg' },
  { id: 'd2', name: 'Rachid Lamrani', vehicle: 'Toyota Prado', distanceKm: 2.5, etaMinutes: 9, pricePerKm: 7, rating: 4.6, imageUrl: '/data/driver2.jpg' },
];

export function buildDriverPayloads(limit = 2): CardPayload[] {
  return MOCK_DRIVERS.slice(0, limit).map((d) => ({
    type: 'driver' as const,
    data: d,
  }));
}

const MOCK_RESTAURANTS: RestaurantPayload[] = [
  { id: 'r1', name: 'Le Jardin', cuisine: 'Marocaine moderne', distanceKm: 0.8, rating: 4.7, imageUrl: '/data/restaurant1.jpg', address: 'Médina, Marrakech' },
  { id: 'r2', name: 'Nomad', cuisine: 'Fusion marocaine', distanceKm: 1.1, rating: 4.6, imageUrl: '/data/restaurant2.jpg', address: 'Place des Épices' },
  { id: 'r3', name: 'Café des Épices', cuisine: 'Traditionnel', distanceKm: 0.5, rating: 4.5, imageUrl: '/data/restaurant3.jpg', address: 'Rahba Kedima' },
];

export function buildRestaurantPayloads(limit = 2): CardPayload[] {
  return MOCK_RESTAURANTS.slice(0, limit).map((r) => ({
    type: 'restaurant' as const,
    data: r,
  }));
}

export function buildItineraryPayload(daysCount = 3): CardPayload {
  const days = Array.from({ length: daysCount }, (_, i) => ({
    day: i + 1,
    title: ['Médina & Jemaa el-Fna', 'Atlas & Cascades', 'Palmeraie & Détente'][i % 3],
    activities: [
      'Visite des souks',
      'Déjeuner traditionnel',
      'Musée de Marrakech',
    ],
  }));
  return {
    type: 'itinerary' as const,
    data: {
      days,
      totalBudget: `${daysCount * 800}–${daysCount * 1500} MAD`,
      destinations: ['Marrakech', 'Agafay', 'Atlas'],
    },
  };
}

const MOCK_ACTIVITIES: ActivityPayload[] = [
  { id: 'a1', name: 'Montgolfière au lever du soleil', duration: '1h30', price: 1800, availabilities: ['Demain', 'Après-demain'], rating: 4.9, imageUrl: '/data/activity1.jpg' },
  { id: 'a2', name: 'Quad dans l\'Agafay', duration: '2h', price: 350, availabilities: ['Aujourd\'hui', 'Demain'], rating: 4.7, imageUrl: '/data/activity2.jpg' },
  { id: 'a3', name: 'Cours de cuisine marocaine', duration: '3h', price: 500, availabilities: ['Tous les jours'], rating: 4.8, imageUrl: '/data/activity3.jpg' },
];

export function buildActivityPayloads(limit = 2): CardPayload[] {
  return MOCK_ACTIVITIES.slice(0, limit).map((a) => ({
    type: 'activity' as const,
    data: a,
  }));
}

// ─── orchestrator entry ────────────────────────────────────────────────────────

export function buildPayloadsForIntent(
  intentType: IntentType,
  attractions: Attraction[],
  userPrefs?: any
): CardPayload[] {
  switch (intentType) {
    case 'destination':
    case 'recommendation':
      return buildDestinationPayloads(attractions, 3, userPrefs);
    case 'guide':
      return buildGuidePayloads(2);
    case 'driver':
      return buildDriverPayloads(2);
    case 'restaurant':
      return buildRestaurantPayloads(3);
    case 'itinerary':
      return [buildItineraryPayload(3)];
    case 'activity':
      return buildActivityPayloads(3);
    default:
      return buildDestinationPayloads(attractions, 3, userPrefs);
  }
}
