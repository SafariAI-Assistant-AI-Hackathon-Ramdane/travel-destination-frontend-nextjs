import React, { useRef } from 'react';
import './SafariChat.css';
import { useSafariChat, Theme } from '../../hooks/useSafariChat';
import SafariMessage from './SafariMessage';
import SafariTypingIndicator from './SafariTypingIndicator';
import SafariInput from './SafariInput';
import SafariOnboarding from './SafariOnboarding';
import SafariAvatar from './SafariAvatar';
import { CardPayload } from '../../lib/cardPayloadBuilder';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, Compass, Home, User, LogOut, LogIn } from 'lucide-react';
import { authService } from '../../services/auth.service';

export type Lang = 'fr' | 'en' | 'ar';

interface SafariChatProps {
  onInjectCards: (cb: (cards: CardPayload[], text: string) => void) => void;
  themeRef: React.MutableRefObject<Theme>;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onThemeToggle: () => void;
}

const LANG_LABELS: Record<Lang, string> = { fr: 'FR', en: 'EN', ar: 'عر' };

const SafariChat: React.FC<SafariChatProps> = ({
  onInjectCards,
  themeRef,
  lang,
  onLangChange,
  onThemeToggle,
}) => {
  const {
    messages,
    isTyping,
    theme,
    isOnboarded,
    sendMessage,
    sendImageSearch,
    injectCards,
    completeOnboarding,
    toggleTheme,
  } = useSafariChat();

  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = authService.isAuthenticated();

  // Sync theme ref
  themeRef.current = theme;

  // Register inject function with parent
  React.useEffect(() => {
    onInjectCards(injectCards);
  }, [injectCards, onInjectCards]);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleThemeToggle = () => {
    toggleTheme();
    onThemeToggle();
  };

  return (
    <div className={`safari-chat ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Safari Header — replaces navbar on this page */}
      <div className="safari-chat-header">
        <div className="safari-chat-header-left">
          <SafariAvatar size={38} showPulse />
          <div className="safari-chat-header-info">
            <h2 className="safari-chat-name">Safari <span className="safari-chat-globe">🌍</span></h2>
            <span className="safari-chat-status">
              <span className="safari-online-dot" />
              {lang === 'ar' ? 'متصل · مساعدك المغربي' : lang === 'en' ? 'Online · Your Morocco companion' : 'En ligne · Votre compagnon Maroc'}
            </span>
          </div>
        </div>

        <div className="safari-chat-header-actions">
          {/* Language switcher */}
          <div className="safari-lang-switcher">
            <Globe size={14} />
            {(['fr', 'en', 'ar'] as Lang[]).map((l) => (
              <button
                key={l}
                className={`safari-lang-btn ${lang === l ? 'active' : ''}`}
                onClick={() => onLangChange(l)}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Dark mode toggle */}
          <button className="safari-header-icon-btn" onClick={handleThemeToggle} title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth */}
          {isLoggedIn ? (
            <>
              <button className="safari-header-icon-btn" onClick={() => navigate('/profile')} title="Profile">
                <User size={16} />
              </button>
              <button className="safari-header-icon-btn" onClick={() => { authService.logout(); window.location.reload(); }} title="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button className="safari-header-icon-btn" onClick={() => navigate('/login')} title="Login">
              <LogIn size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="safari-quick-actions">
        <button className="safari-quick-btn" onClick={() => navigate('/attractions')}>
          <Compass size={14} />
          {lang === 'ar' ? 'استكشاف المعالم' : lang === 'en' ? 'Explore Attractions' : 'Explorer les attractions'}
        </button>
        <button className="safari-quick-btn" onClick={() => navigate('/home')}>
          <Home size={14} />
          {lang === 'ar' ? 'الصفحة الرئيسية' : lang === 'en' ? 'Classic Home' : 'Accueil classique'}
        </button>
        <button className="safari-quick-btn" onClick={() => sendMessage(
          lang === 'ar' ? 'أوصيني بأماكن' : lang === 'en' ? 'Recommend me places' : 'Recommande-moi des lieux'
        )}>
          ✨ {lang === 'ar' ? 'توصيات' : lang === 'en' ? 'Recommendations' : 'Recommandations'}
        </button>
      </div>

      {/* Messages */}
      <div className="safari-chat-messages">
        {messages.map((msg) => (
          <SafariMessage key={msg.id} message={msg} theme={theme} />
        ))}

        {/* Onboarding (inline in chat if not onboarded) */}
        {!isOnboarded && messages.length <= 1 && (
          <div className="safari-chat-onboarding-wrapper">
            <SafariOnboarding onComplete={completeOnboarding} />
          </div>
        )}

        {isTyping && <SafariTypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <SafariInput
        onSend={sendMessage}
        onImageUpload={sendImageSearch}
        disabled={isTyping}
      />
    </div>
  );
};

export default SafariChat;
