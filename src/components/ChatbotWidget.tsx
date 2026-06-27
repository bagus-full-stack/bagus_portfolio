import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, RotateCcw, Mic, MicOff, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatMessage } from '../types';
import { supabase } from '../services/supabase.service';
import useSpeechToText from '../hooks/useSpeechToText';
import { useTranslation } from '../hooks/useTranslation';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastMessageTime = useRef<number>(0);

  const { t, lang: language } = useTranslation();
  const speechLang = language === 'en' ? 'en-US' : 'fr-FR';

  const getInitialMessage = (): ChatMessage => ({
    role: 'assistant',
    content: t('chatbot.welcome'),
    timestamp: new Date().toISOString()
  });

  const SUGGESTIONS: string[] = t('chatbot.suggestions', { returnObjects: true }) || [];

  const { isListening, isSupported, toggleListening } = useSpeechToText((transcript) => {
    setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
  }, speechLang);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    // Pulse animation after 5s
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) setShowPulse(true);
    }, 5000);

    // Load from session storage
    const saved = sessionStorage.getItem('chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([getInitialMessage()]);
      }
    } else {
      setMessages([getInitialMessage()]);
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      // Save max 10 messages
      const toSave = messages.slice(-10);
      sessionStorage.setItem('chat_history', JSON.stringify(toSave));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowPulse(false);
    setTimeout(scrollToBottom, 100);
  };

  const handleClearChat = () => {
    setMessages([getInitialMessage()]);
    sessionStorage.removeItem('chat_history');
  };

  const handleSend = async (text: string) => {
    if (Date.now() - lastMessageTime.current < 3000) {
      alert("Veuillez patienter 3 secondes entre chaque message.");
      return;
    }
    lastMessageTime.current = Date.now();

    const trimmedText = text.trim();
    if (!trimmedText || loading) return;

    if (trimmedText.length > 500) {
      alert("Votre message est trop long. Veuillez le limiter à 500 caractères.");
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmedText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    setError(false);

    abortControllerRef.current = new AbortController();

    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error: invokeError } = await supabase.functions.invoke('chat-resume', {
        body: { message: trimmedText, history: messages.slice(-10) },
        signal: abortControllerRef.current.signal
      } as any);
      
      if (invokeError) throw invokeError;
      
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Request cancelled due to unmount');
        return;
      }
      // console.error(e);
      setError(true);
      // We don't add an error message to the history as requested, just show inline error
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="no-print chatbot-widget fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Widget Button */}
      {!isOpen && (
        <div className="relative group">
          {showPulse && (
            <div className="absolute -top-10 right-0 bg-[var(--text-primary)] text-[var(--bg-primary)] px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg animate-bounce opacity-100 group-hover:opacity-0 transition-opacity">
              {t('chatbot.bubble')}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[var(--text-primary)] rotate-45" />
            </div>
          )}
          <button
            onClick={handleOpen}
            aria-label={t('chatbot.open')}
            className="w-14 h-14 bg-accent-ocre text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform group-hover:shadow-accent-ocre/30"
            title={t('chatbot.title')}
          >
            <MessageSquare size={24} />
          </button>
        </div>
      )}

      {/* Widget Panel */}
      {isOpen && (
        <div className="w-[calc(100vw-48px)] sm:w-[380px] h-[500px] sm:h-[560px] max-h-[calc(100vh-100px)] bg-bg-card border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]/20 bg-[var(--bg-card)]">
            {/* Gauche : avatar + titre */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E08A3E]/20 border border-[#E08A3E]/30 flex items-center justify-center">
                <span className="text-[#E08A3E] text-xs font-[JetBrains_Mono] font-bold">
                  AB
                </span>
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-[Inter] text-sm font-medium">
                  {t('chatbot.title')}
                </p>
                <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px]">
                  {t('chatbot.powered')}
                </p>
              </div>
            </div>

            {/* Droite : reset + fermer */}
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <div className="relative group">
                  <button
                    onClick={handleClearChat}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all duration-150"
                    aria-label={t('chatbot.clear')}
                  >
                    <RotateCcw size={14} />
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[var(--bg-primary)] rounded-md border border-[var(--border-subtle)]/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                    <span className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px]">
                      {t('chatbot.clear')}
                    </span>
                  </div>
                </div>
              )}

              {/* Bouton fermer existant */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all duration-150"
                aria-label={t('chatbot.close')}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth hide-scrollbar bg-bg-primary/50">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.timestamp + idx}
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div
                    className={`p-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent-ocre text-white rounded-2xl rounded-tr-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-white/5 rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="font-mono text-[10px] text-text-muted mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Suggestions (only show if it's just the initial message) */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="flex flex-col max-w-[85%] mr-auto items-start">
                <div className="p-4 bg-[var(--bg-card)] border border-white/5 rounded-2xl rounded-tl-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center mx-4">
                {t('chatbot.error')}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]/20">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                  placeholder={
                    isListening
                      ? t('chatbot.listening')
                      : t('chatbot.placeholder')
                  }
                  rows={1}
                  className={`
                    w-full bg-[var(--bg-primary)] rounded-xl px-4 py-2.5
                    pr-10 text-[var(--text-primary)] font-[Inter] text-sm
                    placeholder:text-[var(--text-muted)] resize-none
                    focus:outline-none transition-all duration-200
                    border min-h-[44px]
                    ${isListening
                      ? 'border-[#EF4444]/50 bg-[#EF4444]/5'
                      : 'border-[var(--border-subtle)]/20 focus:border-[#2DD4BF]/40'
                    }
                  `}
                  style={{
                    maxHeight: '96px',
                    overflowY: 'auto'
                  }}
                  disabled={isListening || loading}
                />

                {isListening && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1 bg-[#EF4444] rounded-full animate-pulse"
                        style={{
                          height: `${8 + i * 4}px`,
                          animationDelay: `${i * 150}ms`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {isSupported && (
                <div className="relative group shrink-0">
                  <button
                    onClick={toggleListening}
                    className={`
                      w-[44px] h-[44px] rounded-xl flex items-center
                      justify-center transition-all duration-200
                      ${isListening
                        ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 animate-pulse'
                        : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-subtle)]/20 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]/40'
                      }
                    `}
                    aria-label={
                      isListening
                        ? t('chatbot.stop')
                        : t('chatbot.dictate')
                    }
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  {!isListening && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--bg-primary)] rounded-md border border-[var(--border-subtle)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-10">
                      <span className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px]">
                        {t('chatbot.dictate')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || loading}
                className="w-[44px] h-[44px] rounded-xl shrink-0 flex items-center justify-center bg-[#E08A3E] text-white hover:bg-[#C97A35] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={t('chatbot.send')}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
