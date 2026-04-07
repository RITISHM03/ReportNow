import { NextResponse } from 'next/server';
import { getEmergencyContacts } from '@/lib/emergency-services';

const hardcodedFallbacks = {
  police: [{
    id: "hc-police-1",
    name: "R11 Rayala Nagar Police Station",
    address: "25JH+QF4, Bharathi Salai, Andavar Nagar, Thiruvalluvar Nagar, Ramapuram, Chennai, Tamil Nadu 600089",
    distance: 850,
    rating: 4.2
  }],
  hospitals: [{
    id: "hc-hospital-1",
    name: "SRM Prime Hospital, Ramapuram | Multi Speciality Hospital | 24x7 Emergency Care",
    address: "Bharathi Salai, Ramapuram, Chennai, Tamil Nadu 600089",
    distance: 1200,
    rating: 4.8
  }],
  fireStations: [{
    id: "hc-fire-1",
    name: "DLF Fire Station",
    address: "25FF+463, Unnamed Road, Manapakkam, Chennai, Tamil Nadu 600125",
    distance: 2100,
    rating: 5.0
  }],
  pharmacies: [{
    id: "hc-pharmacy-1",
    name: "MedPlus Ramapuram",
    address: "No 5, 29 South, Valluvar Salai, Ramapuram, Gokulam Colony, Ramapuram, Chennai, Tamil Nadu 600089",
    distance: 400,
    rating: 3.4
  }]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  try {
    const [police, hospitals, fireStations, pharmacies] = await Promise.all([
      getEmergencyContacts(lat, lng, 'police-station', 2),
      getEmergencyContacts(lat, lng, 'hospital', 2),
      getEmergencyContacts(lat, lng, 'fire-station', 2),
      getEmergencyContacts(lat, lng, 'pharmacy', 2)
    ]);

    // We map them to include an id to satisfy the frontend component's ServicePlace type
    const mapContacts = (contacts: any[]) => contacts.map((c, i) => ({
      id: `${c.name}-${i}`,
      name: c.name,
      address: c.address,
      distance: c.distance,
      rating: null,
    }));

    const mappedPolice = mapContacts(police);
    const mappedHospitals = mapContacts(hospitals);
    const mappedFireStations = mapContacts(fireStations);
    const mappedPharmacies = mapContacts(pharmacies);

    return NextResponse.json({
      police: mappedPolice.length > 0 ? mappedPolice : hardcodedFallbacks.police,
      hospitals: mappedHospitals.length > 0 ? mappedHospitals : hardcodedFallbacks.hospitals,
      fireStations: mappedFireStations.length > 0 ? mappedFireStations : hardcodedFallbacks.fireStations,
      pharmacies: mappedPharmacies.length > 0 ? mappedPharmacies : hardcodedFallbacks.pharmacies
    });
  } catch (error) {
    console.error('Error in nearby-services API:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby services' }, { status: 500 });
  }
}
