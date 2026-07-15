import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialization of Gemini client to prevent startup crash if API key is temporarily missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Highly robust helper to automatically retry Gemini requests during temporary service spikes (503s)
async function generateWithRetry(options: {
  model: string;
  contents: string | any[];
  config: any;
}, maxRetries = 3, initialDelay = 800) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ai = getGeminiClient();
      return await ai.models.generateContent(options);
    } catch (error: any) {
      const errMsg = (error?.message || "").toLowerCase();
      const isTransient = errMsg.includes("503") || errMsg.includes("overloaded") || errMsg.includes("unavailable") || errMsg.includes("high demand") || errMsg.includes("temp");
      
      if (isTransient && attempt < maxRetries) {
        console.warn(`[EduGenie] Gemini API overloaded. Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to contact the educational AI service after several retries.");
}

function handleApiError(error: any) {
  let message = "An error occurred while communicating with the AI model. Please try again.";
  if (error && error.message) {
    const errMsg = error.message.toLowerCase();
    if (errMsg.includes("503") || errMsg.includes("overloaded") || errMsg.includes("unavailable") || errMsg.includes("high demand")) {
      message = "EduGenie is currently experiencing high study demand (Google Gemini Service is briefly overloaded). Please wait a moment and try submitting your request again!";
    } else if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("exhausted")) {
      message = "We have temporarily exceeded the student study quota rate limit. Please wait a minute and try again!";
    } else if (errMsg.includes("api key") || errMsg.includes("api_key") || errMsg.includes("unauthorized") || errMsg.includes("not found")) {
      message = "The Gemini API key is missing or invalid. Please check the secret configurations under Settings > Secrets.";
    } else {
      message = error.message;
    }
  }
  return message;
}

app.use(express.json());

// 1. Intelligent Question Answering API
app.post("/api/qa", async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const systemInstruction = `You are EduGenie, a friendly, professional, and intelligent educational assistant.
Provide highly accurate, inspiring, and engaging educational answers. 
Structure your response in markdown. Break down complex concepts into easy-to-understand parts.
Always include an interesting "Fun Fact" or "Did You Know?" section at the end to spark curiosity.
Keep the explanation clear, accurate, and optimized for self-learners.`;

    const userPrompt = context 
      ? `Based on this previous context: "${context}", answer this educational question: "${question}"`
      : `Please answer this educational question with rich, engaging academic context: "${question}"`;

    const response = await generateWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      answer: response.text || "I was unable to formulate an answer. Please try rephrasing your question.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("QA API Error:", error);
    res.status(503).json({ error: handleApiError(error) });
  }
});

// 2. Simplified Concept Explanation API
app.post("/api/explain", async (req, res) => {
  try {
    const { concept, level } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Concept is required." });
    }
    const audienceLevel = level || "high_school";

    const systemInstruction = `You are EduGenie's concept simplifier. Your task is to explain complex concepts in an engaging and accessible way.
Tailor your response level strictly to the target audience:
- 'elementary': Explain as if to an 8-year-old. Use very simple terms, high enthusiasm, and fun visual analogies.
- 'high_school': Explain as if to a teenager. Use relatable context, real-world applications, and clear definitions.
- 'college': Explain to an undergraduate. Use robust academic definitions, critical thought angles, and formal structures.
- 'educator': Explain with teaching strategies, standard student misconceptions, and recommendations on how to introduce this concept in class.`;

    const userPrompt = `Explain the concept: "${concept}" for a level of: "${audienceLevel}". Return a structured JSON response matching the required schema.`;

    const response = await generateWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.6,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            level: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "A simple, engaging explanation tailored precisely to the level." },
            analogies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 highly intuitive and visual analogies that illustrate the concept."
            },
            keyTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["term", "definition"]
              },
              description: "3-5 crucial terms associated with the concept and their level-appropriate definitions."
            },
            summary: { type: Type.STRING, description: "A concise 1-2 sentence summary statement." }
          },
          required: ["concept", "level", "explanation", "analogies", "keyTerms", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Explain API Error:", error);
    res.status(503).json({ error: handleApiError(error) });
  }
});

// 3. AI-Powered Quiz Generation API
app.post("/api/quiz", async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const quizDifficulty = difficulty || "medium";
    const quizCount = Math.min(Math.max(Number(count) || 5, 3), 10); // cap count between 3 and 10

    const systemInstruction = `You are EduGenie's interactive quiz master. Your task is to generate high-quality academic multiple choice questions.
Create exactly ${quizCount} questions about the topic "${topic}" at a "${quizDifficulty}" difficulty level.
Ensure the questions test actual understanding, not just rote recall. Each question must have exactly 4 choices.
Mark the correct choice via a 0-based index. Provide a clear and educational explanation of why the correct choice is right and others are incorrect.`;

    const userPrompt = `Generate a multiple choice quiz with ${quizCount} questions about "${topic}" at a "${quizDifficulty}" level. Return the output in JSON matching the exact schema.`;

    const response = await generateWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique short string ID (e.g., q1, q2)" },
                  question: { type: Type.STRING, description: "The multiple choice question text." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options."
                  },
                  correctIndex: { type: Type.INTEGER, description: "0-based index of the correct option (0, 1, 2, or 3)." },
                  explanation: { type: Type.STRING, description: "Detailed educational feedback explaining why the correct answer is correct." }
                },
                required: ["id", "question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["topic", "questions"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Quiz API Error:", error);
    res.status(503).json({ error: handleApiError(error) });
  }
});

// 4. Educational Text Summarization API
app.post("/api/summarize", async (req, res) => {
  try {
    const { text, length, format } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text content is required for summarization." });
    }

    const systemInstruction = `You are EduGenie's academic text summarizer. Your goal is to distill large quantities of reading materials, essays, or textbooks into highly digestible, high-yield learning content.
Generate a structured, high-retention summary matching the user's preferred layout options. Keep definitions accurate and explanations clean.`;

    const userPrompt = `Summarize the following educational text. Length constraint: "${length || "medium"}". Preferred style format: "${format || "structured"}".
Text to summarize:
"""
${text}
"""`;

    const response = await generateWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A highly concise summary paragraph representing the absolute essence." },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "5-8 bulleted high-yield learning points or core concepts."
            },
            keyTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "Specific key term or academic jargon." },
                  definition: { type: Type.STRING, description: "A crystal clear, context-appropriate definition." }
                },
                required: ["term", "definition"]
              },
              description: "Important terminology extracted from the text and defined simple and clear."
            }
          },
          required: ["summary", "keyTakeaways", "keyTerms"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Summarize API Error:", error);
    res.status(503).json({ error: handleApiError(error) });
  }
});

// 5. Personalized Learning Path Recommendations API
app.post("/api/path", async (req, res) => {
  try {
    const { topic, timeCommitment } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const systemInstruction = `You are EduGenie's personalized curriculum designer. 
Your goal is to build a beautiful, clear, and highly practical step-by-step learning roadmap for any topic or skill.
Design three progressive stages: Beginner, Intermediate, and Advanced.
For each stage, specify:
1. Title
2. Description of expectations and benchmarks
3. Duration/time allocation
4. Core topics to master
5. Study tips and strategy recommendations
6. Suggested high-quality online learning resources or project suggestions (e.g., "Build an interactive CLI game")`;

    const userPrompt = `Generate a comprehensive learning roadmap for the topic: "${topic}". 
The learner's time commitment is: "${timeCommitment || "Flexible study rate"}".
Return the response in structured JSON matching the required schema.`;

    const response = await generateWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            overview: { type: Type.STRING, description: "A welcoming, inspiring overview of what is involved in mastering this topic." },
            stages: {
              type: Type.OBJECT,
              properties: {
                beginner: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recommendedResources: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "description", "duration", "topics", "tips", "recommendedResources"]
                },
                intermediate: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recommendedResources: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "description", "duration", "topics", "tips", "recommendedResources"]
                },
                advanced: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recommendedResources: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "description", "duration", "topics", "tips", "recommendedResources"]
                }
              },
              required: ["beginner", "intermediate", "advanced"]
            }
          },
          required: ["topic", "overview", "stages"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Path API Error:", error);
    res.status(503).json({ error: handleApiError(error) });
  }
});

// Serve frontend assets via Vite in development, static folder in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduGenie server running on http://localhost:${PORT}`);
  });
}

startServer();
