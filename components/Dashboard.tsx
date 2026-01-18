
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { BleedEntry, Medication, Appointment, GeneticProfile, TeamMember } from '../types';
import { AlertCircle, TrendingDown, Clock, Activity, PlusCircle, ShieldAlert, Pill, Target, Dna, Calendar, ChevronRight, Droplets, Users, CheckCircle, ArrowRight, Sparkles, ShoppingBag, Truck, X } from 'lucide-react';
import { getProfile, updateProfile } from '../services/supabase';

interface Props {
  bleeds: BleedEntry[];
  meds: Medication[];
  appointments: Appointment[];
  geneticProfile: GeneticProfile | null;
  team: TeamMember[];
  onNavigate: (tab: any) => void;
}

const Dashboard: React.FC<Props> = ({ bleeds, meds, appointments, geneticProfile, team, onNavigate }) => {
  const [onboardingDismissed, setOnboardingDismissed] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfile();
      if (profile?.has_completed_onboarding) {
        setOnboardingDismissed(true);
      }
    };
    loadProfile();
  }, []);

  const handleDismissOnboarding = async () => {
    setOnboardingDismissed(true);
    try {
      await updateProfile({ has_completed_onboarding: true });
    } catch (err) {
      console.error('Failed to update onboarding status', err);
    }
  };

  const bleedsThisMonth = bleeds.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === new Date().getMonth();
  }).length;

  const currentABR = bleeds.length > 0 ? (bleeds.length * (365 / 30)).toFixed(1) : "0.0";

  const setupSteps = [
    { id: 'genetics', label: 'Complete Genetic Profile', completed: !!geneticProfile, icon: Dna },
    { id: 'meds', label: 'Add Your Medication', completed: meds.length > 0, icon: Pill },
    { id: 'team', label: 'Add Care Team Member', completed: team.length > 0, icon: Users },
    { id: 'bleeds', label: 'Log Your First Bleed (If Any)', completed: bleeds.length > 0, icon: Droplets },
  ];

  const allSetupDone = setupSteps.every(s => s.completed);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tightest uppercase">Health Matrix</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Precision analytics for your Hemophilia care.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={() => onNavigate('factor-procurement')} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all active:scale-95">
            <ShoppingBag size={18} /> Procure Factor
          </button>
          <button onClick={() => onNavigate('bleeds')} className="w-full md:w-auto flex items-center justify-center gap-2 bg-medical-blue text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-medical-blue/20 hover:scale-105 transition-all active:scale-95">
            <PlusCircle size={18} /> Log Bleed
          </button>
        </div>
      </div>

      {!allSetupDone && !onboardingDismissed && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-blue-200/50 dark:border-blue-800/50 p-10 shadow-xl shadow-blue-500/5 relative group/onboarding">
          <button
            onClick={handleDismissOnboarding}
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            title="Dismiss Onboarding"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="text-medical-blue dark:text-medical-light" size={24} />
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Guided Onboarding</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {setupSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => onNavigate(step.id)}
                className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${step.completed
                  ? 'bg-green-500/5 border-green-500/20 text-green-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-medical-blue dark:hover:border-medical-light group'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${step.completed ? 'bg-green-500/10' : 'bg-white dark:bg-slate-900 shadow-sm'}`}>
                    <step.icon size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-left leading-tight">{step.label}</span>
                </div>
                {step.completed ? <CheckCircle size={20} /> : <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Annualized Bleed Rate', val: currentABR, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-600/5' },
          { label: 'Med Adherence', val: meds.length > 0 ? '---' : 'N/A', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-600/5' },
          { label: 'Inhibitor Risk', val: geneticProfile?.inhibitorRiskScore ? `${geneticProfile.inhibitorRiskScore}%` : 'TBD', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-600/5' },
          { label: 'Supply Integrity', val: meds.length > 0 ? 'Good' : 'N/A', icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/5' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 group hover:-translate-y-1 transition-all duration-300">
            <div className={`flex items-center gap-4 mb-6`}>
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}><stat.icon size={24} /></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{stat.label}</h3>
            </div>
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tightest">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#0f172a] p-10 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between overflow-hidden relative group border border-white/5 h-full">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Truck size={180} />
          </div>
          <div className="relative">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Supply Hub</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">
              Access Government NHM schemes, Private distributors, or Clinical Trial Gene Therapy research channels instantly.
            </p>
          </div>
          <button
            onClick={() => onNavigate('factor-procurement')}
            className="w-full py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all relative z-10"
          >
            Enter Procurement Hub
          </button>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 min-h-[450px] flex flex-col items-center justify-center text-center">
          <Activity size={80} className="text-slate-200 dark:text-slate-800 mb-8" />
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Patient Analytics</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-4 font-medium leading-relaxed">Log your treatment regimen and at least two bleeding episodes to unlock your efficacy trends.</p>
          <button onClick={() => onNavigate('meds')} className="mt-10 px-10 py-4 bg-slate-900 dark:bg-medical-blue text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">Configure Treatment</button>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-indigo-950 p-12 rounded-[4rem] text-white shadow-3xl flex flex-col justify-center overflow-hidden relative group border border-white/5 h-full">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-1000">
            <Dna size={240} />
          </div>
          <div className="relative text-center space-y-8">
            <h3 className="text-3xl font-black uppercase tracking-tighter">Genomic Matrix</h3>
            <p className="text-base text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              Connect your F8/F9 mutation data to see how your treatment response compares to global cohort benchmarks.
            </p>
            <button onClick={() => onNavigate('genetics')} className="w-full px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
              Setup Mutation Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
