import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, Loader2 } from 'lucide-react';
import { City, AIResponseState } from '../types';
import { chatWithCityPlanner } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import GroundingSources from '../components/GroundingSources';

interface PlannerProps {
  currentCity: City;
}

const Planner: React.FC<PlannerProps> = ({ currentCity }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Store the conversation to display in UI (slightly different structure than Gemini history)
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; chunks?: any[] }[]>([
    { 
      role: 'model', 
      text: `Hi! I'm your local guide for ${currentCity.name}. How can I help you plan your visit? You can ask me to plan a date night, find kid-friendly activities for Sunday, or discover hidden historical spots!` 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear chat when city changes
  useEffect(() => {
    setHistory([]);
    setMessages([{ 
      role: 'model', 
      text: `Hi! I'm your local guide for ${currentCity.name}. Ask me anything!` 
    }]);
  }, [currentCity]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const result = await chatWithCityPlanner(currentCity.name, currentCity.state, userMsg, history);

    setHistory(result.newHistory);
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: result.text, 
      chunks: result.groundingChunks 
    }]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-white rounded-t-2xl shadow-lg border border-slate-200 p-4 border-b-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-full text-orange-600">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Inside The Metro Planner</h2>
            <p className="text-xs text-slate-500">Powered by Gemini AI • {currentCity.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-auto p-4 border-x border-slate-200 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-orange-600 text-white'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-5 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                <MarkdownRenderer content={msg.text} />
              </div>
              
              {/* Show sources if available for model responses */}
              {msg.role === 'model' && msg.chunks && msg.chunks.length > 0 && (
                <div className="w-full mt-2 bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-sm">
                   <GroundingSources chunks={msg.chunks} />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-600 text-white flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-orange-600" size={18} />
              <span className="text-slate-500 text-sm">Planning your experience...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-b-2xl shadow-lg border border-slate-200 p-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${currentCity.name} (e.g., "Plan a family weekend itinerary")`}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:hover:bg-orange-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Planner;