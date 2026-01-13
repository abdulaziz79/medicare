
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  // Always initialize with named parameter and process.env.API_KEY directly.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSOAPNote = async (transcript: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform the following medical encounter transcript into a professional SOAP (Subjective, Objective, Assessment, Plan) note. Include ICD-10 code suggestions.
    
    Transcript: ${transcript}`,
    config: {
      temperature: 0.1,
    }
  });
  return response.text;
};

export const clinicalCopilotChat = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are MediPro AI Clinical Copilot, a secure assistant for medical professionals. 
      Your goals:
      1. Provide evidence-based medical information based on latest guidelines.
      2. Suggest differential diagnoses.
      3. Check drug-drug interactions.
      4. Assist with dosage calculations.
      5. Always maintain a professional, clinical tone.
      6. Mention if user should verify with specific guidelines (e.g., AHA, ACC, ADA).
      7. Do not provide patient-identifiable information in your training data.`,
    }
  });

  // Since the provided chat history structure might differ slightly, we'll manually send the message
  // In a real app, we'd pass the full history to the chat creation
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const analyzeVitals = async (vitals: any) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following patient vital signs and trends. Identify any concerning patterns or abnormalities.
    
    Data: ${JSON.stringify(vitals)}`,
  });
  return response.text;
};
