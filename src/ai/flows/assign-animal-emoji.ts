'use server';

/**
 * @fileOverview Analyzes an animal's image to determine its expression.
 *
 * - getAnimalExpression - A function that handles the expression analysis process.
 * - GetAnimalExpressionInput - The input type for the getAnimalExpression function.
 * - GetAnimalExpressionOutput - The return type for the getAnimalExpression function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAnimalExpressionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an animal's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GetAnimalExpressionInput = z.infer<typeof GetAnimalExpressionInputSchema>;

const GetAnimalExpressionOutputSchema = z.object({
  expression: z.string().describe("A short, descriptive sentence about the animal's real expression or mood."),
});
export type GetAnimalExpressionOutput = z.infer<typeof GetAnimalExpressionOutputSchema>;

export async function getAnimalExpression(input: GetAnimalExpressionInput): Promise<GetAnimalExpressionOutput> {
  return getAnimalExpressionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAnimalExpressionPrompt',
  input: {schema: GetAnimalExpressionInputSchema},
  output: {schema: GetAnimalExpressionOutputSchema},
  prompt: `You are an AI that analyzes a picture of an animal. Your task is to:
1. Observe the animal's facial features, posture, and the context of the image.
2. Describe its real expression or mood in a short, single, descriptive sentence.

If a face is not clearly visible, make a best guess based on the animal's posture or the overall context of the image. Do not use emojis. Focus on a realistic interpretation.

Here is the animal's photo: {{media url=photoDataUri}}
`,
});

const getAnimalExpressionFlow = ai.defineFlow(
  {
    name: 'getAnimalExpressionFlow',
    inputSchema: GetAnimalExpressionInputSchema,
    outputSchema: GetAnimalExpressionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return an output.");
    }
    return {
      expression: output.expression,
    };
  }
);
