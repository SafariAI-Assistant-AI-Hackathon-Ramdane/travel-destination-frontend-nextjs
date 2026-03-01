import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { attractionService, Attraction } from '../services/attraction.service';
import { recommendationService } from '../services/recommendation.service';
import { authService } from '../services/auth.service';
import AttractionCard from './AttractionCard';
import './Home.css';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80', // Koutoubia Marrakech
  'https://as2.ftcdn.net/v2/jpg/03/54/25/17/1000_F_354251755_2YROVdpqfiZoHOljn1RKG9mloJUuLzYD.jpg', // Imlil nature
  'https://th.bing.com/th/id/OIP.4juDccnZ_ByYtBLw9u_v8QHaFc?w=246&h=181&c=7&r=0&o=7&dpr=1.7&pid=1.7&rm=3', // Safi
  'https://th.bing.com/th/id/OIP.J-IU7TWfP8V7thWbjUGXOgHaE7?w=306&h=204&c=7&r=0&o=7&dpr=1.7&pid=1.7&rm=3'  // Essaouira
];

function Home() {
  const navigate = useNavigate();
  const [popularAttractions, setPopularAttractions] = useState<Attraction[]>([]);
  const [personalizedAttractions, setPersonalizedAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const allAttractions = await attractionService.getAttractions();
        
        const mapResultsToAttractions = (results: any[]) => {
          return results.map(res => {
            const cleanMatchName = res.name.replace(/ Marrakech Marrakech Safi$/i, '').trim().toLowerCase();
            return allAttractions.find(a => {
              const attrName = a.attraction_name?.toLowerCase();
              return attrName === cleanMatchName || 
                     attrName?.includes(cleanMatchName) || 
                     cleanMatchName.includes(attrName || '');
            });
          }).filter(Boolean) as Attraction[];
        };

        // 1. Fetch Popular
        try {
          const popularRes = await recommendationService.getPopularAttractions(10);
          console.log("Popular Attractions Response:", popularRes);
          if (popularRes.success && popularRes.results && popularRes.results.length > 0) {
            const mapped = mapResultsToAttractions(popularRes.results);
            console.log("Mapped Popular Attractions:", mapped);
            if (mapped.length > 0) {
              setPopularAttractions(mapped);
            } else {
               console.log("No matches found in local data for popular AI results, using CSV fallback");
               setPopularAttractions(allAttractions.slice(0, 10));
            }
          } else {
            console.log("Popular AI results empty or failed, using CSV fallback");
            setPopularAttractions(allAttractions.slice(0, 10));
          }
        } catch (err) {
          console.error("Failed to fetch popular attractions - API Error", err);
          setPopularAttractions(allAttractions.slice(0, 10));
        }

        // 2. Check Auth and Fetch Personalized
        const authed = authService.isAuthenticated();
        setIsLoggedIn(authed);
        
        if (authed) {
          try {
            const profile = await authService.getProfile();
            
            // Check if user has completed onboarding
            const hasOnboarding = localStorage.getItem('onboarding_completed') === 'true';
            const onboardingRatings = localStorage.getItem('onboarding_ratings');
            
            if (hasOnboarding && onboardingRatings && profile.id) {
              // Use cold-start recommendations based on onboarding ratings
              try {
                const coldStartRes = await recommendationService.getColdStartRecommendations(10, 'popular');
                if (coldStartRes.recommendations && coldStartRes.recommendations.length > 0) {
                  setPersonalizedAttractions(mapResultsToAttractions(coldStartRes.recommendations));
                }
              } catch (coldErr) {
                console.error("Failed to fetch cold-start recommendations", coldErr);
              }
            } else if (profile.id) {
              // Regular personalized recommendations
              const personalizedRes = await recommendationService.getRecommendationsForUser(profile.id, 10);
              if (personalizedRes.success && personalizedRes.results) {
                setPersonalizedAttractions(mapResultsToAttractions(personalizedRes.results));
              }
            }
          } catch (err) {
            console.error("Failed to fetch personalized recommendations", err);
          }
        }
      } catch (err) {
        console.error("Error fetching home data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <div className="hero-badge">Discover Marrakech-Safi Region</div>
            <h1 className="hero-title">Explore the Heart of <br/><span className="gradient-text">Morocco</span></h1>
            <p className="hero-subtitle">From the vibrant souks of Marrakech to the coastal beauty of Safi and Essaouira - discover authentic Morocco with AI-powered recommendations.</p>
            <div className="hero-actions">
              <button className="hero-cta-button primary" onClick={() => navigate('/attractions')}>
                  Explore Attractions
              </button>
              <button className="hero-cta-button secondary" onClick={() => navigate('/safari')}>
                  Try Safari AI
              </button>
            </div>
        </div>
        <div className="hero-image-container">
           <img 
             className="hero-image" 
             src={HERO_IMAGES[currentImageIndex]} 
             alt="Marrakech"
           />
        </div>
      </header>

      <main className="recommendations-container">
        {/* Personalized Section */}
        {isLoggedIn && personalizedAttractions.length > 0 && (
          <section className="section-group animate-in">
            <div className="section-header">
              <div className="header-text">
                <div className="ai-badge">
                  <span>AI Personalized For You</span>
                </div>
                <h2>Magic Matches</h2>
                <p>Curated destinations based on your travel history and preferences.</p>
              </div>
              <Link to="/attractions" className="view-all-link">
                View all
              </Link>
            </div>
            <div className="recommendations-grid">
              {personalizedAttractions.map((attr, idx) => (
                <AttractionCard 
                  key={`pers-${idx}`}
                  id={String(idx)} 
                  attraction_name={attr.attraction_name}
                  type={attr.attraction_type}
                  rating={attr.rating}
                  review_count={attr.review_count}
                  images={attr.images_list}
                  address={attr.address}
                />
              ))}
            </div>
          </section>
        )}

        {/* Popular Section */}
        <section className="section-group animate-in">
          <div className="section-header">
            <div className="header-text">
              <div className="ai-badge" style={{background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'}}>
                <span>Most Loved in Marrakech-Safi</span>
              </div>
              <h2>Trending Experiences</h2>
              <p>Join thousands of travelers exploring these top-rated local gems.</p>
            </div>
            <Link to="/attractions" className="view-all-link">
              Explore more
            </Link>
          </div>
          <div className="recommendations-grid">
            {isLoading ? (
               [1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="skeleton-card" style={{height: 350, background: '#f8fafc', borderRadius: 20}}></div>)
            ) : (
              popularAttractions.map((attr, idx) => (
                <AttractionCard 
                  key={`pop-${idx}`}
                  id={String(idx + 100)} 
                  attraction_name={attr.attraction_name}
                  type={attr.attraction_type}
                  rating={attr.rating}
                  review_count={attr.review_count}
                  images={attr.images_list}
                  address={attr.address}
                />
              ))
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="footer">
          <div className="footer-content">
            <p>© 2024 MarrakechTrips. Your AI-Powered Travel Guide.</p>
            <div className="footer-tagline">Made for Marrakech-Safi Region</div>
          </div>
      </footer>
    </div>
  );
}

export default Home;
