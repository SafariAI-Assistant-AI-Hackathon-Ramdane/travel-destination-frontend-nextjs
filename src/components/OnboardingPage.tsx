import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Sparkles } from 'lucide-react';
import { attractionService, Attraction } from '../services/attraction.service';
import { authService } from '../services/auth.service';
import './OnboardingPage.css';

function OnboardingPage() {
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Map<string | number, number>>(new Map());
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRandomAttractions = async () => {
      try {
        const allAttractions = await attractionService.getAttractions();
        
        // Filter attractions with images
        const withImages = allAttractions.filter(a => 
          a.images_list && a.images_list !== '[]'
        );
        
        // Shuffle and take 5
        const shuffled = withImages.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);
        
        setAttractions(selected);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load attractions for onboarding", err);
        navigate('/');
      }
    };

    loadRandomAttractions();
  }, [navigate]);

  const handleRating = (rating: number) => {
    const currentAttraction = attractions[currentIndex];
    const newRatings = new Map(ratings);
    // Use attraction_name as a fallback ID if 'id' is not present
    const id = currentAttraction.id || currentAttraction.attraction_name || String(currentIndex);
    newRatings.set(id, rating);
    setRatings(newRatings);
  };

  const handleNext = () => {
    if (currentIndex < attractions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHoveredRating(0);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    try {
      // Store ratings in localStorage
      const ratingsArray = Array.from(ratings.entries()).map(([attractionId, rating]) => ({
        attractionId,
        rating
      }));
      
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_ratings', JSON.stringify(ratingsArray));
      
      console.log("Onboarding ratings saved:", ratingsArray);

      // Send to backend if authenticated
      if (authService.isAuthenticated()) {
        try {
          await authService.updatePreferences({
            ratings: ratingsArray
          });
          console.log("Onboarding ratings synced with backend");
        } catch (backendErr) {
          console.error("Failed to sync onboarding ratings with backend", backendErr);
        }
      }
      
      navigate('/');
    } catch (err) {
      console.error("Failed to submit onboarding ratings", err);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="onboarding-loading">
        <div className="spinner"></div>
        <p>Préparation de votre expérience...</p>
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="onboarding-error">
        <h2>Oups !</h2>
        <p>Impossible de charger les attractions.</p>
        <button onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    );
  }

  const currentAttraction = attractions[currentIndex];
  const attractionId = currentAttraction.id || currentAttraction.attraction_name || String(currentIndex);
  const currentRating = ratings.get(attractionId) || 0;
  const isLastImage = currentIndex === attractions.length - 1;
  const canProceed = currentRating > 0;

  // Get first image
  const getImageUrl = (attr: Attraction): string => {
    try {
      if (!attr.images_list || attr.images_list === '[]') return '';
      
      const cleanedString = attr.images_list.trim();
      const match = cleanedString.match(/'([^']+)'/) || cleanedString.match(/"([^"]+)"/);
      
      if (match && match[1]) {
        const imageName = match[1].trim();
        const folderName = (attr.attraction_name || "").replace(/[^\w\s-]/g, '').trim();
        return `/data/attractions_images/${encodeURIComponent(folderName)}/${imageName}`;
      }
    } catch (e) {
      console.error("Error parsing image", e);
    }
    return '';
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div className="onboarding-logo">
          <Sparkles size={32} />
          <h1>Découvrez Marrakech</h1>
        </div>
        <button className="skip-btn" onClick={handleSkip}>
          Passer
        </button>
      </div>

      <div className="onboarding-content">
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / attractions.length) * 100}%` }}
            />
          </div>
          <p className="progress-text">
            {currentIndex + 1} / {attractions.length}
          </p>
        </div>

        <div className="instruction-text">
          <h2>Comment évaluez-vous cette attraction ?</h2>
          <p>Vos préférences nous aideront à personnaliser vos recommandations</p>
        </div>

        <div className="attraction-showcase">
          <div className="attraction-image-wrapper">
            <img 
              src={getImageUrl(currentAttraction)} 
              alt={currentAttraction.attraction_name}
              className="attraction-image"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f0f0f0"/><text x="300" y="200" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999">Image non disponible</text></svg>';
              }}
            />
            <div className="attraction-info-overlay">
              <h3>{currentAttraction.attraction_name}</h3>
              <span className="attraction-category">{currentAttraction.attraction_type}</span>
            </div>
          </div>

          <div className="rating-section">
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star-btn ${star <= (hoveredRating || currentRating) ? 'active' : ''}`}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star 
                    size={48} 
                    fill={star <= (hoveredRating || currentRating) ? '#dc2626' : 'none'}
                    stroke={star <= (hoveredRating || currentRating) ? '#dc2626' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>
            <p className="rating-label">
              {currentRating === 0 && 'Cliquez pour noter'}
              {currentRating === 1 && 'Pas intéressé'}
              {currentRating === 2 && 'Peu intéressant'}
              {currentRating === 3 && 'Neutre'}
              {currentRating === 4 && 'Intéressant'}
              {currentRating === 5 && 'Très intéressant !'}
            </p>
          </div>
        </div>

        <div className="action-buttons">
          {!isLastImage ? (
            <button 
              className="next-btn" 
              onClick={handleNext}
              disabled={!canProceed}
            >
              Suivant
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              className="finish-btn" 
              onClick={handleFinish}
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Terminer'}
              <Sparkles size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
