// Safari AI — useSafariChat hook
// Manages the full conversation state and orchestrates intent detection + card building.

import { useState, useCallback, useRef } from 'react';
import { detectIntent } from '../lib/intentDetector';
import { buildPayloadsForIntent, buildDestinationPayloads, CardPayload } from '../lib/cardPayloadBuilder';
import { attractionService, Attraction } from '../services/attraction.service';
import { recommendationService } from '../services/recommendation.service';

export type MessageRole = 'user' | 'safari';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  cards?: CardPayload[];
  timestamp: Date;
}

export type Theme = 'dark' | 'light';

interface UseSafariChatReturn {
  messages: ChatMessage[];
  isTyping: boolean;
  theme: Theme;
  isOnboarded: boolean;
  sendMessage: (text: string) => Promise<void>;
  sendImageSearch: (file: File) => Promise<void>;
  injectCards: (cards: CardPayload[], text: string) => void;
  toggleTheme: () => void;
  completeOnboarding: (prefs: OnboardingPrefs) => Promise<void>;
}

export interface OnboardingPrefs {
  travelType: string;
  budget: string;
  groupType: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'safari',
  text: 'Bonjour ! Je suis **Safari** 🌍 — votre compagnon intelligent pour explorer le Maroc. Que souhaitez-vous découvrir aujourd\'hui ? Une plage, un riad, une aventure dans l\'Atlas ?',
  timestamp: new Date(),
};

const SAFARI_RESPONSES: Record<string, string> = {
  greeting: 'Bonjour ! Comment puis-je vous aider à explorer le Maroc aujourd\'hui ? 🌴',
  destination: 'Voici quelques destinations qui pourraient vous enchanter ✨',
  guide: 'J\'ai trouvé des guides experts pour accompagner votre aventure 🧭',
  driver: 'Voici des chauffeurs disponibles près de vous 🚗',
  restaurant: 'Des tables exceptionnelles vous attendent 🍽️',
  itinerary: 'J\'ai préparé un itinéraire personnalisé pour vous 📅',
  activity: 'Des expériences uniques à vivre au Maroc 🎈',
  recommendation: 'Basé sur vos préférences, voici mes recommandations ✨',
  unknown: 'Je suis là pour vous aider à découvrir le Maroc ! Posez-moi une question sur les destinations, guides, activités, restaurants ou transports.',
};

let msgCounter = 0;
function genId() {
  return `msg-${Date.now()}-${msgCounter++}`;
}

/** Resolve global CSV indices for a subset of attractions */
function resolveGlobalIndices(subset: Attraction[], allAttractions: Attraction[]): number[] {
  return subset.map((attr) => {
    const idx = allAttractions.findIndex(
      (a) => a.attraction_name === attr.attraction_name && a.address === attr.address
    );
    return idx >= 0 ? idx : 0;
  });
}

export function useSafariChat(): UseSafariChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('safari_onboarding') !== null ||
      localStorage.getItem('onboarding_completed') === 'true';
  });
  const attractionsRef = useRef<Attraction[]>([]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    appendMessage(userMsg);
    setIsTyping(true);

    try {
      // Load attractions if not cached
      if (attractionsRef.current.length === 0) {
        attractionsRef.current = await attractionService.getAttractions();
      }

      const intent = detectIntent(text);

      // Simulate small thinking delay (200–700ms)
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));

      // Filter attractions by keywords if any
      let relevantAttractions = attractionsRef.current;
      if (intent.keywords.length > 0 || intent.location) {
        const searchTerm = [...intent.keywords, intent.location || ''].join(' ').trim();
        if (searchTerm) {
          const filtered = await attractionService.searchAttractions(searchTerm);
          if (filtered.length > 0) relevantAttractions = filtered;
        }
      }

      // Compute global indices for navigation
      const globalIndices = resolveGlobalIndices(relevantAttractions, attractionsRef.current);

      // Build card payloads with indices
      let cards: CardPayload[];
      if (intent.type === 'destination' || intent.type === 'recommendation') {
        cards = buildDestinationPayloads(relevantAttractions, 3, undefined, globalIndices);
      } else {
        cards = buildPayloadsForIntent(intent.type, relevantAttractions);
      }

      const responseText = SAFARI_RESPONSES[intent.type] || SAFARI_RESPONSES.unknown;

      const safariMsg: ChatMessage = {
        id: genId(),
        role: 'safari',
        text: responseText,
        cards: cards.length > 0 ? cards : undefined,
        timestamp: new Date(),
      };
      appendMessage(safariMsg);
    } catch (err) {
      console.error('Safari chat error:', err);
      appendMessage({
        id: genId(),
        role: 'safari',
        text: 'Désolé, une erreur est survenue. Veuillez réessayer ! 🙏',
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  }, [appendMessage]);

  const sendImageSearch = useCallback(async (file: File) => {
    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      text: '📷 Recherche par image...',
      timestamp: new Date(),
    };
    appendMessage(userMsg);
    setIsTyping(true);

    try {
      // Call the exact same API as AttractionsPage
      const response = await recommendationService.searchByImage(file);
      console.log("Safari image search response:", response);

      if (attractionsRef.current.length === 0) {
        attractionsRef.current = await attractionService.getAttractions();
      }
      const allAttractions = attractionsRef.current;

      if (response.success && response.results) {
        // Get user ratings from onboarding (same as AttractionsPage)
        const onboardingData = localStorage.getItem('onboarding_ratings');
        const userRatings: { attractionId: string, rating: number }[] = onboardingData ? JSON.parse(onboardingData) : [];
        const ratingsMap = new Map(userRatings.map(r => [r.attractionId, r.rating]));

        // Match attractions by name — same logic as AttractionsPage
        const matchedAttractions = response.results.map((match: any) => {
          if (!match.name) return null;

          const cleanMatchName = match.name.replace(/ Marrakech Marrakech Safi$/i, '').trim();

          const found = allAttractions.find(a => {
            const attrName = a.attraction_name?.toLowerCase();
            const searchName = cleanMatchName.toLowerCase();
            if (!attrName) return false;

            return attrName === searchName ||
                   attrName.includes(searchName) ||
                   searchName.includes(attrName);
          });

          if (found) {
            const attractionId = (found as any).id || found.attraction_name;
            const userRating = ratingsMap.get(attractionId) || 0;
            return { ...found, userRating };
          }
          return null;
        }).filter(Boolean) as (Attraction & { userRating: number })[];

        // Sort by user rating first, then by original order (similarity)
        const sortedAttractions = [...matchedAttractions].sort((a, b) => {
          if (b.userRating !== a.userRating) {
            return b.userRating - a.userRating;
          }
          return 0;
        });

        const matched = sortedAttractions.length > 0 ? sortedAttractions : allAttractions.slice(0, 3);
        const globalIndices = resolveGlobalIndices(matched, allAttractions);
        const cards = buildDestinationPayloads(matched, Math.min(matched.length, 5), undefined, globalIndices);

        appendMessage({
          id: genId(),
          role: 'safari',
          text: `📸 J'ai trouvé **${matched.length}** destination${matched.length > 1 ? 's' : ''} similaires à votre photo ✨`,
          cards,
          timestamp: new Date(),
        });
      } else if ((response as any).error) {
        throw new Error((response as any).error);
      } else {
        appendMessage({
          id: genId(),
          role: 'safari',
          text: 'Aucun résultat trouvé pour cette image. Essayez avec une autre photo ! 📷',
          timestamp: new Date(),
        });
      }
    } catch (err: any) {
      console.error('Image search failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erreur inconnue';
      appendMessage({
        id: genId(),
        role: 'safari',
        text: `❌ La recherche par image a échoué : ${errorMessage}`,
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  }, [appendMessage]);

  const injectCards = useCallback((cards: CardPayload[], text: string) => {
    appendMessage({
      id: genId(),
      role: 'safari',
      text,
      cards,
      timestamp: new Date(),
    });
  }, [appendMessage]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const completeOnboarding = useCallback(async (prefs: OnboardingPrefs) => {
    localStorage.setItem('safari_onboarding', JSON.stringify(prefs));

    appendMessage({
      id: genId(),
      role: 'safari',
      text: `Parfait ! Basé sur votre profil **${prefs.travelType}** avec un budget **${prefs.budget}**, voici mes premières recommandations pour vous 🎯`,
      timestamp: new Date(),
    });
    setIsTyping(true);
    try {
      const response = await recommendationService.getColdStartRecommendations(6);
      if (attractionsRef.current.length === 0) {
        attractionsRef.current = await attractionService.getAttractions();
      }
      let recs = attractionsRef.current.slice(0, 3);
      if (response.recommendations && response.recommendations.length > 0) {
        const found = response.recommendations
          .map((item: any) => {
            const cleanName = (item.details?.name || item.name || '').replace(/ Marrakech Marrakech Safi$/i, '').trim().toLowerCase();
            return attractionsRef.current.find((a) => {
              const n = (a.attraction_name || '').toLowerCase();
              return n === cleanName || n.includes(cleanName) || cleanName.includes(n);
            });
          })
          .filter(Boolean);
        if (found.length > 0) recs = found as Attraction[];
      }

      const globalIndices = resolveGlobalIndices(recs, attractionsRef.current);
      const cards = buildDestinationPayloads(recs, 3, undefined, globalIndices);

      appendMessage({
        id: genId(),
        role: 'safari',
        text: '✨ Recommandations personnalisées pour vous :',
        cards,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Onboarding recommendation error:', err);
    } finally {
      setIsTyping(false);
    }
  }, [appendMessage]);

  return {
    messages,
    isTyping,
    theme,
    isOnboarded,
    sendMessage,
    sendImageSearch,
    injectCards,
    toggleTheme,
    completeOnboarding,
  };
}
