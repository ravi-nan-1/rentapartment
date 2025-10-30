'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, Wand2 } from 'lucide-react';
import {
  getListingImprovementRecommendations,
  type ListingImprovementRecommendationsInput,
} from '@/ai/flows/listing-improvement-recommendations';
import type { Apartment } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';

interface AIAssistantProps {
  apartment: Apartment;
}

export default function AIAssistant({ apartment }: AIAssistantProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const firestore = useFirestore();
  const apartmentsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'apartments'));
  }, [firestore]);
  const { data: allListings } = useCollection(apartmentsQuery);


  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRecommendations([]);

    if (!allListings) {
        setError('Could not load other listings for comparison.');
        setLoading(false);
        return;
    }

    try {
      const input: ListingImprovementRecommendationsInput = {
        userProfile: 'Target audience: Young professionals and couples aged 25-35. They value modern amenities, proximity to public transport, and a vibrant neighborhood. High interest in listings with high-quality photos and clear, concise descriptions.',
        currentListing: `Title: ${apartment.title}. Price: $${apartment.price}. Description: ${apartment.description}. Amenities: ${apartment.amenities.join(', ')}.`,
        similarListings: allListings
          .filter(a => a.id !== apartment.id && Math.abs(a.price - apartment.price) < 500)
          .slice(0, 3)
          .map(a => `Title: ${a.title}. Price: $${a.price}. Amenities: ${a.amenities.join(', ')}`),
      };
      
      const result = await getListingImprovementRecommendations(input);
      setRecommendations(result.recommendations);

    } catch (e) {
      console.error(e);
      setError('Failed to get recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          AI Listing Analyzer
        </CardTitle>
        <CardDescription>Get AI-powered tips to make your listing more attractive to tenants.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGetRecommendations} disabled={loading} className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Analyze My Listing
        </Button>

        <div className="mt-6 space-y-4">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recommendations:</h4>
              <ul className="space-y-3 text-sm">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <p>{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!loading && recommendations.length === 0 && !error && (
             <div className="text-center text-sm text-muted-foreground pt-4">
                Click the button to get personalized improvement suggestions for this listing.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
