import React, { useState, useEffect, useRef } from 'react';
import { Transaction, ChatMessage } from '../types';
import { chatWithFinancialData } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AskAIProps {
  transactions: Transaction[];
}

const SUGGESTED_PROMPTS = [
  "How much did I spend on Food this month?",
  "What is my highest expense category?",
  "Am I overspending on Entertainment?",
  "Analyze my spending habits.",
  "How much money do I have left?"
];

const AskAI: React.FC<AskAIProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your AI financial assistant. Ask me anything about your spending, budget, or financial habits.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await chatWithFinancialData(text, transactions);

    const aiMsg: ChatMessage = {
      id: uuidv4(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Financial Assistant</h3>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500">Online</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-950 scroll-smooth" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
            <div className={`flex max-w-[85%] lg:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${msg.role === 'user'
                  ? 'bg-indigo-600 border-indigo-600 ml-3'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mr-3'
                }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-xl text-sm leading-relaxed border ${msg.role === 'user'
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Suggested Prompts (Only show if few messages) */}
        {messages.length === 1 && !isTyping && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-14 pr-4 animate-fadeIn">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
              >
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1">{prompt}</p>
                <span className="text-[10px] text-slate-400 flex items-center">
                  Ask AI <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="flex flex-row">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 mr-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your spending..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-medium text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskAI;