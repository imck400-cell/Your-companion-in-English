import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage, Language } from '../types';
import { getChatResponse } from '../services/geminiService';
import { Send, User, Bot, Mic, Volume2, RefreshCw, MessageCircle } from 'lucide-react';
import { t } from '../utils/translations';

interface Props {
  user: UserProfile;
  addPoints: (n: number) => void;
  lang: Language;
}

const PERSONAS = [
  { id: 'tutor', name: 'English Tutor', emoji: '👨‍🏫', desc: 'Corrections & Explanations' },
  { id: 'barista', name: 'Coffee Shop Barista', emoji: '☕', desc: 'Ordering food & drink' },
  { id: 'friend', name: 'Casual Friend', emoji: '👋', desc: 'Daily life chat' },
  { id: 'interviewer', name: 'Job Interviewer', emoji: '💼', desc: 'Professional setting' },
];

const ConversationLab: React.FC<Props> = ({ user, addPoints, lang }) => {
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gemini history format
  const history = useRef<{role: string, parts: {text: string}[]}[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(
        history.current,
        input,
        user.level,
        selectedPersona.name
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm having trouble understanding right now.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMsg]);
      addPoints(5); // Gamification
      
      // Update Gemini history
      history.current.push({ role: 'user', parts: [{ text: userMsg.text }] });
      history.current.push({ role: 'model', parts: [{ text: aiMsg.text }] });

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Sorry, connection error.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
      setMessages([]);
      history.current = [];
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Persona Selector */}
      <div className="md:w-1/3 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('selectScenario', lang)}</h2>
        <div className="grid gap-3">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedPersona(p); clearChat(); }}
              className={`text-left p-4 rounded-xl border transition-all ${selectedPersona.id === p.id ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="bg-indigo-900 text-white p-4 rounded-xl mt-6 shadow-lg">
             <h3 className="font-bold mb-2">{t('tips', lang)}</h3>
             <p className="text-sm text-indigo-200">Try to use full sentences. The AI will correct you gently if you make mistakes typical for a {user.level} learner.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="md:w-2/3 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-[600px] md:h-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-2xl">{selectedPersona.emoji}</span>
            <span className="font-bold text-slate-800 dark:text-white">{selectedPersona.name}</span>
          </div>
          <button onClick={clearChat} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
              <RefreshCw size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 dark:text-slate-500 mt-20">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
              <p>Start a conversation with the {selectedPersona.name}!</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none rtl:rounded-bl-none rtl:rounded-br-2xl' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-2xl shadow-sm'}`}>
                <p className="whitespace-pre-wrap" dir="ltr">{msg.text}</p>
                {msg.role === 'model' && (
                    <button onClick={() => handleSpeak(msg.text)} className="mt-2 text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 block">
                        <Volume2 size={16} />
                    </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-4 rounded-bl-none">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('typeMessage', lang)}
              className="flex-1 p-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              dir="ltr"
            />
            <button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationLab;