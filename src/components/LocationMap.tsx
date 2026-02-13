'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MapLogic with SSR disabled to avoid "window is not defined" error
const MapLogic = dynamic(() => import('./MapLogic'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            Loading Map...
        </div>
    ),
});

interface Location {
    lat: number;
    lng: number;
}

interface LocationMapProps {
    className?: string;
}

export default function LocationMap({ className = '' }: LocationMapProps) {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGetLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        // Options for high accuracy
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                let errorMessage = 'An error occurred while retrieving location.';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'User denied the request for Geolocation.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                }
                setError(errorMessage);
                setLoading(false);
            },
            options
        );
    };

    return (
        <div className={`flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-6 ${className}`}>

            <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-2xl border border-gray-200 relative z-0">
                <MapLogic location={location} />

                {/* Overlay prompts when no location yet */}
                {!location && !loading && !error && (
                    <div className="absolute inset-0 bg-black/5 pointer-events-none z-[400]" />
                )}
            </div>

            <div className="w-full flex flex-col items-center gap-4">
                <button
                    onClick={handleGetLocation}
                    disabled={loading}
                    className={`px-8 py-3 rounded-full font-bold text-white transition-all transform duration-200
            ${loading
                            ? 'bg-gray-400 cursor-not-allowed scale-95'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-lg hover:shadow-xl'
                        }
          `}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Locating...
                        </span>
                    ) : (
                        location ? 'Update Location' : '📍 Get My Location'
                    )}
                </button>

                {error && (
                    <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm w-full max-w-md animate-pulse">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {location && (
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-2">
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Latitude</p>
                            <p className="font-mono text-xl font-bold text-gray-800">{location.lat.toFixed(6)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Longitude</p>
                            <p className="font-mono text-xl font-bold text-gray-800">{location.lng.toFixed(6)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
