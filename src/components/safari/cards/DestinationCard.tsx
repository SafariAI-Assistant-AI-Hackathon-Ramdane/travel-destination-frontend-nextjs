import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SafariCards.css';
import { DestinationPayload } from '../../../lib/cardPayloadBuilder';
import { MapPin, Star, ExternalLink } from 'lucide-react';

interface Props { data: DestinationPayload; }

const DestinationCard: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleDetails = () => {
    navigate(`/attraction/${data.attractionIndex}`);
  };

  const handleMapClick = () => {
    navigate(`/map?name=${encodeURIComponent(data.name)}&address=${encodeURIComponent(data.address)}`);
  };

  return (
    <div className="safari-card destination-card">
      <div className="safari-card-image-wrap" onClick={handleDetails} style={{ cursor: 'pointer' }}>
        {!imgError ? (
          <img src={data.imageUrl} alt={data.name} className="safari-card-img" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="safari-card-img-fallback">🏛️</div>
        )}
        <div className="safari-card-match-badge">{data.matchScore}% match</div>
        <div className="safari-card-type-badge">{data.type}</div>
      </div>

      <div className="safari-card-body">
        <h4 className="safari-card-title">{data.name}</h4>
        <div className="safari-card-row">
          <Star size={12} className="safari-card-star" />
          <span className="safari-card-rating">{data.rating.toFixed(1)}</span>
          <span className="safari-card-reviews">({data.reviewCount.toLocaleString()} avis)</span>
        </div>
        <div className="safari-card-row">
          <MapPin size={12} style={{ color: '#f4a261', flexShrink: 0 }} />
          <span className="safari-card-address">{data.address}</span>
        </div>
        {data.price && <div className="safari-card-price">{data.price}</div>}
      </div>

      <div className="safari-card-actions">
        <button className="safari-card-btn primary" onClick={handleDetails}>Voir Détails</button>
        <button className="safari-card-btn secondary" onClick={handleMapClick}>
          <ExternalLink size={12} /> Carte
        </button>
      </div>
    </div>
  );
};

export default DestinationCard;
