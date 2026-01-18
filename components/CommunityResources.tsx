
import React from 'react';
import { BookOpen, ExternalLink, Video, Users, Search, Microscope, HelpCircle, Star } from 'lucide-react';

const CommunityResources: React.FC = () => {
  const resources = [
    { title: 'Hemophilia Federation (India) (HFI)', desc: 'Providing treatment support and advocacy across India.', link: 'https://hemophilia.in/' },
    { title: 'National Hemophilia Foundation', desc: 'Educational advocacy and nationwide programs.', link: 'https://hemophilia.org' },
    { title: 'Hemophilia Federation of America', desc: 'Patient-led advocacy and community support.', link: 'https://hfa.org' },
    { title: 'World Federation of Hemophilia', desc: 'Global standards for hemophilia care.', link: 'https://wfh.org' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Knowledge Base</h2>
          <p className="text-slate-500 mt-1 font-medium">Community resources, clinical trials, and education.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {resources.map((res, i) => (
               <a 
                 key={i} 
                 href={res.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
               >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform"><BookOpen size={24}/></div>
                       <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="text-xl font-black text-slate-800 mb-2">{res.title}</h4>
                    <p className="text-sm font-medium text-slate-400">{res.desc}</p>
                  </div>
               </a>
             ))}
           </div>

           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                   <Microscope className="text-indigo-600" /> Clinical Trial Finder
                 </h3>
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">New Updates</span>
              </div>
              <div className="space-y-6">
                 {[
                   { title: 'Gene Therapy for Hemophilia A (Phase 3)', location: 'Metropolis Hospital', status: 'Recruiting' },
                   { title: 'Extended Half-Life Factor Evaluation', location: 'University HTC', status: 'Enrollment Pending' }
                 ].map((trial, i) => (
                   <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white transition-all cursor-pointer">
                      <div>
                         <h4 className="font-black text-slate-800">{trial.title}</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase mt-1">{trial.location}</p>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-4">
                         <span className="text-[10px] font-black text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100">{trial.status}</span>
                         <Search size={18} className="text-slate-300" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">Support Groups</h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <Users size={24} />
                    </div>
                    <div>
                       <p className="font-black text-sm">Hemophilia Men's Circle</p>
                       <p className="text-xs text-slate-500">Every Tuesday, 7PM</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-all">
                       <HelpCircle size={24} />
                    </div>
                    <div>
                       <p className="font-black text-sm">Carrier Support Group</p>
                       <p className="text-xs text-slate-500">Monthly Webinar</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Patient Education</h4>
              <div className="space-y-4">
                 {[
                   { title: 'Managing Inhibitors', time: '12 min' },
                   { title: 'Infusion Site Best Practices', time: '8 min' },
                   { title: 'Genetic Inheritance 101', time: '15 min' }
                 ].map((video, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                         <Video size={18} />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-black text-slate-800">{video.title}</p>
                         <p className="text-[10px] font-bold text-slate-400">{video.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityResources;
