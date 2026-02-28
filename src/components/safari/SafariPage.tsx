import React, { useCallback, useRef, useState } from 'react';
import './SafariPage.css';
import SafariChat, { Lang } from './SafariChat';
import SafariSidebar from './SafariSidebar';
import { CardPayload } from '../../lib/cardPayloadBuilder';

const SafariPage: React.FC = () => {
  const injectRef = useRef<((cards: CardPayload[], text: string) => void) | null>(null);
  const themeRef = useRef<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<Lang>('fr');
  const [themeState, setThemeState] = useState<'dark' | 'light'>('dark');

  const registerInject = useCallback((fn: (cards: CardPayload[], text: string) => void) => {
    injectRef.current = fn;
  }, []);

  const handleInjectCards = useCallback((cards: CardPayload[], text: string) => {
    injectRef.current?.(cards, text);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
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
          <SafariSidebar onInjectCards={handleInjectCards} lang={lang} />
        )}

        <SafariChat
          onInjectCards={registerInject}
          themeRef={themeRef}
          lang={lang}
          onLangChange={setLang}
          onThemeToggle={handleThemeToggle}
        />

        {lang === 'ar' && (
          <SafariSidebar onInjectCards={handleInjectCards} lang={lang} />
        )}
      </div>
    </div>
  );
};

export default SafariPage;
