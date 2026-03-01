import api from './api.config';

export interface ChatbotResponse {
    status: string;
    question: string;
    response: string;
    message?: string;
    context_docs?: any[];
    model?: string;
    timestamp: string;
}

export const chatbotService = {
    /**
     * Sends a question to the LLM chatbot (RAG).
     * Requires authentication (Bearer token managed by api.config).
     */
    askChatbot: async (question: string, k: number = 5, debugChunks: boolean = false): Promise<ChatbotResponse> => {
        // Direct call to Flask API as requested
        const FLASK_URL = 'http://localhost:5001/ask-chatbot';
        const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3MjMyMDczNSwianRpIjoiMTliNjIxOWYtYzcwMS00NWQ1LThkMWItZGIwYmJjZjk4YzFmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6Im1vaGFtbWVkZXp6YWltIiwibmJmIjoxNzcyMzIwNzM1LCJjc3JmIjoiZWQ0YjQ0OTAtNmU0ZC00YmYzLWJkOTQtNTBiZDgzOTY2ZWJiIiwiZXhwIjoxODAzODU2NzM1LCJpZHVzZXIiOiJtb2hhbW1lZGV6emFpbSIsImlkY2hhdGJvdCI6InNhZmFyaS1haS0yIiwicm9sZSI6InVzZXIifQ.6z9G53UM1jF_3m2weyhe4wZw-xaZOzC7t6TQ6KdI4UM';

        const response = await fetch(FLASK_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                k,
                debug_chunks: debugChunks
            })
        });

        if (!response.ok) {
            throw new Error(`Flask API error: ${response.statusText}`);
        }

        return await response.json();
    },

    /**
     * Assigns a chatbot to the user and returns an updated token.
     */
    assignChatbot: async (idchatbot: string): Promise<any> => {
        const response = await api.post('/assign-chatbot', { idchatbot });
        return response.data;
    }
};
