import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { HospitalResult } from './HTCFinder';
import L from 'leaflet';
import { Search, Navigation, MapPin, AlertCircle, Activity } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

// Fix for default markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom icons based on type
const createCustomIcon = (type?: string) => {
    let color = '#0d9488'; // teal-600 default
    let IconComponent = MapPin;

    if (type?.toLowerCase().includes('emergency') || type?.toLowerCase().includes('er')) {
        color = '#dc2626'; // red-600
        IconComponent = AlertCircle;
    } else if (type?.toLowerCase().includes('physio') || type?.toLowerCase().includes('rehab')) {
        color = '#4f46e5'; // indigo-600
        IconComponent = Activity;
    }

    const iconHtml = ReactDOMServer.renderToString(
        <div className="relative flex items-center justify-center">
            <div style={{ color: color }} className="filter drop-shadow-lg">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" fill="white" />
                </svg>
            </div>
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon', // We'll need to ensure this class doesn't override layout too much or is empty
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};


interface Props {
    hospitals: HospitalResult[];
    userLocation: { lat: number; lon: number } | null;
    center?: { lat: number; lon: number };
    onSearch?: (query: string) => void;
}

const RecenterMap = ({ center }: { center: { lat: number; lon: number } }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([center.lat, center.lon], map.getZoom());
    }, [center, map]);
    return null;
};

const SearchControl = ({ onSearch }: { onSearch?: (query: string) => void }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch && query.trim()) {
            onSearch(query);
        }
    };

    return (
        <div className="absolute top-24 left-4 right-4 md:top-6 md:left-6 md:right-auto md:w-80 z-[1000]">
            <form onSubmit={handleSearch} className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search specific location..."
                    className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 shadow-xl focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all font-bold text-xs uppercase tracking-wide placeholder:text-slate-400"
                />
                <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Search size={16} />
                </button>
            </form>
        </div>
    );
};

const HospitalMap: React.FC<Props> = ({ hospitals, userLocation, center, onSearch }) => {
    const mapCenter = center || (userLocation ? userLocation : { lat: 17.3850, lon: 78.4867 });

    return (
        <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl z-0 relative group">
            <MapContainer
                center={[mapCenter.lat, mapCenter.lon]}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <SearchControl onSearch={onSearch} />

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lon]}>
                        <Popup className="rounded-xl">
                            <div className="text-center p-2">
                                <span className="font-bold text-slate-700">You are here</span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {hospitals.map((hospital, idx) => {
                    if (hospital.lat && hospital.lon) {
                        return (
                            <Marker
                                key={idx}
                                position={[hospital.lat, hospital.lon]}
                                icon={createCustomIcon(hospital.specialty)}
                            >
                                <Popup className="custom-popup rounded-2xl overflow-hidden shadow-xl border-0" maxWidth={300}>
                                    <div className="font-sans min-w-[200px]">
                                        <div className="bg-slate-50 -mx-4 -mt-3 px-4 py-3 border-b border-slate-100 mb-3">
                                            <h3 className="font-bold text-slate-800 text-sm leading-tight">{hospital.name}</h3>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">{hospital.specialty}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                {hospital.address || hospital.snippet || 'No details available.'}
                                            </p>

                                            <a
                                                href={hospital.uri || `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                                            >
                                                <Navigation size={14} />
                                                Get Directions
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
                <RecenterMap center={mapCenter} />
            </MapContainer>
        </div>
    );
};

export default HospitalMap;
