
export async function getLatLng(address: string, city: string): Promise<{ lat: number | null; lng: number | null }> {
  const query = `${address}, ${city}`;
  // NOTE: Replace YOUR_MAPSCO_KEY with your actual API key from geocode.maps.co
  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=YOUR_MAPSCO_KEY`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Throw a more descriptive error for better debugging
      throw new Error(`Geocoding service returned an error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      console.warn("No results found for geocoding query:", query);
      return { lat: null, lng: null };
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (err: any) {
    // Log the specific error and re-throw it for the calling function to handle
    console.error("GEOCODING_ERROR:", err.message);
    throw err;
  }
}
