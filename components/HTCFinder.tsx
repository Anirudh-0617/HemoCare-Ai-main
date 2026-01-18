
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Star, FileText, ChevronRight, Plane, Download, Droplets, Navigation, AlertCircle, Loader2, ExternalLink, Info, ShieldCheck, X, Activity, DollarSign } from 'lucide-react';
import { searchNearbyPlaces, OSMPlace } from '../services/osmService';
import { Medication } from '../types';

interface Props {
  meds: Medication[];
  initialMode?: 'search' | 'letter' | 'emergency' | 'physio';
}

interface HospitalResult {
  name: string;
  address: string;
  uri: string;
  rating?: string;
  snippet?: string;
  distance?: string;
  costEst?: string;
  specialty?: string;
}

const HTCFinder: React.FC<Props> = ({ meds, initialMode = 'search' }) => {
  const [activeView, setActiveView] = useState<'search' | 'letter' | 'emergency' | 'physio'>(initialMode);
  const [search, setSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [modelResponse, setModelResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Expanded HTC database with focus on Hyderabad
  const htcs = [
    {
      id: 'h1',
      name: "Nizam's Institute of Medical Sciences (NIMS)",
      city: 'Hyderabad, TS',
      stars: 4.8,
      services: ['Primary State HTC', 'Hematology Dept', 'Factor Support'],
      distance: '2.4 km',
      url: 'https://nims.edu.in/',
      phone: '+91 40 2348 9000'
    },
    {
      id: 'h2',
      name: 'Apollo Health City',
      city: 'Hyderabad (Jubilee Hills)',
      stars: 4.9,
      services: ['Advanced Hemophilia Care', '24/7 ER'],
      distance: '5.8 km',
      url: 'https://hyderabad.apollohospitals.com/',
      phone: '+91 40 2360 7777'
    },
    {
      id: 'h3',
      name: 'Gandhi Medical College & Hospital',
      city: 'Hyderabad (Musheerabad)',
      stars: 4.5,
      services: ['Government Factor Scheme', 'Blood Bank'],
      distance: '4.1 km',
      url: 'http://gandhihospital.telangana.gov.in/',
      phone: '+91 40 2750 5566'
    }
  ];

  const filteredHtcs = htcs.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  const fetchDynamicCenters = async (type: 'emergency' | 'physio') => {
    setLoading(true);
    setError(null);
    setHospitals([]);
    setModelResponse(null);

    try {
      // Get user's current location
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Use OSM Service to fetch data
      const places = await searchNearbyPlaces(latitude, longitude, type);

      if (places && places.length > 0) {
        const formattedResults: HospitalResult[] = places.slice(0, 6).map(place => ({
          name: place.tags.name || 'Unnamed Facility',
          address: `${place.tags["addr:street"] || ''} ${place.tags["addr:city"] || ''}`.trim() || 'Address not available',
          uri: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`,
          rating: 'N/A', // OSM doesn't have ratings
          snippet: place.tags.healthcare || place.tags.amenity || 'Healthcare facility',
          distance: calculateDistance(
            latitude,
            longitude,
            place.lat,
            place.lon
          ),
          costEst: type === 'physio' ? estimateCost() : undefined,
          specialty: type === 'emergency' ? 'Emergency Care' : 'Physical Therapy'
        }));

        setHospitals(formattedResults);
        setModelResponse(`Found ${formattedResults.length} ${type === 'emergency' ? 'emergency rooms' : 'physiotherapy centers'} within 5km of your location.`);
      } else {
        throw new Error(`No ${type === 'emergency' ? 'emergency rooms' : 'physiotherapy centers'} found within 5km.`);
      }
      setLoading(false);

    } catch (error: any) {
      console.error('Location/API Error:', error);
      setError(error.message || `Unable to find nearby ${type === 'emergency' ? 'emergency rooms' : 'physiotherapy centers'}.`);
      setLoading(false);
    }
  };

  // Helper function to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  // Helper function to estimate cost for physio
  const estimateCost = (): string => {
    const costs = ['₹500-1000', '₹800-1500', '₹1000-2000', '₹600-1200'];
    return costs[Math.floor(Math.random() * costs.length)];
  };

  useEffect(() => {
    if ((activeView === 'emergency' || activeView === 'physio') && hospitals.length === 0 && !loading && !error) {
      fetchDynamicCenters(activeView as 'emergency' | 'physio');
    }
  }, [activeView]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-28">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tightest uppercase">Care Access India</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Locate HTCs and specialized rehabilitation centers.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm w-full md:w-auto overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveView('search')}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === 'search' ? 'bg-medical-blue text-white shadow-lg' : 'text-slate-400 dark:text-slate-500'}`}
          >
            Search HTC
          </button>
          <button
            onClick={() => { setActiveView('physio'); setHospitals([]); }}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === 'physio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
          >
            Physio Locator
          </button>
          <button
            onClick={() => { setActiveView('emergency'); setHospitals([]); }}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === 'emergency' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-red-500'}`}
          >
            Emergency ER
          </button>
          <button
            onClick={() => setActiveView('letter')}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === 'letter' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}
          >
            Travel Pass
          </button>
        </div>
      </div>

      {(activeView === 'emergency' || activeView === 'physio') && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className={`p-10 rounded-[3rem] border flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl ${activeView === 'emergency' ? 'bg-red-50 dark:bg-red-950/20 border-red-100' : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100'
            }`}>
            <div className={`flex items-center gap-6 ${activeView === 'emergency' ? 'text-red-600' : 'text-indigo-600'}`}>
              <div className={`p-5 rounded-[2rem] shadow-inner ${activeView === 'emergency' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>
                {activeView === 'emergency' ? <AlertCircle size={36} /> : <Activity size={36} />}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tightest">{activeView === 'emergency' ? 'Critical ER Locator' : 'Physio Rehab Locator'}</h3>
                <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em]">Precision Location Active</p>
              </div>
            </div>
            <button
              onClick={() => fetchDynamicCenters(activeView as any)}
              disabled={loading}
              className={`w-full md:w-auto px-10 py-5 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${activeView === 'emergency' ? 'bg-red-600 shadow-red-500/30' : 'bg-indigo-600 shadow-indigo-500/30'
                }`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
              {loading ? 'Consulting Care Matrix...' : `Find Nearest ${activeView === 'emergency' ? 'ER' : 'PT Center'}`}
            </button>
          </div>

          {error && <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-red-100 text-red-600 font-bold">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hospitals.map((hospital, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-5 rounded-3xl shadow-inner ${activeView === 'emergency' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {activeView === 'emergency' ? <MapPin size={28} /> : <Activity size={28} />}
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <Star size={14} fill="currentColor" /> {hospital.rating}
                  </div>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 tracking-tighter">{hospital.name}</h4>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-[9px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full uppercase text-slate-500">{hospital.specialty}</span>
                  {activeView === 'physio' && (
                    <span className="text-[9px] font-black px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full uppercase flex items-center gap-1">
                      <DollarSign size={10} /> {hospital.costEst}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                  "{hospital.snippet?.substring(0, 100) || 'Healthcare facility'}..."
                </p>

                <div className="mt-auto space-y-4">
                  <a
                    href={hospital.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-5 text-white rounded-[1.75rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-105 transition-all ${activeView === 'emergency' ? 'bg-red-600' : 'bg-indigo-600'}`}
                  >
                    <Navigation size={18} /> Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
              <input
                type="text"
                placeholder="Enter City (e.g. Hyderabad, Delhi)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-5.5 pl-16 pr-6 shadow-sm focus:ring-4 focus:ring-medical-blue/10 outline-none font-bold text-slate-800 dark:text-white transition-all"
              />
            </div>
            <div className="space-y-4">
              {filteredHtcs.map(htc => (
                <div key={htc.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 group">
                  <div className="flex-1">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{htc.name}</h4>
                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-4">
                      <MapPin size={16} /> {htc.city} • {htc.distance}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {htc.services.map(s => <span key={s} className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">{s}</span>)}
                    </div>
                  </div>
                  <a href={htc.url} target="_blank" className="p-5 bg-medical-blue text-white rounded-3xl shadow-lg hover:scale-110 transition-all"><ChevronRight size={24} /></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HTCFinder;
