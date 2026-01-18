
import React, { useState } from 'react';
import { BleedEntry } from '../types';
import { AlertCircle, Target, Activity, Info, ZoomIn, Maximize2, X, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';

interface Props {
  bleeds: BleedEntry[];
  onSelectLocation?: (location: string) => void;
  onNavigateToPhysio?: () => void;
}

const JointMap: React.FC<Props> = ({ bleeds, onSelectLocation, onNavigateToPhysio }) => {
  const [hoveredJoint, setHoveredJoint] = useState<string | null>(null);
  const [showPTPlan, setShowPTPlan] = useState(false);

  // Anatomical points for the SVG map
  const joints = [
    { id: 'head', name: 'Head/Intracranial', x: 200, y: 45, radius: 25 },
    { id: 'neck', name: 'Neck', x: 200, y: 90, radius: 15 },
    { id: 'shoulder_l', name: 'Left Shoulder', x: 135, y: 120, radius: 20 },
    { id: 'shoulder_r', name: 'Right Shoulder', x: 265, y: 120, radius: 20 },
    { id: 'elbow_l', x: 95, y: 195, name: 'Left Elbow', radius: 18 },
    { id: 'elbow_r', x: 305, y: 195, name: 'Right Elbow', radius: 18 },
    { id: 'wrist_l', x: 65, y: 275, name: 'Left Wrist', radius: 14 },
    { id: 'wrist_r', x: 335, y: 275, name: 'Right Wrist', radius: 14 },
    { id: 'abdomen', x: 200, y: 210, name: 'Abdomen/GI', radius: 35 },
    { id: 'hip_l', x: 160, y: 285, name: 'Left Hip', radius: 22 },
    { id: 'hip_r', x: 240, y: 285, name: 'Right Hip', radius: 22 },
    { id: 'knee_l', x: 155, y: 410, name: 'Left Knee', radius: 25 },
    { id: 'knee_r', x: 245, y: 410, name: 'Right Knee', radius: 25 },
    { id: 'ankle_l', x: 165, y: 540, name: 'Left Ankle', radius: 18 },
    { id: 'ankle_r', x: 235, y: 540, name: 'Right Ankle', radius: 18 },
  ];

  const bleedCounts = bleeds.reduce((acc, b) => {
    const loc = b.location.toLowerCase();
    joints.forEach(j => {
      if (loc.includes(j.name.toLowerCase()) || j.name.toLowerCase().includes(loc)) {
        acc[j.id] = (acc[j.id] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'fill-slate-200 dark:fill-slate-800';
    if (count === 1) return 'fill-orange-300';
    if (count === 2) return 'fill-orange-500';
    return 'fill-red-600 animate-pulse';
  };

  const ptExercises = [
    { name: "Ankle Isometric holds", sets: "3 sets of 10", goal: "Strengthen ankle stabilizers without joint friction." },
    { name: "Quadriceps Contractions", sets: "2 sets of 15", goal: "Maintain muscle tone around the knee during recovery." },
    { name: "Range of Motion (Passive)", sets: "5 mins twice daily", goal: "Prevent arthrofibrosis (stiffness) following a bleed." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center relative group">
        <div className="flex items-center justify-between w-full mb-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Anatomical Heatmap</h3>
          <div className="flex gap-2">
            <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-all"><Maximize2 size={16}/></button>
          </div>
        </div>

        <div className="relative w-full max-w-md aspect-[2/3] bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-center p-4 overflow-hidden">
           <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl">
             <path 
               d="M200,20 C230,20 250,40 250,70 C250,90 240,105 230,110 L280,130 C310,145 330,170 330,200 L350,300 C355,320 340,330 325,325 L290,315 L280,450 C280,500 260,580 230,580 L170,580 C140,580 120,500 120,450 L110,315 L75,325 C60,330 45,320 50,300 L70,200 C70,170 90,145 120,130 L170,110 C160,105 150,90 150,70 C150,40 170,20 200,20 Z" 
               className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700 stroke-2"
             />
             
             {joints.map((joint) => {
               const count = bleedCounts[joint.id] || 0;
               return (
                 <g 
                   key={joint.id}
                   className="cursor-pointer transition-all duration-300"
                   onMouseEnter={() => setHoveredJoint(joint.name)}
                   onMouseLeave={() => setHoveredJoint(null)}
                   onClick={() => onSelectLocation?.(joint.name)}
                 >
                   <circle 
                     cx={joint.x} 
                     cy={joint.y} 
                     r={joint.radius} 
                     className={`${getHeatColor(count)} opacity-60 hover:opacity-100 transition-opacity`}
                   />
                   {count > 0 && (
                     <text 
                       x={joint.x} 
                       y={joint.y + 4} 
                       textAnchor="middle" 
                       className="fill-white dark:fill-white text-[10px] font-black pointer-events-none"
                     >
                       {count}
                     </text>
                   )}
                 </g>
               );
             })}
           </svg>

           {hoveredJoint && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl animate-in fade-in zoom-in duration-200">
                {hoveredJoint}
             </div>
           )}
        </div>
        
        <div className="mt-8 grid grid-cols-3 gap-4 w-full">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Stable</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Recent</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Target Joint</span>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Joint Vulnerability</h3>
            </div>
          </div>
          <div className="space-y-4">
             {Object.keys(bleedCounts).length > 0 ? (
               joints.filter(j => bleedCounts[j.id]).map((joint) => (
                 <div key={joint.id} className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${bleedCounts[joint.id] >= 3 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-orange-400'}`} />
                      <div>
                        <span className="font-black text-slate-800 dark:text-white tracking-tight">{joint.name}</span>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {bleedCounts[joint.id] >= 3 ? 'Target Joint Alert' : 'Frequent Bleed Area'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-slate-800 dark:text-white">{bleedCounts[joint.id]}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Bleeds</p>
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                 <Activity className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={48} />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent bleed data detected</p>
                 <p className="text-slate-800 dark:text-white font-black mt-2">All Joints Clear</p>
               </div>
             )}
          </div>
        </div>

        <div className="bg-[#0f172a] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Activity size={180}/>
           </div>
           <div className="flex items-center gap-3 mb-6 relative">
              <div className="p-2 bg-white/10 rounded-xl">
                <AlertCircle size={20} className="text-blue-400"/>
              </div>
              <h4 className="font-black text-sm uppercase tracking-widest">Physiotherapy Insight</h4>
           </div>
           <p className="text-sm text-slate-300 leading-relaxed font-medium mb-8">
             Your joint stability is currently <span className="text-orange-400 font-black">Moderate</span> based on recent bleed frequency. Specialized Joint Rehab is advised.
           </p>
           <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-4">
                 <div className="flex-1">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[65%]" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Joint Health Index: 65/100</p>
                 </div>
                 <button 
                  onClick={() => setShowPTPlan(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
                 >
                   View Exercises
                 </button>
              </div>
              <button 
                onClick={() => onNavigateToPhysio?.()}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
              >
                <MapPin size={14} /> Find Local PT Centers
              </button>
           </div>
        </div>
      </div>

      {/* PT Plan Modal */}
      {showPTPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowPTPlan(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                      <Activity size={24} />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Joint Protection Plan</h3>
                </div>
                <button onClick={() => setShowPTPlan(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full"><X size={20}/></button>
             </div>
             <div className="space-y-4">
                {ptExercises.map((ex, i) => (
                   <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                         <h4 className="font-black text-slate-800 dark:text-white text-sm">{ex.name}</h4>
                         <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{ex.sets}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ex.goal}</p>
                   </div>
                ))}
             </div>
             <button onClick={() => setShowPTPlan(false)} className="w-full mt-8 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px]">Close Plan</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JointMap;
