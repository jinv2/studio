'use server';

/**
 * @fileOverview Flow to generate 3D models from 2D concept art.
 *
 * - generate3DModel - A function that handles the 3D model generation process.
 * - Generate3DModelInput - The input type for the generate3DModel function.
 * - Generate3DModelOutput - The return type for the generate3DModel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Generate3DModelInputSchema = z.object({
  conceptArtDataUri: z
    .string()
    .describe(
      "A 2D concept art image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  modelDescription: z.string().describe('Detailed description of the 3D model to generate.'),
});
export type Generate3DModelInput = z.infer<typeof Generate3DModelInputSchema>;

const Generate3DModelOutputSchema = z.object({
  modelDataUri: z
    .string()
    .describe(
      'The generated 3D model, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  textureDataUri: z
    .string()
    .describe(
      'The generated texture, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type Generate3DModelOutput = z.infer<typeof Generate3DModelOutputSchema>;

export async function generate3DModel(input: Generate3DModelInput): Promise<Generate3DModelOutput> {
  return generate3DModelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generate3DModelPrompt',
  input: {schema: Generate3DModelInputSchema},
  output: {schema: Generate3DModelOutputSchema},
  prompt: `You are an expert 3D modeler. Generate a 3D model and texture based on the provided concept art and description. Return the 3D model and the texture as data URIs.

Concept Art: {{media url=conceptArtDataUri}}
Description: {{{modelDescription}}}`,
});

const generate3DModelFlow = ai.defineFlow(
  {
    name: 'generate3DModelFlow',
    inputSchema: Generate3DModelInputSchema,
    outputSchema: Generate3DModelOutputSchema,
  },
  async input => {
    //In the future, we could call a 3D generation service here to create the model.
    //Since we can't do that yet, we'll just return a dummy value.
    console.log('Running generate3DModelFlow with input', input);
    const {output} = await prompt(input);
    return output!;
  }
);
