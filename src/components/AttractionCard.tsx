import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AttractionCard.css';

interface AttractionProps {
  id: string;
  attraction_name: string;
  rating: string;
  review_count: string;
  address?: string;
  images: string; // JSON string array like "['img1.jpg', 'img2.jpg']"
  type?: string;
  userRating?: number;
  latitude?: string;
  longitude?: string;
}

const AttractionCard: React.FC<AttractionProps> = ({ 
  id,
  attraction_name, 
  type = "Attraction", 
  rating, 
  review_count, 
  images = "[]", 
  address = "Address not available",
  userRating = 0,
  latitude,
  longitude
}) => {
  const navigate = useNavigate();

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/map?name=${encodeURIComponent(attraction_name)}&address=${encodeURIComponent(address)}`);
  };


  // Function to get folder name from attraction name
  const getFolderName = (name: string): string => {
    if (!name) return "";
    return name.replace(/[^\w\s-]/g, '').trim(); 
  };

  // Function to extract first image from JSON string array
  const getFirstImage = (imageString: string): string => {
    try {
      const cleanedString = imageString.trim();
      
      if (!cleanedString || cleanedString === '[]') {
        return '';
      }
      
      // Try to extract first filename
      const match = cleanedString.match(/'([^']+)'/);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      // Try double quotes
      const matchDouble = cleanedString.match(/"([^"]+)"/);
      if (matchDouble && matchDouble[1]) {
        return matchDouble[1].trim();
      }
      
      // Try to parse as JSON array
      try {
        const jsonString = cleanedString.replace(/'/g, '"');
        const parsedArray = JSON.parse(jsonString);
        if (Array.isArray(parsedArray) && parsedArray.length > 0) {
          return parsedArray[0];
        }
      } catch (jsonError) {
        console.log("JSON parse failed, trying other methods");
      }
      
    } catch (error) {
      console.error("Error parsing image string:", imageString, error);
    }
    
    return '';
  };

  const firstImage = getFirstImage(images);
  const folderName = getFolderName(attraction_name);
  
  // Construct the full image URL
  const getImageUrl = () => {
    if (!firstImage) {
      // Try to guess the image based on folder structure
      const slug = attraction_name.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      return `/data/attractions_images/${folderName}/${slug}01.jpg`;
    }
    
    // Clean the image filename
    const cleanImage = firstImage.replace(/^['"\s]+|['"\s]+$/g, '');
    
    // Construct path: /data/attractions_images/[Folder Name]/[image.jpg]
    return `/data/attractions_images/${encodeURIComponent(folderName)}/${cleanImage}`;
  };

  const imageUrl = getImageUrl();
  
  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Failed to load image:", imageUrl);
    
    // Try fallback approach
    const slug = attraction_name.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Try different naming conventions
    const fallbackPaths = [
      `/data/attractions_images/${folderName}/${slug}01.jpg`,
      `/data/attractions_images/${folderName}/${slug}1.jpg`,
      `/data/attractions_images/${folderName}/${attraction_name.toLowerCase().replace(/\s+/g, '-')}01.jpg`,
      '/data/attractions_images/default.jpg'
    ];
    
    // Try next fallback path
    const currentSrc = e.currentTarget.src;
    const currentIndex = fallbackPaths.indexOf(currentSrc);
    
    if (currentIndex < fallbackPaths.length - 1) {
      e.currentTarget.src = fallbackPaths[currentIndex + 1];
    } else {
      // Last fallback - show broken image icon
      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f0f0f0"/><text x="150" y="100" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999">Image not available</text></svg>';
    }
  };

  // Format review count
  const formatReviewCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  return (
    <div 
      className="attraction-card"
      onClick={() => navigate(`/attraction/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/attraction/${id}`);
        }
      }}
    >
      <div className="attraction-image-container">
        <img 
          src={imageUrl} 
          alt={attraction_name} 
          className="attraction-image" 
          onError={handleImageError}
          loading="lazy"
        />
        {userRating >= 4 && (
          <div className="preference-badge" title="Matching your onboarding preferences">
            <span>✨ Preferred</span>
          </div>
        )}
        <span className="attraction-rating">
          ★ {parseFloat(rating).toFixed(1)}
        </span>
      </div>
      <div className="attraction-content">
        <div className="attraction-header">
          <span className="attraction-type">{type}</span>
        </div>
        <h3 className="attraction-title">{attraction_name}</h3>
        <p className="attraction-address" title={address}>
          {address.length > 50 ? `${address.substring(0, 50)}...` : address}
        </p>
        <div className="attraction-footer">
          <span className="attraction-reviews">
            {formatReviewCount(review_count)} reviews
          </span>
          <button 
            className="view-details-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/attraction/${id}`);
            }}
            aria-label={`View details for ${attraction_name}`}
          >
            View Details
            <span aria-hidden="true">→</span>
          </button>
          <button 
            className="view-details-btn"
            onClick={handleMapClick}
            aria-label={`View ${attraction_name} on map`}
            style={{ marginLeft: '8px' }}
          >
            🗺️ Carte
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttractionCard;