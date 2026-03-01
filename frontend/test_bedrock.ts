import { getModelName, isGeminiConfigured, sendMessageToGemini } from './src/services/gemini';
import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

// Mocking Vite's import.meta.env for testing node execution
(global as any).import = {
    meta: {
        env: {
            VITE_AI_PROVIDER: 'bedrock',
            VITE_AWS_REGION: 'us-east-1',
            VITE_AWS_ACCESS_KEY_ID: 'fake_access_key',
            VITE_AWS_SECRET_ACCESS_KEY: 'fake_secret_key',
            VITE_BEDROCK_MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0',
        }
    }
};

async function testBedrockConfigs() {
    try {
        console.log("Testing Bedrock Configurations...");

        const isConfigured = isGeminiConfigured();
        console.log("Is Configured:", isConfigured); // Should be true since fake keys are provided

        const modelName = getModelName();
        console.log("Model Name:", modelName); // Should be the claude model

        if (!isConfigured || modelName !== 'anthropic.claude-3-haiku-20240307-v1:0') {
            console.error("Configuration test failed.");
            process.exit(1);
        }

        console.log("Configuration test passed.");

        // Note: we can't fully invoke sendMessageToGemini without real AWS credentials 
        // because the SDK will attempt to sign and send the request, which will fail with InvalidSignatureException.
        // However, we can verify that the ConverseCommand is constructed correctly by looking at the logs/errors.

    } catch (e) {
        console.error("Test failed with error:", e);
        process.exit(1);
    }
}

testBedrockConfigs();
