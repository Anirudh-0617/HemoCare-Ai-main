
import React, { useState, useRef } from 'react';
import { BleedEntry, BleedType, Severity, Trigger } from '../types';
import { Plus, MapPin, Camera, Info, Search, Filter, Clock, ChevronDown, X, Trash2, Check, Droplets, Activity, ShoppingBag, MoveLeft, MoveRight, Pencil } from 'lucide-react';

interface Props {
  bleeds: BleedEntry[];
  onAddBleed: (bleed: BleedEntry) => void;
  onUpdateBleed: (bleed: BleedEntry) => void;
  onNavigate: (tab: any) => void;
}

const BleedTracker: React.FC<Props> = ({ bleeds, onAddBleed, onUpdateBleed, onNavigate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newBleed, setNewBleed] = useState<Partial<BleedEntry> & { side?: 'Left' | 'Right' | 'Center' }>({
    type: BleedType.JOINT,
    severity: 5,
    trigger: Trigger.SPONTANEOUS,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    location: '',
    side: 'Center',
    photoUrl: undefined
  });

  const joints = ['Knee', 'Elbow', 'Ankle', 'Shoulder', 'Hip', 'Wrist'];
  const muscles = ['Thigh', 'Calf', 'Forearm', 'Buttock'];
  const external = ['Nose', 'Gums', 'Skin / Laceration', 'Scalp'];
  const centralOthers = ['Intracranial', 'Gastrointestinal', 'Urinary'];

  const isBilateral = (loc: string) => {
    return [...joints, ...muscles, 'Skin / Laceration'].includes(loc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBleed.location) {
      alert("Please select a location");
      return;
    }

    const finalLocation = isBilateral(newBleed.location) && newBleed.side !== 'Center'
      ? `${newBleed.side} ${newBleed.location}`
      : newBleed.location;

    const entryData: BleedEntry = {
      id: editingId || Date.now().toString(),
      date: newBleed.date || new Date().toISOString().split('T')[0],
      time: newBleed.time || '12:00',
      type: newBleed.type as BleedType,
      location: finalLocation,
      severity: newBleed.severity || 5,
      trigger: newBleed.trigger as Trigger,
      treatment: newBleed.treatment || '',
      notes: newBleed.notes || '',
      photoUrl: newBleed.photoUrl
    };

    if (editingId) {
      onUpdateBleed(entryData);
    } else {
      onAddBleed(entryData);
    }
    setShowForm(false);
    setShowSuccess(true);
    setNewBleed({
      type: BleedType.JOINT,
      severity: 5,
      trigger: Trigger.SPONTANEOUS,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      location: '',
      side: 'Center',
      photoUrl: undefined,
      treatment: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBleed(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredBleeds = bleeds.filter(b => {
    const matchesSearch = b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || b.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Bleed Log</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Track and manage your bleeding episodes.</p>
        </div>
        {!showForm && bleeds.length > 0 && (
          <button
            onClick={() => {
              setEditingId(null);
              setNewBleed({
                type: BleedType.JOINT,
                severity: 5,
                trigger: Trigger.SPONTANEOUS,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                location: '',
                side: 'Center'
              });
              setShowForm(true);
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-200 active:scale-95 transition-all"
          >
            <Plus size={18} /> Log New Episode
          </button>
        )}
      </div>

      {showSuccess && (
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl"><Check size={28} /></div>
            <div>
              <h3 className="text-xl font-black uppercase">Bleed Logged Successfully</h3>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('factor-procurement')}
              className="flex-1 md:flex-none px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} /> Procure Factor
            </button>
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-1 md:flex-none px-6 py-4 bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-blue-100 dark:border-slate-800 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{editingId ? 'Edit Entry' : 'New Entry'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="p-2 text-slate-400"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} /> Occurrence
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={newBleed.date} onChange={e => setNewBleed({ ...newBleed, date: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white" />
                <input type="time" value={newBleed.time} onChange={e => setNewBleed({ ...newBleed, time: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[BleedType.JOINT, BleedType.MUSCLE, BleedType.SOFT_TISSUE, BleedType.EXTERNAL, BleedType.OTHER].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewBleed({ ...newBleed, type })}
                      className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newBleed.type === type ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-transparent dark:border-slate-700'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} /> Anatomical Selection
              </h3>

              <div className="space-y-4">
                <select
                  value={newBleed.location}
                  onChange={e => {
                    const loc = e.target.value;
                    setNewBleed({ ...newBleed, location: loc, side: isBilateral(loc) ? (newBleed.side === 'Center' ? 'Left' : newBleed.side) : 'Center' });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700"
                  required
                >
                  <option value="">Select Region...</option>
                  <optgroup label="Joints">{joints.map(j => <option key={j} value={j}>{j}</option>)}</optgroup>
                  <optgroup label="Muscles">{muscles.map(m => <option key={m} value={m}>{m}</option>)}</optgroup>
                  <optgroup label="External">{external.map(e => <option key={e} value={e}>{e}</option>)}</optgroup>
                  <optgroup label="Other (Central)">{centralOthers.map(o => <option key={o} value={o}>{o}</option>)}</optgroup>
                </select>

                {isBilateral(newBleed.location || '') && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Side of Body</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewBleed({ ...newBleed, side: 'Left' })}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${newBleed.side === 'Left' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                      >
                        <MoveLeft size={16} /> Left
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewBleed({ ...newBleed, side: 'Right' })}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${newBleed.side === 'Right' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                      >
                        Right <MoveRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pain Severity</label>
                  <span className="text-xs font-black text-blue-600">{newBleed.severity} / 10</span>
                </div>
                <input type="range" min="1" max="10" value={newBleed.severity} onChange={e => setNewBleed({ ...newBleed, severity: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-blue-600" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Camera size={16} /> Visual Evidence
              </h3>
              <div className="flex gap-3">
                {newBleed.photoUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200">
                    <img src={newBleed.photoUrl} className="w-full h-full object-cover" alt="Captured" />
                    <button type="button" onClick={() => setNewBleed(prev => ({ ...prev, photoUrl: undefined }))} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg"><X size={14} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-all">
                    <Camera size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Take Photo</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
              </div>
              <textarea placeholder="Additional notes or context..." value={newBleed.notes} onChange={e => setNewBleed({ ...newBleed, notes: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white resize-none h-24 outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-blue-500" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Cancel</button>
            <button type="submit" className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-100 active:scale-95 transition-all">{editingId ? 'Update Episode' : 'Save Episode'}</button>
          </div>
        </form>
      )}

      {bleeds.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <Droplets size={48} className="text-blue-200 dark:text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">No Bleed History</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 font-medium">
            Track every bleeding episode to help your clinical team optimize your prophylaxis regimen and monitor joint health.
          </p>
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            className="mt-10 flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 hover:scale-105 transition-all"
          >
            <Plus size={18} /> Log Your First Bleed
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
              <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none text-slate-800 dark:text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredBleeds.length > 0 ? (
              filteredBleeds.map(bleed => (
                <div key={bleed.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bleed.severity > 7 ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-black text-slate-800 dark:text-white">{bleed.location}</h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${bleed.severity > 7 ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900'}`}>Lvl {bleed.severity}</span>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase border border-slate-100 dark:border-slate-700">{bleed.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{bleed.date} at {bleed.time}</p>
                    {bleed.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">"{bleed.notes}"</p>}
                    {bleed.photoUrl && (
                      <div className="mt-3 w-16 h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm"><img src={bleed.photoUrl} className="w-full h-full object-cover" alt="Log" /></div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const parts = bleed.location.split(' ');
                      const isSide = parts[0] === 'Left' || parts[0] === 'Right';
                      const loc = isSide ? parts.slice(1).join(' ') : bleed.location;
                      const side = isSide ? parts[0] as 'Left' | 'Right' : 'Center';

                      setNewBleed({
                        type: bleed.type,
                        severity: bleed.severity,
                        trigger: bleed.trigger,
                        date: bleed.date,
                        time: bleed.time,
                        location: loc,
                        side: side,
                        treatment: bleed.treatment,
                        notes: bleed.notes,
                        photoUrl: bleed.photoUrl
                      });
                      setEditingId(bleed.id);
                      setShowForm(true);
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-2xl transition-colors self-start md:self-center"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <Activity className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={32} />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No matching episodes found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BleedTracker;
