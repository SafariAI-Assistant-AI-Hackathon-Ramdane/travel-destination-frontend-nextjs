import { 
  Palmtree, 
  Landmark, 
  Waves, 
  Utensils, 
  Music, 
  ShoppingBag,
  Clock,
  Zap,
  Coffee,
  Wallet,
  Coins,
  Gem,
  Calendar,
  Users,
  Camera,
  Compass,
  Check
} from 'lucide-react';

interface Question {
  id: string;
  title: string;
  options: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

const questions: Question[] = [
  {
    id: 'travelStyle',
    title: 'Quel est votre style de voyage ?',
    options: [
      { id: 'solo', label: 'Solo', icon: <Compass size={24} /> },
      { id: 'couple', label: 'En couple', icon: <Users size={24} /> },
      { id: 'family', label: 'En famille', icon: <Waves size={24} /> },
      { id: 'friends', label: 'Entre amis', icon: <Music size={24} /> },
    ]
  },
  {
    id: 'interests',
    title: 'Qu\'est-ce qui vous intéresse le plus ?',
    options: [
      { id: 'culture', label: 'Culture & Histoire', icon: <Landmark size={24} /> },
      { id: 'food', label: 'Gastronomie', icon: <Utensils size={24} /> },
      { id: 'nature', label: 'Nature & Détente', icon: <Palmtree size={24} /> },
      { id: 'shopping', label: 'Shopping & Souks', icon: <ShoppingBag size={24} /> },
    ]
  },
  {
    id: 'budget',
    title: 'Quel est votre budget ?',
    options: [
      { id: 'budget', label: 'Économique', icon: <Coins size={24} /> },
      { id: 'standard', label: 'Standard', icon: <Wallet size={24} /> },
      { id: 'luxury', label: 'Luxe', icon: <Gem size={24} /> },
    ]
  },
  {
    id: 'pace',
    title: 'Quel est votre rythme préféré ?',
    options: [
      { id: 'slow', label: 'Détendu', icon: <Coffee size={24} /> },
      { id: 'moderate', label: 'Modéré', icon: <Clock size={24} /> },
      { id: 'fast', label: 'Intense', icon: <Zap size={24} /> },
    ]
  },
  {
    id: 'duration',
    title: 'Quelle est la durée de votre séjour ?',
    options: [
      { id: 'weekend', label: 'Week-end', icon: <Calendar size={24} /> },
      { id: 'week', label: 'Une semaine', icon: <Calendar size={24} /> },
      { id: 'long', label: 'Plus de 10 jours', icon: <Calendar size={24} /> },
    ]
  },
  {
    id: 'purpose',
    title: 'Quel est l\'objectif principal ?',
    options: [
      { id: 'discovery', label: 'Découverte', icon: <Compass size={24} /> },
      { id: 'relax', label: 'Se ressourcer', icon: <Waves size={24} /> },
      { id: 'photo', label: 'Photographie', icon: <Camera size={24} /> },
    ]
  }
];

interface QuickQuestionsProps {
  preferences: Record<string, string>;
  onPreferenceChange: (id: string, value: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const QuickQuestions: React.FC<QuickQuestionsProps> = ({ 
  preferences, 
  onPreferenceChange, 
  onSave,
  isSaving 
}) => {
  const isComplete = questions.every(q => preferences[q.id]);

  return (
    <div className="quick-questions-wrapper">
      <div className="quick-questions-grid">
        {questions.map((q) => (
          <div key={q.id} className="question-card">
            <h3>{q.title}</h3>
            <div className="options-grid">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  className={`option-btn ${preferences[q.id] === opt.id ? 'selected' : ''}`}
                  onClick={() => onPreferenceChange(q.id, opt.id)}
                >
                  <div className="option-icon">{opt.icon}</div>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {onSave && (
        <div className="quick-questions-actions">
          <button 
            className="save-prefs-btn" 
            onClick={onSave}
            disabled={!isComplete || isSaving}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer mes préférences'}
            {!isSaving && <Check size={20} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickQuestions;
