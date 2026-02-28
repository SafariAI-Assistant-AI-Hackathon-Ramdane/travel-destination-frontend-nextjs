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

const AttractionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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
            <div className="info-card description">
                <h3>Description</h3>
                <p>Experience the beauty of Marrakech with {attraction.attraction_name}. One of the top rated {(attraction.attraction_type || "attraction").toLowerCase()} spots in the city.</p>
                <div className="action-buttons">
                    <button className="book-now-btn">Book Experience</button>
                </div>
            </div>

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
