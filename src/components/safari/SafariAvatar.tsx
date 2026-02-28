import React from 'react';
import './SafariAvatar.css';

interface SafariAvatarProps {
  size?: number;
  showPulse?: boolean;
}

const SafariAvatar: React.FC<SafariAvatarProps> = ({ size = 40, showPulse = true }) => {
  return (
    <div className="safari-avatar-wrapper" style={{ width: size, height: size }}>
      {showPulse && <span className="safari-avatar-pulse" />}
      <div className="safari-avatar-inner">
        <img
          src="/logo/logo_rs_project.png"
          alt="Safari AI"
          width={size * 0.65}
          height={size * 0.65}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="safari-avatar-fallback">🌍</span>
      </div>
    </div>
  );
};

export default SafariAvatar;
