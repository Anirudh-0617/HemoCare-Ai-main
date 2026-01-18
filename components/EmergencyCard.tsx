
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Droplets, MapPin, User, Info, CreditCard, Share2, AlertTriangle, Navigation, Heart, BriefcaseMedical, Building2, RefreshCcw } from 'lucide-react';
import { User as UserType, Medication, GeneticProfile, TeamMember } from '../types';

interface Props {
  user: UserType;
  meds: Medication[];
  geneticProfile: GeneticProfile | null;
  team: TeamMember[];
  onFindER?: () => void;
}

interface LocalChapter {
  name: string;
  phone: string;
  address: string;
  city: string;
}

const EmergencyCard: React.FC<Props> = ({ user, meds, geneticProfile, team, onFindER }) => {
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const primaryMed = meds[0];
  const htcContact = team.find(t => t.type === 'medical' || !t.type);
  const personalContact = team.find(t => t.type === 'personal');

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
          setDetectedCity("Hyderabad");
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setDetectedCity("Hyderabad");
        setIsDetecting(false);
      }
    );
  };

  const getChapterData = (): LocalChapter => {
    const city = detectedCity || "Hyderabad";
    if (city.toLowerCase().includes("hyderabad")) {
      return {
        name: "HS OF HYD CHAP",
        city: "Hyderabad",
        phone: "+91 40 2348 9000",
        address: "NIMS Campus, Punjagutta, Hyderabad, Telangana"
      };
    } else if (city.toLowerCase().includes("delhi")) {
      return {
        name: "HS OF DELHI CHAP",
        city: "Delhi",
        phone: "+91 11 2623 3513",
        address: "Sarita Vihar, New Delhi"
      };
    }
    return {
      name: `HS OF ${city.toUpperCase()} CHAP`,
      city: city,
      phone: "+91 11 2623 3513", // Fallback to HFI Main
      address: `Contact Regional Chapter in ${city}`
    };
  };

  const localChapter = getChapterData();

  const getDeficiencyLabel = () => {
    if (!geneticProfile) return 'HEMOPHILIA';
    switch (geneticProfile.gene) {
      case 'F7': return 'FACTOR VII DEFICIENCY';
      case 'F8': return 'HEMOPHILIA A';
      case 'F9': return 'HEMOPHILIA B';
      case 'F11': return 'HEMOPHILIA C (F-XI)';
      case 'VWF': return 'VON WILLEBRAND DISEASE';
      default: return 'HEMOPHILIA';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-red-600 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <ShieldAlert size={160} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Life Alert</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tightest leading-[0.9]">Emergency Digital ID</h2>
            <p className="text-xl md:text-2xl opacity-90 font-black mt-4">
              I have {getDeficiencyLabel()} (Severe)
            </p>
          </div>
          <button 
            onClick={onFindER}
            className="px-8 py-5 bg-white text-red-600 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Navigation size={20} /> Find Nearest ER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
           <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex items-center gap-3 mb-8 text-slate-400">
               <User size={20} />
               <h3 className="font-black uppercase tracking-widest text-[10px]">Patient Identity</h3>
             </div>
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Full Name</p>
                 <p className="text-lg font-black text-slate-800 dark:text-white">{user.name}</p>
               </div>
               <div className="flex justify-between items-center">
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Blood Type</p>
                 <p className="text-lg font-black text-red-600">O Positive (Ref)</p>
               </div>
               <div className="flex justify-between items-center">
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Diagnosis</p>
                 <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                   {geneticProfile ? `Severe ${geneticProfile.gene}` : 'Severe Hemophilia'}
                 </p>
               </div>
             </div>
           </section>

           <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex items-center gap-3 mb-8 text-slate-400">
               <Droplets size={20} />
               <h3 className="font-black uppercase tracking-widest text-[10px]">Clinical Protocols</h3>
             </div>
             <div className="space-y-6">
               <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30">
                  <p className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase mb-3 flex items-center gap-2"><ShieldAlert size={14}/> Urgent Instruction</p>
                  <p className="text-sm text-red-900 dark:text-red-200 font-bold leading-relaxed">IN CASE OF TRAUMA: Administer dose of {geneticProfile ? getDeficiencyLabel() : 'Factor'} immediately. DO NOT wait for imaging or laboratory results for head trauma.</p>
               </div>
             </div>
           </section>
        </div>

        <div className="space-y-8">
           {/* Local Chapter Section */}
           <section className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Building2 size={80} />
             </div>
             <div className="flex items-center gap-3 mb-6">
               <h3 className="font-black uppercase tracking-widest text-[10px] opacity-80">Local Support Chapter</h3>
               <button onClick={detectLocation} className="p-1 hover:bg-white/10 rounded-lg transition-all">
                  <RefreshCcw size={12} className={isDetecting ? 'animate-spin' : ''} />
               </button>
             </div>
             <div className="space-y-4">
                <div>
                   <h4 className="text-2xl font-black tracking-tightest leading-none">{localChapter.name}</h4>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Hemophilia Society of India</p>
                </div>
                <div className="flex items-start gap-3 mt-6">
                   <MapPin size={16} className="shrink-0 mt-0.5" />
                   <p className="text-xs font-bold leading-relaxed">{localChapter.address}</p>
                </div>
                <div className="flex gap-4 pt-4">
                   <a href={`tel:${localChapter.phone}`} className="flex-1 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg">
                      <Phone size={14} /> {localChapter.phone}
                   </a>
                </div>
             </div>
           </section>

           <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex items-center gap-3 mb-8 text-slate-400">
               <Phone size={20} />
               <h3 className="font-black uppercase tracking-widest text-[10px]">Support Circle Access</h3>
             </div>
             <div className="space-y-4">
               {htcContact ? (
                 <div className="flex items-center justify-between p-5 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                        <BriefcaseMedical size={12} className="text-blue-600" />
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Primary HTC</p>
                     </div>
                     <p className="font-black text-slate-800 dark:text-white leading-tight">{htcContact.name}</p>
                   </div>
                   <a href={`tel:${htcContact.phone}`} className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Phone size={20} /></a>
                 </div>
               ) : null}

               {personalContact ? (
                 <div className="flex items-center justify-between p-5 bg-pink-50 dark:bg-pink-900/20 rounded-[2rem] border border-pink-100 dark:border-pink-800">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                        <Heart size={12} className="text-pink-600" />
                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Emergency Personal</p>
                     </div>
                     <p className="font-black text-slate-800 dark:text-white leading-tight">{personalContact.name} ({personalContact.role})</p>
                   </div>
                   <a href={`tel:${personalContact.phone}`} className="w-12 h-12 bg-pink-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20"><Phone size={20} /></a>
                 </div>
               ) : null}
             </div>
           </section>

           <div className="flex flex-col gap-4">
             <button className="flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                <Share2 size={24} /> Share Emergency Access
             </button>
             <button className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 p-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <CreditCard size={24} /> Download Wallet Card
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCard;