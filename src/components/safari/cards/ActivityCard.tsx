import React, { useState } from 'react';
import './SafariCards.css';
import { ActivityPayload } from '../../../lib/cardPayloadBuilder';
import { Clock, Star } from 'lucide-react';

interface Props { data: ActivityPayload; }

const ActivityCard: React.FC<Props> = ({ data }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="safari-card activity-card">
      <div className="safari-card-image-wrap">
        {!imgError ? (
          <img src={data.imageUrl} alt={data.name} className="safari-card-img" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="safari-card-img-fallback">🎈</div>
        )}
        <div className="safari-card-type-badge">
          <Clock size={10} /> {data.duration}
        </div>
      </div>
      <div className="safari-card-body">
        <h4 className="safari-card-title">{data.name}</h4>
        <div className="safari-card-row">
          <Star size={12} className="safari-card-star" />
          <span className="safari-card-rating">{data.rating.toFixed(1)}</span>
        </div>
        <div className="safari-card-price">{data.price} MAD/pers.</div>
        <div className="safari-activity-availabilities">
          {data.availabilities.map((a, i) => (
            <span key={i} className="safari-avail-chip">{a}</span>
          ))}
        </div>
      </div>
      <div className="safari-card-actions">
        <button className="safari-card-btn primary">Réserver</button>
      </div>
    </div>
  );
};

export default ActivityCard;
