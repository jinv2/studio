// This is an AI-powered application that generates storyboards from script outlines.
// It suggests camera angles and scene layouts to help directors visualize the film's structure.
// - generateStoryboard - A function that generates a storyboard based on a script outline.
// - GenerateStoryboardInput - The input type for the generateStoryboard function.
// - GenerateStoryboardOutput - The return type for the generateStoryboard function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryboardInputSchema = z.object({
  scriptOutline: z
    .string()
    .describe('The script outline to generate the storyboard from.'),
});
export type GenerateStoryboardInput = z.infer<typeof GenerateStoryboardInputSchema>;

const GenerateStoryboardOutputSchema = z.object({
  storyboard: z.array(
    z.object({
      sceneDescription: z.string().describe('Description of the scene.'),
      cameraAngle: z.string().describe('Suggested camera angle for the scene.'),
      sceneLayout: z.string().describe('Suggested scene layout.'),
    })
  ).describe('The generated storyboard.'),
});
export type GenerateStoryboardOutput = z.infer<typeof GenerateStoryboardOutputSchema>;

export async function generateStoryboard(input: GenerateStoryboardInput): Promise<GenerateStoryboardOutput> {
  return generateStoryboardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryboardPrompt',
  input: {schema: GenerateStoryboardInputSchema},
  output: {schema: GenerateStoryboardOutputSchema},
  prompt: `You are a professional storyboard artist. Based on the provided script outline, generate a storyboard with suggested camera angles and scene layouts for each scene.

Script Outline:
{{scriptOutline}}

Storyboard:
`,
});

const generateStoryboardFlow = ai.defineFlow(
  {
    name: 'generateStoryboardFlow',
    inputSchema: GenerateStoryboardInputSchema,
    outputSchema: GenerateStoryboardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
