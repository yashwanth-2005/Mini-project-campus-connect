
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This file configures our connection to the AI.
// We're telling our app to use Google's AI services and to use the
// 'gemini-pro' model by default, which is a fast and powerful model.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro',
});

