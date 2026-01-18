
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
            <X size={16} className="text-slate-500"/>
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
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500 relative">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Bot size={28} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight text-white leading-none uppercase">HemoCare AI</h3>
              <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-bold uppercase tracking-widest mt-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Regional Assistant Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={shareChat} type="button" className="p-3 hover:bg-white/10 rounded-xl transition-all relative group" title="Share transcript">
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
              className={`p-3 hover:bg-white/10 rounded-xl transition-all ${clearing ? 'animate-pulse opacity-50' : ''}`} 
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
              className="p-3 hover:bg-white/10 rounded-xl transition-all"
              title="Toggle protocols"
            >
              <Info size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-amber-800 uppercase tracking-widest shrink-0">
          <ShieldCheck size={12} />
          Educational content only. For emergencies in India, contact 102.
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 hide-scrollbar bg-slate-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-indigo-600 border border-slate-100'
                }`}>
                  {m.role === 'user' ? <User size={20}/> : <Bot size={20}/>}
                </div>
                <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {m.content.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600">
                    <Sparkles size={20} className="animate-spin" />
                  </div>
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-1 items-center px-4">
                     <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                     <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75" />
                     <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150" />
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <div className="relative flex items-center gap-3">
            <button type="button" className="p-4 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-2xl">
              <Mic size={20} />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Ask HemoCare AI..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] py-4.5 pl-6 pr-14 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium transition-all"
              />
              <button 
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                  input.trim() ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
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
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${selectedProtocol.bg} ${selectedProtocol.color}`}>
                  <selectedProtocol.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{selectedProtocol.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedProtocol(null)} 
                type="button" 
                className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4">
                {selectedProtocol.details.map((step: string, i: number) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                  </div>
                ))}
            </div>

            <button 
              type="button"
              onClick={() => setSelectedProtocol(null)}
              className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
