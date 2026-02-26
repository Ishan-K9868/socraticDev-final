import { useState, useCallback } from 'react';
import { ChatContextSnippet, useStore } from '../../store/useStore';
import { ProjectFile } from '../../utils/projectAnalyzer';
import { sendMessageToGemini, isGeminiConfigured, ChatMessage } from '../../services/gemini';

function flattenProjectFiles(files: ProjectFile[], acc: ProjectFile[] = []): ProjectFile[] {
    for (const file of files) {
        acc.push(file);
        if (file.children?.length) {
            flattenProjectFiles(file.children, acc);
        }
    }
    return acc;
}

function formatSnippetContext(snippets?: ChatContextSnippet[]): string | undefined {
    if (!snippets || snippets.length === 0) return undefined;

    const bounded = snippets.slice(0, 4).map((snippet) => {
        const content = snippet.text.length > 1000
            ? `${snippet.text.slice(0, 1000)}\n...[truncated]`
            : snippet.text;
        return [
            `File: ${snippet.documentName}`,
            `Language: ${snippet.languageMode}`,
            `Lines: ${snippet.startLine}-${snippet.endLine}`,
            '```',
            content,
            '```',
        ].join('\n');
    });

    return `Selected code context (user-attached):\n${bounded.join('\n\n')}`;
}

export function useChat() {
    const { mode, addMessage, conversations, currentConversationId, projectContext } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentConversation = conversations.find(c => c.id === currentConversationId);
    const messages = currentConversation?.messages || [];

    const getApiMessages = useCallback((): ChatMessage[] => {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
    }, [messages]);

    const getProjectContextString = useCallback((): string | undefined => {
        if (!projectContext) return undefined;
        const flattened = flattenProjectFiles(projectContext.files || []);
        const onlyFiles = flattened.filter((file) => file.type === 'file');
        const listing = onlyFiles
            .slice(0, 20)
            .map((file) => `${file.path || file.name} (${file.language || 'plaintext'})`);

        return `Project: ${projectContext.name}
Language: ${projectContext.language}
Files (${onlyFiles.length}):
${listing.map((entry) => `- ${entry}`).join('\n')}${onlyFiles.length > listing.length ? `\n- ...and ${onlyFiles.length - listing.length} more` : ''}`;
    }, [projectContext]);

    const sendMessage = useCallback(async (
        content: string,
        opts?: { contextSnippets?: ChatContextSnippet[] },
    ) => {
        if (!content.trim() || isLoading) return;

        setError(null);

        if (!isGeminiConfigured()) {
            setError('Gemini API key not configured. Please add your API key to .env.local');

            addMessage({
                role: 'user',
                content: content.trim(),
                mode,
            });

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

        addMessage({
            role: 'user',
            content: content.trim(),
            mode,
        });

        setIsLoading(true);

        try {
            const apiMessages: ChatMessage[] = [
                ...getApiMessages(),
                { role: 'user', content: content.trim() },
            ];

            const response = await sendMessageToGemini(
                apiMessages,
                mode,
                getProjectContextString(),
                formatSnippetContext(opts?.contextSnippets),
            );

            addMessage({
                role: 'assistant',
                content: response,
                mode,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);

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
