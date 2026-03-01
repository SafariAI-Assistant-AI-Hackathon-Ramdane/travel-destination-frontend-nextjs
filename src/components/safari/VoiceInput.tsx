import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceInputProps {
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ disabled }) => {
  return (
    <button
      className="safari-input-icon-btn voice-input-btn"
      disabled={disabled}
      title="Entrée vocale (Bientôt disponible)"
      type="button"
    >
      <Mic size={18} />
    </button>
  );
};

export default VoiceInput;
