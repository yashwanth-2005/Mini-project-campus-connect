
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This file configures our connection to the AI.
// We're telling our app to use Google's AI services and to use the
// 'gemini-2.5-flash' model by default, which is a fast and powerful model.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
