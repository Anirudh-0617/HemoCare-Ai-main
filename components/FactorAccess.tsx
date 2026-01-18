
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShoppingBag, 
  Microscope, 
  Phone, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  Info,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Truck,
  Heart,
  FileText,
  MapPin,
  RefreshCcw,
  Stethoscope,
  Plus
} from 'lucide-react';
import { Medication, User } from '../types';

interface Props {
  user: User;
  meds: Medication[];
}

const FactorAccess: React.FC<Props> = ({ user, meds }) => {
  const [activeChannel, setActiveChannel] = useState<'govt' | 'private' | 'research'>('govt');
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.state_district || "Hyderabad";
          setDetectedCity(city);
        } catch (e) {
          console.error("Location detection failed", e);
          setDetectedCity("Hyderabad"); 
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
        setDetectedCity("Hyderabad");
      }
    );
  };

  const getLocalChapterInfo = () => {
    const city = detectedCity || "Hyderabad";
    if (city.toLowerCase().includes("hyderabad")) {
      return {
        name: "HSHC - Hyderabad Chapter",
        entity: "Hemophilia Society Hyderabad Chapter",
        desc: "Specialized local support for the Telangana region. Coordinates with major state hospitals for factor supply.",
        phone: "+91 40 2348 9000"
      };
    }
    return {
      name: `HS - ${city} Chapter`,
      entity: `Hemophilia Society ${city} Branch`,
      desc: `Local chapter providing emergency factor support and coordination with state medical schemes in ${city}.`,
      phone: "Contact HFI Main"
    };
  };

  const localChapter = getLocalChapterInfo();
  const isHyderabad = (detectedCity || "Hyderabad").toLowerCase().includes("hyderabad");

  const govtSources = [
    ...(isHyderabad ? [
      {
        name: "Gandhi Medical College & Hospital",
        entity: "State Government HTC - Hyderabad",
        desc: "The primary Nodal Center for Hemophilia in Telangana. Provides Factor VIII & IX under the state-sponsored free distribution scheme.",
        locations: ["Musheerabad, Hyderabad"],
        cta: "Official Portal",
        link: "https://gandhihospital.telangana.gov.in/",
        mapLink: "https://www.google.com/maps/search/?api=1&query=Gandhi+Hospital+Secunderabad",
        phone: "+91 40 2750 5566",
        highlight: true
      },
      {
        name: "Osmania General Hospital",
        entity: "State Tertiary Care Center",
        desc: "Major procurement hub for adult hemophilia patients. Offers comprehensive hematology diagnostics and clotting factor support.",
        locations: ["Afzal Gunj, Hyderabad"],
        cta: "Official Portal",
        link: "https://osmaniageneralhospital.org/",
        mapLink: "https://www.google.com/maps/search/?api=1&query=Osmania+General+Hospital+Hyderabad",
        phone: "+91 40 2460 0146",
        highlight: true
      },
      {
        name: "Niloufer Hospital for Women & Children",
        entity: "Pediatric Hemophilia Center",
        desc: "Dedicated pediatric wing for young hemophilia warriors. Specialized in child-safe infusion and dosage management for minors.",
        locations: ["Lakdikapul, Hyderabad"],
        cta: "Official Portal",
        link: "https://nilouferhospital.telangana.gov.in/",
        mapLink: "https://www.google.com/maps/search/?api=1&query=Niloufer+Hospital+Hyderabad",
        phone: "+91 40 2339 4141",
        highlight: true
      }
    ] : []),
    {
      name: "NHM Free Factor Scheme",
      entity: "National Health Mission",
      desc: "Provides life-saving factor concentrates free of charge to registered hemophilia patients in participating Indian states.",
      locations: ["AIIMS Delhi", "KEM Mumbai", "NRS Kolkata", "MMC Chennai"],
      cta: "State Guidelines",
      link: "https://nhm.gov.in/",
      mapLink: "https://www.google.com/maps/search/?api=1&query=AIIMS+Delhi+Hemophilia",
      phone: "1075 (Health Helpline)"
    },
    {
      name: localChapter.name,
      entity: localChapter.entity,
      desc: localChapter.desc,
      locations: [detectedCity || "Detecting...", "Regional Hub"],
      cta: "Contact Local Branch",
      link: "https://www.hemophilia.in/",
      mapLink: `https://www.google.com/maps/search/?api=1&query=Hemophilia+Society+${detectedCity || 'Hyderabad'}`,
      phone: localChapter.phone,
      isDynamic: true
    }
  ];

  const privateSources = [
    {
      name: "Novo Nordisk Access",
      provider: "Novo Nordisk Pharma",
      desc: "World leader in hemophilia care. Direct access to NovoSeven, NovoEight, and Esperoct via authorized pharmaceutical channels.",
      brands: ["NovoSeven", "NovoEight", "Esperoct"],
      cta: "Product Information",
      delivery: "Premium Cold Chain",
      link: "https://www.novonordisk.com/",
      color: "border-blue-200 bg-blue-50/30"
    },
    {
      name: "Specialty Distributors",
      provider: "Pharma Direct India",
      desc: "Authorized distributors for major factor brands (Roche, Takeda). Requires a valid clinical prescription and GST-compliant billing.",
      brands: ["Advate", "Hemlibra", "Eloctate"],
      cta: "Check Stock",
      delivery: "Express Cold Chain",
      link: "#"
    }
  ];

  const researchSources = [
    {
      name: "Gene Therapy Clinical Trials",
      entity: "Bio-Tech Research India",
      desc: "Ongoing trials evaluating the efficacy of AAV-based gene therapy for Hemophilia A/B patients with no inhibitors.",
      phase: "Phase 3 Enrollment",
      cta: "Check Eligibility",
      color: "border-purple-200 bg-purple-50 text-purple-700"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tightest uppercase">Factor Supply Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Navigate procurement channels for clotting factors in India.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm w-full md:w-auto">
          <button 
            onClick={() => setActiveChannel('govt')}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeChannel === 'govt' ? 'bg-medical-blue text-white shadow-lg' : 'text-slate-400'}`}
          >
            Government
          </button>
          <button 
            onClick={() => setActiveChannel('private')}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeChannel === 'private' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            Private
          </button>
          <button 
            onClick={() => setActiveChannel('research')}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeChannel === 'research' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            Research
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {activeChannel === 'govt' && (
             <div className="space-y-6 animate-in slide-in-from-left-4">
                {govtSources.map((source, i) => (
                  <div key={i} className={`bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border shadow-sm group hover:border-medical-blue transition-all ${source.highlight ? 'border-amber-200 ring-4 ring-amber-500/5' : source.isDynamic ? 'border-blue-200 ring-4 ring-blue-500/5' : 'border-slate-100 dark:border-slate-800'}`}>
                     <div className="flex justify-between items-start mb-8">
                        <div className={`p-4 rounded-2xl ${source.highlight ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/20 text-medical-blue'}`}>
                           <Building2 size={28} />
                        </div>
                        {source.highlight && (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 uppercase tracking-widest">Major Regional Hub</span>
                        )}
                        {source.isDynamic && !source.highlight && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 uppercase tracking-widest">
                            <Navigation size={12} className={isDetecting ? 'animate-spin' : ''} /> 
                            {isDetecting ? "Detecting Region..." : "Local Support"}
                          </div>
                        )}
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{source.name}</h3>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{source.entity}</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                        {source.desc}
                     </p>
                     <div className="flex flex-wrap gap-2 mb-8">
                        {source.locations.map(loc => (
                          <span key={loc} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                            <MapPin size={10} /> {loc}
                          </span>
                        ))}
                     </div>
                     <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                        <a href={source.mapLink} target="_blank" className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg">
                           <Navigation size={16} /> Get Directions
                        </a>
                        <a href={source.link} target="_blank" className={`flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg ${source.highlight ? 'bg-amber-600 shadow-amber-500/20' : 'bg-medical-blue shadow-medical-blue/10'}`}>
                           <Globe size={16} /> {source.cta}
                        </a>
                        <a href={`tel:${source.phone}`} className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                           <Phone size={16} /> {source.phone}
                        </a>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {activeChannel === 'private' && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
                {privateSources.map((source, i) => (
                  <div key={i} className={`p-8 md:p-10 rounded-[3rem] border shadow-sm group hover:border-emerald-500 transition-all ${source.color || 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                     <div className="flex justify-between items-start mb-8">
                        <div className={`p-4 rounded-2xl ${source.name.includes('Novo') ? 'bg-blue-600 text-white' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
                           <ShoppingBag size={28} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">
                           <Truck size={12} /> {source.delivery}
                        </div>
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{source.name}</h3>
                     <p className={`text-xs font-black uppercase tracking-widest mb-6 ${source.name.includes('Novo') ? 'text-blue-600' : 'text-emerald-600'}`}>{source.provider}</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                        {source.desc}
                     </p>
                     <div className="flex flex-wrap gap-2 mb-8">
                        {source.brands.map(brand => (
                          <span key={brand} className="px-4 py-2 bg-emerald-50/50 dark:bg-emerald-950 text-emerald-600 text-[10px] font-bold rounded-xl border border-emerald-100">{brand}</span>
                        ))}
                     </div>
                     <a href={source.link} target="_blank" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
                        {source.cta} <ChevronRight size={16} />
                     </a>
                  </div>
                ))}
             </div>
           )}

           {activeChannel === 'research' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95">
                {researchSources.map((source, i) => (
                  <div key={i} className={`p-8 md:p-10 rounded-[3rem] border-2 shadow-sm flex flex-col justify-between h-full ${source.color}`}>
                     <div>
                        <div className="p-4 bg-white rounded-2xl w-fit mb-8 shadow-sm">
                           <Microscope size={28} />
                        </div>
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tightest">{source.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">{source.entity}</p>
                        <p className="text-sm font-medium leading-relaxed mb-8 opacity-80">
                           {source.desc}
                        </p>
                     </div>
                     <div className="pt-6 border-t border-black/5">
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                           <span className="text-xs font-black">{source.phase}</span>
                        </div>
                        <button className="w-full py-4 bg-black/10 hover:bg-black/20 text-black/80 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                           {source.cta}
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        <div className="space-y-8">
           <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={180}/>
              </div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Verification Status</h4>
              <div className="space-y-6 relative">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/20 flex items-center justify-center text-green-500">
                       <CheckCircle2 size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-black uppercase tracking-tight">Identity Synced</p>
                       <p className="text-[10px] text-slate-500">ABDM Health ID Verified</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-500">
                       <FileText size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-black uppercase tracking-tight">Prescription Active</p>
                       <p className="text-[10px] text-slate-500">Last updated: 14 Days ago</p>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-10 py-5 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                 Download Smart Card
              </button>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <Heart className="text-red-500 mb-4 animate-pulse" size={32} />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Location Services</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                 Your current region is identified as <span className="text-medical-blue font-black">{detectedCity || "detecting..."}</span>. HemoCare is coordinating with the local chapter.
              </p>
              <button 
                onClick={detectLocation}
                className="flex items-center gap-2 text-[10px] font-black text-medical-blue uppercase tracking-widest underline underline-offset-4"
              >
                 <RefreshCcw size={12} className={isDetecting ? 'animate-spin' : ''} /> Refresh Location
              </button>
           </div>
           
           <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl"><Stethoscope size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60">Clinical Partner</p>
                <p className="font-black text-lg">Novo Nordisk</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FactorAccess;
