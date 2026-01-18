
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Settings,
  Menu,
  Droplets,
  Stethoscope,
  Pill,
  Dna,
  Users,
  Search,
  BookOpen,
  Briefcase,
  PlayCircle,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  LogOut,
  Loader2,
  CloudUpload,
  Database,
  RefreshCcw,
  Wifi,
  WifiOff,
  X,
  ShoppingBag
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import LoginView from './components/LoginView';
import Dashboard from './components/Dashboard';
import BleedTracker from './components/BleedTracker';
import MedicationLog from './components/MedicationLog';
import AIAssistant from './components/AIAssistant';
import JointMap from './components/JointMap';
import EmergencyCard from './components/EmergencyCard';
import GeneticAnalytics from './components/GeneticAnalytics';
import HTCFinder from './components/HTCFinder';
import CareTeam from './components/CareTeam';
import InsuranceAccess from './components/InsuranceAccess';
import CommunityResources from './components/CommunityResources';
import SettingsView from './components/SettingsView';
import FactorAccess from './components/FactorAccess';
import { triggerAutomation } from './services/automationService';
import { supabase } from './services/supabase';
import {
  BleedEntry, Medication, InfusionRecord, MedicationType, Frequency,
  Trigger, BleedType, GeneticProfile, TeamMember, Appointment, User, InsuranceProfile
} from './types';

const STORAGE_KEYS = {
  USER: 'hemocare_user',
  BLEEDS: 'hemocare_bleeds',
  MEDS: 'hemocare_meds',
  INFUSIONS: 'hemocare_infusions',
  PROFILE: 'hemocare_profile',
  INSURANCE: 'hemocare_insurance',
  TEAM: 'hemocare_team',
  APPTS: 'hemocare_appointments',
  ONBOARDING: 'hemocare_onboarding_done',
  THEME: 'hemocare_theme',
  LANDING: 'hemocare_landing_seen',
  AUTOMATION: 'hemocare_automation_url'
};

const DEFAULT_INSURANCE: InsuranceProfile = {
  provider: 'BlueCross PPO',
  priorAuthNumber: 'PA-99234812-B',
  expirationDate: '2024-12-31',
  maxOutOfPocket: 3500,
  currentSpending: 2625,
  planType: 'PPO',
  status: 'Active'
};

const App: React.FC = () => {
  type TabId = 'dashboard' | 'bleeds' | 'meds' | 'ai' | 'joints' | 'emergency' | 'genetics' | 'htc' | 'team' | 'insurance' | 'community' | 'settings' | 'factor-procurement';

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem(STORAGE_KEYS.LANDING));
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [htcInitialMode, setHtcInitialMode] = useState<'search' | 'letter' | 'emergency' | 'physio'>('search');

  const [bleeds, setBleeds] = useState<BleedEntry[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [infusions, setInfusions] = useState<InfusionRecord[]>([]);
  const [geneticProfile, setGeneticProfile] = useState<GeneticProfile | null>(null);
  const [insurance, setInsurance] = useState<InsuranceProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSURANCE);
    return saved ? JSON.parse(saved) : DEFAULT_INSURANCE;
  });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Connectivity Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Initial Auth Check & Session Listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          handleUserLogin({
            id: session.user.id,
            name: session.user.user_metadata.full_name || 'HemoCare User',
            email: session.user.email || '',
            photoURL: session.user.user_metadata.avatar_url
          });
        }
      } catch (err) {
        const localUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (localUser) setUser(JSON.parse(localUser));
      } finally {
        setIsAppLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        handleUserLogin({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'HemoCare User',
          email: session.user.email || '',
          photoURL: session.user.user_metadata.avatar_url
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncCloudData = useCallback(async (userId: string) => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const fetchTable = async (table: string) => {
        const { data } = await supabase.from(table).select('*').eq('user_id', userId);
        return data;
      };

      const [bleedsData, medsData, infusionsData, teamData, apptsData] = await Promise.all([
        fetchTable('bleeds'),
        fetchTable('medications'),
        fetchTable('infusions'),
        fetchTable('team_members'),
        fetchTable('appointments')
      ]);

      const { data: profileData } = await supabase.from('profiles').select('genetic_profile, insurance_profile, has_completed_onboarding').eq('id', userId).maybeSingle();

      const mapMeds = (data: any[]) => data?.map(m => ({
        ...m,
        dosageBase: m.dosage_base,
        prescribingHTC: m.prescribing_htc,
        currentWeight: m.current_weight,
        vialSizes: m.vial_sizes,
        stockRemaining: m.stock_remaining
      })) || [];

      const mapBleeds = (data: any[]) => data?.map(b => ({
        ...b,
        photoUrl: b.photo_url
      })) || [];

      const mapInfusions = (data: any[]) => data?.map(i => ({
        ...i,
        medicationId: i.medication_id,
        lotNumber: i.lot_number,
        isMissed: i.is_missed
      })) || [];

      if (bleedsData) setBleeds(mapBleeds(bleedsData));
      if (medsData) setMeds(mapMeds(medsData));
      if (infusionsData) setInfusions(mapInfusions(infusionsData));

      if (profileData) {
        if (profileData.genetic_profile) setGeneticProfile(profileData.genetic_profile);
        if (profileData.insurance_profile) {
          setInsurance(profileData.insurance_profile);
          localStorage.setItem(STORAGE_KEYS.INSURANCE, JSON.stringify(profileData.insurance_profile));
        }
        // Sync onboarding status from DB
        if (profileData.has_completed_onboarding) {
          setShowOnboarding(false);
          localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
        }
      }

      if (teamData) setTeam(teamData);
      if (apptsData) setAppointments(apptsData);
    } catch (error) {
      console.error('Cloud Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleUserLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    syncCloudData(u.id);
    // Onboarding status is now handled by syncCloudData from DB
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const handleStartAuth = () => {
    localStorage.setItem(STORAGE_KEYS.LANDING, 'true');
    setShowLanding(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
    window.location.reload();
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    setIsSyncing(true);
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    if (isOnline) {
      await supabase.auth.updateUser({ data: { full_name: updates.name } });
    }
    setIsSyncing(false);
  };

  const addBleed = useCallback(async (bleed: BleedEntry) => {
    setBleeds(prev => [bleed, ...prev]);
    if (user && isOnline) {
      try {
        // STRICTLY construct the DB object to avoid "column not found" errors for camelCase props
        const dbBleed = {
          id: bleed.id, // Explicitly pass the ID generated by the frontend
          user_id: user.id,
          date: bleed.date,
          time: bleed.time,
          type: bleed.type,
          location: bleed.location,
          severity: bleed.severity,
          trigger: bleed.trigger,
          treatment: bleed.treatment,
          notes: bleed.notes,
          photo_url: bleed.photoUrl // Explicitly map and do NOT include original bleed object spread
        };

        const { error } = await supabase.from('bleeds').insert([dbBleed]);
        if (error) throw error;
        const webhook = localStorage.getItem(STORAGE_KEYS.AUTOMATION);
        if (webhook) {
          triggerAutomation(webhook, 'bleed_logged', bleed);
        }
      } catch (error) {
        console.error('Error saving bleed:', error);
        alert(`Failed to save bleed: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const addMed = useCallback(async (med: Medication) => {
    setMeds(prev => [...prev, med]);
    if (user && isOnline) {
      try {
        // STRICTLY construct the DB object
        const dbMed = {
          id: med.id, // Explicitly pass the ID generated by the frontend
          user_id: user.id,
          name: med.name,
          type: med.type,
          frequency: med.frequency,
          start_date: med.startDate,
          dosage_base: med.dosageBase,
          prescribing_htc: med.prescribingHTC,
          current_weight: med.currentWeight,
          vial_sizes: med.vialSizes,
          stock_remaining: med.stockRemaining
        };

        const { error } = await supabase.from('medications').insert([dbMed]);
        if (error) throw error;
      } catch (error) {
        console.error('Error saving medication:', error);
        alert(`Failed to save medication: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const updateMedication = useCallback(async (med: Medication) => {
    setMeds(prev => prev.map(m => m.id === med.id ? med : m));
    if (user && isOnline) {
      try {
        const dbMed = {
          user_id: user.id,
          name: med.name,
          type: med.type,
          frequency: med.frequency,
          start_date: med.startDate,
          dosage_base: med.dosageBase,
          prescribing_htc: med.prescribingHTC,
          current_weight: med.currentWeight,
          vial_sizes: med.vialSizes,
          stock_remaining: med.stockRemaining
        };

        const { error } = await supabase.from('medications').update(dbMed).eq('id', med.id);
        if (error) throw error;
      } catch (error) {
        console.error('Error updating medication:', error);
        alert(`Failed to update medication: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const addInfusion = useCallback(async (record: InfusionRecord) => {
    setInfusions(prev => [record, ...prev]);
    if (user && isOnline) {
      try {
        const dbInfusion = {
          id: record.id, // Explicitly pass the ID generated by the frontend
          user_id: user.id,
          medication_id: record.medicationId,
          timestamp: record.timestamp,
          lot_number: record.lotNumber,
          site: record.site,
          reaction: record.reaction,
          notes: record.notes,
          is_missed: record.isMissed
        };

        const { error } = await supabase.from('infusions').insert([dbInfusion]);
        if (error) throw error;
      } catch (error) {
        console.error('Error saving infusion:', error);
        alert(`Failed to save infusion: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const updateGeneticProfile = useCallback(async (profile: GeneticProfile) => {
    setGeneticProfile(profile);
    if (user && isOnline) {
      try {
        const { error } = await supabase.from('profiles').upsert({ id: user.id, genetic_profile: profile }, { onConflict: 'id' });
        if (error) throw error;
      } catch (error) {
        console.error('Error saving genetic profile:', error);
        alert(`Failed to save genetic profile: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const updateInsurance = useCallback(async (newInsurance: InsuranceProfile) => {
    setInsurance(newInsurance);
    localStorage.setItem(STORAGE_KEYS.INSURANCE, JSON.stringify(newInsurance));
    if (user && isOnline) {
      try {
        const { error } = await supabase.from('profiles').upsert({ id: user.id, insurance_profile: newInsurance }, { onConflict: 'id' });
        if (error) throw error;
      } catch (error) {
        console.error('Error saving insurance profile:', error);
        alert(`Failed to save insurance profile: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const addTeamMember = useCallback(async (member: TeamMember) => {
    setTeam(prev => [...prev, member]);
    if (user && isOnline) {
      try {
        const { error } = await supabase.from('team_members').insert([{ ...member, user_id: user.id }]);
        if (error) throw error;
      } catch (error) {
        console.error('Error saving team member:', error);
        alert(`Failed to save team member: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const updateTeamMember = useCallback(async (member: TeamMember) => {
    setTeam(prev => prev.map(m => m.id === member.id ? member : m));
    if (user && isOnline) {
      try {
        const { error } = await supabase.from('team_members').update({ ...member, user_id: user.id }).eq('id', member.id);
        if (error) throw error;
      } catch (error) {
        console.error('Error updating team member:', error);
        alert(`Failed to update team member: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const deleteTeamMember = useCallback(async (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    if (user && isOnline) {
      try {
        const { error } = await supabase.from('team_members').delete().eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert(`Failed to delete team member: ${(error as any).message}`);
      }
    }
  }, [user, isOnline]);

  const updateAppointments = useCallback((newAppts: Appointment[]) => {
    setAppointments(newAppts);
  }, []);

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => {
    const navItems = [
      {
        section: 'HEALTH MONITORING', items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'bleeds', label: 'Bleed Log', icon: Droplets },
          { id: 'meds', label: 'Treatment', icon: Pill },
          { id: 'joints', label: 'Joint Health', icon: Stethoscope },
          { id: 'genetics', label: 'Genetic Profile', icon: Dna },
        ]
      },
      {
        section: 'PROCUREMENT & CARE', items: [
          { id: 'factor-procurement', label: 'Factor Access', icon: ShoppingBag, color: 'text-medical-blue' },
          { id: 'team', label: 'Medical Team', icon: Users },
          { id: 'htc', label: 'Find Care', icon: Search },
          { id: 'insurance', label: 'Access & Cost', icon: Briefcase },
        ]
      },
      {
        section: 'SUPPORT', items: [
          { id: 'ai', label: 'AI Assistant', icon: MessageSquare },
          { id: 'community', label: 'Resources', icon: BookOpen },
          { id: 'emergency', label: 'Emergency Card', icon: ShieldAlert, color: 'text-danger' },
        ]
      }
    ];

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <nav className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto hide-scrollbar pb-10">
          {navItems.map((group) => (
            <div key={group.section} className="space-y-1">
              <h4 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-3 uppercase">{group.section}</h4>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabId);
                    if (item.id !== 'htc') setHtcInitialMode('search');
                    if (mobile) setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id
                    ? 'bg-medical-blue text-white shadow-lg'
                    : `text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 ${item.color || ''}`
                    }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <button
            onClick={() => {
              setActiveTab('settings');
              if (mobile) setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Settings size={18} />
            <span className="font-bold text-sm">Settings</span>
          </button>
        </div>
      </div>
    );
  };

  if (isAppLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-medical-calm dark:bg-slate-950">
        <Loader2 className="animate-spin text-medical-blue mb-4" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Cloud Sync Initializing</p>
      </div>
    );
  }

  if (showLanding) return <LandingPage onEnter={handleStartAuth} />;
  if (!user) return <LoginView onLogin={handleUserLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-inter text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black text-medical-blue flex items-center gap-2 tracking-tighter uppercase dark:text-medical-light">
            <Droplets className="fill-medical-blue text-medical-blue dark:fill-medical-light dark:text-medical-light" /> HemoCare
          </h1>
        </div>
        <NavContent />
      </aside>

      <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex items-center justify-between">
            <h1 className="text-xl font-black text-medical-blue flex items-center gap-2 tracking-tighter uppercase dark:text-medical-light">
              <Droplets className="fill-medical-blue text-medical-blue dark:fill-medical-light dark:text-medical-light" size={20} /> HemoCare
            </h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <X size={20} />
            </button>
          </div>
          <NavContent mobile />
        </aside>
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isSyncing ? 'text-blue-500' : isOnline ? 'text-green-500' : 'text-amber-500'}`}>
              {isSyncing ? <RefreshCcw size={14} className="animate-spin" /> : isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : isOnline ? 'Cloud Active' : 'Offline'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user?.email}</p>
            </div>
            <button onClick={() => setActiveTab('settings')} className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
              <img src={user?.photoURL} alt="User" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar bg-slate-50 dark:bg-slate-950 pb-20 md:pb-8">
          {activeTab === 'dashboard' && <Dashboard bleeds={bleeds} meds={meds} onNavigate={setActiveTab} appointments={appointments} geneticProfile={geneticProfile} team={team} />}
          {activeTab === 'bleeds' && <BleedTracker bleeds={bleeds} onAddBleed={addBleed} onNavigate={setActiveTab} />}
          {activeTab === 'meds' && <MedicationLog meds={meds} infusions={infusions} onAddMed={addMed} onUpdateMed={updateMedication} onAddInfusion={addInfusion} />}
          {activeTab === 'ai' && <AIAssistant bleeds={bleeds} meds={meds} />}
          {activeTab === 'joints' && <JointMap bleeds={bleeds} onNavigateToPhysio={() => { setHtcInitialMode('physio'); setActiveTab('htc'); }} />}
          {activeTab === 'genetics' && <GeneticAnalytics profile={geneticProfile} bleeds={bleeds} meds={meds} setProfile={updateGeneticProfile} />}
          {activeTab === 'team' && <CareTeam team={team} appointments={appointments} onAddMember={addTeamMember} onUpdateMember={updateTeamMember} onDeleteMember={deleteTeamMember} setAppointments={updateAppointments} />}
          {activeTab === 'htc' && <HTCFinder meds={meds} initialMode={htcInitialMode} />}
          {activeTab === 'insurance' && <InsuranceAccess insurance={insurance} onUpdateInsurance={updateInsurance} bleeds={bleeds} />}
          {activeTab === 'community' && <CommunityResources />}
          {activeTab === 'factor-procurement' && <FactorAccess user={user!} meds={meds} />}
          {activeTab === 'emergency' && <EmergencyCard geneticProfile={geneticProfile} meds={meds} team={team} user={user!} onFindER={() => { setHtcInitialMode('emergency'); setActiveTab('htc'); }} />}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <SettingsView
                user={user!}
                onUpdateUser={updateUserProfile}
                geneticProfile={geneticProfile || { gene: 'F8', nucleotideChange: '', aminoAcidChange: '', location: '', factorActivity: 0, inhibitorRiskScore: 0, exposureDays: 0 }}
                setGeneticProfile={updateGeneticProfile}
                theme={theme}
                onUpdateTheme={setTheme}
              />
              <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm mx-auto">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
