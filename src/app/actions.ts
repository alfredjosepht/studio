'use server';

import { assignAnimalEmoji } from '@/ai/flows/assign-animal-emoji';

export async function getEmojiForAnimal(photoDataUri: string) {
  if (!photoDataUri) {
    return { success: false, error: 'No photo data provided.' };
  }

  try {
    const result = await assignAnimalEmoji({ photoDataUri });
    return { success: true, emoji: result.emoji, comment: result.comment };
  } catch (e) {
    console.error(e);
    // A more user-friendly error message.
    return { success: false, error: 'Could not analyze the photo. Please try another one.' };
  }
}
