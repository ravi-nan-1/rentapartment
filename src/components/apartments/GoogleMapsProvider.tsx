'use client';

import { APIProvider } from '@vis.gl/react-google-maps';

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  // In a real application, you should use environment variables for the API key.
  // Example: const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-muted">
        <div className="text-center text-muted-foreground p-4">
          <h3 className="text-lg font-semibold text-foreground">Google Maps Not Configured</h3>
          <p className="mt-2">
            To enable the map view, you need to provide a Google Maps API key.
          </p>
          <p className="mt-1 text-sm">
            Please get a key from the Google Cloud Console and add it to the project.
          </p>
          <p className="mt-4 text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
            Update the `apiKey` variable in `src/components/apartments/GoogleMapsProvider.tsx`.
          </p>
        </div>
      </div>
    );
  }

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}
