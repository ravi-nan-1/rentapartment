
export async function getLatLng(address: string, city: string): Promise<{ lat: number | null; lng: number | null }> {
  const query = `${address}, ${city}`;
  // NOTE: Replace YOUR_MAPSCO_KEY with your actual API key from geocode.maps.co
  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=YOUR_MAPSCO_KEY`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding service returned an error");

    const data = await res.json();
    if (!data || data.length === 0) {
      console.warn("No results found for geocoding query:", query);
      return { lat: null, lng: null };
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (err) {
    console.error("GEOCODING_ERROR:", err);
    return { lat: null, lng: null };
  }
}
