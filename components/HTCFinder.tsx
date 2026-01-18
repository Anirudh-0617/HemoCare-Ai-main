import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Star, FileText, ChevronRight, Plane, Download, Droplets, Navigation, AlertCircle, Loader2, ExternalLink, Info, ShieldCheck, X, Activity, DollarSign } from 'lucide-react';
import { searchNearbyPlaces, searchPlacesByKeyword, OSMPlace } from '../services/osmService';
import { Medication } from '../types';
import HospitalMap from './HospitalMap';

interface Props {
  meds: Medication[];
  initialMode?: 'search' | 'letter' | 'emergency' | 'physio' | 'hospital';
}

export interface HospitalResult {
  name: string;
  address: string;
  uri: string;
  rating?: string;
  snippet?: string;
  distance?: string;
  costEst?: string;
  specialty?: string;
  lat?: number;
  lon?: number;
}

const HTCFinder: React.FC<Props> = ({ meds, initialMode = 'search' }) => {
  const [activeView, setActiveView] = useState<'search' | 'letter' | 'emergency' | 'physio' | 'hospital'>(initialMode);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number, lon: number } | undefined>(undefined);
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

  const fetchDynamicCenters = async (type: 'emergency' | 'physio' | 'hospital') => {
    setLoading(true);
    setError(null);
    setHospitals([]);
    setModelResponse(null);

    // Mock data for fallback
    const mockData: Record<string, HospitalResult[]> = {
      physio: [
        { name: 'PhysioFit Rehabilitation', address: 'Jubilee Hills, Hyderabad', lat: 17.4256, lon: 78.4111, specialty: 'Physical Therapy', uri: 'https://maps.google.com/?q=17.4256,78.4111', distance: '2.5km', rating: '4.8', snippet: 'Advanced sports rehab and physiotherapy center.' },
        { name: 'OrthoLive Physio Care', address: 'Banjara Hills, Hyderabad', lat: 17.4156, lon: 78.4311, specialty: 'Physical Therapy', uri: 'https://maps.google.com/?q=17.4156,78.4311', distance: '3.1km', rating: '4.5', snippet: 'Post-op recovery and mobility specialists.' },
        { name: 'Wellness Physio Clinic', address: 'Madhapur, Hyderabad', lat: 17.4456, lon: 78.3911, specialty: 'Physical Therapy', uri: 'https://maps.google.com/?q=17.4456,78.3911', distance: '1.8km', rating: '4.6', snippet: 'Pain management and chiropractic care.' }
      ],
      emergency: [
        { name: 'City Emergency Hospital', address: 'Gachibowli, Hyderabad', lat: 17.4356, lon: 78.3611, specialty: 'Emergency Care', uri: 'https://maps.google.com/?q=17.4356,78.3611', distance: '4.2km', rating: '4.9', snippet: '24/7 Trauma center and critical care.' },
        { name: 'Sunrise Trauma Center', address: 'Kondapur, Hyderabad', lat: 17.4656, lon: 78.3211, specialty: 'Emergency Care', uri: 'https://maps.google.com/?q=17.4656,78.3211', distance: '5.5km', rating: '4.7', snippet: 'Immediate response unit.' },
      ],
      hospital: [
        { name: 'Care General Hospital', address: 'Hitech City, Hyderabad', lat: 17.4556, lon: 78.3711, specialty: 'General Hospital', uri: 'https://maps.google.com/?q=17.4556,78.3711', distance: '1.2km', rating: '4.4', snippet: 'Multi-specialty healthcare facility.' },
        { name: 'MediPlus Health Center', address: 'Kukatpally, Hyderabad', lat: 17.4856, lon: 78.4011, specialty: 'General Hospital', uri: 'https://maps.google.com/?q=17.4856,78.4011', distance: '6.0km', rating: '4.2', snippet: 'Affordable healthcare for all.' },
      ]
    };

    try {
      // Get user's current location with a timeout
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lon: longitude });
      setMapCenter({ lat: latitude, lon: longitude });

      // Use OSM Service to fetch data
      const places = await searchNearbyPlaces(latitude, longitude, type);



      if (places && places.length > 0) {
        const formattedResults: HospitalResult[] = places.slice(0, 10).map(place => ({
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
          specialty: type === 'emergency' ? 'Emergency Care' : (type === 'physio' ? 'Physical Therapy' : 'General Hospital'),
          lat: place.lat,
          lon: place.lon
        }));

        setHospitals(formattedResults);
        setModelResponse(`Found ${formattedResults.length} facilities within 5km of your location.`);
      } else {
        // Soft fallback
        console.warn('No results from OSM, triggering demo mode.');
        setHospitals(mockData[type]);
        setError(`Showing top rated ${type} centers (Demo Mode)`);
      }
      setLoading(false);

    } catch (err: any) {
      console.error('Location/API Error:', err);
      // Fail gracefully to demo mode
      setHospitals(mockData[type]);
      if (mockData[type] && mockData[type].length > 0) {
        setMapCenter({ lat: mockData[type][0].lat || 0, lon: mockData[type][0].lon || 0 });
      }
      setError(`Showing demo ${type} centers nearby (Offline Mode)`);
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const places = await searchPlacesByKeyword(query);

      if (places.length > 0) {
        const formattedResults: HospitalResult[] = places.map(place => ({
          name: place.tags.name || 'Unnamed Facility',
          address: `${place.tags["addr:street"] || ''} ${place.tags["addr:city"] || ''}`.trim() || 'Address not available',
          uri: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`,
          rating: 'N/A',
          snippet: place.tags.healthcare || place.tags.amenity,
          specialty: place.tags.healthcare || 'Hospital',
          lat: place.lat,
          lon: place.lon,
          distance: undefined
        }));
        setHospitals(formattedResults);
        // Ensure we have a valid center before setting it
        if (formattedResults[0].lat && formattedResults[0].lon) {
          setMapCenter({ lat: formattedResults[0].lat, lon: formattedResults[0].lon });
        }
      } else {
        setHospitals([]);
        setError(`No results found for "${query}"`);
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordSearch = () => {
    performSearch(search);
  };

  const handleMapSearch = (query: string) => {
    setSearch(query);
    performSearch(query);
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
    if ((activeView === 'emergency' || activeView === 'physio' || activeView === 'hospital') && hospitals.length === 0 && !loading && !error) {
      //   fetchDynamicCenters(activeView as any);
      // Commented out auto-fetch: User can click 'Find Nearest' to load, or use Search.
      // Re-enabling it but maybe we want to lazy load or let user initiate.
      // The original code auto-fetched. The user said "improve preview". Auto-fetch is fine.
      fetchDynamicCenters(activeView as any);
    }
  }, [activeView]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase relative inline-block">
            Care Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Network</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
            Locate specialized Hemophilia Treatment Centers (HTCs) and rehabilitation facilities relative to your position.
          </p>
        </div>

        <div className="flex bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm w-full xl:w-auto overflow-x-auto hide-scrollbar">
          {[
            { id: 'search', label: 'Search', icon: Search },
            { id: 'hospital', label: 'Near Me', icon: MapPin },
            { id: 'physio', label: 'Physio', icon: Activity },
            { id: 'emergency', label: 'ER', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveView(tab.id as any); if (tab.id !== 'search') setHospitals([]); }}
              className={`flex-1 xl:flex-none px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 group ${activeView === tab.id
                ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl scale-100'
                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <tab.icon size={16} className={`transition-transform group-hover:scale-110 ${activeView === tab.id ? 'text-blue-400' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {(activeView === 'emergency' || activeView === 'physio' || activeView === 'hospital') && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">

          {/* Status Banner instead of Error */}
          {error && (
            <div className={`mx-auto max-w-2xl px-6 py-4 rounded-3xl flex items-center justify-center gap-3 text-sm font-medium shadow-sm backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300 ${error.toLowerCase().includes("demo") || error.toLowerCase().includes("offline")
              ? "bg-amber-50/90 text-amber-800 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/30"
              : "bg-red-50/90 text-red-700 border border-red-200/50"
              }`}>
              {error.toLowerCase().includes("demo") || error.toLowerCase().includes("offline") ? <div className="p-1 bg-amber-100 dark:bg-amber-900 rounded-full"><Info size={16} /></div> : <AlertCircle size={20} />}
              {error}
            </div>
          )}

          <div className="relative rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
            {/* Header Overlay on Map */}
            <div className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 pointer-events-auto">
                  <div className={`flex items-center gap-3 ${activeView === 'emergency' ? 'text-red-600' :
                    activeView === 'physio' ? 'text-indigo-600' : 'text-teal-600'
                    }`}>
                    {activeView === 'emergency' ? <AlertCircle size={24} /> : activeView === 'physio' ? <Activity size={24} /> : <MapPin size={24} />}
                    <span className="font-black uppercase tracking-widest text-xs">
                      {activeView === 'emergency' ? 'Critical Care' : activeView === 'physio' ? 'Rehalilitation' : 'General Care'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => fetchDynamicCenters(activeView as any)}
                  disabled={loading}
                  className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all pointer-events-auto flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                  {loading ? 'Scanning...' : 'Refresh Area'}
                </button>
              </div>
            </div>

            <HospitalMap
              hospitals={hospitals}
              userLocation={userLocation}
              center={mapCenter}
              onSearch={handleMapSearch}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  {activeView === 'emergency' ? <AlertCircle size={120} /> : <MapPin size={120} />}
                </div>

                <div className="flex justify-between items-start mb-6 relative">
                  <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${activeView === 'emergency' ? 'bg-red-50 text-red-600' :
                    activeView === 'physio' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'
                    }`}>
                    {hospital.specialty || 'Medical Center'}
                  </span>

                  {hospital.rating !== 'N/A' && (
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={14} fill="currentColor" /> {hospital.rating}
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight pr-4">{hospital.name}</h4>

                <p className="text-xs font-medium text-slate-400 mb-6 flex items-center gap-2">
                  <MapPin size={12} /> {hospital.address} {hospital.distance && `• ${hospital.distance}`}
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 line-clamp-3">
                  {hospital.snippet || 'No additional details available.'}
                </p>

                <div className="mt-auto">
                  <a
                    href={hospital.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 rounded-2xl text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    Get Directions <Navigation size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative group transistion-all duration-500 hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
              <input
                type="text"
                placeholder="Search hospitals, clinics, or cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-6 pl-20 pr-32 shadow-xl shadow-slate-200/20 dark:shadow-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none font-bold text-lg text-slate-800 dark:text-white transition-all placeholder:font-medium placeholder:text-slate-400"
              />
              <button
                onClick={handleKeywordSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                Search
              </button>
            </div>

            <div className="space-y-4">
              {/* Show Local Search Results */}
              {filteredHtcs.map(htc => (
                <div key={htc.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors shadow-sm hover:shadow-xl">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{htc.name}</h4>
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">HTC</span>
                      </div>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-slate-300" /> {htc.city} <span className="text-slate-300">•</span> {htc.distance}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {htc.services.map(s => <span key={s} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{s}</span>)}
                      </div>
                    </div>
                    <a href={htc.url} target="_blank" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-blue-600 hover:text-white transition-all">
                      <ChevronRight size={24} />
                    </a>
                  </div>
                </div>
              ))}

              {/* Show OSM Search Results in Search View if exists */}
              {activeView === 'search' && hospitals.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <Globe size={20} className="text-slate-400" />
                    Web Results
                  </h3>

                  <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl mb-8">
                    <HospitalMap
                      hospitals={hospitals}
                      userLocation={userLocation}
                      center={mapCenter}
                      onSearch={handleMapSearch}
                    />
                  </div>

                  <div className="space-y-4">
                    {hospitals.map((h, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{h.name}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">{h.address}</p>
                          </div>
                        </div>
                        <a href={h.uri} target="_blank" className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all w-full sm:w-auto text-center">
                          View Map
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Filters for Search View (Visual Only for now) */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">Need Help?</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                  Our team can help you find the right specialist for your condition.
                </p>
                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors">
                  Contact Support
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <ShieldCheck size={200} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HTCFinder;
