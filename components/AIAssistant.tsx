
import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, ShieldCheck, Sparkles,
  Trash2, Share2, Mic, Info, AlertTriangle,
  ChevronRight, Phone, Droplets, LifeBuoy, X, Check
} from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { Message, BleedEntry, Medication } from '../types';

interface Props {
  bleeds?: BleedEntry[];
  meds?: Medication[];
}

const AIAssistant: React.FC<Props> = ({ bleeds = [], meds = [] }) => {
  const defaultMessages: Message[] = [
    { role: 'model', content: "Namaste! I'm your HemoCare AI. I can help with triage, treatment info, or general questions about hemophilia management in India. \n\n⚠️ Disclaimer: For educational purposes only. Not medical advice." }
  ];

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('hemocare_chat_history');
      return saved ? JSON.parse(saved) : defaultMessages;
    } catch (e) {
      return defaultMessages;
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showProtocolsMobile, setShowProtocolsMobile] = useState(false);
  const [showProtocolsDesktop, setShowProtocolsDesktop] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (!clearing) {
      localStorage.setItem('hemocare_chat_history', JSON.stringify(messages));
    }
  }, [messages, clearing]);

  const handleSend = async (content: string = input) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await chatWithAI([...messages, userMsg], { bleeds, meds });
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setLoading(false);
  };

  const clearChat = () => {
    setClearing(true);
    // Instant visual feedback
    const resetMsg: Message[] = [{ role: 'model', content: "History cleared. How can I assist with your care today?" }];
    setMessages(resetMsg);
    localStorage.removeItem('hemocare_chat_history');

    setTimeout(() => {
      setClearing(false);
    }, 500);
  };

  const shareChat = async () => {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HemoCare AI Chat Transcript',
          text: text
        });
      } catch (err) {
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const protocols = [
    {
      title: "Head Injury",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      text: "CALL 102 (Ambulance). Do not wait for symptoms. Infuse immediately if you have factor at home.",
      details: [
        "Call 102 or your local emergency number immediately.",
        "Infuse a 100% correction dose of Factor VIII/IX immediately.",
        "Do NOT wait for imaging before treating.",
        "Watch for: Nausea, projectile vomiting, unusual sleepiness.",
        "Keep the person upright and calm."
      ]
    },
    {
      title: "Joint Bleed",
      icon: Droplets,
      color: "text-blue-600",
      bg: "bg-blue-50",
      text: "Infuse Factor ASAP. Apply RICE (Rest, Ice, Compression, Elevation). Do not bear weight.",
      details: [
        "Infuse your recommended correction dose immediately.",
        "REST: Immobilize the joint immediately.",
        "ICE: Apply cold pack for 15-20 mins (indirectly).",
        "COMPRESSION: Use an elastic bandage.",
        "ELEVATION: Keep the joint above heart level."
      ]
    },
    {
      title: "Muscle Bleed",
      icon: LifeBuoy,
      color: "text-orange-600",
      bg: "bg-orange-50",
      text: "Urgent if psoas or thigh. Infuse immediately. Avoid massage or heat in the first 48 hours.",
      details: [
        "Psoas bleeds are medical emergencies.",
        "Infuse Factor immediately.",
        "Strict bed rest is required.",
        "Avoid NSAIDs for pain control.",
        "Consult hematology before starting PT."
      ]
    }
  ];

  const ProtocolList = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-[10px]">Protocol Matrix (IN)</h4>
        {onClose && (
          <button onClick={onClose} type="button" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        )}
      </div>
      {protocols.map((p, i) => (
        <div key={i} className={`p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all ${p.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl bg-white shadow-xs ${p.color}`}>
              <p.icon size={18} />
            </div>
            <span className="font-black text-slate-800 text-xs uppercase">{p.title}</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium mb-4 leading-relaxed">
            {p.text}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedProtocol(p);
              if (onClose) onClose();
            }}
            className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest group"
          >
            Detailed Guide <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ))}

      <div className="mt-auto p-6 bg-slate-900 rounded-[2rem] text-white">
        <Phone className="text-red-500 mb-3" size={24} />
        <p className="font-black text-[10px] mb-1 uppercase tracking-widest opacity-60">AIIMS Emergency</p>
        <p className="text-lg font-black mb-4 tracking-tighter text-white">+91 11-2658-8500</p>
        <a
          href="tel:+911126588500"
          className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
        >
          <Phone size={14} /> Call ER
        </a>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-8 animate-in fade-in duration-500 relative pb-6">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-50"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot size={28} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tight text-white leading-none uppercase">HemoCare AI</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Regional Assistant Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button onClick={shareChat} type="button" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md relative group" title="Share transcript">
              <Share2 size={20} className="text-white" />
              {copied && (
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                  Copied
                </span>
              )}
            </button>
            <button
              onClick={clearChat}
              type="button"
              disabled={clearing}
              className={`p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md ${clearing ? 'animate-pulse opacity-50' : ''}`}
              title="Clear chat"
            >
              <Trash2 size={20} className="text-white" />
            </button>
            <button
              onClick={() => {
                setShowProtocolsMobile(true);
                setShowProtocolsDesktop(!showProtocolsDesktop);
              }}
              type="button"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md lg:hidden"
              title="Toggle protocols"
            >
              <Info size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/40 px-8 py-3 flex items-center gap-3 text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest shrink-0">
          <ShieldCheck size={14} />
          <span>Educational content only. For emergencies in India, contact 102.</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 hide-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-8 group`}>
              <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-800 text-blue-600 border border-slate-100 dark:border-slate-700'
                  }`}>
                  {m.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>

                <div className={`p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm relative ${m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                  }`}>
                  {m.content.split('\n').map((line, idx) => (
                    <p key={idx} className={`${idx > 0 ? 'mt-3' : ''} ${line.startsWith('⚠️') ? 'font-bold text-amber-600' : ''}`}>
                      {line}
                    </p>
                  ))}
                  <div className={`text-[9px] font-bold uppercase tracking-widest mt-3 opacity-0 group-hover:opacity-40 transition-opacity ${m.role === 'user' ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                    {m.role === 'user' ? 'You' : 'HemoCare AI'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-600 shadow-md">
                  <Sparkles size={18} className="animate-spin duration-1000" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] rounded-tl-sm border border-slate-200 dark:border-slate-700 flex gap-2 items-center shadow-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm">
            <button type="button" className="p-4 text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all">
              <Mic size={20} />
            </button>
            <input
              type="text"
              placeholder="Ask a medical question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white font-medium placeholder:text-slate-400 h-full py-2"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className={`p-4 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 ${input.trim()
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
            >
              <Send size={20} className={input.trim() ? 'ml-0.5' : ''} />
            </button>
          </div>
          <div className="text-center mt-3">
            <p className="text-[10px] text-slate-400 font-medium">HemoCare AI can make mistakes. Always verify important information.</p>
          </div>
        </div>
      </div>

      {/* Protocols Mobile Overlay */}
      {showProtocolsMobile && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowProtocolsMobile(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <ProtocolList onClose={() => setShowProtocolsMobile(false)} />
          </div>
        </div>
      )}

      {/* Protocols Desktop Sidebar */}
      <div className={`hidden lg:block w-80 shrink-0 transition-all duration-300 ${showProtocolsDesktop ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none w-0'}`}>
        <ProtocolList />
      </div>

      {/* Protocol Detail Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" onClick={() => setSelectedProtocol(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${selectedProtocol.bg} ${selectedProtocol.color}`}>
                  <selectedProtocol.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedProtocol.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Protocol #0{protocols.indexOf(selectedProtocol) + 1}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProtocol(null)}
                type="button"
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-8">
              {selectedProtocol.details.map((step: string, i: number) => (
                <div key={i} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-blue-900/10">{i + 1}</div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed pt-1.5">{step}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedProtocol(null)}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              Close Protocol Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
