
export async function getLatLng(address: string, city: string): Promise<{ lat: number | null; lng: number | null }> {
  const API_KEY = "YOUR_LOCATIONIQ_KEY";

  const query = `${address}, ${city}, India`;

  const url = `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("LocationIQ error:", await res.text());
      return { lat: null, lng: null };
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      console.warn("No results:", data);
      return { lat: null, lng: null };
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (err) {
    console.error("GEOCODE ERROR:", err);
    return { lat: null, lng: null };
  }
}
