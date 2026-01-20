
import React, { useState } from 'react';
import {
  Users, Phone, Mail, Calendar, Plus,
  Clock, MapPin, Search, Star, X, Save,
  Trash2, CheckCircle2, AlertCircle, Heart,
  UserPlus, UserCircle, BriefcaseMedical, Pencil
} from 'lucide-react';
import { TeamMember, Appointment } from '../types';

interface Props {
  team: TeamMember[];
  appointments: Appointment[];
  onAddMember: (member: TeamMember) => void;
  onUpdateMember: (member: TeamMember) => void;
  onDeleteMember: (id: string) => void;
  setAppointments: (a: Appointment[]) => void;
}

const CareTeam: React.FC<Props> = ({ team, appointments, onAddMember, onUpdateMember, onDeleteMember, setAppointments }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddAppt, setShowAddAppt] = useState(false);

  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    role: 'Hematologist',
    specialty: '',
    phone: '',
    email: '',
    type: 'medical'
  });

  const indianPhoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
  const isPhoneValid = newMember.phone ? indianPhoneRegex.test(newMember.phone) : true;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) {
      alert("Name and Phone are required.");
      return;
    }

    if (!indianPhoneRegex.test(newMember.phone)) {
      alert("Please enter a valid Indian mobile number.");
      return;
    }

    const member: TeamMember = {
      id: crypto.randomUUID(),
      name: newMember.name || '',
      role: newMember.role || '',
      specialty: newMember.specialty || '',
      phone: newMember.phone || '',
      email: newMember.email || '',
      type: (newMember.type as 'medical' | 'personal') || 'medical'
    };

    if (isEditing && newMember.id) {
      onUpdateMember({
        ...member,
        id: newMember.id // Keep original ID
      });
    } else {
      onAddMember(member);
    }

    setShowAddMember(false);
    setIsEditing(false);
    setNewMember({
      name: '',
      role: member.type === 'medical' ? 'Hematologist' : 'Parent',
      specialty: '',
      phone: '',
      email: '',
      type: member.type
    });
  };

  const removeMember = (id: string) => {
    if (confirm("Remove this contact from your circle of care?")) {
      onDeleteMember(id);
    }
  };

  const openEditMember = (member: TeamMember) => {
    setNewMember(member);
    setIsEditing(true);
    setShowAddMember(true);
  };

  const medicalTeam = team.filter(m => m.type === 'medical' || !m.type);
  const personalTeam = team.filter(m => m.type === 'personal');

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tightest uppercase">Support Circle</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Your clinical providers and personal safety net.</p>
        </div>
        <button
          onClick={() => {
            setNewMember({ name: '', role: 'Hematologist', specialty: '', phone: '', email: '', type: 'medical' });
            setIsEditing(false);
            setShowAddMember(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <UserPlus size={18} /> Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Medical Team Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600">
                <BriefcaseMedical size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Clinical Providers</h3>
            </div>

            {medicalTeam.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medicalTeam.map(member => (
                  <div key={member.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative group">
                    <button
                      onClick={() => removeMember(member.id)}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-inner border border-blue-100 dark:border-blue-800 uppercase">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight">{member.name}</h4>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Phone size={14} className="text-slate-300 dark:text-slate-600" /> {member.phone}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Mail size={14} className="text-slate-300 dark:text-slate-600" /> {member.email || 'No email saved'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
                <BriefcaseMedical size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No medical providers</p>
              </div>
            )}
          </section>

          {/* Personal Contacts Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/40 rounded-xl text-pink-600">
                <Heart size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Family & Friends</h3>
            </div>

            {personalTeam.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalTeam.map(member => (
                  <div key={member.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative group">
                    <button
                      onClick={() => removeMember(member.id)}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-pink-600 font-black text-xl shadow-inner border border-pink-100 dark:border-pink-800 uppercase">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight">{member.name}</h4>
                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mt-1">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Phone size={14} className="text-slate-300 dark:text-slate-600" /> {member.phone}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <UserCircle size={14} className="text-slate-300 dark:text-slate-600" /> Emergency Contact
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
                <Heart size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No family/friend contacts</p>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 p-10 opacity-5"><Calendar size={160} /></div>
            <div className="flex items-center justify-between mb-8 relative">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Schedule</h3>
              <button onClick={() => setShowAddAppt(true)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"><Plus size={18} /></button>
            </div>
            <div className="space-y-6 relative">
              {appointments.length > 0 ? appointments.map(appt => (
                <div key={appt.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">{appt.date} • {appt.time}</p>
                  <h4 className="text-lg font-black mb-1">{appt.reason}</h4>
                  <p className="text-xs text-slate-400 font-bold mb-4">{appt.provider}</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <MapPin size={12} /> {appt.location}
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center py-10 border border-white/5 rounded-3xl">No upcoming checkups</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddMember(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{isEditing ? 'Update Contact' : 'Add Support Contact'}</h3>
              <button onClick={() => setShowAddMember(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contact Category</label>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNewMember({ ...newMember, type: 'medical', role: 'Hematologist' })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${newMember.type === 'medical' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                  >
                    <BriefcaseMedical size={14} /> Clinical
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMember({ ...newMember, type: 'personal', role: 'Parent' })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${newMember.type === 'personal' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400'}`}
                  >
                    <Heart size={14} /> Family / Friend
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder={newMember.type === 'medical' ? "Dr. Rajesh Khanna" : "Asha Sharma"}
                    value={newMember.name}
                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Role / Relation</label>
                  <select
                    value={newMember.role}
                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                  >
                    {newMember.type === 'medical' ? (
                      <>
                        <option value="Hematologist">Hematologist</option>
                        <option value="HTC Coordinator">HTC Coordinator</option>
                        <option value="Physiotherapist">Physiotherapist</option>
                        <option value="Specialized Nurse">Specialized Nurse</option>
                        <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                      </>
                    ) : (
                      <>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Neighbor">Neighbor</option>
                        <option value="Caregiver">Other Caregiver</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</label>
                    {newMember.phone && (
                      isPhoneValid ? <CheckCircle2 size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-red-500" />
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={newMember.phone}
                    onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 transition-all outline-none ${!isPhoneValid && newMember.phone ? 'ring-2 ring-red-500/20' : 'focus:ring-blue-600/20'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="contact@email.com"
                    value={newMember.email}
                    onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isPhoneValid}
                  className={`flex-1 py-5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${newMember.type === 'personal' ? 'bg-pink-600 shadow-pink-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}
                >
                  <Save size={16} /> {isEditing ? 'Update Contact' : 'Save to Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareTeam;