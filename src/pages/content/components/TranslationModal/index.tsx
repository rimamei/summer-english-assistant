import { useState } from 'react';
import type { CSSProperties } from 'react';
import { X, Copy, Volume2, RotateCcw } from 'lucide-react';
import { classes } from './style';

interface TranslationModalProps {
  isVisible: boolean;
  originalText: string;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function TranslationModal({
  isVisible,
  originalText,
  onClose,
  position = { x: 0, y: 0 },
}: TranslationModalProps) {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [error, setError] = useState<string | null>(null);

  if (!isVisible) return null;

  // Mock translation function - replace with actual API call
  const handleTranslate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock translation result - replace with actual translation API
      const mockTranslation = `[Translated from ${sourceLanguage}]: ${originalText
        .split('')
        .reverse()
        .join('')}`;
      setTranslatedText(mockTranslation);
    } catch {
      setError('Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLanguage === 'en' ? 'en-US' : targetLanguage;
      speechSynthesis.speak(utterance);
    }
  };

  const primaryButtonStyle: CSSProperties = {
    ...classes.buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
  };

  const secondaryButtonStyle: CSSProperties = {
    ...classes.buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
  };

  return (
    <>
      <div
        data-summer-extension="translation-modal"
        style={{
          ...classes.modalStyle,
          left: `${Math.min(position.x, window.innerWidth - 400)}px`,
          top: `${Math.max(position.y + 40, 20)}px`,
        }}
      >
        {/* Header */}
        <div style={classes.headerStyle}>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
            }}
          >
            Translation
          </h3>
          <button
            style={{
              ...secondaryButtonStyle,
              padding: '4px',
              backgroundColor: 'transparent',
            }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={classes.contentStyle}>
          {/* Original Text */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              Original Text
            </label>
            <div style={{ position: 'relative' }}>
              <textarea value={originalText} readOnly style={classes.textAreaStyle} />
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <button
                  style={{
                    ...secondaryButtonStyle,
                    padding: '4px',
                    fontSize: '12px',
                  }}
                  onClick={() => handleCopy(originalText)}
                >
                  <Copy size={12} />
                </button>
                <button
                  style={{
                    ...secondaryButtonStyle,
                    padding: '4px',
                    fontSize: '12px',
                  }}
                  onClick={() => handleSpeak(originalText)}
                >
                  <Volume2 size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                From
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <option value="auto">Auto-detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <button
              style={{
                ...secondaryButtonStyle,
                padding: '6px',
                alignSelf: 'end',
              }}
              onClick={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            >
              <RotateCcw size={14} />
            </button>

            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                To
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>

          {/* Translate Button */}
          <button
            style={primaryButtonStyle}
            onClick={handleTranslate}
            disabled={isLoading}
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </button>

          {/* Error Display */}
          {error && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Translation Result */}
          {translatedText && (
            <div style={{ marginTop: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Translation
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={translatedText}
                  readOnly
                  style={{
                    ...classes.textAreaStyle,
                    backgroundColor: '#f0f9ff',
                    borderColor: '#bae6fd',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <button
                    style={{
                      ...secondaryButtonStyle,
                      padding: '4px',
                      fontSize: '12px',
                    }}
                    onClick={() => handleCopy(translatedText)}
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    style={{
                      ...secondaryButtonStyle,
                      padding: '4px',
                      fontSize: '12px',
                    }}
                    onClick={() => handleSpeak(translatedText)}
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
