import React from 'react';
import './SafariTypingIndicator.css';
import SafariAvatar from './SafariAvatar';

const SafariTypingIndicator: React.FC = () => {
  return (
    <div className="safari-typing-row">
      <SafariAvatar size={32} showPulse={false} />
      <div className="safari-typing-bubble">
        <span className="safari-typing-dot" />
        <span className="safari-typing-dot" />
        <span className="safari-typing-dot" />
        <span className="safari-typing-label">Safari réfléchit...</span>
      </div>
    </div>
  );
};

export default SafariTypingIndicator;
