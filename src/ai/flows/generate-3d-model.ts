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
      "一张 2D 概念艺术图，格式为数据 URI，必须包含 MIME 类型并使用 Base64 编码。预期格式：'data:<mimetype>;base64,<encoded_data>'。"
    ),
  modelDescription: z.string().describe('要生成的 3D 模型的详细描述。'),
});
export type Generate3DModelInput = z.infer<typeof Generate3DModelInputSchema>;

const Generate3DModelOutputSchema = z.object({
  modelDataUri: z
    .string()
    .describe(
      '生成的 3D 模型，格式为数据 URI，必须包含 MIME 类型并使用 Base64 编码。预期格式：\'data:<mimetype>;base64,<encoded_data>\'。'
    ),
  textureDataUri: z
    .string()
    .describe(
      '生成的纹理，格式为数据 URI，必须包含 MIME 类型并使用 Base64 编码。预期格式：\'data:<mimetype>;base64,<encoded_data>\'。'
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
  prompt: `你是一位专业的 3D 建模师。根据提供的概念艺术图和描述生成一个 3D 模型和纹理。以数据 URI 的形式返回 3D 模型和纹理。

概念艺术图：{{media url=conceptArtDataUri}}
描述：{{{modelDescription}}}`,
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
    console.log('运行 generate3DModelFlow，输入为', input); // Translated log message
    const {output} = await prompt(input);
    return output!;
  }
);
