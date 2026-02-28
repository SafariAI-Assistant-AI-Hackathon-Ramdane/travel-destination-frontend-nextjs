import React, { useState } from 'react';
import './SafariCards.css';
import { RestaurantPayload } from '../../../lib/cardPayloadBuilder';
import { MapPin, Star } from 'lucide-react';

interface Props { data: RestaurantPayload; }

const RestaurantCard: React.FC<Props> = ({ data }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="safari-card restaurant-card">
      <div className="safari-card-image-wrap">
        {!imgError ? (
          <img src={data.imageUrl} alt={data.name} className="safari-card-img" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="safari-card-img-fallback">🍽️</div>
        )}
        <div className="safari-card-type-badge">{data.cuisine}</div>
      </div>
      <div className="safari-card-body">
        <h4 className="safari-card-title">{data.name}</h4>
        <div className="safari-card-row">
          <Star size={12} className="safari-card-star" />
          <span className="safari-card-rating">{data.rating.toFixed(1)}</span>
        </div>
        <div className="safari-card-row">
          <MapPin size={12} style={{ color: '#f4a261', flexShrink: 0 }} />
          <span className="safari-card-address">{data.distanceKm} km · {data.address}</span>
        </div>
      </div>
      <div className="safari-card-actions">
        <button className="safari-card-btn primary">Réserver</button>
        <button className="safari-card-btn secondary">Menu</button>
      </div>
    </div>
  );
};

export default RestaurantCard;
