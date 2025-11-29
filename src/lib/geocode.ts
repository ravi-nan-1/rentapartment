
export async function getLatLng(address: string, city: string): Promise<{ lat: number | null; lng: number | null; }> {
  // IMPORTANT: This key is public and is intended for demonstration purposes only.
  // In a production application, you should secure your API key by using a backend proxy.
  const API_KEY = "pk.d1d976412cb20ed99a2f8fd6aab67a2e";
  
  const query = `${address}, ${city}`;
  const url = `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("LocationIQ API request failed:", await res.text());
      return { lat: null, lng: null };
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      console.warn("LocationIQ returned no results for the query:", query);
      return { lat: null, lng: null };
    }

    // Find the first result that is in India to increase relevance.
    const resultInIndia = data.find((item: any) => item.display_name && item.display_name.includes("India"));
    
    const result = resultInIndia || data[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

  } catch (err) {
    console.error("An error occurred during geocoding:", err);
    return { lat: null, lng: null };
  }
}
