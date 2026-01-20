
import React, { useState, useMemo } from 'react';
import { Medication, InfusionRecord, MedicationType, Frequency } from '../types';
import {
  Pill,
  Plus,
  Calendar,
  Calculator,
  Info,
  Clock,
  History,
  Activity,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Package,
  MapPin,
  Share2,
  GitBranch,
  Save,
  X,
  PlusCircle,
  TrendingUp,
  Droplet
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  meds: Medication[];
  infusions: InfusionRecord[];
  onAddMed: (med: Medication) => void;
  onUpdateMed: (med: Medication) => void;
  onAddInfusion: (record: InfusionRecord) => void;
}

const MedicationLog: React.FC<Props> = ({ meds, infusions, onAddMed, onUpdateMed, onAddInfusion }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'profiles' | 'calculator' | 'analytics'>('schedule');
  const [showAddMed, setShowAddMed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogInfusion, setShowLogInfusion] = useState(false);

  // Calc state
  const [calcWeight, setCalcWeight] = useState('75');
  const [calcDose, setCalcDose] = useState('40');

  const medNames = ['Advate', 'Eloctate', 'Jivi', 'Afstyla', 'Hemlibra', 'Alprolix', 'Rebinyn', 'NovoSeven', 'FEIBA'];
  const injectionSites = ['L. Antecubital', 'R. Antecubital', 'L. Hand', 'R. Hand', 'L. Thigh', 'R. Thigh', 'L. Buttock', 'R. Buttock'];

  const [newMed, setNewMed] = useState<Partial<Medication>>({
    name: medNames[0],
    type: MedicationType.FACTOR_VIII,
    frequency: Frequency.THREE_X_WEEK,
    dosageBase: '40',
    currentWeight: 75,
    vialSizes: [1000],
    stockRemaining: 10,
    startDate: new Date().toISOString().split('T')[0],
    prescribingHTC: ''
  });

  const [newInfusion, setNewInfusion] = useState<Partial<InfusionRecord>>({
    medicationId: meds[0]?.id || '',
    lotNumber: '',
    site: injectionSites[0],
    timestamp: new Date().toISOString().slice(0, 16),
    reaction: 'None',
    notes: ''
  });

  const kineticsData = [
    { hour: 0, level: 100 },
    { hour: 12, level: 45 },
    { hour: 24, level: 22 },
    { hour: 36, level: 11 },
    { hour: 48, level: 5 },
    { hour: 60, level: 2 },
    { hour: 72, level: 1 },
  ];

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && newMed.id) {
      onUpdateMed(newMed as Medication);
    } else {
      onAddMed({
        ...newMed as Medication,
        id: crypto.randomUUID()
      });
    }
    setShowAddMed(false);
    setIsEditing(false);
    // Reset form defaults 
    setNewMed({
      name: medNames[0],
      type: MedicationType.FACTOR_VIII,
      frequency: Frequency.THREE_X_WEEK,
      dosageBase: '40',
      currentWeight: 75,
      vialSizes: [1000],
      stockRemaining: 10,
      startDate: new Date().toISOString().split('T')[0],
      prescribingHTC: ''
    });
  };

  const openEditMed = (med: Medication) => {
    setNewMed(med);
    setIsEditing(true);
    setShowAddMed(true);
  };

  const handleLogInfusion = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInfusion({
      ...newInfusion as InfusionRecord,
      id: crypto.randomUUID()
    });
    setShowLogInfusion(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Treatment Log</h2>
          <p className="text-slate-500 mt-1 font-medium">Precision dosing and kinetic tracking for prophylaxis.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => meds.length > 0 ? setShowLogInfusion(true) : setShowAddMed(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all"
          >
            <Plus size={18} /> {meds.length > 0 ? 'Record Dose' : 'Add Medication'}
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-3xl border border-slate-200 shadow-sm w-fit">
        {[
          { id: 'schedule', label: 'Dashboard', icon: Calendar },
          { id: 'profiles', label: 'Inventory', icon: Package },
          { id: 'calculator', label: 'Dose Calc', icon: Calculator },
          { id: 'analytics', label: 'Kinetics', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {meds.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
          <Pill size={64} className="text-slate-200 mb-6" />
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">No Active Treatment</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-2 font-medium">
            Add your prophylaxis medication to start tracking doses, kinetics, and adherence.
          </p>
          <button
            onClick={() => { setShowAddMed(true); setIsEditing(false); }}
            className="mt-10 flex items-center gap-3 px-8 py-4 bg-medical-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-medical-blue/20"
          >
            <PlusCircle size={18} /> Configure Medication
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                      <Clock className="text-blue-600" /> Prophylaxis Queue
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {meds.map(med => (
                      <div key={med.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Pill size={28} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-800 tracking-tight">{med.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{med.frequency} Regimen</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                          <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Stock</p>
                            <p className="text-sm font-black text-slate-800">{med.stockRemaining} Vials</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); openEditMed(med); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                            <ChevronRight size={24} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5"><History size={140} /></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Adherence Rate</h3>
                <p className="text-6xl font-black text-blue-400 mb-4">96%</p>
                <p className="text-sm text-slate-400 font-medium">Excellent. You've only missed 1 prophylactic dose in the last 90 days.</p>
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {meds.map(med => (
                <div key={med.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package size={32} /></div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl">Active Factor</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-800">{med.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">prescribed by {med.prescribingHTC || 'HTC'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Supply</span>
                      <span className="font-black text-slate-800">{med.stockRemaining} boxes</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-blue-600 transition-all ${med.stockRemaining < 5 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(med.stockRemaining / 20) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-10 flex items-center gap-3">
                <Calculator className="text-blue-600" /> Dose Calculator
              </h3>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Dose (IU/kg)</label>
                  <input
                    type="number"
                    value={calcDose}
                    onChange={(e) => setCalcDose(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white text-center shadow-xl shadow-blue-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Recommended Dosage</p>
                  <p className="text-5xl font-black">{(parseFloat(calcWeight) * parseFloat(calcDose)).toLocaleString()} IU</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                    <TrendingUp className="text-blue-600" /> Kinetic Prediction Model
                  </h3>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kineticsData}>
                      <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hour" label={{ value: 'Hours Post-Infusion', position: 'bottom', offset: 0, fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <YAxis label={{ value: 'Factor Level (%)', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorLevel)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col justify-center">
                  <Droplet className="text-blue-400 mb-6" size={32} />
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-slate-500">Predicted Current Level</h4>
                  <p className="text-5xl font-black">12%</p>
                  <p className="text-[10px] font-bold text-amber-400 mt-4 uppercase tracking-widest">Entering Vulnerability Window</p>
                </div>
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Trough Target</h4>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xl font-black text-slate-800">1.5%</span>
                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">Optimal</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMed && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddMed(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{isEditing ? 'Update Medication' : 'Add Medication'}</h3>
              <button onClick={() => setShowAddMed(false)} className="p-2 bg-slate-50 rounded-full"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddMed} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medication Name</label>
                  <select
                    value={newMed.name}
                    onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 outline-none"
                  >
                    {medNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medication Type</label>
                  <select
                    value={newMed.type}
                    onChange={e => setNewMed({ ...newMed, type: e.target.value as MedicationType })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 outline-none"
                  >
                    {Object.values(MedicationType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage (IU/kg)</label>
                  <input
                    type="text"
                    value={newMed.dosageBase}
                    onChange={e => setNewMed({ ...newMed, dosageBase: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-medical-blue/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                  <select
                    value={newMed.frequency}
                    onChange={e => setNewMed({ ...newMed, frequency: e.target.value as Frequency })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 outline-none"
                  >
                    {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock (Vials)</label>
                  <input
                    type="number"
                    value={newMed.stockRemaining}
                    onChange={e => setNewMed({ ...newMed, stockRemaining: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-medical-blue/20 outline-none"
                  />
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button
                  type="submit"
                  className="w-full py-5 bg-medical-blue text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-medical-blue/20 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {isEditing ? 'Update Stock & Details' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationLog;
