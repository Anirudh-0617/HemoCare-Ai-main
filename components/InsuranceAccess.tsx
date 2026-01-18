
import React, { useState } from 'react';
import { Briefcase, CreditCard, PieChart, Info, ExternalLink, ShieldCheck, DollarSign, ArrowUpRight, FileText, X, Download, Send, Save, CheckCircle, Activity } from 'lucide-react';
import { Medication, InfusionRecord, BleedEntry, InsuranceProfile } from '../types';

interface Props {
  insurance: InsuranceProfile;
  bleeds: BleedEntry[];
  onUpdateInsurance: (profile: InsuranceProfile) => void;
}

const InsuranceAccess: React.FC<Props> = ({ insurance, bleeds, onUpdateInsurance }) => {
  const [showAppeal, setShowAppeal] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [editForm, setEditForm] = useState<InsuranceProfile>(insurance);

  const calculateProgress = () => {
    if (insurance.maxOutOfPocket <= 0) return 0;
    return Math.min(100, (insurance.currentSpending / insurance.maxOutOfPocket) * 100);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInsurance(editForm);
    setShowEditPlan(false);
  };

  const generateAppealContent = () => {
    const bleedCount = bleeds.length;
    return `To the Appeals Department:

I am writing to formally appeal the denial of coverage for clotting factor replacement therapy. 
As a patient with SEVERE HEMOPHILIA, consistent access to prophylactic factor is a medical necessity to prevent life-threatening intracranial hemorrhage and chronic arthropathy.

Clinical Record Summary:
- Annualized Bleed Rate (ABR) with current regimen: ${bleedCount > 0 ? (bleedCount * 12).toFixed(1) : '0.0'}
- Mutation Location: High Risk Clinical Profile
- Patient Adherence: Consistent

The requested medication is essential for stabilizing my factor levels and preventing further joint damage. Delaying treatment increases the risk of hospitalization and long-term disability.

Please reconsider your decision in light of this clinical evidence.`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Access & Cost</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage insurance, co-pays, and prior authorizations.</p>
        </div>
        <button 
          onClick={() => setShowEditPlan(true)}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
        >
          Manage Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 dark:bg-green-900/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Current Plan Overview</h3>
                   <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                     insurance.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                   }`}>{insurance.status}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Provider</p>
                         <p className="text-xl font-black text-slate-800 dark:text-white underline decoration-blue-200 dark:decoration-blue-800 underline-offset-4">{insurance.provider}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Prior Auth</p>
                           <p className="text-sm font-black text-slate-700 dark:text-slate-300">{insurance.priorAuthNumber || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Type</p>
                           <p className="text-sm font-black text-slate-700 dark:text-slate-300">{insurance.planType}</p>
                        </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Expires On</p>
                         <p className="text-sm font-black text-red-600 dark:text-red-400">{insurance.expirationDate}</p>
                      </div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center text-center">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Max Out-of-Pocket</p>
                      <p className="text-4xl font-black text-slate-800 dark:text-white">${insurance.maxOutOfPocket.toLocaleString()}</p>
                      <div className="mt-6 h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 transition-all duration-1000" style={{width: `${calculateProgress()}%`}} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase">{calculateProgress().toFixed(0)}% of limit reached</p>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                   <DollarSign className="text-green-600" /> Co-pay Assistance
                 </h3>
                 <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">Find Programs</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex justify-between mb-4">
                       <ShieldCheck className="text-blue-500" />
                       <ArrowUpRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 transition-colors" size={18} />
                    </div>
                    <h4 className="font-black text-slate-800 dark:text-white mb-1">Manufacturer Copay Card</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Reduces eligible Factor VIII out-of-pocket costs to $0.</p>
                 </div>
                 <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex justify-between mb-4">
                       <PieChart className="text-indigo-500" />
                       <ArrowUpRight className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 transition-colors" size={18} />
                    </div>
                    <h4 className="font-black text-slate-800 dark:text-white mb-1">PAN Foundation</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Grants for hemophilia patients with financial need.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <Activity className="text-blue-400" />
                 <h4 className="font-black text-xs uppercase tracking-widest">Spending Analytics</h4>
              </div>
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase">Year to Date</p>
                       <p className="text-2xl font-black">${insurance.currentSpending.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl text-green-400">
                       <ArrowUpRight size={24} />
                    </div>
                 </div>
                 <p className="text-xs text-slate-400 font-medium italic">"Your costs have stabilized. You've reached {calculateProgress().toFixed(0)}% of your out-of-pocket maximum."</p>
              </div>
           </div>

           <div className="p-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-[2.5rem] flex items-start gap-4">
              <Info className="text-blue-600 shrink-0" />
              <div>
                 <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-1">Insurance Advocate</h4>
                 <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed font-medium">Need help with a denied claim? Use our AI to draft a medically necessary appeal letter based on your history.</p>
                 <button 
                  onClick={() => setShowAppeal(true)}
                  className="mt-4 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest underline underline-offset-4"
                 >
                   Draft Appeal Letter
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Edit Insurance Modal */}
      {showEditPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditPlan(false)} />
           <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Update Plan Details</h3>
                <button onClick={() => setShowEditPlan(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full"><X size={18}/></button>
              </div>
              <form onSubmit={handleSavePlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Provider Name</label>
                    <input 
                      type="text" 
                      value={editForm.provider} 
                      onChange={e => setEditForm({...editForm, provider: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Plan Type</label>
                    <select 
                      value={editForm.planType} 
                      onChange={e => setEditForm({...editForm, planType: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700"
                    >
                      <option value="PPO">PPO</option>
                      <option value="HMO">HMO</option>
                      <option value="EPO">EPO</option>
                      <option value="POS">POS</option>
                      <option value="Govt/NHM">Govt/NHM Scheme</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Prior Auth Number</label>
                    <input 
                      type="text" 
                      value={editForm.priorAuthNumber} 
                      onChange={e => setEditForm({...editForm, priorAuthNumber: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Expiration Date</label>
                    <input 
                      type="date" 
                      value={editForm.expirationDate} 
                      onChange={e => setEditForm({...editForm, expirationDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Max Out-of-Pocket ($)</label>
                    <input 
                      type="number" 
                      value={editForm.maxOutOfPocket} 
                      onChange={e => setEditForm({...editForm, maxOutOfPocket: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">YTD Spending ($)</label>
                    <input 
                      type="number" 
                      value={editForm.currentSpending} 
                      onChange={e => setEditForm({...editForm, currentSpending: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700" 
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button type="submit" className="w-full py-5 bg-medical-blue text-white rounded-[1.75rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                    <Save size={18}/> Update Plan Identity
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Appeal Letter Modal */}
      {showAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAppeal(false)} />
           <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Medical Appeal Draft</h3>
                <button onClick={() => setShowAppeal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={18}/></button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap mb-8 max-h-96 overflow-y-auto shadow-inner">
                {generateAppealContent()}
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                   <Download size={16}/> Download PDF
                </button>
                <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                   <Send size={16}/> Send to Provider
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceAccess;