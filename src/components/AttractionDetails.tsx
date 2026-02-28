import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parseCSV } from '../utils/csvLoader';
import './AttractionDetails.css';

interface Attraction {
  attraction_name: string;
  attraction_type: string;
  price: string;
  address: string;
  rating: string;
  review_count: string;
  images_path: string;
  images_list: string;
  attraction_url?: string;
  [key: string]: any;
}

interface Review {
  review_title: string;
  review_text: string;
  rating: string;
  review_date: string;
  reviewer_name: string;
  attraction_url: string;
  [key: string]: string;
}

const ACTIVITY_KEYWORDS = ['quad', 'buggy', 'montgolfière', 'balloon', 'trek', 'trekking', 'tour', 'excursion', 'adventure', 'sport', 'cooking', 'class', 'spa', 'hammam', 'surf', 'kite'];

const GUIDE_PROFILES = [
  { name: 'Ahmed Benali', languages: ['FR', 'EN', 'AR'], speciality: 'Aventure & Sports', phone: '212640252519', rating: 4.9 },
  { name: 'Fatima Zahra', languages: ['FR', 'EN'], speciality: 'Culture & Gastronomie', phone: '212640252519', rating: 4.8 },
  { name: 'Youssef Alami', languages: ['EN', 'AR', 'ES'], speciality: 'Nature & Trekking', phone: '212640252519', rating: 4.9 },
  { name: 'Salma Idrissi', languages: ['FR', 'AR'], speciality: 'Bien-être & Relaxation', phone: '212640252519', rating: 4.7 },
];

const needsGuide = (attractionName: string, attractionType: string): boolean => {
  const text = `${attractionName} ${attractionType}`.toLowerCase();
  return ACTIVITY_KEYWORDS.some(keyword => text.includes(keyword));
};

const getGuideForAttraction = (attractionName: string) => {
  const hash = attractionName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GUIDE_PROFILES[hash % GUIDE_PROFILES.length];
};

const AttractionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const requiresGuide = attraction ? needsGuide(attraction.attraction_name, attraction.attraction_type || '') : false;
  const guide = requiresGuide && attraction ? getGuideForAttraction(attraction.attraction_name) : null;

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch Attraction Data
            const attractionRes = await fetch('/data/marrakech_attractions_clean_final.csv');
            const attractionText = await attractionRes.text();
            const attractionData = parseCSV(attractionText) as Attraction[];
            
            if (id && attractionData[parseInt(id)]) {
                const attr = attractionData[parseInt(id)];
                setAttraction(attr);
                
                // Parse images
                try {
                    const cleaned = attr.images_list.replace(/[[\]']/g, "").split(",").map(s => s.trim()).filter(s => s);
                    const folderName = attr.attraction_name ? attr.attraction_name.replace(/[^\w\s-]/g, '').trim() : "";
                    const fullPaths = cleaned.map(img => {
                        return `/data/attractions_images/${encodeURIComponent(folderName)}/${img}`;
                    });
                    setImages(fullPaths.length > 0 ? fullPaths : []);
                } catch (e) {
                    console.error("Error parsing images list", e);
                    setImages([]);
                }

                // Fetch Reviews Data if attraction has a URL to link
                if (attr.attraction_url) {
                    const reviewsRes = await fetch('/data/marrakech_reviews_clean_final.csv');
                    const reviewsText = await reviewsRes.text();
                    const reviewsData = parseCSV(reviewsText) as Review[];
                    
                    // Filter reviews for this attraction
                    const relevantReviews = reviewsData.filter(r => r.attraction_url === attr.attraction_url);
                    setReviews(relevantReviews);
                }
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    fetchData();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderStars = (rating: string) => {
      const num = parseFloat(rating) || 0;
      return "★".repeat(Math.round(num)) + "☆".repeat(5 - Math.round(num));
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!attraction) return <div className="error-container">Attraction not found</div>;

  return (
    <div className="details-container">
      <button className="back-btn" onClick={() => navigate('/')}>← Retour à Safari</button>
      
      <div className="details-header">
        <h1>{attraction.attraction_name}</h1>
        <div className="details-meta">
            <span className="tag type">{attraction.attraction_type || "Experience"}</span>
            <span className="tag rating">★ {attraction.rating}</span>
            <span className="tag reviews">{attraction.review_count} reviews</span>
        </div>
      </div>

      <div className="carousel-container">
        {images.length > 0 ? (
            <>
                <div className="carousel-slide">
                    <img 
                        src={images[currentImageIndex]} 
                        alt={`Slide ${currentImageIndex}`} 
                        className="carousel-image"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available')}
                    />
                </div>
                {images.length > 1 && (
                    <>
                        <button className="carousel-btn prev" onClick={prevImage}>❮</button>
                        <button className="carousel-btn next" onClick={nextImage}>❯</button>
                    </>
                )}
                <div className="carousel-indicators">
                    {images.map((_, idx) => (
                        <span 
                            key={idx} 
                            className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(idx)}
                        />
                    ))}
                </div>
            </>
        ) : (
            <div className="no-images">No images available</div>
        )}
      </div>

      <div className="details-content-grid">
        <div className="main-info">
            {guide && (
              <div className="info-card guide-card">
                <h3>🧭 Votre Guide</h3>
                <div className="guide-profile">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&background=1a3a52&color=fff&size=80`}
                    alt={guide.name}
                    className="guide-avatar"
                  />
                  <div className="guide-info">
                    <h4>{guide.name}</h4>
                    <p className="guide-speciality">{guide.speciality}</p>
                    <p className="guide-languages">🗣️ {guide.languages.join(', ')}</p>
                    <p className="guide-rating">⭐ {guide.rating}/5</p>
                    <a 
                      href={`https://wa.me/${guide.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Contacter sur WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="reviews-section">
                <h3>Reviews ({reviews.length})</h3>
                {reviews.length > 0 ? (
                    <div className="reviews-list">
                        {reviews.map((review, index) => (
                            <div key={index} className="review-card">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name || "Anonymous")}&background=random&color=fff&size=40`} 
                                            alt={review.reviewer_name} 
                                            className="reviewer-avatar"
                                        />
                                        <span className="reviewer-name">{review.reviewer_name || "Anonymous"}</span>
                                    </div>
                                    <span className="review-rating">{renderStars(review.rating)}</span>
                                </div>
                                <h4 className="review-title">{review.review_title}</h4>
                                <p className="review-text">{review.review_text}</p>
                                <span className="review-date">{review.review_date}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-reviews">No reviews available yet.</p>
                )}
            </div>
        </div>

        <div className="sidebar-info">
            <div className="info-card">
                <h3>Information</h3>
                <p><strong> Address:</strong> {attraction.address}</p>
                <p><strong> Price:</strong> {attraction.price || "Contact for price"}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetails;
