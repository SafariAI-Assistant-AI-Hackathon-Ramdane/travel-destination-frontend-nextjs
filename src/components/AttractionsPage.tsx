import React, { useEffect, useState } from 'react';
import AttractionCard from './AttractionCard';
import { Search, Camera, MapPin } from 'lucide-react';
import { attractionService, Attraction } from '../services/attraction.service';
import { recommendationService } from '../services/recommendation.service';
import { authService } from '../services/auth.service';
import { Sparkles } from 'lucide-react';
import './AttractionsPage.css';

function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recommendationType, setRecommendationType] = useState<'none' | 'image' | 'personalized'>('none');

  useEffect(() => {
    const fetchData = async () => {
      const data = await attractionService.getAttractions();
      setAttractions(data);
      setLoading(false);
      setIsLoggedIn(authService.isAuthenticated());
    };
    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setImagePreview(null); // Clear image search if text is typed
    setRecommendationType('none');
    const filtered = await attractionService.searchAttractions(query);
    setAttractions(filtered);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsSearching(true);
    setSearchQuery(''); // Clear text search
    
    try {
      const response = await recommendationService.searchByImage(file);
      console.log("Image search response:", response);
      
      if (response.success && response.results) {
        const allAttractions = await attractionService.getAttractions();
        
        // Get user ratings from onboarding
        const onboardingData = localStorage.getItem('onboarding_ratings');
        const userRatings: { attractionId: string, rating: number }[] = onboardingData ? JSON.parse(onboardingData) : [];
        const ratingsMap = new Map(userRatings.map(r => [r.attractionId, r.rating]));

        const matchedAttractions = response.results.map(match => {
           if (!match.name) return null;
           
           // Improved matching
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
             // Attach user rating for sorting
             const attractionId = found.id || found.attraction_name;
             const userRating = ratingsMap.get(attractionId) || 0;
             return { ...found, userRating };
           }
           return null;
        }).filter(Boolean) as (Attraction & { userRating: number })[];
        
        // Sort by user rating first, then by the original order (similarity)
        const sortedAttractions = [...matchedAttractions].sort((a, b) => {
          if (b.userRating !== a.userRating) {
            return b.userRating - a.userRating; // Higher ratings first
          }
          return 0; // Maintain original order if ratings are same
        });

        setAttractions(sortedAttractions);
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (err: any) {
      console.error("Image search failed", err);
      const errorMessage = err.response?.data?.error || err.message || "Unknown error";
      alert(`Image search failed: ${errorMessage}`);
    } finally {
      setIsSearching(false);
      if (file) setRecommendationType('image');
    }
  };

  const handleAIRecommend = async () => {
    setIsSearching(true);
    setSearchQuery('');
    setImagePreview(null);
    
    try {
      const profile = await authService.getProfile();
      console.log("Searching recommendations for profile:", profile.email);
      
      // Map email to numeric dataset ID
      const datasetId = await attractionService.getNumericUserIdByEmail(profile.email);
      console.log("Mapped Dataset ID:", datasetId);
      
      if (!datasetId) {
        throw new Error(`User with email ${profile.email} not found in dataset. Use a test user like user4085tripadvisor@gmail.com`);
      }

      console.log("Calling getRecommendationsForUser with ID:", datasetId);
      const response = await recommendationService.getRecommendationsForUser(datasetId, 12);
      console.log("AI Recommendation Response:", response);

      if (response.recommendations && response.recommendations.length > 0) {
        const allAttractions = await attractionService.getAttractions();
        console.log("All local attractions count:", allAttractions.length);
        
        const matchedAttractions = response.recommendations.map(item => {
          const cleanMatchName = item.details.name.replace(/ Marrakech Marrakech Safi$/i, '').trim().toLowerCase();
          const found = allAttractions.find(a => {
            const attrName = a.attraction_name?.toLowerCase();
            return attrName === cleanMatchName || 
                   attrName?.includes(cleanMatchName) || 
                   cleanMatchName.includes(attrName || '');
          });
          if (!found) console.log(`No local match for AI result: "${item.details.name}" (cleaned: "${cleanMatchName}")`);
          return found;
        }).filter(Boolean) as Attraction[];
        
        console.log("Final matched attractions:", matchedAttractions);
        setAttractions(matchedAttractions);
        setRecommendationType('personalized');
      } else {
        console.warn("AI Response was not successful or results were empty", response);
      }
    } catch (err: any) {
      console.error("Personalized recommendation failed", err);
      alert(`Could not get recommendations: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = async () => {
    setSearchQuery('');
    setImagePreview(null);
    setRecommendationType('none');
    setLoading(true);
    const data = await attractionService.getAttractions();
    setAttractions(data);
    setLoading(false);
  };

  if (loading) {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Finding the best spots...</p>
        </div>
    );
  }

  return (
    <div className="attractions-page">
      <header className="page-header">
          <div className="header-title-group">
              <h1>Explore Marrakech</h1>
              <div className="results-count">
                <MapPin size={16} />
                {attractions.length.toLocaleString()} locations discovered
              </div>
          </div>

          <div className="search-container">
              <div className="search-bar-wrapper">
                  <div className="search-bar-main">
                      <Search className="search-icon" size={20} />
                      <input 
                        type="text" 
                        placeholder="Search by name, category or mood..." 
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                  </div>
                  <div className="search-divider"></div>
                  <div className="search-actions">
                      <label htmlFor="image-upload" className="image-search-btn" title="Search by photo">
                          <Camera size={20} />
                          <span>Image Search</span>
                      </label>
                      <input 
                        type="file" 
                        id="image-upload" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleImageUpload}
                      />
                      {isLoggedIn && (
                        <button 
                          className="ai-recommend-btn" 
                          onClick={handleAIRecommend} 
                          title="Get personalized AI recommendations"
                          disabled={isSearching}
                        >
                          <span>✨</span>
                        </button>
                      )}
                      <button className="search-submit-btn" disabled={isSearching}>
                        {isSearching ? 'Searching...' : 'Search'}
                      </button>
                  </div>
              </div>

              {(searchQuery || imagePreview) && (
                <div className="search-feedback">
                    <div className="feedback-content">
                        {imagePreview && (
                          <div className="image-preview-badge">
                            <img src={imagePreview} alt="Search preview" />
                            <span>AI Image Search Active</span>
                          </div>
                        )}
                        {searchQuery && <p>Results for "<strong>{searchQuery}</strong>"</p>}
                    </div>
                    <button className="clear-results-btn" onClick={clearResults}>Clear Results</button>
                </div>
              )}
          </div>
      </header>
  
      <div className="attractions-grid">
        {recommendationType !== 'none' && attractions.length > 0 && (
          <div className={`grid-label ${recommendationType}-label`}>
            <span className="ai-stars">✨</span> 
            {recommendationType === 'image' ? 'Visual Search Matches' : 'Personalized Just For You'}
            <span className="ai-stars">✨</span>
          </div>
        )}
        {attractions.length > 0 ? (
          attractions.map((attr, index) => (
            <AttractionCard 
              key={index}
              id={String(index)}
              attraction_name={attr.attraction_name || "Unknown"}
              type={attr.attraction_type || "Experience"}
              rating={attr.rating || "New"}
              review_count={attr.review_count || "0"}
              images={attr.images_list || "[]"}
              address={attr.address || "Marrakech"}
              userRating={attr.userRating || 0}
            />
          ))
        ) : (
          <div className="no-results">
            <h2>No locations found</h2>
            <p>Try searching for something else like "Jardin" or "Palace".</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttractionsPage;
