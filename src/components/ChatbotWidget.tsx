import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatMessage } from '../types';
import { supabase } from '../services/supabase.service';

const getInitialMessage = (): ChatMessage => ({
  role: 'assistant',
  content: 'Bonjour ! Je suis l\'assistant d\'Assami. Posez-moi vos questions sur son parcours, ses projets ou sa disponibilité.',
  timestamp: new Date().toISOString()
});

const SUGGESTIONS = [
  "Quel est ton stack principal ?",
  "Parle-moi d'AgroSahel AI",
  "Tu es disponible quand ?"
];

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
      console.error(e);
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
            <div className="absolute -top-10 right-0 bg-white text-bg-primary px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg animate-bounce opacity-100 group-hover:opacity-0 transition-opacity">
              Posez-moi une question
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white rotate-45" />
            </div>
          )}
          <button
            onClick={handleOpen}
            aria-label="Ouvrir le chatbot"
            className="w-14 h-14 bg-accent-ocre text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform group-hover:shadow-accent-ocre/30"
            title="Parler à l'assistant d'Assami"
          >
            <MessageSquare size={24} />
          </button>
        </div>
      )}

      {/* Widget Panel */}
      {isOpen && (
        <div className="w-[320px] h-[480px] bg-bg-card border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#8B94A3]/20 bg-[#141B22]">
            {/* Gauche : avatar + titre */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E08A3E]/20 border border-[#E08A3E]/30 flex items-center justify-center">
                <span className="text-[#E08A3E] text-xs font-[JetBrains_Mono] font-bold">
                  AB
                </span>
              </div>
              <div>
                <p className="text-[#EDEFF2] font-[Inter] text-sm font-medium">
                  Assistant d'Assami
                </p>
                <p className="text-[#8B94A3] font-[JetBrains_Mono] text-[10px]">
                  Propulsé par GPT-4o-mini
                </p>
              </div>
            </div>

            {/* Droite : reset + fermer */}
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <div className="relative group">
                  <button
                    onClick={handleClearChat}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B94A3] hover:text-[#EDEFF2] hover:bg-[#0B0F14] transition-all duration-150"
                    aria-label="Vider la conversation"
                  >
                    <RotateCcw size={14} />
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[#0B0F14] rounded-md border border-[#8B94A3]/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                    <span className="text-[#8B94A3] font-[JetBrains_Mono] text-[10px]">
                      Vider la conversation
                    </span>
                  </div>
                </div>
              )}

              {/* Bouton fermer existant */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B94A3] hover:text-[#EDEFF2] hover:bg-[#0B0F14] transition-all duration-150"
                aria-label="Fermer le chatbot"
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
                        : 'bg-[#141B22] text-[#EDEFF2] border border-white/5 rounded-2xl rounded-tl-sm'
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
                <div className="p-4 bg-[#141B22] border border-white/5 rounded-2xl rounded-tl-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center mx-4">
                Je rencontre un problème technique. Contactez Assami directement via le{' '}
                <a href="/#contact" onClick={() => setIsOpen(false)} className="underline font-medium hover:text-red-300">
                  formulaire
                </a>.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#141B22] border-t border-white/5">
            <div className="relative flex items-end bg-bg-primary border border-white/10 rounded-xl overflow-hidden focus-within:border-accent-ocre/50 focus-within:ring-1 focus-within:ring-accent-ocre/50 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 p-3 pr-12 resize-none outline-none max-h-32 min-h-[44px]"
                rows={1}
                disabled={loading}
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || loading}
                className="absolute right-2 bottom-2 p-1.5 text-accent-ocre hover:bg-accent-ocre/10 rounded-lg disabled:opacity-30 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
