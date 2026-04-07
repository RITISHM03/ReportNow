"use client"
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Map, Navigation, Loader2, Hospital, Shield, Flame, Pill, Star } from "lucide-react";
import Link from 'next/link';

type ServicePlace = {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  distance: number;
};

interface NearbyServicesData {
  police: ServicePlace[];
  hospitals: ServicePlace[];
  fireStations: ServicePlace[];
  pharmacies: ServicePlace[];
}

export default function UrgentHelp() {
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [servicesData, setServicesData] = useState<NearbyServicesData | null>(null);

  const getUserLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setLoadingLocation(false);
          toast({
            title: "Location detected",
            description: "Successfully detected your location.",
          });
          fetchServices(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Could not detect your location. Please allow location access.",
          });
        }
      );
    } else {
      setLoadingLocation(false);
      toast({
        variant: "destructive",
        title: "Location not supported",
        description: "Your browser does not support geolocation.",
      });
    }
  };

  const fetchServices = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nearby-services?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: NearbyServicesData = await res.json();
      setServicesData(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch nearby services. Please try again later.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderServiceSection = (title: string, icon: React.ReactNode, items: ServicePlace[] | undefined) => {
    return (
      <div className="bg-gray-800/60 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          {icon} {title}
        </h2>
        {(!items || items.length === 0) ? (
          <div className="py-4 text-center text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p>No {title.toLowerCase()} found nearby.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200/10">
            {items.map((item) => (
              <li key={item.id} className="py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 text-purple-500 bg-gray-500/10 rounded-full">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 max-sm:flex-col">
                      <div>
                        <h3 className="font-semibold text-gray-200">{item.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{item.address}</p>
                      </div>
                      {item.rating && (
                        <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-sm whitespace-nowrap">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-3 text-sm text-gray-400 gap-3">
                      <div className="flex items-center">
                        <Map className="h-4 w-4 mr-1" />
                        <span>{(item.distance / 1000).toFixed(2)} km away</span>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 hover:underline flex items-center max-md:text-xs"
                      >
                        <Navigation className="h-4 w-4 mr-1 " />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 pt-40 pb-28 max-md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-7xl tracking-tight font-bold mb-5">Nearby Emergency Support</h1>
            <p className="text-gray-500 max-w-2xl mx-auto max-md:text-sm max-md:leading-snug">
              Find emergency services near your location. Allow location access to see nearest hospitals, police stations, 
              fire stations, and pharmacies.
            </p>
          </div>
          
          <div className="bg-destructive text-white p-4 rounded-lg mb-8 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="font-bold text-lg max-md:text-base">Emergency Number: 112</h3>
                <p className="text-sm opacity-90 max-md:text-xs">For immediate emergency assistance in India</p>
              </div>
            </div>
            <Link href="tel:112" className="bg-white text-destructive font-bold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors max-md:text-sm max-md:px-1 max-md:py-1 max-md:text-center max-md:leading-tight">
              Call Now
            </Link>
          </div>
          
          <div className="bg-gray-500/20 p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold  mb-2">Find Emergency Services Near You</h2>
                <p className="text-gray-500">Allow location access to find services near you</p>
              </div>
              
              <Button 
                onClick={getUserLocation} 
                className="flex items-center gap-2 bg-accent text-white bg-purple-500 hover:bg-purple-600"
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {location ? 'Update My Location' : 'Get My Location'}
              </Button>
              
              {location && (
                <p className="text-sm text-gray-500">
                  Your location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-3 text-gray-400">Searching for nearby emergency services...</span>
            </div>
          )}

          {!loading && servicesData && location && (
            <div className="space-y-6">
              {renderServiceSection("Police Stations", <Shield className="h-5 w-5" />, servicesData.police)}
              {renderServiceSection("Hospitals", <Hospital className="h-5 w-5" />, servicesData.hospitals)}
              {renderServiceSection("Fire Stations", <Flame className="h-5 w-5" />, servicesData.fireStations)}
              {renderServiceSection("Pharmacies", <Pill className="h-5 w-5" />, servicesData.pharmacies)}
            </div>
          )}

          {!location && !loading && (
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-md mt-8">
              <h2 className="text-xl font-semibold mb-2">Emergency Services Information</h2>
              <p className="text-gray-500 mb-4 max-md:text-sm">
                This feature helps you find emergency services near your current location. To use it, please allow location access
                by clicking the &quot;Get My Location&quot; button above.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200/10 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Hospital className="h-5 w-5 text-purple-500" /> Hospitals
                  </h3>
                  <p className="text-sm text-gray-500">Find the nearest hospitals for medical emergencies.</p>
                </div>
                <div className="border border-gray-200/10 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-500" /> Police Stations
                  </h3>
                  <p className="text-sm text-gray-500">Locate nearby police stations for security emergencies.</p>
                </div>
                <div className="border border-gray-200/10 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Flame className="h-5 w-5 text-purple-500" /> Fire Stations
                  </h3>
                  <p className="text-sm text-gray-500">Find fire stations for fire emergencies and rescue operations.</p>
                </div>
                <div className="border border-gray-200/10 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Pill className="h-5 w-5 text-purple-500" /> Pharmacies
                  </h3>
                  <p className="text-sm text-gray-500">Locate pharmacies for urgent medication needs.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}