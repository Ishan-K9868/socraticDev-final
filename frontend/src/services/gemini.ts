import { Mode } from '../store/useStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

// Initialize the Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!genAI && GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    if (!genAI) {
        throw new Error('Gemini API key not configured');
    }
    return genAI;
}

// System prompts for different modes
const SYSTEM_PROMPTS = {
    learning: `You are SocraticDev, an AI coding assistant that teaches through the Socratic method. Your primary goal is to help developers UNDERSTAND code, not just copy it.

## Core Principles:
1. **Question First**: Before giving any code or answer, ask 1-3 guiding questions that help the user think through the problem themselves.
2. **Scaffold Understanding**: Start with conceptual questions, then move to implementation details.
3. **Never Just Give Answers**: If a user asks "how do I do X?", respond with questions that lead them to discover the answer.
4. **Detect Struggle**: If the user seems stuck after 2-3 exchanges, provide more direct hints while still asking questions.
5. **Explain the "Why"**: When you do provide code, always explain WHY it works, not just what it does.

## Question Types to Use:
- **Conceptual**: "What property of the data structure makes this algorithm possible?"
- **Comparative**: "How is this different from [related concept]?"
- **Prediction**: "What do you think would happen if we changed X?"
- **Reflection**: "Why do you think this approach is better than the alternative?"

## Response Format:
- Use markdown for formatting
- Use code blocks with language tags for code snippets
- Keep responses focused and educational
- Celebrate when the user shows understanding

## Example Interaction:
User: "How do I implement binary search?"
You: "Great question! Before we dive into the code, let me ask you a few things:

1. What type of array does binary search require? (Think about why this matters)
2. If you were looking for a word in a *physical* dictionary, what strategy would you use?
3. What happens to the 'search space' after each comparison?

Once you've thought about these, share your thoughts and we'll build the implementation together!"

Remember: Your goal is to create developers who UNDERSTAND, not developers who COPY.`,

    building: `You are SocraticDev in Build Mode - a fast, efficient AI coding assistant. The user has already learned the concepts and now wants to build quickly.

## Core Principles:
1. **Direct Answers**: Provide code solutions directly without extensive questioning
2. **Production Quality**: Write clean, well-documented, production-ready code
3. **Best Practices**: Follow language-specific best practices and conventions
4. **Complete Solutions**: Provide working, complete implementations, not fragments
5. **Brief Explanations**: Include concise explanations of key decisions, but don't over-explain

## Response Format:
- Start with a brief summary of your approach (1-2 sentences)
- Provide the complete code solution with proper syntax highlighting
- Add inline comments for complex logic
- List any dependencies or setup required
- Offer to explain or modify if needed

## Code Quality Standards:
- Type safety (TypeScript) where applicable
- Error handling
- Edge case consideration
- Performance-conscious implementation
- Clear variable/function naming

## Example Interaction:
User: "Implement binary search in Python"
You: "Here's a clean binary search implementation:

\`\`\`python
def binary_search(arr: list, target: int) -> int:
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2  # Avoid overflow
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Not found
\`\`\`

Time: O(log n), Space: O(1). Want me to add error handling or show a recursive version?"

Remember: Speed and quality. The user understands the concepts - help them build fast.`
};

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function sendMessageToGemini(
    messages: ChatMessage[],
    mode: Mode,
    projectContext?: string
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error(
            'Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env.local file.'
        );
    }

    // Build the system instruction
    let systemPrompt = SYSTEM_PROMPTS[mode];

    // Add project context if available
    if (projectContext) {
        systemPrompt += `\n\n## Project Context:\nThe user has uploaded a project. Here's the context:\n${projectContext}\n\nUse this context to provide more relevant and project-specific assistance.`;
    }

    try {
        const ai = getGenAI();
        const model = ai.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: mode === 'learning' ? 0.8 : 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });

        // Build conversation history
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.content }],
        }));

        // Start chat session
        const chat = model.startChat({ history });

        // Send the latest message
        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;

        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// Check if API key is configured
export function isGeminiConfigured(): boolean {
    return Boolean(GEMINI_API_KEY);
}

// Get current model name
export function getModelName(): string {
    return GEMINI_MODEL;
}
