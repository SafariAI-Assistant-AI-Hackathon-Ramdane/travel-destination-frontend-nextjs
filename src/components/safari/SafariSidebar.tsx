import React, { useState, useRef } from 'react';
import './SafariSidebar.css';
import { recommendationService } from '../../services/recommendation.service';
import { attractionService, Attraction } from '../../services/attraction.service';
import { authService } from '../../services/auth.service';
import { buildDestinationPayloads, CardPayload } from '../../lib/cardPayloadBuilder';
import { Search, Camera, Users, Star, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import QuickQuestions from '../QuickQuestions';

type Lang = 'fr' | 'en' | 'ar';

interface SafariSidebarProps {
  onInjectCards: (cards: CardPayload[], text: string) => void;
  onSendMessage?: (text: string) => void;
  lang: Lang;
  isVisible?: boolean;
}

const T: Record<string, Record<Lang, string>> = {
  title: { fr: 'Safari', en: 'Safari', ar: 'سفاري' },
  subtitle: { fr: 'Votre compagnon Maroc', en: 'Your Morocco companion', ar: 'رفيقك المغربي' },
  reco: { fr: 'Mes Recommandations', en: 'My Recommendations', ar: 'توصياتي' },
  search: { fr: 'Recherche par titre', en: 'Search by title', ar: 'البحث بالعنوان' },
  image: { fr: 'Recherche par image', en: 'Search by image', ar: 'البحث بالصورة' },
  similar: { fr: 'Questions Rapides', en: 'Quick Questions', ar: 'أسئلة سريعة' },
  categories: { fr: 'Catégories', en: 'Categories', ar: 'فئات' },
  restaurants: { fr: 'Restaurants', en: 'Restaurants', ar: 'مطاعم' },
  family: { fr: 'Famille', en: 'Family', ar: 'عائلي' },
  romantic: { fr: 'Romantique', en: 'Romantic', ar: 'رومانسي' },
  loading: { fr: 'Chargement...', en: 'Loading...', ar: '...جاري التحميل' },
  loadReco: { fr: '✨ Charger mes recommandations', en: '✨ Load my recommendations', ar: '✨ تحميل توصياتي' },
  searchPlaceholder: { fr: 'Jardin, Palais, Souk...', en: 'Garden, Palace, Souk...', ar: '...حديقة، قصر، سوق' },
  searching: { fr: 'Recherche...', en: 'Searching...', ar: '...يبحث' },
  upload: { fr: 'Uploader une photo', en: 'Upload a photo', ar: 'تحميل صورة' },
  analyzing: { fr: 'Analyse en cours...', en: 'Analyzing...', ar: '...جاري التحليل' },
  similarLabel: { fr: 'Questions Rapides', en: 'Quick Questions', ar: 'أسئلة سريعة' },
  quickQuestionsCta: { fr: 'Répondre aux questions rapides', en: 'Answer Quick Questions', ar: 'الإجابة على الأسئلة السريعة' },
  quickQuestionsText: { fr: 'Aidez-nous à personnaliser vos recommandations en répondant à quelques questions.', en: 'Help us personalize your recommendations by answering a few questions.', ar: 'ساعدنا في تخصيص توصياتك من خلال الإجابة على بعض الأسئلة.' },
};

interface MiniCard {
  name: string;
  type: string;
  rating: string;
  imageUrl: string;
  attraction: Attraction;
}

function AttractionToMiniCard(attr: Attraction): MiniCard {
  const folder = attr.attraction_name?.replace(/[^\w\s-]/g, '').trim() || '';
  const imgList = attr.images_list || '';
  const match = imgList.match(/'([^']+)'/);
  const filename = match ? match[1].trim() : '';
  const imageUrl = filename
    ? `/data/attractions_images/${encodeURIComponent(folder)}/${filename}`
    : '';
  return {
    name: attr.attraction_name || 'Destination',
    type: attr.attraction_type || 'Attraction',
    rating: attr.rating || '0',
    imageUrl,
    attraction: attr,
  };
}

const SafariSidebar: React.FC<SafariSidebarProps> = ({ onInjectCards, onSendMessage, lang, isVisible = true }) => {
  const [openSection, setOpenSection] = useState<string>('reco');
  const [recoCards, setRecoCards] = useState<MiniCard[]>([]);
  const [recoLoading, setRecoLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MiniCard[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [imgLoading, setImgLoading] = useState(false);
  const [imgResults, setImgResults] = useState<MiniCard[]>([]);
  const imgRef = useRef<HTMLInputElement>(null);

  const [similarCards, setSimilarCards] = useState<MiniCard[]>([]);
  const [similarLoaded, setSimilarLoaded] = useState(false);
  
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('onboarding_preferences');
    return saved ? JSON.parse(saved) : {};
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePreferenceChange = (id: string, value: string) => {
    setPreferences(prev => ({ ...prev, [id]: value }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('onboarding_preferences', JSON.stringify(preferences));
      if (authService.isAuthenticated()) {
        await authService.updatePreferences(preferences);
      }
      
      // Construct a descriptive prompt for recommendations
      const p = preferences;
      const travelStyleMap: any = { solo: 'seul(e)', couple: 'en couple', family: 'en famille', friends: 'entre amis' };
      const interestMap: any = { culture: 'la culture et l\'histoire', food: 'la gastronomie', nature: 'la nature', shopping: 'le shopping' };
      const budgetMap: any = { budget: 'économique', standard: 'moyen', luxury: 'de luxe' };
      const paceMap: any = { slow: 'détendu', moderate: 'modéré', fast: 'intense' };
      const durationMap: any = { weekend: 'un week-end', week: 'une semaine', long: 'plus de 10 jours' };
      const purposeMap: any = { discovery: 'la découverte', relax: 'le repos', photo: 'la photographie' };

      let prompt = "Bonjour ! J'ai mis à jour mes préférences de voyage. ";
      prompt += `Je voyage ${travelStyleMap[p.travelStyle] || 'au Maroc'} avec un intérêt particulier pour ${interestMap[p.interests] || 'la découverte'}. `;
      prompt += `Mon budget est ${budgetMap[p.budget] || 'standard'} et je préfère un rythme ${paceMap[p.pace] || 'modéré'}. `;
      prompt += `Je prévois de rester ${durationMap[p.duration] || 'quelques jours'} pour ${purposeMap[p.purpose] || 'visiter'}. `;
      prompt += "Peux-tu me recommander des attractions ou activités à Marrakech qui correspondent à ce profil ? ✨";

      // Send the prompt to the chatbot
      if (onSendMessage) {
        onSendMessage(prompt);
      }

      // Re-load recommendations to reflect new preferences in the sidebar too
      await loadRecommendations();
      setShowQuickQuestions(false);
    } catch (err) {
      console.error("Failed to save preferences", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = (key: string) =>
    setOpenSection((prev) => (prev === key ? '' : key));

  // ── Section 1: Recommendations ──────────────────────
  const loadRecommendations = async () => {
    setRecoLoading(true);
    try {
      const allAttractions = await attractionService.getAttractions();
      let attractions: Attraction[] = [];

      try {
        const isAuth = authService.isAuthenticated();
        if (isAuth) {
          const profile = await authService.getProfile();
          if (profile.id != null) {
            const res = await recommendationService.getRecommendationsForUser(profile.id, 6);
            if (res.recommendations && res.recommendations.length > 0) {
              attractions = res.recommendations
                .map((item: any) => {
                  const cleanName = (item.details?.name || item.name || '').replace(/ Marrakech Marrakech Safi$/i, '').trim().toLowerCase();
                  return allAttractions.find((a) => {
                    const n = (a.attraction_name || '').toLowerCase();
                    return n === cleanName || n.includes(cleanName) || cleanName.includes(n);
                  });
                })
                .filter(Boolean) as Attraction[];
            }
          }
        }
      } catch {
        /* fall through to popular */
      }

      if (attractions.length === 0) {
        try {
          const popRes = await recommendationService.getPopularAttractions(6);
          if (popRes.success && popRes.results) {
            attractions = popRes.results
              .map((r: any) => {
                const cleanName = (r.name || '').replace(/ Marrakech Marrakech Safi$/i, '').trim().toLowerCase();
                return allAttractions.find((a) => {
                  const n = (a.attraction_name || '').toLowerCase();
                  return n === cleanName || n.includes(cleanName) || cleanName.includes(n);
                });
              })
              .filter(Boolean) as Attraction[];
          }
        } catch {
          /* ignore */
        }
        if (attractions.length === 0) attractions = allAttractions.slice(0, 6);
      }

      setRecoCards(attractions.map(AttractionToMiniCard));
    } catch (err) {
      console.error('Reco error', err);
    } finally {
      setRecoLoading(false);
    }
  };

  // ── Section 2: Search by text ────────────────────────
  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await attractionService.searchAttractions(q);
      setSearchResults(res.slice(0, 5).map(AttractionToMiniCard));
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ── Section 3: Image search (SAME logic as AttractionsPage) ──
  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgLoading(true);
    setImgResults([]);
    try {
      const allAttractions = await attractionService.getAttractions();
      const response = await recommendationService.searchByImage(file);
      console.log("Sidebar image search response:", response);

      if (response.success && response.results) {
        // Get user ratings from onboarding (same as AttractionsPage)
        const onboardingData = localStorage.getItem('onboarding_ratings');
        const userRatings: { attractionId: string, rating: number }[] = onboardingData ? JSON.parse(onboardingData) : [];
        const ratingsMap = new Map(userRatings.map(r => [r.attractionId, r.rating]));

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

        // Sort by user rating first, then by similarity order
        const sortedAttractions = [...matchedAttractions].sort((a, b) => {
          if (b.userRating !== a.userRating) return b.userRating - a.userRating;
          return 0;
        });

        const matched = sortedAttractions.length > 0 ? sortedAttractions : allAttractions.slice(0, 4);
        setImgResults(matched.slice(0, 5).map(AttractionToMiniCard));

        // Also inject into the chat as cards
        const globalIndices = matched.map(attr => {
          const idx = allAttractions.findIndex(a => a.attraction_name === attr.attraction_name && a.address === attr.address);
          return idx >= 0 ? idx : 0;
        });
        const cards = buildDestinationPayloads(matched, Math.min(matched.length, 5), undefined, globalIndices);
        onInjectCards(cards, `📸 Résultats de la recherche par image — **${matched.length}** destination${matched.length > 1 ? 's' : ''} trouvée${matched.length > 1 ? 's' : ''} ✨`);
      }
    } catch (err) {
      console.error("Image search failed:", err);
    } finally {
      setImgLoading(false);
      e.target.value = '';
    }
  };

  // ── Section 4: Similar users ─────────────────────────
  const loadSimilarUsers = async () => {
    if (similarLoaded) return;
    try {
      const allAttractions = await attractionService.getAttractions();
      const res = await recommendationService.getHybridRecommendations({ k: 5 });
      let attractions: Attraction[] = allAttractions.slice(0, 5);
      if (res.recommendations && res.recommendations.length > 0) {
        const found = res.recommendations.map((item: any) => {
          const cleanName = (item.details?.name || item.name || '').replace(/ Marrakech Marrakech Safi$/i, '').trim().toLowerCase();
          return allAttractions.find((a) => {
            const n = (a.attraction_name || '').toLowerCase();
            return n === cleanName || n.includes(cleanName) || cleanName.includes(n);
          });
        }).filter(Boolean) as Attraction[];
        if (found.length > 0) attractions = found;
      }
      setSimilarCards(attractions.map(AttractionToMiniCard));
      setSimilarLoaded(true);
    } catch {
      const all = await attractionService.getAttractions();
      setSimilarCards(all.slice(0, 5).map(AttractionToMiniCard));
      setSimilarLoaded(true);
    }
  };

  const injectMiniCard = (mc: MiniCard) => {
    const payloads = buildDestinationPayloads([mc.attraction], 1);
    onInjectCards(payloads, ` **${mc.name}** — voici les détails :`);
  };

  const MiniCardList: React.FC<{ cards: MiniCard[] }> = ({ cards }) => (
    <div className="safari-mini-cards">
      {cards.map((mc, i) => (
        <button key={i} className="safari-mini-card" onClick={() => injectMiniCard(mc)}>
          <div className="safari-mini-card-img-wrap">
            {mc.imageUrl ? (
              <img src={mc.imageUrl} alt={mc.name} onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <span>🏛️</span>
            )}
          </div>
          <div className="safari-mini-card-info">
            <p className="safari-mini-card-name">{mc.name}</p>
            <p className="safari-mini-card-type">{mc.type} · ⭐ {parseFloat(mc.rating).toFixed(1)}</p>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <aside className={`safari-sidebar ${isVisible ? '' : 'collapsed'}`}>
      {/* Header */}
      <div className="safari-sidebar-header">
        <span className="safari-sidebar-globe">🌍</span>
        <div>
          <h3 className="safari-sidebar-title">{T.title[lang]}</h3>
          <p className="safari-sidebar-sub">{T.subtitle[lang]}</p>
        </div>
      </div>

      {/* Section 1 — Recommandations */}
      <div className="safari-sidebar-section">
        <button
          className="safari-sidebar-section-toggle"
          onClick={() => {
            toggle('reco');
            if (recoCards.length === 0) loadRecommendations();
          }}
        >
          <Star size={14} />
          <span>{T.reco[lang]}</span>
          {openSection === 'reco' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSection === 'reco' && (
          <div className="safari-sidebar-content">
            {recoLoading ? (
              <div className="safari-sidebar-spinner">{T.loading[lang]} ✨</div>
            ) : recoCards.length === 0 ? (
              <button className="safari-sidebar-cta" onClick={loadRecommendations}>
                {T.loadReco[lang]}
              </button>
            ) : (
              <MiniCardList cards={recoCards} />
            )}
          </div>
        )}
      </div>

      {/* Section 2 — Text search */}
      <div className="safari-sidebar-section">
        <button className="safari-sidebar-section-toggle" onClick={() => toggle('search')}>
          <Search size={14} />
          <span>{T.search[lang]}</span>
          {openSection === 'search' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSection === 'search' && (
          <div className="safari-sidebar-content">
            <div className="safari-sidebar-search-wrap">
              <Search size={13} className="safari-sidebar-search-icon" />
              <input
                type="text"
                className="safari-sidebar-search-input"
                placeholder={T.searchPlaceholder[lang]}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {searchLoading && <div className="safari-sidebar-spinner">{T.searching[lang]}</div>}
            {!searchLoading && searchResults.length > 0 && <MiniCardList cards={searchResults} />}
          </div>
        )}
      </div>

      {/* Section 3 — Image search */}
      <div className="safari-sidebar-section">
        <button className="safari-sidebar-section-toggle" onClick={() => toggle('image')}>
          <Camera size={14} />
          <span>{T.image[lang]}</span>
          {openSection === 'image' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSection === 'image' && (
          <div className="safari-sidebar-content">
            <button className="safari-sidebar-upload-btn" onClick={() => imgRef.current?.click()} disabled={imgLoading}>
              <Camera size={16} />
              {imgLoading ? T.analyzing[lang] : T.upload[lang]}
            </button>
            <input type="file" accept="image/*" ref={imgRef} style={{ display: 'none' }} onChange={handleImgUpload} />
            {imgResults.length > 0 && <MiniCardList cards={imgResults} />}
          </div>
        )}
      </div>

      {/* Section 4 — Quick Questions */}
      <div className="safari-sidebar-section">
        <button
          className="safari-sidebar-section-toggle"
          onClick={() => toggle('similar')}
        >
          <HelpCircle size={14} />
          <span>{T.similar[lang]}</span>
          {openSection === 'similar' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSection === 'similar' && (
          <div className="safari-sidebar-content">
            <p className="safari-sidebar-label">{T.quickQuestionsText[lang]}</p>
            <button 
              className="safari-sidebar-cta" 
              onClick={() => setShowQuickQuestions(true)}
            >
              ✨ {T.quickQuestionsCta[lang]}
            </button>
          </div>
        )}
      </div>

      {/* Modal Overlay for Quick Questions */}
      {showQuickQuestions && (
        <div className="quick-questions-overlay" onClick={() => setShowQuickQuestions(false)}>
          <div className="quick-questions-modal" onClick={e => e.stopPropagation()}>
            <div className="quick-questions-modal-header">
              <h2>Questions Rapides</h2>
              <button className="close-modal-btn" onClick={() => setShowQuickQuestions(false)}>×</button>
            </div>
            <div className="quick-questions-modal-body">
              <QuickQuestions 
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                onSave={handleSavePreferences}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 5 — Categories */}
      <div className="safari-sidebar-section">
        <button className="safari-sidebar-section-toggle" onClick={() => toggle('categories')}>
          <span>🎯</span>
          <span>{T.categories[lang]}</span>
          {openSection === 'categories' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSection === 'categories' && (
          <div className="safari-sidebar-content">
            <button className="safari-sidebar-cta" onClick={() => onSendMessage?.(lang === 'ar' ? 'أفضل المطاعم في مراكش' : lang === 'en' ? 'Best restaurants in Marrakech' : 'Meilleurs restaurants à Marrakech')}>
              🍽️ {T.restaurants[lang]}
            </button>
            <button className="safari-sidebar-cta" onClick={() => onSendMessage?.(lang === 'ar' ? 'أنشطة عائلية' : lang === 'en' ? 'Family activities' : 'Activités familiales')}>
              👨👩👧 {T.family[lang]}
            </button>
            <button className="safari-sidebar-cta" onClick={() => onSendMessage?.(lang === 'ar' ? 'أماكن رومانسية' : lang === 'en' ? 'Romantic places' : 'Lieux romantiques')}>
              💑 {T.romantic[lang]}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SafariSidebar;
