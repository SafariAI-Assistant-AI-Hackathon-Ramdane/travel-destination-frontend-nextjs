import React from 'react';
import './SafariMessage.css';
import SafariAvatar from './SafariAvatar';
import { ChatMessage } from '../../hooks/useSafariChat';
import { CardPayload } from '../../lib/cardPayloadBuilder';
import DestinationCard from './cards/DestinationCard';
import GuideCard from './cards/GuideCard';
import DriverCard from './cards/DriverCard';
import RestaurantCard from './cards/RestaurantCard';
import ItineraryCard from './cards/ItineraryCard';
import ActivityCard from './cards/ActivityCard';

interface SafariMessageProps {
  message: ChatMessage;
  theme: 'dark' | 'light';
}

// Simple bold renderer: **text** → <strong>
function renderText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderCard(card: CardPayload, idx: number): React.ReactNode {
  switch (card.type) {
    case 'destination':
      return <DestinationCard key={idx} data={card.data} />;
    case 'guide':
      return <GuideCard key={idx} data={card.data} />;
    case 'driver':
      return <DriverCard key={idx} data={card.data} />;
    case 'restaurant':
      return <RestaurantCard key={idx} data={card.data} />;
    case 'itinerary':
      return <ItineraryCard key={idx} data={card.data} />;
    case 'activity':
      return <ActivityCard key={idx} data={card.data} />;
    default:
      return null;
  }
}

const SafariMessage: React.FC<SafariMessageProps> = ({ message, theme }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`safari-msg-row ${isUser ? 'user-row' : 'safari-row'}`}>
      {!isUser && <SafariAvatar size={34} showPulse={false} />}

      <div className={`safari-msg-content ${isUser ? 'user-content' : 'safari-content'}`}>
        <div className={`safari-msg-bubble ${isUser ? 'user-bubble' : 'safari-bubble'}`}>
          <p>{renderText(message.text)}</p>
        </div>

        {message.cards && message.cards.length > 0 && (
          <div className="safari-cards-row">
            {message.cards.map((card, idx) => renderCard(card, idx))}
          </div>
        )}

        <span className="safari-msg-time">
          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="safari-user-icon">
          <span>👤</span>
        </div>
      )}
    </div>
  );
};

export default SafariMessage;
