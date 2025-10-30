'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-discussion.ts';
import '@/ai/flows/quick-placement-prep-start.ts';
import '@/ai/flows/ai-chatbot-assistance.ts';
