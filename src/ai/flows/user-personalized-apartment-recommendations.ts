'use server';
/**
 * @fileOverview Provides AI-powered apartment listing recommendations based on user profiles and preferences.
 *
 * - getUserPersonalizedApartmentRecommendations - A function that generates personalized apartment recommendations for a user.
 * - UserProfile - The input type for the getUserPersonalizedApartmentRecommendations function, representing a user's profile.
 * - ApartmentListing - The output type for the getUserPersonalizedApartmentRecommendations function, representing an apartment listing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserProfileSchema = z.object({
  userId: z.string().describe('The unique identifier of the user.'),
  locationPreferences: z.array(z.string()).describe('The preferred locations for apartments.'),
  priceRange: z.object({
    min: z.number().describe('The minimum acceptable price.'),
    max: z.number().describe('The maximum acceptable price.'),
  }).describe('The acceptable price range for apartments.'),
  desiredAmenities: z.array(z.string()).describe('The desired amenities in an apartment.'),
  profileDescription: z.string().describe('A comprehensive description of the apartment desired by the user.')
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

const ApartmentListingSchema = z.object({
  listingId: z.string().describe('The unique identifier of the apartment listing.'),
  location: z.string().describe('The location of the apartment.'),
  price: z.number().describe('The price of the apartment.'),
  amenities: z.array(z.string()).describe('The amenities offered by the apartment.'),
  photoDataUri: z.string()
    .describe(
      "A photo of the apartment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  listingDescription: z.string().describe('A description of the apartment listing'),
});
export type ApartmentListing = z.infer<typeof ApartmentListingSchema>;

const ApartmentRecommendationsOutputSchema = z.array(ApartmentListingSchema);
export type ApartmentRecommendationsOutput = z.infer<typeof ApartmentRecommendationsOutputSchema>;

export async function getUserPersonalizedApartmentRecommendations(userProfile: UserProfile): Promise<ApartmentRecommendationsOutput> {
  return userPersonalizedApartmentRecommendationsFlow(userProfile);
}

const prompt = ai.definePrompt({
  name: 'userPersonalizedApartmentRecommendationsPrompt',
  input: {schema: UserProfileSchema},
  output: {schema: ApartmentRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized apartment listing recommendations to users based on their profile and preferences. Analyze the user's profile and preferences to generate a list of apartment listings that best match their needs.

User Profile:
{{profileDescription}}

Location Preferences: {{locationPreferences}}
Price Range: Min: {{{priceRange.min}}}, Max: {{{priceRange.max}}}
Desired Amenities: {{desiredAmenities}}

Consider the following apartment listings:

Return a JSON array of apartments that match the user's profile, ordered by relevance. Include a photo of the apartment with each listing. List the photo as a media part.
`,
});

const userPersonalizedApartmentRecommendationsFlow = ai.defineFlow(
  {
    name: 'userPersonalizedApartmentRecommendationsFlow',
    inputSchema: UserProfileSchema,
    outputSchema: ApartmentRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
