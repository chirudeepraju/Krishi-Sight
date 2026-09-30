import React, { useState, useRef, useEffect } from 'react';
import { PlantDiagnosis, ChatMessage } from '../types';
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, HelpCircle } from 'lucide-react';

interface FollowUpChatProps {
  diagnosis: PlantDiagnosis;
  language: string;
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({ diagnosis, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agronomist',
      text: `Hello farmer! I have diagnosed your ${diagnosis.plantSpecies} for ${diagnosis.diseaseOrPest.name}. Do you have any questions about preparing the organic spray, dosage timings, or crop safety?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = [
    'Can I spray neem oil if it might rain today?',
    'Is it safe for cows/goats to graze near sprayed crop?',
    'How do I prepare sour buttermilk spray step-by-step?',
    'Should I pluck and burn heavily infected leaves first?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          diagnosisContext: diagnosis,
          history: messages,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach agronomist service.');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: 'agri-' + Date.now(),
        sender: 'agronomist',
        text: data.answer || 'I am ready to help with your crop treatment questions.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'agronomist',
        text: 'Sorry, I had trouble connecting to the agronomy advisory service. Please check your connection and ask again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span>Krishi-Sight Agronomist Consultation</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                Live Q&amp;A
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              Ask follow-up questions regarding spray mixing, rain intervals, or organic safety
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-3.5 h-[280px] overflow-y-auto flex flex-col gap-2.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`p-3 rounded-xl text-xs leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-800 text-white rounded-tr-xs font-medium'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs whitespace-pre-line'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="self-start flex items-center gap-2 text-xs text-emerald-800 bg-white border border-stone-200 p-2.5 rounded-xl">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Agronomist reviewing treatment guidelines...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-emerald-600" /> Farmer FAQ:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md transition cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 mt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about this diagnosis (e.g., 'Can I mix wood ash with buttermilk?')"
          disabled={isLoading}
          className="flex-1 text-xs text-stone-800 p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white p-2.5 rounded-xl shadow-xs transition disabled:opacity-40 cursor-pointer"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
