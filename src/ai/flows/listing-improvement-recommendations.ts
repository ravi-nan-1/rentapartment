'use server';

/**
 * @fileOverview Provides AI-powered recommendations to landlords on how to improve their apartment listings.
 *
 * - getListingImprovementRecommendations - A function that generates listing improvement recommendations.
 * - ListingImprovementRecommendationsInput - The input type for the getListingImprovementRecommendations function.
 * - ListingImprovementRecommendationsOutput - The return type for the getListingImprovementRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ListingImprovementRecommendationsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile information, including preferences and history.'),
  currentListing: z.string().describe('The current apartment listing details.'),
  similarListings: z
    .array(z.string())
    .describe('Details of similar apartment listings.'),
});
export type ListingImprovementRecommendationsInput = z.infer<
  typeof ListingImprovementRecommendationsInputSchema
>;

const ListingImprovementRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('AI-powered recommendations for improving the apartment listing.'),
});
export type ListingImprovementRecommendationsOutput = z.infer<
  typeof ListingImprovementRecommendationsOutputSchema
>;

export async function getListingImprovementRecommendations(
  input: ListingImprovementRecommendationsInput
): Promise<ListingImprovementRecommendationsOutput> {
  return listingImprovementRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'listingImprovementRecommendationsPrompt',
  input: {schema: ListingImprovementRecommendationsInputSchema},
  output: {schema: ListingImprovementRecommendationsOutputSchema},
  prompt: `You are an AI assistant helping landlords improve their apartment listings to attract more tenants.

  Analyze the following information and provide specific, actionable recommendations to improve the listing.

  User Profile: {{{userProfile}}}
  Current Listing: {{{currentListing}}}
  Similar Listings: {{#each similarListings}}\n- {{{this}}}{{/each}}\n
  Consider factors such as listing quality, pricing, amenities, and market trends.
  Focus on providing recommendations that are likely to increase inquiries and tenant interest.
  Format your response as a list of recommendations.
  `,
});

const listingImprovementRecommendationsFlow = ai.defineFlow(
  {
    name: 'listingImprovementRecommendationsFlow',
    inputSchema: ListingImprovementRecommendationsInputSchema,
    outputSchema: ListingImprovementRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
