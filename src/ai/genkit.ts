
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This configures the Genkit AI instance with the Google AI plugin.
// It sets Gemini Flash as the default model for all AI operations.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
