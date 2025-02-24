import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL_NAME });


/**
 * Process an interview interaction and return the next question
 * @param {string} jobTitle - The position being interviewed for
 * @param {Array} history - Array of previous interactions
 * @returns {Promise<string>} The AI's next question
 */
async function processInterviewInteraction(jobTitle, history = []) {
    try {
        // If this is the first interaction, start with an opening question
        if (history.length === 0) {
            history = [{
                role: "user",
                parts: [{ text: `${jobTitle}` }]
            }];
        }

        // Format history for the AI model
        const formattedHistory = history.map(msg => ({
            role: msg.role === "assistant" ? "model" : msg.role,
            parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }]
        }));

        // Create chat with context
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `You are an business strategist. Talk about helping the user with "${jobTitle}" . After each response from the applicant, ask a relevant follow-up question. Do not analyze, give feedback, or provide any advice; simply ask a natural follow-up question based on the previous response. After 1 follow up question, change the subject slightly so you don't go too deep. Do not include the following prefixes in your response: "[interviewer] " and "[applicant] ".` }]
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I will act as a professional business strategist and ask relevant follow-up questions without providing feedback or analysis." }]
                },
                ...formattedHistory
            ]
        });

        // Send the message and get the response
        const result = await chat.sendMessageStream(
            formattedHistory[formattedHistory.length - 1].parts[0].text
        );

        // Capture AI's follow-up question
        let aiResponse = "";
        for await (const chunk of result.stream) {
            aiResponse += chunk.text();
        }

        return aiResponse;
    } catch (error) {
        console.error('Error in processInterviewInteraction:', error);
        throw error;
    }
}

async function analyzeInterview(jobTitle, history = []) {
    try {
        // Format history for the AI model
        const formattedHistory = history.map(msg => ({
            role: msg.role === "assistant" ? "model" : msg.role,
            parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }]
        }));

        // Create chat with context
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `You are an expert business strategist analyzing responses for ${jobTitle}. 
                    Provide constructive feedback and assistance on:
                    1. How to supply such required demands
                    2. Specific examples on what to do
                    3. Areas where their ideas could be improved
                    4. Actionable suggestions for better solutions
                    5. Finally, give a percentage chance the idea will succeed.
                    
                    Only analyze the users's responses, not the interviewer's questions.
                    Be constructive and encouraging while providing specific examples from their responses.` }]
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I will analyze only the users responses and provide detailed, constructive feedback and solutions." }]
                },
                ...formattedHistory
            ]
        });

        // Send analysis request
        const result = await chat.sendMessageStream(
            "Please analyze the user's responses as a business strategist and provide detailed feedback.."
        );

        // Capture AI's analysis
        let aiResponse = "";
        for await (const chunk of result.stream) {
            aiResponse += chunk.text();
        }

        return aiResponse;
    } catch (error) {
        console.error('Error in analyzeInterview:', error);
        throw error;
    }
}

export { processInterviewInteraction, analyzeInterview };