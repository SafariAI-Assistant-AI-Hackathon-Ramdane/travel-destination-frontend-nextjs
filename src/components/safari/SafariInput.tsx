import React, { useState, useRef, KeyboardEvent } from 'react';
import './SafariInput.css';
import { Send, Camera } from 'lucide-react';

interface SafariInputProps {
  onSend: (text: string) => void;
  onImageUpload: (file: File) => void;
  disabled?: boolean;
}

const SafariInput: React.FC<SafariInputProps> = ({ onSend, onImageUpload, disabled }) => {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="safari-input-bar">
      <div className="safari-input-inner">
        <textarea
          className="safari-input-field"
          placeholder="Posez votre question à Safari... (ex: plage romantique, guide expert)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          rows={1}
        />
        <div className="safari-input-actions">
          <button
            className="safari-input-icon-btn"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            title="Recherche par image"
          >
            <Camera size={18} />
          </button>
          <button
            className="safari-input-send-btn"
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            title="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <p className="safari-input-hint">
        Appuyez sur <kbd>Entrée</kbd> pour envoyer · <kbd>Shift+Entrée</kbd> pour un saut de ligne
      </p>
    </div>
  );
};

export default SafariInput;
