import React, { useState } from 'react';
import './SafariOnboarding.css';
import { OnboardingPrefs } from '../../hooks/useSafariChat';

interface SafariOnboardingProps {
  onComplete: (prefs: OnboardingPrefs) => void;
}

const STEPS = [
  {
    key: 'travelType' as keyof OnboardingPrefs,
    question: 'Quel type de voyage vous attire ? 🌍',
    options: [
      { value: 'Aventure', emoji: '🏔️', label: 'Aventure' },
      { value: 'Culture', emoji: '🏛️', label: 'Culture' },
      { value: 'Plage', emoji: '🏖️', label: 'Plage' },
      { value: 'Désert', emoji: '🐪', label: 'Désert' },
    ],
  },
  {
    key: 'budget' as keyof OnboardingPrefs,
    question: 'Quel est votre budget approximatif ? 💰',
    options: [
      { value: 'Économique', emoji: '🎒', label: 'Économique' },
      { value: 'Moyen', emoji: '✈️', label: 'Moyen' },
      { value: 'Luxe', emoji: '💎', label: 'Luxe' },
    ],
  },
  {
    key: 'groupType' as keyof OnboardingPrefs,
    question: 'Vous voyagez seul(e), en couple ou en groupe ? 👥',
    options: [
      { value: 'Seul(e)', emoji: '🚶', label: 'Seul(e)' },
      { value: 'Couple', emoji: '💑', label: 'En couple' },
      { value: 'Groupe', emoji: '👨‍👩‍👧‍👦', label: 'En groupe' },
    ],
  },
];

const SafariOnboarding: React.FC<SafariOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingPrefs>>({});

  const handleChoice = (value: string) => {
    const key = STEPS[step].key;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newAnswers as OnboardingPrefs);
    }
  };

  const current = STEPS[step];

  return (
    <div className="safari-onboarding">
      <div className="safari-onboarding-progress">
        {STEPS.map((_, i) => (
          <div key={i} className={`safari-ob-dot ${i <= step ? 'active' : ''}`} />
        ))}
      </div>
      <div className="safari-onboarding-question">
        <p>{current.question}</p>
      </div>
      <div className="safari-onboarding-options">
        {current.options.map((opt) => (
          <button
            key={opt.value}
            className="safari-ob-option"
            onClick={() => handleChoice(opt.value)}
          >
            <span className="safari-ob-emoji">{opt.emoji}</span>
            <span className="safari-ob-label">{opt.label}</span>
          </button>
        ))}
      </div>
      <p className="safari-onboarding-hint">
        Question {step + 1} sur {STEPS.length}
      </p>
    </div>
  );
};

export default SafariOnboarding;
