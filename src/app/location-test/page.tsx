import LocationMap from '@/components/LocationMap';

export default function LocationPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-4">
                        User Location Demo
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        This feature uses the browser's Geolocation API to find your position and displays it on an interactive map using Leaflet and OpenStreetMap. No API keys required.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-2 sm:p-8">
                    <LocationMap />
                </div>

                <div className="mt-12 text-center text-sm text-gray-400">
                    <p>Built with Next.js, Tailwind CSS, and React Leaflet.</p>
                </div>
            </div>
        </main>
    );
}
