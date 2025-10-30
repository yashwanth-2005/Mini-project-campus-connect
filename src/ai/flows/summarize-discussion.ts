
'use server';

/**
 * This flow takes a long piece of text and returns a concise summary.
 * It is powered by a Genkit prompt.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Defines the input schema for the summarization flow.
const SummarizeDiscussionInputSchema = z.object({
  discussionText: z
    .string()
    .describe('The complete text of the discussion to summarize.'),
});
export type SummarizeDiscussionInput = z.infer<typeof SummarizeDiscussionInputSchema>;

// Defines the output schema for the summarization flow.
const SummarizeDiscussionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the discussion thread.'),
});
export type SummarizeDiscussionOutput = z.infer<typeof SummarizeDiscussionOutputSchema>;

// The main function that clients will call to trigger the flow.
export async function summarizeDiscussion(input: SummarizeDiscussionInput): Promise<SummarizeDiscussionOutput> {
  return summarizeDiscussionFlow(input);
}

// Defines the prompt for the AI model.
const prompt = ai.definePrompt({
  name: 'summarizeDiscussionPrompt',
  input: {schema: SummarizeDiscussionInputSchema},
  output: {schema: SummarizeDiscussionOutputSchema},
  prompt: `You are an expert at summarizing long discussions into key takeaways.

  Please provide a concise summary of the following discussion:

  {{{discussionText}}}`,
});

// Defines the Genkit flow that orchestrates the summarization.
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
