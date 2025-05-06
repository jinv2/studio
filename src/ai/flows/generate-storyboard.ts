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
    .describe('用于生成故事板的脚本大纲。'),
});
export type GenerateStoryboardInput = z.infer<typeof GenerateStoryboardInputSchema>;

const GenerateStoryboardOutputSchema = z.object({
  storyboard: z.array(
    z.object({
      sceneDescription: z.string().describe('场景描述。'),
      cameraAngle: z.string().describe('建议的场景摄像机角度。'),
      sceneLayout: z.string().describe('建议的场景布局。'),
    })
  ).describe('生成的故事板。'),
});
export type GenerateStoryboardOutput = z.infer<typeof GenerateStoryboardOutputSchema>;

export async function generateStoryboard(input: GenerateStoryboardInput): Promise<GenerateStoryboardOutput> {
  return generateStoryboardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryboardPrompt',
  input: {schema: GenerateStoryboardInputSchema},
  output: {schema: GenerateStoryboardOutputSchema},
  prompt: `你是一位专业的故事板艺术家。根据提供的脚本大纲，为每个场景生成一个包含建议摄像机角度和场景布局的故事板。

脚本大纲:
{{scriptOutline}}

故事板:
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
