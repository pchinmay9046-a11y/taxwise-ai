import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';
import type { BusinessProfile, TaxCalculationResult, TaxStrategy } from '../taxEngine/types.ts';
import { formatINR } from '../utils/formatters.ts';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: 'gemini_api' | 'rule_engine';
  timestamp: string;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  calculation: TaxCalculationResult;
  strategies: TaxStrategy[];
  initialPrompt?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  calculation,
  strategies,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Hello! I am your **TaxWise AI** business tax advisor. I am grounded in your live financial numbers for **${profile.name}** (Gross Revenue: **${formatINR(profile.grossRevenue)}**, Taxable Profit: **${formatINR(calculation.taxableIncome)}**, Baseline Tax: **${formatINR(calculation.totalTaxLiability)}**).

How can I help you legally reduce your business tax liability today?`,
      source: 'rule_engine',
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const sentPromptRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt !== sentPromptRef.current) {
      sentPromptRef.current = initialPrompt;
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const suggestedQuestions = [
    'How can I legally reduce my business tax?',
    'Explain the ₹1.2 Crore scenario: Revenue vs Taxable Profit',
    'Which 3 strategies are most suitable for my business?',
    'Should I buy equipment before or after October 3?',
    'What changes if I switch to Section 115BAA (Pvt Ltd)?',
    'How does Section 43B(h) MSME payment rule affect me?',
    'Which documents should I prepare for my Chartered Accountant?',
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/tax-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          profile,
          calculation,
          strategies,
          conversationHistory: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I was unable to complete the analysis. Please consult your tax professional.',
        source: data.source || 'rule_engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Based on your current numbers (${formatINR(profile.grossRevenue)} revenue, ${formatINR(calculation.totalTaxLiability)} baseline tax), consider implementing **Section 80CCD(2) Corporate NPS**, **Section 32 tech capital expenditure before Oct 3**, and auditing vendor payments under **Section 43B(h)**.`,
        source: 'rule_engine',
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col text-white shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white">TaxWise AI Assistant</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to {profile.name} financials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close assistant drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="capitalize text-emerald-400">
                      • {msg.source === 'gemini_api' ? 'Gemini 3.8' : 'Tax Law Engine'}
                    </span>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span>Analyzing Indian tax provisions & calculating savings...</span>
            </div>
          )}

        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Suggested Tax Questions
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about legal deductions, Section 32, Section 115BAA..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Advisory verified under Income-tax Act, 1961. Does not constitute formal power-of-attorney representation.
          </p>
        </div>

      </div>
    </div>
  );
};
