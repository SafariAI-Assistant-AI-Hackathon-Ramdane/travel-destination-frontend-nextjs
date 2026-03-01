import React, { useCallback, useRef, useState } from 'react';
import './SafariPage.css';
import SafariChat, { Lang } from './SafariChat';
import SafariSidebar from './SafariSidebar';
import { CardPayload } from '../../lib/cardPayloadBuilder';

const SafariPage: React.FC = () => {
  const injectRef = useRef<((cards: CardPayload[], text: string) => void) | null>(null);
  const sendMessageRef = useRef<((text: string) => void) | null>(null);
  const themeRef = useRef<'dark' | 'light'>('light');
  const [lang, setLang] = useState<Lang>('fr');
  const [themeState, setThemeState] = useState<'dark' | 'light'>('light');
  const [showSidebar, setShowSidebar] = useState(true);

  // Initialize theme on mount
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const registerInject = useCallback((fn: (cards: CardPayload[], text: string) => void) => {
    injectRef.current = fn;
  }, []);

  const registerSendMessage = useCallback((fn: (text: string) => void) => {
    sendMessageRef.current = fn;
  }, []);

  const handleInjectCards = useCallback((cards: CardPayload[], text: string) => {
    injectRef.current?.(cards, text);
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    sendMessageRef.current?.(text);
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newTheme = themeState === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, [themeState]);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  return (
    <div className={`safari-page ${lang === 'ar' ? 'safari-rtl' : ''}`} data-theme={themeState}>
      {/* Ambient background orbs */}
      <div className="safari-bg-orb orb-1" />
      <div className="safari-bg-orb orb-2" />
      <div className="safari-bg-orb orb-3" />

      <div className="safari-layout">
        {/* Sidebar on LEFT for FR/EN (before chat), on RIGHT for AR (after chat) */}
        {lang !== 'ar' && (
          <SafariSidebar 
            onInjectCards={handleInjectCards} 
            onSendMessage={handleSendMessage} 
            lang={lang} 
            isVisible={showSidebar}
          />
        )}

        <SafariChat
          onInjectCards={registerInject}
          onSendMessage={registerSendMessage}
          themeRef={themeRef}
          lang={lang}
          onLangChange={setLang}
          onThemeToggle={handleThemeToggle}
          onToggleSidebar={handleToggleSidebar}
          isSidebarVisible={showSidebar}
        />

        {lang === 'ar' && (
          <SafariSidebar 
            onInjectCards={handleInjectCards} 
            onSendMessage={handleSendMessage} 
            lang={lang} 
            isVisible={showSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default SafariPage;
