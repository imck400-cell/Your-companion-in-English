
import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { UserLevel, CorrectionResult, GeneratedArticle, VocabularyItem } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const determineLevel = async (answers: string[]): Promise<UserLevel> => {
  const prompt = `
    Analyze these user answers to an English placement test:
    ${JSON.stringify(answers)}
    
    Determine if the user is 'Beginner', 'Intermediate', or 'Advanced'.
    Return ONLY the level name as a string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text?.trim();
    if (text?.includes('Advanced')) return UserLevel.Advanced;
    if (text?.includes('Intermediate')) return UserLevel.Intermediate;
    return UserLevel.Beginner;
  } catch (error) {
    console.error("Level determination failed", error);
    return UserLevel.Beginner;
  }
};

export const getSmartCorrection = async (text: string): Promise<CorrectionResult> => {
  const prompt = `
    Act as an expert English teacher for Arabic speakers.
    Correct the following text: "${text}"
    
    Return a JSON object with:
    1. 'correctedText': The fully corrected version.
    2. 'errors': An array of objects, each containing:
       - 'original': The mistake segment.
       - 'correction': The fix.
       - 'explanation': A brief explanation of the grammar/spelling rule in ARABIC.
       - 'type': One of 'grammar', 'spelling', 'vocabulary', 'style'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                correctedText: { type: Type.STRING },
                errors: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            original: { type: Type.STRING },
                            correction: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['grammar', 'spelling', 'vocabulary', 'style'] }
                        }
                    }
                }
            }
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result as CorrectionResult;
  } catch (error) {
    console.error("Correction failed", error);
    throw error;
  }
};

export const generateArticle = async (topic: string, level: UserLevel): Promise<GeneratedArticle> => {
  const prompt = `
    Write an interesting, educational article about "${topic}".
    Target Level: ${level} English.
    
    Return JSON:
    {
      "title": "Catchy Title",
      "content": "The full article text...",
      "vocabulary": [ { "word": "difficult word", "definition": "Definition in simple English" } ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                vocabulary: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            word: { type: Type.STRING },
                            definition: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    return JSON.parse(response.text || "{}") as GeneratedArticle;
  } catch (error) {
    console.error("Article generation failed", error);
    throw error;
  }
};

export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string, level: UserLevel, persona: string) => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: `You are an English conversation partner roleplaying as: ${persona}. The user is a ${level} level learner. Correct major mistakes gently in the flow of conversation. Keep responses concise and engaging.`
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
}

// NEW: Generate Vocabulary Practice Set
export const generateVocabularySet = async (level: UserLevel, excludeWords: string[] = []): Promise<VocabularyItem[]> => {
    // We limit excluded words to the last 100 to avoid token limits, though 1.5 flash has a large context window.
    const exclusionList = excludeWords.slice(-100).join(", ");
    
    const prompt = `
      Generate 5 important English words appropriate for a ${level} learner.
      
      CRITICAL INSTRUCTION: Do NOT include any of the following words: [${exclusionList}].
      Generate NEW words that are not in the list above.
      
      Include a context sentence for each and a simple English definition.
      Return JSON array.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      word: { type: Type.STRING },
                      contextSentence: { type: Type.STRING },
                      definitionEn: { type: Type.STRING }
                  }
              }
          }
        }
      });
  
      return JSON.parse(response.text || "[]") as VocabularyItem[];
    } catch (error) {
      console.error("Vocabulary generation failed", error);
      return [
        { word: "Success", contextSentence: "Hard work leads to success.", definitionEn: "The accomplishment of an aim or purpose." },
        { word: "Learning", contextSentence: "Learning is a lifelong process.", definitionEn: "The acquisition of knowledge." }
      ]; // Fallback
    }
  };
  
  // NEW: Validate Arabic Translation
  export const validateTranslation = async (word: string, userTranslation: string): Promise<{ isCorrect: boolean, feedback: string }> => {
    const prompt = `
      Word: "${word}"
      User's Arabic Translation: "${userTranslation}"
      
      Is this translation correct? 
      Return JSON: { "isCorrect": boolean, "feedback": "Short explanation in Arabic" }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  isCorrect: { type: Type.BOOLEAN },
                  feedback: { type: Type.STRING }
              }
          }
        }
      });
  
      return JSON.parse(response.text || "{}");
    } catch (error) {
      return { isCorrect: false, feedback: "Connection error. Please try again." };
    }
  };
