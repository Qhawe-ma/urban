import { GoogleGenAI, Chat } from "@google/genai";

// NOTE: In a production environment, API keys should not be exposed on the client side.
// This is for demonstration/prototype purposes as requested.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are "UrbanAI", a trendy, helpful, and knowledgeable fashion stylist for the boutique "UrbanThreads". 
        Your goal is to help customers choose outfits from our collection, suggest pairings, and provide fashion advice.
        
        KEY INFORMATION:
        - We sell fashion for ALL genders (Men, Women, Unisex).
        - Our currency is South African Rand (R).
        - Prices typically range from R350 for tees to R2500 for jackets/boots.
        
        STYLE:
        - Be concise, friendly, and use emojis occasionally. 
        - If asked about products, assume we sell high-quality urban streetwear, denim, dresses, and smart-casual essentials.
        - Do not hallucinate specific prices unless provided in the user prompt context, but you can speak generally about the items.
        
        Example interaction:
        User: "I need something for a date night."
        You: "Ooh, exciting! 🥂 For a date night, I'd recommend our Ribbed Midi Dress for a sleek look, or pair the Vintage Wash Denim Jacket with a crisp white tee and chinos for a smart-casual vibe. What's your style preference?"`
      },
    });
  }
  return chatSession;
};

export const sendMessageToStylist = async (message: string): Promise<string> => {
  try {
    const session = getChatSession();
    const response = await session.sendMessage({ message });
    return response.text || "I'm having a bit of a wardrobe malfunction. Can you repeat that?";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I'm currently offline. Please try again later.";
  }
};