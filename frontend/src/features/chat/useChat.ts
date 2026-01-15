import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { sendMessageToGemini, isGeminiConfigured, ChatMessage } from '../../services/gemini';

export function useChat() {
    const { mode, addMessage, conversations, currentConversationId, projectContext } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentConversation = conversations.find(c => c.id === currentConversationId);
    const messages = currentConversation?.messages || [];

    // Convert store messages to API format
    const getApiMessages = useCallback((): ChatMessage[] => {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
    }, [messages]);

    // Build project context string
    const getProjectContextString = useCallback((): string | undefined => {
        if (!projectContext) return undefined;

        return `Project: ${projectContext.name}
Language: ${projectContext.language}
Files: ${projectContext.files.slice(0, 20).join(', ')}${projectContext.files.length > 20 ? ` ...and ${projectContext.files.length - 20} more` : ''}`;
    }, [projectContext]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        setError(null);

        // Check if API is configured
        if (!isGeminiConfigured()) {
            setError('Gemini API key not configured. Please add your API key to .env.local');

            // Add user message anyway
            addMessage({
                role: 'user',
                content: content.trim(),
                mode,
            });

            // Add error message as assistant response
            addMessage({
                role: 'assistant',
                content: `⚠️ **API Key Required**

To use SocraticDev with real AI responses, you need to configure your Gemini API key:

1. Open \`.env.local\` in the frontend folder
2. Add your API key: \`VITE_GEMINI_API_KEY=your_key_here\`
3. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
4. Restart the dev server (\`npm run dev\`)

Once configured, I'll be able to help you learn and build with the full power of Gemini!`,
                mode,
            });

            return;
        }

        // Add user message
        addMessage({
            role: 'user',
            content: content.trim(),
            mode,
        });

        setIsLoading(true);

        try {
            // Get conversation history including the new message
            const apiMessages: ChatMessage[] = [
                ...getApiMessages(),
                { role: 'user', content: content.trim() },
            ];

            // Call Gemini API
            const response = await sendMessageToGemini(
                apiMessages,
                mode,
                getProjectContextString()
            );

            // Add AI response
            addMessage({
                role: 'assistant',
                content: response,
                mode,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);

            // Add error message as assistant response
            addMessage({
                role: 'assistant',
                content: `❌ **Error**

Something went wrong while processing your request:

\`\`\`
${errorMessage}
\`\`\`

Please check:
- Your API key is correct in \`.env.local\`
- You have internet connectivity
- Your API quota hasn't been exceeded

Try again or check the console for more details.`,
                mode,
            });
        } finally {
            setIsLoading(false);
        }
    }, [mode, isLoading, addMessage, getApiMessages, getProjectContextString]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearError,
        isConfigured: isGeminiConfigured(),
    };
}
