
'use server';
import { config } from 'dotenv';
config();

// This file is used in development to register all the Genkit flows.
// It ensures that flows are available for use in the application.
import '@/ai/flows/summarize-discussion.ts';
import '@/ai/flows/quick-placement-prep-start.ts';
import '@/ai/flows/ai-chatbot-assistance.ts';
