
'use server';

/**
 * @fileOverview A Genkit flow to automatically identify and select celebrity faces for populating the game grid.
 *
 * - populateCelebrityGrid - A function that handles the celebrity grid population process.
 * - PopulateCelebrityGridInput - The input type for the populateCelebrityGrid function.
 * - PopulateCelebrityGridOutput - The return type for the populateCelebrityGrid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PopulateCelebrityGridInputSchema = z.object({
  topic: z
    .string()
    .describe("The topic or theme for selecting celebrities, e.g., 'Hollywood actors', 'Pop musicians'."),
  gridSize: z.number().describe('The number of celebrities to include in the grid.'),
});
export type PopulateCelebrityGridInput = z.infer<typeof PopulateCelebrityGridInputSchema>;

const PopulateCelebrityGridOutputSchema = z.object({
  celebrityFaces: z.array(
    z.object({
      name: z.string().describe('The name of the celebrity.'),
      imageUrl: z.string().url().describe('The URL of the celebrity face image.'),
    })
  ).describe('An array of celebrity faces with names and image URLs.'),
});
export type PopulateCelebrityGridOutput = z.infer<typeof PopulateCelebrityGridOutputSchema>;

export async function populateCelebrityGrid(input: PopulateCelebrityGridInput): Promise<PopulateCelebrityGridOutput> {
  return populateCelebrityGridFlow(input);
}

const prompt = ai.definePrompt({
  name: 'populateCelebrityGridPrompt',
  input: {schema: PopulateCelebrityGridInputSchema},
  output: {schema: PopulateCelebrityGridOutputSchema},
  prompt: `You are a tool that provides a list of celebrity faces for a game.

  Based on the topic: "{{topic}}", generate a list of {{gridSize}} celebrities. For each celebrity, include their name and a direct URL to a publicly available face image. Use reliable image sources like Wikipedia, Wikimedia Commons, or official social media.

  Ensure that the celebrities are well-known and have readily available face images online. Focus on diversity and relevance to the specified topic.

  Output the celebrity faces in JSON format.
  {
    "celebrityFaces": [
      {
        "name": "Celebrity Name",
        "imageUrl": "URL to Celebrity Face Image"
      }
    ]
  }`,
});

const populateCelebrityGridFlow = ai.defineFlow(
  {
    name: 'populateCelebrityGridFlow',
    inputSchema: PopulateCelebrityGridInputSchema,
    outputSchema: PopulateCelebrityGridOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
