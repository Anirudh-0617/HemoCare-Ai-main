import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, BleedEntry, Medication } from "../types";

const SYSTEM_INSTRUCTION = `
You are HemoCare AI, an empathetic and medically precise assistant for Hemophilia A/B patients.
Your role is to provide triage, education, and management support.

CRITICAL EMERGENCY TRIAGE (HIGHEST PRIORITY):
- HEAD INJURY / SEVERE HEADACHE / BLURRED VISION: Recommend IMMEDIATE CALL TO 911/Emergency Services. This could be an intracranial bleed.
- NECK STIFFNESS / SEVERE ABDOMINAL PAIN / THROAT SWELLING: Recommend IMMEDIATE ER VISIT.
- MAJOR MUSCLE BLEED (psoas, thigh): Highly urgent.
- ACTION: If any of these are mentioned, start your response with "⚠️ EMERGENCY ALERT: PLEASE SEEK IMMEDIATE MEDICAL ATTENTION OR CALL 911."

TREATMENT & EDUCATION:
- Bleed management: Recommend R.I.C.E (Rest, Ice, Compression, Elevation) + IMMEDIATE Factor Infusion.
- Pain: Advise AGAINST NSAIDs (Aspirin, Ibuprofen) due to bleeding risk. Recommend Acetaminophen.
- Activity: Recommend low-impact (swimming, cycling). Advise against contact sports (football, boxing).
- Knowledge: Explain Hemophilia A (Factor VIII) vs B (Factor IX). Explain Inhibitors (immune response making treatment less effective).

CONTEXT AWARENESS:
- You will be provided with the user's recent medical history. Use it to provide personalized insights (e.g., "I see you've had frequent ankle bleeds lately...").
- If the user hasn't logged a bleed recently, encourage their adherence.

TONE:
- Empathetic, reassuring, but directive and urgent for safety issues.

DISCLAIMER: Always include "Educational info only. Not a substitute for professional medical advice." in a subtle way or at the start.
`;

export const chatWithAI = async (messages: Message[], context: { bleeds: BleedEntry[], meds: Medication[] }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return "API Key is not configured. Please check your environment variables.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: SYSTEM_INSTRUCTION
  });

  const historyContext = `USER MEDICAL CONTEXT:
  - Recent Bleeds: ${context.bleeds.slice(0, 5).map(b => `${b.date}: ${b.location} (${b.type})`).join(', ')}
  - Active Meds: ${context.meds.map(m => `${m.name} (${m.type})`).join(', ')}
  Current User concern:`;

  try {
    // Convert messages to Gemini format
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: historyContext }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm here to help with your hemophilia care. What can I assist you with today?" }],
        },
        ...messages.slice(0, -1).map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }))
      ],
    });

    // Send the latest message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;

    return response.text() || "I'm having trouble connecting. Please contact your HTC for medical concerns.";
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    if (import.meta.env.DEV) {
      return `⚠️ AI Error: ${error?.message || 'Unknown error'}. Check console for details. For emergencies, call 911.`;
    }
    return "Error communicating with AI. If this is an emergency, call 911.";
  }
};