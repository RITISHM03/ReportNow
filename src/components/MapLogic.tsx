'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Location {
    lat: number;
    lng: number;
}

interface MapLogicProps {
    location: Location | null;
}

const RecenterMap = ({ location }: { location: Location }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([location.lat, location.lng], 13);
    }, [location, map]);
    return null;
};

export default function MapLogic({ location }: MapLogicProps) {
    const defaultCenter = { lat: 51.505, lng: -0.09 }; // Default: London
    const center = location || defaultCenter;

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {location && (
                <>
                    <Marker position={[location.lat, location.lng]} icon={icon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold">You are here!</p>
                                <p className="text-sm text-gray-600">
                                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                    <RecenterMap location={location} />
                </>
            )}
        </MapContainer>
    );
}
