
'use server';

/**
 * @fileOverview This flow takes a long piece of text and returns a concise summary.
 * It is powered by a Genkit prompt that uses the Gemini model.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This is the input for our summarizer. It just expects a single piece of text.
const SummarizeDiscussionInputSchema = z.object({
  discussionText: z
    .string()
    .describe('The complete text of the discussion to summarize.'),
});
export type SummarizeDiscussionInput = z.infer<typeof SummarizeDiscussionInputSchema>;

// This is the output we expect from the AI: a single string containing the summary.
const SummarizeDiscussionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the discussion thread.'),
});
export type SummarizeDiscussionOutput = z.infer<typeof SummarizeDiscussionOutputSchema>;

// This is the main function that our app will call to start the summarization.
export async function summarizeDiscussion(input: SummarizeDiscussionInput): Promise<SummarizeDiscussionOutput> {
  return summarizeDiscussionFlow(input);
}

// Here we define the instructions for the AI model.
const prompt = ai.definePrompt({
  name: 'summarizeDiscussionPrompt',
  input: {schema: SummarizeDiscussionInputSchema},
  output: {schema: SummarizeDiscussionOutputSchema},
  prompt: `You are an expert at summarizing long discussions into key takeaways.

  Please provide a concise summary of the following discussion:

  {{{discussionText}}}`,
});

// This "flow" ties everything together. It takes the input, sends it to the prompt, and returns the AI's output.
const summarizeDiscussionFlow = ai.defineFlow(
  {
    name: 'summarizeDiscussionFlow',
    inputSchema: SummarizeDiscussionInputSchema,
    outputSchema: SummarizeDiscussionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
