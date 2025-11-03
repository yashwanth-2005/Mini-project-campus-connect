
'use server';

/**
 * @fileOverview This flow generates a multiple-choice quiz for placement preparation
 * based on current technology trends.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for a single quiz question
const QuizQuestionSchema = z.object({
    question: z.string().describe("The aptitude or technical question."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options."),
});

// Schema for the entire quiz
const PlacementQuizSchema = z.object({
  title: z.string().describe("A creative title for the quiz."),
  questions: z.array(QuizQuestionSchema).length(5).describe("An array of 5 quiz questions."),
});

export type PlacementQuiz = z.infer<typeof PlacementQuizSchema>;

// This is the main function our app will call to get a new quiz.
export async function generatePlacementQuiz(): Promise<PlacementQuiz> {
  return generatePlacementQuizFlow();
}

// The prompt that instructs the AI model how to generate the quiz.
const placementQuizPrompt = ai.definePrompt({
  name: 'placementQuizPrompt',
  output: { schema: PlacementQuizSchema },
  prompt: `You are an expert quiz creator for university students preparing for software engineering placements.
  
  Your task is to generate a 5-question multiple-choice quiz. The questions should cover a mix of the following topics relevant to 2024 tech job interviews:
  1.  Data Structures & Algorithms (e.g., Big O notation, array manipulation, basic tree/graph concepts).
  2.  Aptitude & Logical Reasoning (e.g., pattern recognition, simple probability).
  3.  Basic knowledge of a popular programming language (e.g., Python, JavaScript, or Java).
  4.  Fundamentals of Web Development or Cloud Computing.

  For each question, provide 4 distinct options and clearly identify the correct answer. The difficulty should be at an entry-level/internship level. Ensure the questions are fresh and relevant to current trends.`,
});

// This "flow" ties everything together. It calls the prompt and returns the AI's output.
const generatePlacementQuizFlow = ai.defineFlow(
  {
    name: 'generatePlacementQuizFlow',
    outputSchema: PlacementQuizSchema,
  },
  async () => {
    const { output } = await placementQuizPrompt();
    if (!output) {
      throw new Error("AI failed to generate a quiz.");
    }
    return output;
  }
);

    