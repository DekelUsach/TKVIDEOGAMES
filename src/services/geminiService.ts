import type { GameGenerationRequest } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview').trim();
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
}

export const geminiService = {
    generateGame: async (request: GameGenerationRequest): Promise<string> => {
        console.log('[Gemini] Generating game with request:', request);

        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
            console.error('[Gemini] API key not configured');
            throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env.local file');
        }

        const systemPrompt = `You are a professional HTML5 Game Architect.
Your task is to generate a SINGLE, COMPLETE, AND FULLY FUNCTIONAL HTML5 file for a game based on the user's request.

TECHNICAL RULES:
1. Everything (HTML, CSS, JS) MUST be in one file.
2. Use standard <script> and <style> tags.
3. The game must be playable by just opening the file in a browser.
4. Include a robust game loop, collision detection, and score system.
5. Use high-quality visual aesthetics (neon/cyberpunk/minimalist as requested).
6. MOBILE FIRST: The game MUST be fully playable on mobile devices with touch controls.
   - Use 'touchstart', 'touchmove', 'touchend' events.
   - Canvas must fill the screen (width: 100%, height: 100%).
   - Prevent default touch actions (e.g., scrolling) on the canvas.
7. CRITICAL: DO NOT STOP UNTIL THE ENTIRE FILE IS COMPLETE. 
8. DO NOT USE MARKDOWN WRAPPERS (\`\`\`html). Just start with <!DOCTYPE html>.

GAME SPECIFICATIONS:
- Prompt: ${request.prompt}
- Style: ${request.style || 'neon cyberpunk'}
- Difficulty: ${request.difficulty || 'medium'}

Generate the full code now:`;

        try {
            const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY.substring(0, 5)}...`;
            console.log('[GeminiService] Fetching from URL (masked key):', url);

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[GeminiService] API Error:', errorData);
                throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data: GeminiResponse = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                console.error('[GeminiService] Empty response data:', data);
                throw new Error('No game code generated from Gemini');
            }

            console.log('[GeminiService] Raw text received. Length:', generatedText.length);

            // Clean up the response - remove markdown code blocks if present
            let cleanedCode = generatedText.trim();
            if (cleanedCode.startsWith('```html')) {
                cleanedCode = cleanedCode.replace(/^```html\n?/, '').replace(/```$/, '');
            } else if (cleanedCode.startsWith('```')) {
                cleanedCode = cleanedCode.replace(/^```\n?/, '').replace(/```$/, '');
            }

            console.log('[GeminiService] Game generated successfully. Final code size:', cleanedCode.length, 'chars');
            return cleanedCode.trim();

        } catch (error) {
            console.error('[Gemini] Error generating game:', error);
            throw error;
        }
    },

    // Generic generation for short texts (like ideas)
    generateIdea: async (): Promise<string> => {
        if (!geminiService.isConfigured()) throw new Error('Gemini not configured');

        const prompt = "Act as a creative indie game designer. Generate a short, unique, and addictive HTML5 game idea (one sentence). Output ONLY the idea itself. No conversational filler, no quotes. Just the raw text.";

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.9, maxOutputTokens: 100 },
                }),
            });

            if (!response.ok) throw new Error('Gemini API error');

            const data: GeminiResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error('Empty response');
            return text.trim().replace(/^["']|["']$/g, '');
        } catch (error) {
            console.error('[Gemini] Error generating idea:', error);
            throw error;
        }
    },

    // Check if API is configured (static check)
    isConfigured: (): boolean => {
        return !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here';
    }
};
