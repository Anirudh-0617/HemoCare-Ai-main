import React, { useState } from 'react';
import { User as UserIcon, Bell, Shield, Palette, Smartphone, LogOut, ChevronRight, Moon, Sun, Lock, Save, CheckCircle, Zap, Globe, Link } from 'lucide-react';
import { User, GeneticProfile } from '../types';

interface Props {
   user: User;
   onUpdateUser: (updates: Partial<User>) => void;
   geneticProfile: GeneticProfile;
   setGeneticProfile: (profile: GeneticProfile) => void;
   theme: 'light' | 'dark';
   onUpdateTheme: (theme: 'light' | 'dark') => void;
}

const SettingsView: React.FC<Props> = ({ user, onUpdateUser, geneticProfile, setGeneticProfile, theme, onUpdateTheme }) => {
   const [profileForm, setProfileForm] = useState({
      name: user.name,
      email: user.email
   });

   const [geneticForm, setGeneticForm] = useState({
      gene: geneticProfile.gene,
      inhibitorStatus: geneticProfile.inhibitorRiskScore > 10 ? 'Positive' : 'Negative'
   });

   const [automationUrl, setAutomationUrl] = useState(() => localStorage.getItem('hemocare_automation_url') || '');

   const [saved, setSaved] = useState(false);

   const handleProfileSave = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateUser(profileForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
   };

   const handleGeneticSave = (e: React.FormEvent) => {
      e.preventDefault();
      setGeneticProfile({
         ...geneticProfile,
         gene: geneticForm.gene as 'F8' | 'F9',
         inhibitorRiskScore: geneticForm.inhibitorStatus === 'Positive' ? 45 : 5
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
   };

   const saveAutomation = () => {
      localStorage.setItem('hemocare_automation_url', automationUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
   };

   return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase">Settings</h2>
               <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm md:text-base">Manage your clinical profile and account security.</p>
            </div>
            {saved && (
               <div className="flex items-center gap-2 text-success font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-right bg-success/5 px-4 py-2 rounded-full border border-success/20">
                  <CheckCircle size={14} /> Changes Synchronized
               </div>
            )}
         </div>

         <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-8">
               {/* Profile Section */}
               <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <form onSubmit={handleProfileSave} className="p-8 md:p-10">
                     <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2 uppercase"><UserIcon size={14} /> Identity & Access</h3>
                     <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                           <input
                              type="text"
                              value={profileForm.name}
                              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-medical-blue/20 transition-all outline-none"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                           <input
                              type="email"
                              value={profileForm.email}
                              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-medical-blue/20 transition-all outline-none"
                           />
                        </div>
                     </div>
                     <button type="submit" className="w-full md:w-auto px-8 py-4 bg-medical-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-medical-blue/10 flex items-center justify-center gap-2 hover:bg-medical-blue/90 transition-all">
                        <Save size={16} /> Update Profile
                     </button>
                  </form>
               </section>

               <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 uppercase"><Palette size={14} /> Appearance</h4>
                  <div className="flex items-center justify-between px-2">
                     <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Theme</span>
                     <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                           onClick={() => onUpdateTheme('light')}
                           className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-medical-blue' : 'text-slate-400'}`}
                        >
                           <Sun size={14} />
                        </button>
                        <button
                           onClick={() => onUpdateTheme('dark')}
                           className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-medical-blue' : 'text-slate-400'}`}
                        >
                           <Moon size={14} />
                        </button>
                     </div>
                  </div>
               </section>
            </div>
         </div>
      </div>
   );
};

export default SettingsView;