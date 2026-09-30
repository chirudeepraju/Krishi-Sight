import React, { useState, useEffect, useRef } from 'react';
import { PlantDiagnosis, ChatMessage } from '../types';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Mic,
  MicOff,
  Sprout,
  ShieldCheck,
  AlertCircle,
  Loader2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

interface AIAssistantWidgetProps {
  activeDiagnosis?: PlantDiagnosis | null;
  language: string;
  region: string;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  activeDiagnosis,
  language,
  region,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showPromptChips, setShowPromptChips] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize with personalized welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = activeDiagnosis
        ? `👨‍🌾 Namaste & Hello! I am your **Krishi-Sight AI Agronomist**. I see you're currently analyzing **${activeDiagnosis.plantSpecies}** affected by **${activeDiagnosis.diseaseOrPest.name}** (Severity ${activeDiagnosis.diseaseOrPest.severityScore}/5).\n\nAsk me about organic spray preparation, dosage, rain warnings, or cattle safety!`
        : `👨‍🌾 Namaste & Hello! I am your **Krishi-Sight AI Agronomist**. I'm here to support smallholder farmers in **${region}** with practical, low-cost advice.\n\nAsk me anything about crop diseases, organic neem sprays, yellowing leaves, fertilizer schedules, or weather protection!`;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: welcomeText,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [activeDiagnosis, region]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else {
      // Stop speech synthesis if closing
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      }
    }
  }, [isOpen]);

  // Speech Recognition (Dictation) Setup
  const toggleListening = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  // Text to Speech playback
  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for smoother voice narration
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/👨‍🌾|🌾|🌱|🌧️|🛡️|⚖️|🍂|🐛/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const handleCopy = (messageId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Clear chat history
  const handleClearHistory = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    const welcomeText = activeDiagnosis
      ? `👨‍🌾 Chat reset. I am ready with agronomic guidance for **${activeDiagnosis.plantSpecies}** (${activeDiagnosis.diseaseOrPest.name}). What would you like to know?`
      : `👨‍🌾 Chat reset. How can I assist you with your crops, soil, or organic sprays today?`;

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: welcomeText,
        timestamp: Date.now(),
      },
    ]);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuestion).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuestion('');
    setIsLoading(true);

    try {
      // Prepare compact context to respect token and payload boundaries
      const diagnosisContext = activeDiagnosis
        ? {
            plantSpecies: activeDiagnosis.plantSpecies,
            diseaseOrPest: {
              name: activeDiagnosis.diseaseOrPest.name,
              scientificName: activeDiagnosis.diseaseOrPest.scientificName,
              severityScore: activeDiagnosis.diseaseOrPest.severityScore,
              pathogenType: activeDiagnosis.diseaseOrPest.pathogenType,
            },
            organicRemedies: activeDiagnosis.organicRemedies.map((r) => ({
              name: r.name,
              preparationSteps: r.preparationSteps,
            })),
          }
        : undefined;

      const res = await fetch('/api/ask-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          diagnosisContext,
          history: newMessages.slice(-8).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          language,
          region,
        }),
      });

      const data = await res.json();
      const botReply = data.answer || 'Thank you for your question. Please ensure regular field inspection and apply organic neem spray once weekly.';

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: botReply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Assistant follow-up error:', err);
      // Fallback message
      const fallbackReply = `👨‍🌾 **Agronomist Advisory:**\n\nFor low-cost protection, spray 5ml neem oil + 1ml soap emulsified in 1L clean water early in the morning. Ensure field drainage is clear and inspect weekly.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Suggested prompts
  const suggestedPrompts = activeDiagnosis
    ? [
        `How do I prepare neem spray for ${activeDiagnosis.plantSpecies}?`,
        'Is this safe around cattle & livestock?',
        'What should I do if rain is expected today?',
        'What is the exact dosage for my sprayer?',
      ]
    : [
        'How to treat yellow leaves in paddy?',
        'How to prepare low-cost neem spray?',
        'Organic pest spray for tomato & chilli',
        'Weather & monsoon crop precautions',
      ];

  // Markdown-like text renderer
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bold processing
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-stone-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          // Bullet point
          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-emerald-600 font-bold leading-none mt-1">•</span>
                <span className="flex-1">{renderedParts}</span>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 font-normal">
                <span className="flex-1">{renderedParts}</span>
              </div>
            );
          }

          return <p key={idx}>{renderedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <aside aria-label="AI Assistant" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
      {/* 1. COLLAPSED FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <div className="relative group">
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/25 blur-sm animate-pulse group-hover:bg-emerald-500/40 transition-all duration-300" />

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-full shadow-xl shadow-emerald-950/25 hover:shadow-2xl hover:shadow-emerald-950/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-emerald-400/30"
            aria-label="Open AI Agronomist Assistant"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
              <Bot className="w-5 h-5 text-emerald-100" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-800 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-800" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5">
                AI Assistant
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              </span>
              <span className="text-[10px] text-emerald-100/90 font-medium hidden sm:inline">
                {activeDiagnosis ? `Advising: ${activeDiagnosis.plantSpecies}` : 'Agronomist Copilot'}
              </span>
            </div>

            {/* Context Badge Indicator */}
            {activeDiagnosis && (
              <span className="w-2 h-2 rounded-full bg-amber-400 border border-emerald-900" title="Active crop diagnosis context loaded" />
            )}
          </button>
        </div>
      )}

      {/* 2. EXPANDED AI ASSISTANT CHAT MODAL */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Krishi-Sight AI Assistant Chat"
          className="flex flex-col w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl shadow-emerald-950/25 overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 origin-bottom-right"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-3.5 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-emerald-100" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-800" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1">
                    Krishi-Sight AI Assistant
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-900/60 text-emerald-200 rounded border border-emerald-500/30">
                    AI Copilot
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Smallholder Agronomist • {region}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-emerald-100/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                className="p-1.5 rounded-lg text-emerald-100/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {activeDiagnosis && (
            <div className="px-3.5 py-1.5 bg-emerald-50/90 border-b border-emerald-100/80 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 truncate">
                <Sprout className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="font-medium text-emerald-950 truncate">
                  Active Context: {activeDiagnosis.plantSpecies} • {activeDiagnosis.diseaseOrPest.name}
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold flex-shrink-0">
                Grade {activeDiagnosis.diseaseOrPest.severityScore}/5
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-stone-800 bg-stone-50/50">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-xs transition-all ${
                      isAssistant
                        ? 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-sm'
                        : 'bg-emerald-700 text-white rounded-tr-sm'
                    }`}
                  >
                    {isAssistant ? (
                      renderFormattedText(msg.text)
                    ) : (
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>

                  {/* Message Action Bar (For Assistant) */}
                  {isAssistant && (
                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[11px] text-stone-400">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        title={speakingMessageId === msg.id ? 'Stop reading' : 'Read aloud'}
                        className={`flex items-center gap-1 hover:text-emerald-700 transition-colors ${
                          speakingMessageId === msg.id ? 'text-emerald-700 font-semibold' : ''
                        }`}
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-emerald-600 animate-pulse" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      <span>•</span>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy answer"
                        className="flex items-center gap-1 hover:text-emerald-700 transition-colors"
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs py-1 px-2 bg-white/80 rounded-xl border border-stone-200/80 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Agronomist consulting knowledge base...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          {showPromptChips && (
            <div className="px-3 py-2 bg-stone-100/80 border-t border-stone-200/70">
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1.5 px-0.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Suggested questions
                </span>
                <button
                  onClick={() => setShowPromptChips(false)}
                  className="text-stone-400 hover:text-stone-600"
                  title="Hide suggestions"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {suggestedPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-[11px] px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 rounded-full border border-stone-200/90 transition-colors whitespace-nowrap shadow-2xs disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input & Send Bar */}
          <div className="p-3 bg-white border-t border-stone-200/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              {/* Voice Dictation Toggle */}
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Listening... click to stop' : 'Speak your question'}
                className={`p-2 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={
                  activeDiagnosis
                    ? `Ask about ${activeDiagnosis.plantSpecies}, neem spray, dosages...`
                    : 'Ask about crops, pests, organic sprays, soil...'
                }
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 bg-stone-50/60 placeholder:text-stone-400"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                aria-label="Send question"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
