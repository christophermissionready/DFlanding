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

// Original function
// async function processInterviewInteraction(jobTitle, history = []) {
//     try {
//         // If this is the first interaction, start with an opening question
//         if (history.length === 0) {
//             history = [{
//                 role: "user",
//                 parts: [{ text: `${jobTitle}` }]
//             }];
//         }

//         // Format history for the AI model
//         const formattedHistory = history.map(msg => ({
//             role: msg.role === "assistant" ? "model" : msg.role,
//             parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }]
//         }));

//         // Create chat with context
//         const chat = model.startChat({
//             history: [
//                 {
//                     role: "user",
//                     parts: [{ text: `You are an business strategist. Talk about helping the user with "${jobTitle}" . After each response from the applicant, ask a relevant follow-up question. Do not analyze, give feedback, or provide any advice; simply ask a natural follow-up question based on the previous response. After 1 follow up question, change the subject slightly so you don't go too deep. Do not include the following prefixes in your response: "[interviewer] " and "[applicant] ".` }]
//                 },
//                 {
//                     role: "model",
//                     parts: [{ text: "I understand. I will act as a professional business strategist and ask relevant follow-up questions without providing feedback or analysis." }]
//                 },
//                 ...formattedHistory
//             ]
//         });

//         // Send the message and get the response
//         const result = await chat.sendMessageStream(
//             formattedHistory[formattedHistory.length - 1].parts[0].text
//         );

//         // Capture AI's follow-up question
//         let aiResponse = "";
//         for await (const chunk of result.stream) {
//             aiResponse += chunk.text();
//         }

//         return aiResponse;
//     } catch (error) {
//         console.error('Error in processInterviewInteraction:', error);
//         throw error;
//     }
// }

// async function processInterviewInteraction(jobTitle, history = []) {
//     try {
//         // Ensure history is an array
//         if (!Array.isArray(history)) {
//             history = [];
//         }

//         // If this is the first interaction, initialize history
//         if (history.length === 0) {
//             history = [{
//                 role: "user",
//                 parts: [{ text: `${jobTitle}` }]
//             }];
//         }

//         // Format history with role validation
//         const formattedHistory = history
//             .filter(msg => msg && msg.role) // Ensure each message has a role
//             .map(msg => ({
//                 role: msg.role === "assistant" ? "model" : msg.role, // Convert "assistant" to "model"
//                 parts: Array.isArray(msg.parts) ? msg.parts : [{ text: String(msg.parts) }]
//             }));

//         // Ensure at least one valid user message exists
//         if (formattedHistory.length === 0) {
//             formattedHistory.push({
//                 role: "user",
//                 parts: [{ text: `${jobTitle}` }]
//             });
//         }

//         // Start AI chat session
//         const chat = model.startChat({
//             history: [
//                 {
//                     role: "user",
//                     parts: [{ text: `You are a business strategist conducting a job interview for the position of "${jobTitle}". After each response, ask a relevant follow-up question. Do not provide feedback or analysis—only ask natural follow-up questions.` }]
//                 },
//                 {
//                     role: "model",
//                     parts: [{ text: "Understood. I will act as a business strategist and ask relevant follow-up questions." }]
//                 },
//                 ...formattedHistory
//             ]
//         });

//         // Get AI response based on last user message
//         const lastUserMessage = formattedHistory[formattedHistory.length - 1]?.parts?.[0]?.text || "";
//         if (!lastUserMessage) throw new Error("No valid user message to process.");

//         const result = await chat.sendMessageStream(lastUserMessage);

//         // Capture AI's follow-up question
//         let aiResponse = "";
//         for await (const chunk of result.stream) {
//             aiResponse += chunk.text();
//         }

//         return aiResponse;
//     } catch (error) {
//         console.error("Error in processInterviewInteraction:", error);
//         throw error;
//     }
// }

async function processInterviewInteraction(jobTitle, history = []) {
    try {
        // Ensure history is an array and initialize if empty
        if (!Array.isArray(history)) {
            history = [];
        }

        // Format the history with valid messages and roles
        const formattedHistory = history
            .filter(msg => msg && msg.role && msg.parts)
            .map(msg => ({
                role: msg.role === "assistant" ? "model" : msg.role, // Convert "assistant" to "model"
                parts: Array.isArray(msg.parts) ? msg.parts : [{ text: String(msg.parts) }]
            }));

        // If the history is empty, add the first interaction
        if (formattedHistory.length === 0) {
            formattedHistory.push({
                role: "user",
                parts: [{ text: `You are a business strategist helping a stakeholder in the "${jobTitle}" industry. After each response, ask a relevant follow-up question.` }]
            });
        }

        // Start AI chat session with history and the context for the interview
        const chat = model.startChat({
            history: [
                ...formattedHistory,
                {
                    role: "user",
                    parts: [{ text: `You are a business strategist helping a stakeholder in the "${jobTitle}" industry. After each response, ask a relevant follow-up question.` }]
                }
            ]
        });

        // Get the last user message
        const lastUserMessage = formattedHistory[formattedHistory.length - 1]?.parts?.[0]?.text || "";
        if (!lastUserMessage) throw new Error("No valid user message to process.");

        // Send message and wait for response
        const result = await chat.sendMessageStream(lastUserMessage);

        // Collect the follow-up question from the AI response
        let aiResponse = "";
        for await (const chunk of result.stream) {
            aiResponse += chunk.text();
        }

        // Return the AI's follow-up question
        return aiResponse;
    } catch (error) {
        console.error("Error in processInterviewInteraction:", error);
        throw error;
    }
}


// Original
// async function analyzeInterview(jobTitle, history = []) {
//     try {
//         // Format history for the AI model
//         const formattedHistory = history.map(msg => ({
//             role: msg.role === "assistant" ? "model" : msg.role,
//             parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }]
//         }));

//         // Create chat with context
//         const chat = model.startChat({
//             history: [
//                 {
//                     role: "user",
//                     parts: [{ text: `You are an expert business strategist analyzing responses for ${jobTitle}. 
//                     Provide constructive feedback and assistance on:
//                     1. How to supply such required demands
//                     2. Specific examples on what to do
//                     3. Areas where their ideas could be improved
//                     4. Actionable suggestions for better solutions
//                     5. Finally, give a percentage chance the idea will succeed.
                    
//                     Only analyze the users's responses, not the interviewer's questions.
//                     Be constructive and encouraging while providing specific examples from their responses.` }]
//                 },
//                 {
//                     role: "model",
//                     parts: [{ text: "I understand. I will analyze only the users responses and provide detailed, constructive feedback and solutions." }]
//                 },
//                 ...formattedHistory
//             ]
//         });

//         // Send analysis request
//         const result = await chat.sendMessageStream(
//             "Please analyze the user's responses as a business strategist and provide detailed feedback.."
//         );

//         // Capture AI's analysis
//         let aiResponse = "";
//         for await (const chunk of result.stream) {
//             aiResponse += chunk.text();
//         }

//         return aiResponse;
//     } catch (error) {
//         console.error('Error in analyzeInterview:', error);
//         throw error;
//     }
// }



async function analyzeInterview(jobTitle, history = []) {
    try {
        // Log the incoming history to ensure it has the expected format
        console.log("Incoming history:", history);

        // Ensure history is an array and filter out invalid messages
        const formattedHistory = history
            .filter(msg => msg && msg.text) // Ensure each message has valid text
            .map(msg => {
                // Check if message has a valid role
                const role = msg.isAI ? "model" : "user"; // Set role based on isAI flag

                // Ensure parts are wrapped correctly and text is valid
                return {
                    role,
                    parts: Array.isArray(msg.text) ? msg.text : [{ text: msg.text }]
                };
            });

        // Log the formatted history after filtering invalid messages
        console.log("Formatted History:", formattedHistory);

        // If history is empty, initialize it with default user role
        if (formattedHistory.length === 0) {
            formattedHistory.push({
                role: "user",
                parts: [{ text: `You are an expert business strategist analyzing responses for ${jobTitle}. Please provide a solution to the applicant's requests without analyzing the interviewer's questions.` }]
            });
        }

        // Start AI chat session for analysis
        const chat = model.startChat({
            history: [
                ...formattedHistory,
                {
                    role: "user",
                    parts: [{ text: `
                    Provide constructive feedback and assistance on:
                    1. How to supply such required demands
                    2. Specific examples on what to do
                    3. Areas where their ideas could be improved
                    4. Actionable suggestions for better solutions
                    5. Finally, give a percentage chance the idea will succeed.
                    
                    Only analyze the users's responses, not the interviewer's questions.
                    Be constructive and encouraging while providing specific examples from their responses
                    Provide specific ideas.` }]
                }
            ]
        });

        // Log the final history being sent to the model
        console.log("Final History Sent to Model:", chat.history);

        // Send analysis request
        const result = await chat.sendMessageStream(
            "Please analyze the user's responses as a business strategist and provide detailed solutions."
        );

        // Capture AI's analysis response
        let aiResponse = "";
        for await (const chunk of result.stream) {
            aiResponse += chunk.text();
        }

        // Return the analysis from the AI
        return aiResponse;
    } catch (error) {
        console.error('Error in analyzeInterview:', error);
        throw error;
    }
}





export { processInterviewInteraction, analyzeInterview };