import React from 'react';
import './SafariCards.css';
import { ItineraryPayload } from '../../../lib/cardPayloadBuilder';

interface Props { data: ItineraryPayload; }

const ItineraryCard: React.FC<Props> = ({ data }) => (
  <div className="safari-card itinerary-card">
    <div className="safari-card-body">
      <div className="safari-itinerary-header">
        <span className="safari-itinerary-icon">📅</span>
        <div>
          <h4 className="safari-card-title" style={{ marginBottom: 2 }}>Itinéraire {data.days.length} jours</h4>
          <div className="safari-card-price">{data.totalBudget}</div>
        </div>
      </div>

      <div className="safari-timeline">
        {data.days.map((day) => (
          <div key={day.day} className="safari-timeline-item">
            <div className="safari-timeline-dot" />
            <div className="safari-timeline-content">
              <span className="safari-timeline-day">J{day.day}</span>
              <span className="safari-timeline-title">{day.title}</span>
              <ul className="safari-timeline-activities">
                {day.activities.map((act, i) => <li key={i}>{act}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ItineraryCard;
