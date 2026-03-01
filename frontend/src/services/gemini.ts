import { Mode } from '../store/useStore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BedrockRuntimeClient, ConverseCommand, Message as BedrockMessage } from '@aws-sdk/client-bedrock-runtime';
import {
    CardGenerationRequest,
    CardGenerationResult,
    GeneratedCardCandidate,
} from '../features/srs/types';
import { generateFallbackFlashcards } from '../features/srs/aiCardFallback';

// Config
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'gemini';

// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

// AWS Bedrock configuration
const AWS_REGION = import.meta.env.VITE_AWS_REGION || '';
const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '';
const BEDROCK_MODEL = import.meta.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

// Initialize clients
let genAI: GoogleGenerativeAI | null = null;
let bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient {
    if (!bedrockClient && AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
        bedrockClient = new BedrockRuntimeClient({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            }
        });
    }
    if (!bedrockClient) {
        throw new Error('AWS Bedrock credentials not fully configured');
    }
    return bedrockClient;
}

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

const TAG_STOPWORDS = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you', 'are', 'how', 'what',
    'when', 'where', 'why', 'which', 'will', 'would', 'could', 'should', 'can', 'does', 'did', 'have',
    'has', 'had', 'not', 'but', 'use', 'using', 'about', 'through', 'their', 'there', 'them', 'then',
    'than', 'also', 'only', 'more', 'most', 'some', 'many', 'each', 'other', 'very', 'code', 'card',
    'cards', 'question', 'answer', 'example', 'examples',
]);

function extractJsonPayload(text: string): unknown {
    const fenced = text.match(/```json\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1] : text;
    const trimmed = candidate.trim();
    try {
        return JSON.parse(trimmed);
    } catch {
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return JSON.parse(trimmed.slice(start, end + 1));
        }
        throw new Error('Failed to parse generated JSON payload');
    }
}

function normalizeGeneratedCards(payload: unknown, count: number): GeneratedCardCandidate[] {
    const rawCards = Array.isArray((payload as { cards?: unknown[] })?.cards)
        ? (payload as { cards: unknown[] }).cards
        : [];

    const cleaned = rawCards
        .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const obj = item as Record<string, unknown>;
            const front = typeof obj.front === 'string' ? obj.front.trim() : '';
            const back = typeof obj.back === 'string' ? obj.back.trim() : '';
            if (!front || !back) return null;

            const type = obj.type === 'cloze' || obj.type === 'code' ? obj.type : 'basic';
            const tags = Array.isArray(obj.tags)
                ? obj.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8)
                : undefined;

            const language = typeof obj.language === 'string' ? obj.language.trim() : undefined;
            const confidence = Number.isFinite(Number(obj.confidence)) ? Number(obj.confidence) : undefined;
            const reason = typeof obj.reason === 'string' ? obj.reason.trim() : undefined;

            return {
                front: front.slice(0, 500),
                back: back.slice(0, 800),
                type,
                language: language || undefined,
                tags,
                confidence,
                reason,
            } as GeneratedCardCandidate;
        })
        .filter((card): card is GeneratedCardCandidate => card !== null);

    return cleaned.slice(0, Math.max(1, Math.min(5, count)));
}

function tokenizeForTags(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\-\s]/g, ' ')
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 3 && !TAG_STOPWORDS.has(word));
}

function buildAutoTags(card: GeneratedCardCandidate, request: CardGenerationRequest): string[] {
    const merged = `${card.front} ${card.back}`;
    const tokens = tokenizeForTags(merged);
    const freq = new Map<string, number>();
    tokens.forEach((token) => freq.set(token, (freq.get(token) || 0) + 1));
    const ranked = Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([word]) => word)
        .slice(0, 3);

    const sourceTag = request.source === 'chat' ? 'chat' : 'dojo';
    const languageTag = (card.language || request.languageHint || '').toLowerCase().trim();
    const topicTag = (request.topic || '').toLowerCase().trim().replace(/\s+/g, '-');

    const tagSet = new Set<string>();
    tagSet.add(sourceTag);
    if (languageTag) tagSet.add(languageTag);
    if (topicTag) tagSet.add(topicTag);
    ranked.forEach((tag) => tagSet.add(tag));

    return Array.from(tagSet).slice(0, 8);
}

function ensureCardTags(cards: GeneratedCardCandidate[], request: CardGenerationRequest): GeneratedCardCandidate[] {
    return cards.map((card) => {
        const existingTags = (card.tags || []).map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
        if (existingTags.length > 0) {
            return { ...card, tags: existingTags };
        }
        return { ...card, tags: buildAutoTags(card, request) };
    });
}

export async function sendMessageToGemini(
    messages: ChatMessage[],
    mode: Mode,
    projectContext?: string,
    extraContext?: string,
): Promise<string> {
    // Build the system instruction
    let systemPrompt = SYSTEM_PROMPTS[mode];

    // Add project context if available
    if (projectContext) {
        systemPrompt += `\n\n## Project Context:\nThe user has uploaded a project. Here's the context:\n${projectContext}\n\nUse this context to provide more relevant and project-specific assistance.`;
    }

    if (extraContext) {
        systemPrompt += `\n\n## User-selected Code Context:\n${extraContext}\n\nPrioritize this selected context when answering.`;
    }

    if (AI_PROVIDER === 'bedrock') {
        const client = getBedrockClient();
        
        const bedrockMessages: BedrockMessage[] = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: [{ text: msg.content }]
        }));

        try {
            const command = new ConverseCommand({
                modelId: BEDROCK_MODEL,
                messages: bedrockMessages,
                system: [{ text: systemPrompt }],
                inferenceConfig: {
                    maxTokens: 4096,
                    temperature: mode === 'learning' ? 0.8 : 0.7,
                    topP: 0.95,
                }
            });
            const response = await client.send(command);
            if (response.output?.message?.content?.[0]?.text) {
                return response.output.message.content[0].text;
            }
            throw new Error("Invalid response from Bedrock");
        } catch (error) {
            console.error('Bedrock API Error:', error);
            throw error;
        }
    }

    if (!GEMINI_API_KEY) {
        throw new Error(
            'Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env.local file.'
        );
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

export async function generateFlashcardsWithGemini(
    request: CardGenerationRequest
): Promise<CardGenerationResult> {
    const count = Math.max(1, Math.min(5, request.count ?? 3));
    if (!request.content.trim()) {
        return generateFallbackFlashcards({ ...request, count });
    }

    if (!GEMINI_API_KEY) {
        return generateFallbackFlashcards({ ...request, count });
    }

    const generationPrompt = `
Generate exactly ${count} high-quality flashcards as JSON.

Source: ${request.source}
Topic: ${request.topic || 'n/a'}
Challenge Type: ${request.challengeType || 'n/a'}
Language Hint: ${request.languageHint || 'n/a'}
Score: ${typeof request.score === 'number' ? request.score : 'n/a'}

Rules:
- Output valid JSON only
- Root shape: {"cards":[...]}
- Each card: {"front":string,"back":string,"type":"basic"|"cloze"|"code","language"?:string,"tags"?:string[],"confidence"?:number,"reason"?:string}
- concise, concrete, no duplicate cards
- Include at least one practical/usage-oriented card when possible

Source content:
${request.content}
`.trim();

    if (AI_PROVIDER === 'bedrock') {
        const client = getBedrockClient();
        try {
            const command = new ConverseCommand({
                modelId: BEDROCK_MODEL,
                messages: [{ role: 'user', content: [{ text: generationPrompt }] }],
                inferenceConfig: {
                    maxTokens: 2048,
                    temperature: 0.4,
                    topP: 0.9,
                }
            });
            const response = await client.send(command);
            const text = response.output?.message?.content?.[0]?.text || '';
            const parsed = extractJsonPayload(text);
            const cards = ensureCardTags(normalizeGeneratedCards(parsed, count), request);
            if (!cards.length) {
                return generateFallbackFlashcards({ ...request, count });
            }
            return {
                cards,
                engine: 'bedrock',
            };
        } catch (error) {
            console.error('Bedrock flashcard generation error:', error);
            return generateFallbackFlashcards({ ...request, count });
        }
    }

    try {
        const ai = getGenAI();
        const model = ai.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 0.9,
                maxOutputTokens: 2048,
            },
        });

        const result = await model.generateContent(generationPrompt);
        const response = await result.response;
        const text = response.text();
        const parsed = extractJsonPayload(text);
        const cards = ensureCardTags(normalizeGeneratedCards(parsed, count), request);

        if (!cards.length) {
            return generateFallbackFlashcards({ ...request, count });
        }

        return {
            cards,
            engine: 'gemini',
        };
    } catch (error) {
        console.error('Gemini flashcard generation error:', error);
        return generateFallbackFlashcards({ ...request, count });
    }
}

// Check if API key is configured
export function isGeminiConfigured(): boolean {
    if (AI_PROVIDER === 'bedrock') {
        return Boolean(AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
    }
    return Boolean(GEMINI_API_KEY);
}

// Get current model name
export function getModelName(): string {
    if (AI_PROVIDER === 'bedrock') {
        return BEDROCK_MODEL;
    }
    return GEMINI_MODEL;
}
