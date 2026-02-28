import React from 'react';
import './SafariCards.css';
import { DriverPayload } from '../../../lib/cardPayloadBuilder';
import { MapPin, Clock, Star } from 'lucide-react';

interface Props { data: DriverPayload; }

const DriverCard: React.FC<Props> = ({ data }) => (
  <div className="safari-card driver-card">
    <div className="safari-card-avatar-wrap">
      <div className="safari-card-guide-avatar">🚗</div>
      <div className={`safari-card-status-dot ${data.distanceKm < 2 ? 'online' : 'away'}`} />
    </div>
    <div className="safari-card-body">
      <h4 className="safari-card-title">{data.name}</h4>
      <p className="safari-card-specialty">🚘 {data.vehicle}</p>
      <div className="safari-card-row">
        <Star size={12} className="safari-card-star" />
        <span className="safari-card-rating">{data.rating.toFixed(1)}</span>
      </div>
      <div className="safari-card-row">
        <MapPin size={12} style={{ color: '#06d6a0' }} />
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>{data.distanceKm} km</span>
        <Clock size={12} style={{ color: '#ffd166', marginLeft: 8 }} />
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>{data.etaMinutes} min</span>
      </div>
      <div className="safari-card-price">{data.pricePerKm} MAD/km</div>
    </div>
    <div className="safari-card-actions">
      <button className="safari-card-btn primary">Réserver</button>
    </div>
  </div>
);

export default DriverCard;
