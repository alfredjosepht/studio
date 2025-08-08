'use server';

/**
 * @fileOverview Assigns an emoji to an animal's image based on its facial expression.
 *
 * - assignAnimalEmoji - A function that handles the emoji assignment process.
 * - AssignAnimalEmojiInput - The input type for the assignAnimalEmoji function.
 * - AssignAnimalEmojiOutput - The return type for the assignAnimalEmoji function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignAnimalEmojiInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an animal's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type AssignAnimalEmojiInput = z.infer<typeof AssignAnimalEmojiInputSchema>;

const AssignAnimalEmojiOutputSchema = z.object({
  emoji: z.string().describe("The emoji representing the animal's expression or mood."),
  comment: z.string().describe("A short, fun comment about the animal's expression or mood."),
});
export type AssignAnimalEmojiOutput = z.infer<typeof AssignAnimalEmojiOutputSchema>;

export async function assignAnimalEmoji(input: AssignAnimalEmojiInput): Promise<AssignAnimalEmojiOutput> {
  return assignAnimalEmojiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assignAnimalEmojiPrompt',
  input: {schema: AssignAnimalEmojiInputSchema},
  output: {schema: AssignAnimalEmojiOutputSchema},
  prompt: `You are an AI that analyzes a picture of an animal. Your task is to:
1. Return an emoji that best represents its expression or general mood.
2. Provide a short, fun, single-sentence comment explaining the emoji choice.

If a face is not clearly visible, make a best guess based on the animal's posture or the overall context of the image.

Here is the animal's photo: {{media url=photoDataUri}}
`,
});

const assignAnimalEmojiFlow = ai.defineFlow(
  {
    name: 'assignAnimalEmojiFlow',
    inputSchema: AssignAnimalEmojiInputSchema,
    outputSchema: AssignAnimalEmojiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return an output.");
    }
    return {
      emoji: output.emoji,
      comment: output.comment,
    };
  }
);
