import React, { useState, useMemo } from 'react';
import { 
  Dna, Search, TrendingUp, AlertTriangle, Activity, 
  Info, ChevronRight, FileText, Target, Brain,
  Microscope, Users, Calendar, Filter, Sparkles, Save, X, Database, Share2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Cell, LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie, Legend
} from 'recharts';
import { GeneticProfile, BleedEntry, Medication, Trigger } from '../types';

interface Props {
  profile: GeneticProfile | null;
  bleeds: BleedEntry[];
  meds: Medication[];
  setProfile: (p: GeneticProfile) => void;
}

const GeneticAnalytics: React.FC<Props> = ({ profile, bleeds, meds, setProfile }) => {
  const [activeView, setActiveView] = useState<'profile' | 'predictive' | 'lookup' | 'inheritance'>('profile');
  const [showSetup, setShowSetup] = useState(!profile);
  const [lookupQuery, setLookupQuery] = useState('');
  
  // Setup form state
  const [setupData, setSetupData] = useState<Partial<GeneticProfile>>({
    gene: 'F8',
    nucleotideChange: '',
    aminoAcidChange: '',
    location: '',
    factorActivity: 1,
    inhibitorRiskScore: 0,
    exposureDays: 0
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: GeneticProfile = {
      gene: setupData.gene as 'F7' | 'F8' | 'F9' | 'F11' | 'VWF',
      nucleotideChange: setupData.nucleotideChange || 'Unknown',
      aminoAcidChange: setupData.aminoAcidChange || 'Unknown',
      location: setupData.location || 'Unknown',
      factorActivity: setupData.factorActivity || 0,
      inhibitorRiskScore: setupData.inhibitorRiskScore || 0,
      exposureDays: setupData.exposureDays || 0
    };
    setProfile(newProfile);
    setShowSetup(false);
  };

  const predictRisk = useMemo(() => {
    if (!profile) return { score: 0, level: 'N/A', color: 'text-slate-400' };
    const recentBleeds = bleeds.filter(b => {
      const d = new Date(b.date);
      const now = new Date();
      return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) < 30;
    }).length;

    const riskScore = Math.min(100, (recentBleeds * 20) + (profile.exposureDays < 50 ? 30 : 5));
    return {
      score: riskScore,
      level: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
      color: riskScore > 70 ? 'text-red-600' : riskScore > 40 ? 'text-amber-600' : 'text-green-600'
    };
  }, [bleeds, profile]);

  const comparativeData = [
    { trait: 'Clotting', you: 85, cohort: 65 },
    { trait: 'Adherence', you: 98, cohort: 88 },
    { trait: 'Joint Health', you: 70, cohort: 75 },
    { trait: 'PK Recovery', you: 92, cohort: 82 },
    { trait: 'Activity', you: 60, cohort: 45 },
  ];

  const exposureChartData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    ceds: profile ? Math.floor(profile.exposureDays * (i + 1) / 12) : 0,
    threshold: 50
  }));

  const inheritanceProb = [
    { name: 'Carrier Daughter', value: 25, fill: '#3b82f6' },
    { name: 'Affected Son', value: 25, fill: '#ef4444' },
    { name: 'Unaffected Son', value: 25, fill: '#10b981' },
    { name: 'Unaffected Daughter', value: 25, fill: '#6366f1' },
  ];

  if (showSetup || !profile) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
             <Dna size={200} />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Initialize Genomic Profile</h2>
            <p className="text-slate-500 font-medium mb-12">Enter your clinical mutation details to enable predictive analytics.</p>
            
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deficiency Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['F7', 'F8', 'F9', 'F11', 'VWF'].map(gene => (
                      <button
                        key={gene}
                        type="button"
                        onClick={() => setSetupData({...setupData, gene: gene as any})}
                        className={`py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all ${setupData.gene === gene ? 'bg-medical-blue text-white border-medical-blue shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                      >
                        {gene === 'F7' ? 'Factor VII' : 
                         gene === 'F8' ? 'Hemo A' : 
                         gene === 'F9' ? 'Hemo B' : 
                         gene === 'F11' ? 'Hemo C' : 'vWD'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Factor Activity Level (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g. 0.5"
                    value={setupData.factorActivity}
                    onChange={e => setSetupData({...setupData, factorActivity: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-medical-blue/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mutation Location (Exon/Intron)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Intron 22"
                    value={setupData.location}
                    onChange={e => setSetupData({...setupData, location: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-medical-blue/20 outline-none"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex gap-4">
                <button 
                  type="submit"
                  className="w-full py-5 bg-medical-blue text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-medical-blue/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Synchronize Genetic Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
            <Dna className="text-blue-600" size={36} /> Genetic Intelligence
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Genomic profiling and predictive health trajectory modeling.</p>
        </div>
        <div className="flex bg-white p-1 rounded-3xl border border-slate-200 shadow-sm">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'predictive', label: 'Predictive' },
            { id: 'lookup', label: 'Lookup' },
            { id: 'inheritance', label: 'Inheritance' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id as any)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === v.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
               <div className="relative">
                 <div className="flex items-start justify-between mb-12">
                    <div>
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Genotype Matrix</h3>
                      <p className="text-4xl font-black text-slate-800 tracking-tight">{profile.gene} Mutation Profile</p>
                    </div>
                    <button onClick={() => setShowSetup(true)} className="p-4 bg-slate-50 rounded-3xl text-slate-400 hover:text-medical-blue transition-colors">
                      <FileText size={24} />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { l: 'Location', v: profile.location },
                      { l: 'Factor Level', v: `${profile.factorActivity}%` },
                      { l: 'Status', v: 'Verified', color: 'text-green-600' }
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.l}</p>
                        <p className={`text-sm font-black text-slate-800 ${item.color || ''}`}>{item.v}</p>
                      </div>
                    ))}
                 </div>

                 <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                          <Activity size={32} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Phenotypic Activity</p>
                          <p className="text-4xl font-black">{profile.factorActivity}% <span className="text-sm font-bold text-slate-600">Basal</span></p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Inhibitor Sensitivity</p>
                       <p className="text-4xl font-black text-blue-400">{profile.inhibitorRiskScore}%</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl min-h-[400px]">
               <div className="flex items-center justify-between mb-10">
                 <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                   <Target className="text-indigo-600" size={24} /> Genomic Performance
                 </h4>
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"/> You
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"/> Peer Median
                    </div>
                 </div>
               </div>
               <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparativeData}>
                     <PolarGrid stroke="#f1f5f9" />
                     <PolarAngleAxis dataKey="trait" tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                     <Radar name="You" dataKey="you" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} animationDuration={2000} />
                     <Radar name="Cohort" dataKey="cohort" stroke="#e2e8f0" fill="#e2e8f0" fillOpacity={0.3} animationDuration={2500} />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} />
                   </RadarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                   <Sparkles size={180}/>
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">AI Health Forecast</h4>
                <div className="flex items-center justify-between mb-10">
                   <div className="text-6xl font-black">{predictRisk.score}%</div>
                   <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border ${predictRisk.color} bg-white/5`}>
                     {predictRisk.level} Risk
                   </div>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic border-l-2 border-blue-600 pl-4">
                  "Genetic markers suggest a seasonal sensitivity to humidity. Joint lubrication might decrease next week."
                </p>
                <button className="w-full mt-10 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">
                  Optimize Protocol
                </button>
             </div>

             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Exposure Window</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={exposureChartData}>
                      <defs>
                        <linearGradient id="colorCed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="ceds" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCed)" animationDuration={3000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-3">
                   <AlertTriangle className="text-blue-600 shrink-0" size={18} />
                   <p className="text-[10px] font-bold text-blue-900 leading-relaxed uppercase">
                     Approaching 50 CED threshold. Standard inhibitor screening recommended next quarter.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeView === 'predictive' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                <TrendingUp className="text-blue-600" /> Bleed Trajectory Model
              </h3>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Jan', bleeds: 2, projection: 2 },
                      { month: 'Feb', bleeds: 1, projection: 1 },
                      { month: 'Mar', bleeds: 3, projection: 3 },
                      { month: 'Apr', bleeds: null, projection: 2 },
                      { month: 'May', bleeds: null, projection: 1 },
                      { month: 'Jun', bleeds: null, projection: 1.5 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                      <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                      <Area type="monotone" dataKey="bleeds" stroke="#3b82f6" strokeWidth={4} fill="#3b82f610" />
                      <Area type="monotone" dataKey="projection" stroke="#3b82f6" strokeDasharray="5 5" fill="transparent" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Projected reduction in bleed rate by 35% based on current adherence and genetic recovery markers.
              </p>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Inhibitor Sensitivity</h3>
                <div className="flex items-end gap-3 mb-8">
                   <span className="text-6xl font-black text-blue-400">{profile.inhibitorRiskScore}%</span>
                   <span className="text-sm font-bold text-slate-500 mb-2 uppercase">Probability</span>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">
                   Based on your clinical variant in {profile.location}, you have a {profile.inhibitorRiskScore > 20 ? 'higher' : 'typical'} correlation with inhibitor development. Frequent ITI monitoring is advised.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Exposure Target</p>
                    <p className="text-lg font-black">50 CEDs</p>
                 </div>
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status</p>
                    <p className="text-lg font-black text-green-400">Stable</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeView === 'lookup' && (
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
              <div className="max-w-xl mx-auto text-center mb-12">
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Genomic Database Search</h3>
                 <p className="text-sm text-slate-500 font-medium">Search the global F8/F9 mutation database for clinical outcomes related to your specific variant.</p>
              </div>
              <div className="relative max-w-2xl mx-auto">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                 <input 
                  type="text" 
                  placeholder="Search mutation ID (e.g. c.5944C>T)..." 
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-6 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-600/20 outline-none shadow-inner transition-all"
                 />
              </div>
           </div>

           {lookupQuery && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {[
                  { title: 'Clinical Severity', val: 'Severe', icon: AlertTriangle, color: 'text-red-500' },
                  { title: 'Inhibitor Correlation', val: 'Low (4.2%)', icon: Microscope, color: 'text-blue-500' },
                  { title: 'Peer Response', val: '92% Recovery', icon: Users, color: 'text-green-500' }
                ].map((res, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                     <div className={`p-4 rounded-2xl bg-slate-50 ${res.color}`}><res.icon size={24}/></div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.title}</p>
                        <p className="text-xl font-black text-slate-800">{res.val}</p>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {activeView === 'inheritance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-10 flex items-center gap-3">
                <Brain className="text-blue-600" /> Inheritance Probability
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={inheritanceProb} dataKey="value" innerRadius={80} outerRadius={120} paddingAngle={10}>
                          {inheritanceProb.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                       </Pie>
                       <Tooltip />
                       <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-10 p-6 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Calculated based on X-linked recessive transmission model.
              </div>
           </div>

           <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Microscope size={160}/></div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Genetic Counseling</h3>
              <p className="text-lg font-medium leading-relaxed mb-10 opacity-90">
                Genetic counseling can help you and your family understand the implications of your diagnosis for family planning and symptom management.
              </p>
              <div className="flex gap-4">
                 <button className="flex-1 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px]">Find Counselor</button>
                 <button className="flex-1 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-[10px]">Download Guide</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GeneticAnalytics;