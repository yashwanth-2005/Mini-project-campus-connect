'use server';

// This flow generates a personalized study plan based on student documents.
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlacementPrepInputSchema = z.object({
  resume: z
    .string()
    .describe('The resume of the student as a string.'),
  transcript: z
    .string()
    .describe('The transcript of the student as a string.'),
  targetCompanies: z
    .string()
    .describe('The list of target companies for placement.'),
});
export type PlacementPrepInput = z.infer<typeof PlacementPrepInputSchema>;

const PlacementPrepOutputSchema = z.object({
  studyPlan: z.string().describe('A tailored study plan for placement preparation.'),
  suggestedResources: z.string().describe('A list of suggested resources for placement preparation.'),
});
export type PlacementPrepOutput = z.infer<typeof PlacementPrepOutputSchema>;

export async function generatePlacementPrepPlan(input: PlacementPrepInput): Promise<PlacementPrepOutput> {
  return placementPrepFlow(input);
}

const placementPrepPrompt = ai.definePrompt({
  name: 'placementPrepPrompt',
  input: {schema: PlacementPrepInputSchema},
  output: {schema: PlacementPrepOutputSchema},
  prompt: `You are an AI assistant that generates a tailored study plan and suggests relevant resources for placement preparation based on the student's resume, transcript, and target companies.

  Resume: {{{resume}}}
  Transcript: {{{transcript}}}
  Target Companies: {{{targetCompanies}}}

  Create a detailed study plan that covers technical skills, problem-solving abilities, and interview preparation.
  Also, suggest relevant resources such as online courses, practice platforms, and books.

  Study Plan:
  Suggested Resources:`,
});

const placementPrepFlow = ai.defineFlow(
  {
    name: 'placementPrepFlow',
    inputSchema: PlacementPrepInputSchema,
    outputSchema: PlacementPrepOutputSchema,
  },
  async input => {
    const {output} = await placementPrepPrompt(input);
    return output!;
  }
);
