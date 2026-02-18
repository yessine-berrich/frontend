'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2, FileText } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: Array<{ id: string | number; title: string; similarity: number }>;
}

interface SuggestedQuestion {
  id: string;
  text: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content:
      'Bonjour ! Je suis votre assistant IA avec recherche sémantique (RAG).\nPosez-moi une question sur les articles de la base de connaissances.',
    role: 'assistant',
    timestamp: new Date(),
  },
];

const suggestedQuestions: SuggestedQuestion[] = [
  { id: '1', text: 'Comment installer le serveur ?' },
  { id: '2', text: 'Quelle est la procédure de déploiement ?' },
  { id: '3', text: 'Guide de configuration Docker' },
  { id: '4', text: 'Comment gérer les utilisateurs ?' },
];

export default function AIAssistantWithAPI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (questionText?: string) => {
    const messageText = questionText || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3000/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: messageText.trim(),
          limit: 5,           // ← ajuste selon tes besoins
          minSimilarity: 0.25, // ← seuil raisonnable, à calibrer
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Réponse invalide');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer || "Je n'ai pas de réponse pertinente pour le moment.",
        role: 'assistant',
        timestamp: new Date(),
        sources: data.retrieved_articles || [],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Erreur RAG API:', error);

      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        content:
          'Désolé, une erreur est survenue lors de la recherche.\nVeuillez réessayer ou reformuler votre question.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center animate-fadeIn group"
          aria-label="Ouvrir l'assistant IA"
        >
          <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
            RAG
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-96 sm:w-[420px] h-[580px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Assistant IA (RAG)</h3>
                <p className="text-xs opacity-85">Recherche sémantique • {248} articles</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/70 dark:bg-gray-950 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-messageSlide ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    message.role === 'assistant'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>

                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'assistant'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
                      : 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                  }`}
                >
                  {message.content}

                  {/* Affichage des sources si présentes */}
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                      <p className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Sources utilisées :
                      </p>
                      <ul className="space-y-1 pl-1">
                        {message.sources.map((src, i) => (
                          <li
                            key={src.id}
                            className="text-blue-600 dark:text-blue-400 truncate"
                          >
                            {i + 1}. {src.title} • {(src.similarity * 100).toFixed(0)}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="h-2.5 w-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:180ms]" />
                    <div className="h-2.5 w-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:360ms]" />
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && !isTyping && (
              <div className="mt-4 space-y-2.5 px-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 px-3">
                  Essayez ces questions :
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleSuggestedQuestion(q.text)}
                      className="text-left px-4 py-2.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question sur la base de connaissances..."
                disabled={isTyping}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[52px] transition-colors shadow-sm"
                aria-label="Envoyer"
              >
                {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2.5">
              Réponses générées à partir de la base de connaissances • Expérimental
            </p>
          </div>
        </div>
      )}

      {/* Animations et scrollbar */}
      <style jsx global>{`
        @keyframes fadeIn    { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp   { from { opacity:0; transform: translateY(24px) scale(0.94) } to { opacity:1; transform: none } }
        @keyframes messageSlide { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform: none } }

        .animate-fadeIn       { animation: fadeIn 0.35s ease-out; }
        .animate-slideUp      { animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-messageSlide { animation: messageSlide 0.25s ease-out; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </>
  );
}