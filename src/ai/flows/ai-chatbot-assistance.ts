
'use server';

/**
 * @fileOverview This flow powers the AI chatbot, allowing it to answer
 * general and campus-specific questions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Defines the expected input for the chatbot.
const ChatWithBotInputSchema = z.object({
  query: z.string().describe('The user query or question.'),
});
export type ChatWithBotInput = z.infer<typeof ChatWithBotInputSchema>;

// Defines the expected output for the chatbot.
const ChatWithBotOutputSchema = z.object({
  answer: z.string().describe('The AI Chatbot response to the user query.'),
});
export type ChatWithBotOutput = z.infer<typeof ChatWithBotOutputSchema>;

// The main function that clients will call to trigger the flow.
export async function chatWithBot(input: ChatWithBotInput): Promise<ChatWithBotOutput> {
  return chatWithBotFlow(input);
}

// Defines a tool the AI can use for campus-specific questions.
// This allows the AI to "look up" information it doesn't already know.
const useCampusInfoTool = ai.defineTool({
  name: 'getCampusInformation',
  description: 'This tool retrieves information about campus resources, placements, and events.',
  inputSchema: z.object({
    query: z.string().describe('The specific information being requested.'),
  }),
  outputSchema: z.string(),
  async func(input) {
    // In a real app, this could query a database or call a dedicated API.
    return `Detailed campus information for query: ${input.query}`;
  },
});

// Defines the prompt and instructions for the AI model.
const prompt = ai.definePrompt({
  name: 'chatWithBotPrompt',
  input: {schema: ChatWithBotInputSchema},
  output: {schema: ChatWithBotOutputSchema},
  tools: [useCampusInfoTool],
  system: `You are a helpful AI assistant for university students.
  Your goal is to answer questions accurately and concisely.
  If the question is campus-related (e.g., about resources, placements, events), use the getCampusInformation tool.
  Otherwise, respond using your general knowledge.
  `,
  prompt: `User query: {{{query}}}`,
});

// Defines the Genkit flow that orchestrates the chat logic.
const chatWithBotFlow = ai.defineFlow(
  {
    name: 'chatWithBotFlow',
    inputSchema: ChatWithBotInputSchema,
    outputSchema: ChatWithBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
