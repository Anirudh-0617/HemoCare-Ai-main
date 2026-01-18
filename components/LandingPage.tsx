import React, { useEffect, useState } from 'react';
import { 
  Droplets, 
  ShieldAlert, 
  Activity, 
  MessageSquare, 
  ArrowRight, 
  Dna, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Globe,
  Heart,
  ChevronDown,
  PlayCircle
} from 'lucide-react';

interface Props {
  onEnter: () => void;
}

const LandingPage: React.FC<Props> = ({ onEnter }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Activity,
      title: "Precision Matrix",
      desc: "Real-time bleed tracking with predictive joint health analytics and kinetic factor modeling.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: MessageSquare,
      title: "AI Clinical Triage",
      desc: "Gemini-powered medical assistant for immediate triage, protocol advice, and education.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      icon: ShieldAlert,
      title: "Emergency Protocol",
      desc: "One-tap digital ID and nearest ER locator with integrated emergency medical instructions.",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      icon: Dna,
      title: "Genomic Insights",
      desc: "Connect your specific mutation to global outcomes for personalized treatment efficacy.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#020617] font-inter selection:bg-medical-blue selection:text-white transition-colors duration-700">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center shadow-lg shadow-medical-blue/20">
              <Droplets className="text-white fill-white" size={20} />
            </div>
            <span className={`text-xl font-black tracking-tighter uppercase transition-colors duration-300 ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
              HemoCare AI
            </span>
          </div>
          <div className="flex items-center gap-8">
            <button 
              onClick={onEnter}
              className="px-6 py-3 bg-medical-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-medical-blue/30 hover:scale-105 active:scale-95 transition-all"
            >
              Launch Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-48 overflow-hidden bg-[#0f172a] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 pointer-events-none opacity-50" />
        
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8">
            <Sparkles size={12} /> Personalized Care Ecosystem
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.9] mb-10">
            PRECISION CARE.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">FOR THE FUTURE.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-14">
            Intelligent tracking, predictive modeling, and medical AI assistance. Built to soothe the patient journey.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onEnter}
              className="w-full sm:w-auto px-12 py-6 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Get Started <ArrowRight size={20} />
            </button>
            <a 
              href="https://youtu.be/BoXBuJSURTI?si=qdLyqRbbcJsm_nfT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-12 py-6 bg-slate-800/50 backdrop-blur-md text-white border border-slate-700 rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
            >
              <PlayCircle size={20} /> Learn Hemophilia
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 bg-[#f0f4f8] dark:bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Core Ecosystem</h2>
            <p className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Everything you need, <br />all in one calm place.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="group p-10 rounded-[3rem] bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-14 h-14 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-40 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-10">
            <Heart size={40} className="text-red-500 animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tightest mb-8 uppercase">Start Your Calm Journey</h2>
          <button 
            onClick={onEnter}
            className="px-16 py-7 bg-medical-blue text-white rounded-[3rem] font-black uppercase tracking-[0.25em] text-sm shadow-3xl shadow-medical-blue/30 hover:scale-105 active:scale-95 transition-all"
          >
            Create Your Account
          </button>
          
          <div className="mt-32 pt-12 border-t border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-8 opacity-50">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">© 2024 HemoCare AI. All Rights Reserved.</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;