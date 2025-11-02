
'use server';
import { config } from 'dotenv';
config();

// This file is used in development to register all our Genkit AI flows.
// It ensures that the AI capabilities are available for the application to use.
import '@/ai/flows/summarize-discussion.ts';
import '@/ai/flows/quick-placement-prep-start.ts';
import '@/ai/flows/ai-chatbot-assistance.ts';
