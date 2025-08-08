'use server';

import { getAnimalExpression } from '@/ai/flows/assign-animal-emoji';

export async function getExpressionForAnimal(photoDataUri: string) {
  if (!photoDataUri) {
    return { success: false, error: 'No photo data provided.' };
  }

  try {
    const result = await getAnimalExpression({ photoDataUri });
    return { success: true, expression: result.expression, emoji: result.emoji };
  } catch (e) {
    console.error(e);
    // A more user-friendly error message.
    return { success: false, error: 'Could not analyze the photo. Please try another one.' };
  }
}
