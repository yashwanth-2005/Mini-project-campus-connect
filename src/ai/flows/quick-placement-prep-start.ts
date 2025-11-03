
'use server';

/**
 * @fileOverview This flow generates a personalized study plan for students
 * based on their resume, transcript, and target companies.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This defines the input for the placement prep flow.
const PlacementPrepInputSchema = z.object({
  resume: z
    .string()
    .describe('The resume of the student as a string.'),
  transcript: z
    .string()
    .describe('The transcript of the student as a string.'),
  targetCompanies: z
    .string()
    .describe('A list of target companies for placement.'),
});
export type PlacementPrepInput = z.infer<typeof PlacementPrepInputSchema>;

// This defines the output we expect from the AI.
const PlacementPrepOutputSchema = z.object({
  studyPlan: z.string().describe('A tailored study plan for placement preparation.'),
  suggestedResources: z.string().describe('A list of suggested resources.'),
});
export type PlacementPrepOutput = z.infer<typeof PlacementPrepOutputSchema>;

// This is the main function our app will call to start the process.
export async function generatePlacementPrepPlan(input: PlacementPrepInput): Promise<PlacementPrepOutput> {
  return placementPrepFlow(input);
}

// This defines the instructions for the AI model.
const placementPrepPrompt = ai.definePrompt({
  name: 'placementPrepPrompt',
  input: {schema: PlacementPrepInputSchema},
  output: {schema: PlacementPrepOutputSchema},
  prompt: `You are an AI assistant that generates a tailored study plan and suggests relevant resources for placement preparation based on a student's resume, transcript, and target companies.

  Resume: {{{resume}}}
  Transcript: {{{transcript}}}
  Target Companies: {{{targetCompanies}}}

  Create a detailed study plan that covers technical skills, problem-solving, and interview prep.
  Also, suggest relevant resources like online courses, practice platforms, and books.

  Study Plan:
  Suggested Resources:`,
});

// This "flow" ties everything together.
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
