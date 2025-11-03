
'use server';

/**
 * @fileOverview This flow powers the AI chatbot, allowing it to answer
 * general and campus-specific questions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This defines the input for the chatbot, which is just the user's question.
const ChatWithBotInputSchema = z.object({
  query: z.string().describe('The user query or question.'),
});
export type ChatWithBotInput = z.infer<typeof ChatWithBotInputSchema>;

// This defines the output from the chatbot: a single answer string.
const ChatWithBotOutputSchema = z.object({
  answer: z.string().describe('The AI Chatbot response to the user query.'),
});
export type ChatWithBotOutput = z.infer<typeof ChatWithBotOutputSchema>;

// This is the main function our application calls to talk to the bot.
export async function chatWithBot(input: ChatWithBotInput): Promise<ChatWithBotOutput> {
  return chatWithBotFlow(input);
}

// This defines a "tool" the AI can use to find campus-specific information.
// This allows the AI to "look up" information it wasn't trained on.
const useCampusInfoTool = ai.defineTool({
  name: 'getCampusInformation',
  description: 'This tool retrieves information about campus resources, placements, and events.',
  inputSchema: z.object({
    query: z.string().describe('The specific information being requested.'),
  }),
  outputSchema: z.string(),
  async func(input) {
    // In a real app, this function would query our own database.
    return `Detailed campus information for query: ${input.query}`;
  },
});

// This sets up the instructions for the AI model.
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

// This "flow" ties everything together. It takes the input, sends it to the prompt, and returns the AI's output.
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
