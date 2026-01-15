import { useCallback, useState } from 'react';
import { sendMessageToGemini } from '../../services/gemini';
import {
    ParsonsChallenge,
    SurgeryChallenge,
    ELI5Challenge,
    FadedChallenge,
    MentalChallenge,
    CodeLine,
    Bug,
    Blank,
    TraceStep
} from './types';

// Generate a unique ID
const generateId = () => crypto.randomUUID().slice(0, 8);

// AI prompts for generating challenges
const CHALLENGE_PROMPTS = {
    parsons: (topic: string, language: string) => `
Generate a Parsons Problem for teaching "${topic}" in ${language}.

Requirements:
1. Write a correct solution (5-8 lines of code)
2. Create 2-3 distractor lines (subtly wrong code that looks correct)
3. The distractor should have realistic bugs (wrong operator, off-by-one, etc.)

Return ONLY valid JSON in this exact format:
{
  "title": "Challenge title",
  "description": "One sentence problem description",
  "solution": ["line1", "line2", "line3"],
  "distractors": ["wrong line 1", "wrong line 2"],
  "hints": ["Hint 1", "Hint 2"]
}`,

    surgery: (topic: string, language: string) => `
Generate a Code Surgery challenge for "${topic}" in ${language}.

CRITICAL RULES - READ CAREFULLY:
1. Write a function (10-15 lines) with EXACTLY 2-3 bugs
2. Every bug MUST be a REAL BUG that causes INCORRECT BEHAVIOR, not:
   - Style preferences (e.g., empty() vs size() == 0)
   - Valid language syntax that looks unusual
   - Best practices that don't affect correctness
   - Idiomatic alternatives
   
3. VALID BUG TYPES (use only these):
   - Off-by-one errors in loops (< vs <=, wrong start/end index)
   - Wrong comparison operators (> vs >=, == vs !=)
   - Wrong arithmetic operators (+ vs -, * vs /)
   - Missing null/undefined checks that will cause crashes
   - Incorrect return values (returning wrong variable)
   - Logic errors in conditionals (AND vs OR, inverted conditions)
   - Array/string index out of bounds access
   - Infinite loops from wrong increment/condition
   - Type coercion bugs that produce wrong results

4. NEVER flag these as bugs:
   - for (char c : string) - this is VALID C++ range-based for loop
   - size() == 0 vs empty() - both are correct
   - Different but valid syntax choices
   - Code that works correctly but could be "cleaner"

5. Each bug line number must EXACTLY match a line with an actual error
6. The buggy code must COMPILE without syntax errors
7. The correct code must fix ONLY the bugs, not change valid code

IMPORTANT: Return code as an ARRAY of lines (one string per line) to avoid JSON escaping issues.

Return ONLY valid JSON:
{
  "title": "Challenge title",
  "description": "Function purpose",
  "buggyCodeLines": ["line1", "line2", "line3"],
  "correctCodeLines": ["line1", "line2", "line3"],
  "bugs": [
    {"lineNumber": 5, "bugType": "logic", "description": "What's wrong - must cause incorrect behavior", "hint": "Hint", "fix": "The fix"}
  ]
}`,

    eli5: (topic: string, language: string) => `
Generate an ELI5 challenge for "${topic}" in ${language}.

Requirements:
1. Provide a code snippet (5-10 lines) that demonstrates the concept
2. List 3-5 key points the user should explain
3. List 8-10 jargon words they should NOT use

Return ONLY valid JSON:
{
  "title": "Explain: ${topic}",
  "description": "Explain this code like you're talking to a 5-year-old",
  "code": "the code snippet",
  "keyPoints": ["point 1", "point 2"],
  "forbiddenWords": ["recursion", "algorithm", "function"]
}`,

    faded: (topic: string, language: string) => `
Generate a Fill-in-the-Blanks challenge for "${topic}" in ${language}.

Requirements:
1. Write complete code (8-12 lines)
2. Create a template with 4-6 blanks (marked as ___)
3. Blanks should be at key logical points (conditions, function names, operators)

Return ONLY valid JSON:
{
  "title": "Complete the code",
  "description": "Fill in the blanks to complete the ${topic} implementation",
  "fullCode": "complete working code",
  "template": "code with ___ for blanks",
  "blanks": [
    {"id": "1", "position": 45, "answer": "true", "hint": "boolean value", "length": 4}
  ]
}`,

    mental: (topic: string, language: string) => `
Generate a Mental Compiler challenge for "${topic}" in ${language}.

Requirements:
1. Write code (5-8 lines) with non-obvious output
2. Include loops, conditionals, or tricky logic
3. Provide step-by-step trace

Return ONLY valid JSON:
{
  "title": "What's the output?",
  "description": "Trace through this code mentally",
  "code": "the code",
  "expectedOutput": "the correct output",
  "wrongOptions": ["plausible wrong 1", "plausible wrong 2", "plausible wrong 3"],
  "traceSteps": [
    {"line": 1, "variables": {"x": "0"}, "explanation": "Initialize x"}
  ]
}`
};

// Fallback sample challenges when AI generation fails
const SAMPLE_SURGERY_CHALLENGES = [
    {
        title: "Array Chunk Splitter",
        description: "Split an array into chunks of a specified size",
        buggyCode: `function chunkArray(arr, chunkSize) {
  const result = [];
  for (let i = 0; i <= arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}`,
        correctCode: `function chunkArray(arr, chunkSize) {
  if (chunkSize <= 0) return [];
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}`,
        bugs: [
            { lineNumber: 3, bugType: "logic", description: "Off-by-one error: uses <= instead of <, causing extra empty chunk", hint: "Check the loop condition carefully", fix: "Change <= to <" },
            { lineNumber: 1, bugType: "missing check", description: "No validation for invalid chunkSize", hint: "What if chunkSize is 0 or negative?", fix: "Add: if (chunkSize <= 0) return [];" }
        ]
    },
    {
        title: "Find Maximum in Array",
        description: "Find the maximum value in an array of numbers",
        buggyCode: `function findMax(numbers) {
  let max = 0;
  for (let i = 0; i <= numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}`,
        correctCode: `function findMax(numbers) {
  if (numbers.length === 0) return undefined;
  let max = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}`,
        bugs: [
            { lineNumber: 2, bugType: "logic", description: "Initializing max to 0 fails for arrays with all negative numbers", hint: "What if all numbers are negative?", fix: "Initialize max to numbers[0]" },
            { lineNumber: 3, bugType: "off-by-one", description: "Loop goes past array bounds with <=", hint: "Check the loop termination condition", fix: "Change <= to <" }
        ]
    },
    {
        title: "String Reverser",
        description: "Reverse a string without using built-in reverse method",
        buggyCode: `function reverseString(str) {
  let reversed = "";
  for (let i = str.length; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
        correctCode: `function reverseString(str) {
  let reversed = "";
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
        bugs: [
            { lineNumber: 3, bugType: "off-by-one", description: "Starting at str.length instead of str.length - 1 causes undefined to be added", hint: "String indices are 0-based", fix: "Start loop at str.length - 1" }
        ]
    }
];

export function useChallengeAI() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateParsonsChallenge = useCallback(async (
        topic: string,
        language: string = 'python'
    ): Promise<ParsonsChallenge | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const prompt = CHALLENGE_PROMPTS.parsons(topic, language);
            const response = await sendMessageToGemini(
                [{ role: 'user', content: prompt }],
                'building'
            );

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            const data = JSON.parse(jsonMatch[0]);

            // Build CodeLine array with shuffled lines
            const solutionLines: CodeLine[] = data.solution.map((content: string, idx: number) => ({
                id: generateId(),
                content,
                isDistractor: false,
                correctPosition: idx
            }));

            const distractorLines: CodeLine[] = data.distractors.map((content: string) => ({
                id: generateId(),
                content,
                isDistractor: true
            }));

            // Shuffle all lines
            const allLines = [...solutionLines, ...distractorLines]
                .sort(() => Math.random() - 0.5);

            return {
                id: generateId(),
                type: 'parsons',
                title: data.title,
                description: data.description,
                difficulty: 'intermediate',
                topic,
                language,
                points: 100,
                lines: allLines,
                solution: data.solution,
                hints: data.hints || []
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate challenge');
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateSurgeryChallenge = useCallback(async (
        topic: string,
        language: string = 'javascript'
    ): Promise<SurgeryChallenge | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const prompt = CHALLENGE_PROMPTS.surgery(topic, language);
            const response = await sendMessageToGemini(
                [{ role: 'user', content: prompt }],
                'building'
            );

            // Extract JSON with multiple fallback patterns
            let jsonStr = response;

            // Try to find JSON block
            const jsonMatch = response.match(/```json\s*([\s\S]*?)```/) ||
                response.match(/```\s*([\s\S]*?)```/) ||
                response.match(/(\{[\s\S]*\})/);

            if (jsonMatch) {
                jsonStr = jsonMatch[1] || jsonMatch[0];
            }

            // Clean up the JSON string
            jsonStr = jsonStr.trim();
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/^```\w*\n?/, '').replace(/```$/, '');
            }

            const data = JSON.parse(jsonStr);

            // Convert array of lines to single string if needed
            const buggyCode = Array.isArray(data.buggyCodeLines)
                ? data.buggyCodeLines.join('\n')
                : (data.buggyCode || '');
            const correctCode = Array.isArray(data.correctCodeLines)
                ? data.correctCodeLines.join('\n')
                : (data.correctCode || '');

            const bugs: Bug[] = data.bugs.map((b: Bug) => ({
                lineNumber: b.lineNumber,
                bugType: b.bugType || 'logic',
                description: b.description,
                hint: b.hint,
                fix: b.fix
            }));

            return {
                id: generateId(),
                type: 'surgery',
                title: data.title,
                description: data.description,
                difficulty: 'intermediate',
                topic,
                language,
                points: 150,
                buggyCode,
                bugs,
                correctCode
            };
        } catch (err) {
            console.error('Surgery challenge parse error:', err);
            // Use fallback sample challenge
            const sample = SAMPLE_SURGERY_CHALLENGES[Math.floor(Math.random() * SAMPLE_SURGERY_CHALLENGES.length)];
            return {
                id: generateId(),
                type: 'surgery',
                title: sample.title,
                description: sample.description,
                difficulty: 'intermediate',
                topic,
                language,
                points: 150,
                buggyCode: sample.buggyCode,
                bugs: sample.bugs as Bug[],
                correctCode: sample.correctCode
            };
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateELI5Challenge = useCallback(async (
        topic: string,
        language: string = 'python'
    ): Promise<ELI5Challenge | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const prompt = CHALLENGE_PROMPTS.eli5(topic, language);
            const response = await sendMessageToGemini(
                [{ role: 'user', content: prompt }],
                'building'
            );

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            const data = JSON.parse(jsonMatch[0]);

            return {
                id: generateId(),
                type: 'eli5',
                title: data.title,
                description: data.description,
                difficulty: 'beginner',
                topic,
                language,
                points: 75,
                code: data.code,
                keyPoints: data.keyPoints,
                forbiddenWords: data.forbiddenWords,
                targetGradeLevel: 5
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate challenge');
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateFadedChallenge = useCallback(async (
        topic: string,
        language: string = 'python'
    ): Promise<FadedChallenge | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const prompt = CHALLENGE_PROMPTS.faded(topic, language);
            const response = await sendMessageToGemini(
                [{ role: 'user', content: prompt }],
                'building'
            );

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            const data = JSON.parse(jsonMatch[0]);

            const blanks: Blank[] = data.blanks.map((b: Blank) => ({
                id: b.id || generateId(),
                position: b.position,
                answer: b.answer,
                hint: b.hint,
                length: b.length || b.answer.length
            }));

            return {
                id: generateId(),
                type: 'faded',
                title: data.title,
                description: data.description,
                difficulty: 'beginner',
                topic,
                language,
                points: 50,
                template: data.template,
                blanks,
                fullCode: data.fullCode
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate challenge');
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateMentalChallenge = useCallback(async (
        topic: string,
        language: string = 'python'
    ): Promise<MentalChallenge | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const prompt = CHALLENGE_PROMPTS.mental(topic, language);
            const response = await sendMessageToGemini(
                [{ role: 'user', content: prompt }],
                'building'
            );

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            const data = JSON.parse(jsonMatch[0]);

            const traceSteps: TraceStep[] = data.traceSteps.map((s: TraceStep) => ({
                line: s.line,
                variables: s.variables,
                output: s.output,
                explanation: s.explanation
            }));

            return {
                id: generateId(),
                type: 'mental',
                title: data.title,
                description: data.description,
                difficulty: 'intermediate',
                topic,
                language,
                points: 100,
                code: data.code,
                expectedOutput: data.expectedOutput,
                wrongOptions: data.wrongOptions,
                traceSteps
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate challenge');
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        isGenerating,
        error,
        generateParsonsChallenge,
        generateSurgeryChallenge,
        generateELI5Challenge,
        generateFadedChallenge,
        generateMentalChallenge
    };
}
