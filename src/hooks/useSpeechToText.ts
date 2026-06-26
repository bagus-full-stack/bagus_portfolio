import { useState, useEffect, useRef } from 'react';

const useSpeechToText = (
  onResult: (text: string) => void,
  lang: string = 'fr-FR'
) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  // Using any here as a shortcut, ideally we'd use the types we define
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      // Erreurs silencieuses sauf "not-allowed"
      if (event.error === 'not-allowed') {
        // Micro refusé par l'utilisateur
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang]); // Re-initialize if language changes

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
    } catch {
      // Ignore
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  return { isListening, isSupported, toggleListening };
};

export default useSpeechToText;
