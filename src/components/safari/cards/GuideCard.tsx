import React from 'react';
import './SafariCards.css';
import { GuidePayload } from '../../../lib/cardPayloadBuilder';
import { Star } from 'lucide-react';

interface Props { data: GuidePayload; }

const GuideCard: React.FC<Props> = ({ data }) => (
  <div className="safari-card guide-card">
    <div className="safari-card-avatar-wrap">
      <div className="safari-card-guide-avatar">🧭</div>
    </div>
    <div className="safari-card-body">
      <h4 className="safari-card-title">{data.name}</h4>
      <div className="safari-card-row">
        <Star size={12} className="safari-card-star" />
        <span className="safari-card-rating">{data.rating.toFixed(1)}</span>
      </div>
      <p className="safari-card-specialty">🎯 {data.speciality}</p>
      <div className="safari-card-langs">
        {data.languages.map((l) => (
          <span key={l} className="safari-card-lang-badge">{l}</span>
        ))}
      </div>
      <div className="safari-card-price">{data.pricePerDay} MAD/jour</div>
    </div>
    <div className="safari-card-actions">
      <button className="safari-card-btn primary">Contacter</button>
      <button className="safari-card-btn secondary">Profil</button>
    </div>
  </div>
);

export default GuideCard;
