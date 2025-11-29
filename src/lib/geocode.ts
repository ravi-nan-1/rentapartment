
export async function getLatLng(address: string, city: string): Promise<{ lat: number | null; lng: number | null }> {
  const API_KEY = "YOUR_LOCATIONIQ_KEY";

  // Construct query without hardcoding "India" as it may interfere with results.
  const query = `${address}, ${city}`;

  const url = `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`LocationIQ API error (${res.status}):`, errorText);
      throw new Error(`Geocoding service returned status ${res.status}.`);
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      console.warn("No geocoding results found for query:", query);
      return { lat: null, lng: null };
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (err: any) {
    console.error("GEOCODE_ERROR:", err.message);
    // Pass the specific error message up to the caller
    throw new Error(`Geocoding failed: ${err.message}`);
  }
}
