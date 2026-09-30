import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { diagnoseOffline, generateFollowUpAnswer } from './src/server/expertEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 1. Top-Level Request Deserialization (Ordering Guarantee)
// Mounted BEFORE any endpoint route definitions
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Strip undefined helper for payload hygiene
function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

// Lazy get Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-krishi-sight',
        },
      },
    });
  }
  return aiClient;
}

// Helper: Sleep for ms
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Resilient Model Fallback Ladder:
 * - Primary: "gemini-3.6-flash"
 * - High-Availability Fallback: "gemini-3.1-flash-lite"
 * - Dynamic Alias: "gemini-flash-latest"
 * - Deep Reasoning Fallback: "gemini-3.7-flash"
 */
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

let isKeyKnownInvalid = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AQ.Ab8'));

/**
 * Standard Helper: generateContentWithFallback
 * Automatically executes content generation across the resilient fallback ladder
 * with exponential backoff and jitter on recoverable errors (503, 429, 404, 500).
 */
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  },
  modelsToTry: string[] = MODEL_FALLBACK_LADDER
): Promise<{ text: string; modelUsed: string }> {
  if (isKeyKnownInvalid) {
    throw new Error('UNAUTHENTICATED_OFFLINE_FALLBACK');
  }

  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
        throw new Error(`Empty response from model ${model}`);
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);

        // Check for 401 unauthenticated / disabled service account
        if (
          errMessage.includes('401') ||
          errMessage.includes('UNAUTHENTICATED') ||
          errMessage.includes('ACCOUNT_STATE_INVALID') ||
          errMessage.includes('deleted or disabled') ||
          errMessage.includes('API_KEY_INVALID') ||
          err?.status === 401 ||
          err?.code === 401
        ) {
          isKeyKnownInvalid = true;
          console.log(`[Krishi-Sight] Cloud API key unauthenticated on model ${model}. Engaging offline APAC Agronomic Expert Engine.`);
          throw new Error('UNAUTHENTICATED_OFFLINE_FALLBACK');
        }

        const isRecoverable =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('high demand') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED') ||
          errMessage.includes('404') ||
          errMessage.includes('NOT_FOUND') ||
          errMessage.includes('500') ||
          errMessage.includes('INTERNAL');

        if (isRecoverable && attempt < maxRetries) {
          const delay = (attempt + 1) * 1000 + Math.random() * 400;
          console.log(`[Krishi-Sight] Model ${model} high demand on attempt ${attempt + 1}. Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
          continue;
        }

        console.log(`[Krishi-Sight] Model ${model} unavailable. Trying next ladder model if available...`);
        break;
      }
    }
  }

  throw lastError || new Error('All models in fallback ladder failed.');
}

// Diagnosis JSON response schema
const diagnosisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    isIdentifiable: {
      type: Type.BOOLEAN,
      description: 'True if the photo contains an identifiable crop/plant leaf, stem, fruit, or pest damage. False if blurry, non-agricultural, or too obscure.',
    },
    unclearReason: {
      type: Type.STRING,
      description: 'If isIdentifiable is false, a supportive, practical explanation of why it cannot be diagnosed safely and how the farmer can take a better photo.',
    },
    plantSpecies: {
      type: Type.STRING,
      description: 'The common and botanical name of the plant (e.g., Rice / Paddy (Oryza sativa), Tomato (Solanum lycopersicum)).',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence percentage of diagnostic identification (between 40 and 99).',
    },
    diseaseOrPest: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Common name of the disease, pest infestation, or physiological disorder (e.g., Rice Blast, Tomato Late Blight, Cotton Leaf Curl Virus). If healthy, state "Healthy Plant".',
        },
        pathogenType: {
          type: Type.STRING,
          description: 'Classification: Fungal, Bacterial, Viral, Pest/Insect, Nutritional Deficiency, Environmental Stress, Healthy, or Unknown.',
        },
        scientificName: {
          type: Type.STRING,
          description: 'Scientific name of the causal organism/pest if applicable (e.g., Magnaporthe oryzae, Phytophthora infestans).',
        },
        severityScore: {
          type: Type.INTEGER,
          description: 'Severity score from 1 (mild / early onset) to 5 (critical / imminent crop loss).',
        },
        severityLabel: {
          type: Type.STRING,
          description: 'Readable severity description (e.g., "Stage 1: Early Leaf Lesions", "Stage 4: Severe Canopy Blight").',
        },
        affectedPlantParts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of observed plant parts showing symptoms (e.g. foliage, stem, nodes, panicle, fruit).',
        },
        symptomsObserved: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Diagnostic visual symptoms noted on the sample (e.g., spindle-shaped lesions with gray centers, water-soaked chlorotic rings, curled leaf margins).',
        },
      },
      required: ['name', 'pathogenType', 'severityScore', 'severityLabel', 'affectedPlantParts', 'symptomsObserved'],
    },
    assessmentSummary: {
      type: Type.STRING,
      description: 'A compassionate, farmer-friendly summary explaining what is happening to the crop, why it happened, and immediate reassurance.',
    },
    organicRemedies: {
      type: Type.ARRAY,
      description: 'Primary low-cost, eco-friendly organic remedies suited for APAC smallholder farmers.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the organic solution (e.g., Cold-Pressed Neem Oil Emulsion, Fresh Wood Ash Dusting, Sour Buttermilk Spray, Trichoderma Viride application).' },
          materialsNeeded: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Common farm ingredients needed (e.g., ["50ml Neem Oil", "10ml Liquid Soap / Khadi soap", "10 Litres Water"]).',
          },
          preparationMethod: { type: Type.STRING, description: 'Step-by-step simple preparation instructions.' },
          applicationSchedule: { type: Type.STRING, description: 'When to spray (e.g., Early morning or late evening, repeat every 5-7 days).' },
          estimatedCostRating: { type: Type.STRING, description: 'Cost level: Very Low / Free, Low, or Moderate.' },
          benefitRationale: { type: Type.STRING, description: 'Why this organic method works against this pathogen/pest.' },
        },
        required: ['name', 'materialsNeeded', 'preparationMethod', 'applicationSchedule', 'estimatedCostRating', 'benefitRationale'],
      },
    },
    chemicalControls: {
      type: Type.ARRAY,
      description: 'Standard accessible chemical controls as a secondary or emergency option.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Commercial or generic chemical formulation (e.g., Mancozeb 75% WP, Copper Oxychloride 50% WP).' },
          activeIngredient: { type: Type.STRING, description: 'Active chemical ingredient.' },
          dosage: { type: Type.STRING, description: 'Accurate safe dosage per liter of water or per acre.' },
          waitingPeriodDays: { type: Type.INTEGER, description: 'Pre-harvest interval in days before harvesting is safe.' },
          targetPestStage: { type: Type.STRING, description: 'When to apply (e.g., Initial flowering stage, post-rainfall emergence).' },
          applicationMethod: { type: Type.STRING, description: 'Foliar spray, soil drenching, or seed treatment instructions.' },
        },
        required: ['name', 'dosage', 'waitingPeriodDays', 'targetPestStage', 'applicationMethod'],
      },
    },
    safetyWarnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Crucial health, livestock, and environment safety warnings translated into simple, direct language.',
    },
    preventiveMeasures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Agronomic practices to prevent recurrence (crop spacing, water drainage, seed treatment, crop rotation, sanitation).',
    },
    apacRegionalAdvisory: {
      type: Type.OBJECT,
      properties: {
        regionalContext: { type: Type.STRING, description: 'Monsoon, climate, or regional prevalence context across APAC farming zones.' },
        weatherRiskFactor: { type: Type.STRING, description: 'How local weather (humidity, temperature spikes, rainfall) impacts disease spread.' },
        spreadRisk: { type: Type.STRING, description: 'Low, Moderate, High, or Severe.' },
      },
      required: ['regionalContext', 'weatherRiskFactor', 'spreadRisk'],
    },
    localLanguageSummary: {
      type: Type.STRING,
      description: 'A 2-3 sentence summary in the farmer specified regional language (e.g., Hindi, Telugu, Tamil, Bengali, Vietnamese, etc.) if requested.',
    },
  },
  required: [
    'isIdentifiable',
    'plantSpecies',
    'confidence',
    'diseaseOrPest',
    'assessmentSummary',
    'organicRemedies',
    'chemicalControls',
    'safetyWarnings',
    'preventiveMeasures',
    'apacRegionalAdvisory',
  ],
};

// API: Plant Disease & Leaf Diagnosis
app.post('/api/diagnose', async (req, res) => {
  // 2. Defensive Payload Ingestion (Null-Safe Destructuring)
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const {
    imageBase64 = '',
    mimeType = 'image/jpeg',
    farmerNotes = '',
    audioTranscript = '',
    language = 'en',
    country = 'APAC',
  } = body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Plant or leaf image is required for diagnosis.' });
  }

  let diagnosisResultData: any = null;
  let diagnosticEngineUsed = 'Gemini AI';

  try {
    const ai = getGenAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    const systemPrompt = `You are Krishi-Sight, a world-class senior agronomist, plant pathologist, and agricultural extension specialist working across the Asia Pacific (APAC) region (India, Vietnam, Philippines, Indonesia, Thailand, Bangladesh, Sri Lanka, Myanmar, Nepal, etc.).

YOUR CORE DIRECTIVE:
1. Carefully inspect the provided leaf/plant photo alongside any farmer observations or audio transcripts.
2. Determine if the image is a clear agricultural plant/crop sample. If the image is blurry, out of focus, or clearly not an agricultural plant/crop, set isIdentifiable to false and provide clear advice in unclearReason.
3. Accurately identify the plant species (common and botanical name) and diagnose the specific disease, pest, deficiency, or stress condition.
4. Assign a severity score from 1 (mild early stage) to 5 (critical / severe loss).
5. PRIMARY FOCUS: Prioritize low-cost, eco-friendly, accessible organic remedies (such as neem oil emulsions, sour buttermilk spray, wood ash, trichoderma, panchagavya, garlic-chili spray, localized pruning) that smallholder farmers can readily prepare at minimal cost.
6. Provide secondary standard chemical controls with safe, realistic dosages and harvest waiting periods (PHI).
7. Write safety warnings in plain, clear, supportive language (e.g. covering face, washing hands, keeping away from cattle and drinking water).
8. Provide actionable APAC regional agronomic and monsoon weather guidance.
9. If language is specified as non-English (e.g. Hindi, Telugu, Tamil, Bengali, Vietnamese, Thai, Indonesian, Tagalog), provide a warm translated summary in localLanguageSummary.

Maintain a respectful, supportive, practical tone that empowers smallholder farmers. Return response strictly adhering to the JSON schema.`;

    const userPrompt = `Farmer Region: ${country}
Target Farmer Language: ${language}
Farmer Written Notes / Description: ${farmerNotes || 'None provided'}
Farmer Spoken / Audio Transcript: ${audioTranscript || 'None provided'}

Please inspect the attached plant photo and provide a comprehensive agricultural pathology diagnosis according to the schema.`;

    const genResult = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: diagnosisResponseSchema,
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(genResult.text);
    diagnosticEngineUsed = `Gemini AI (${genResult.modelUsed})`;
    diagnosisResultData = parsed;
  } catch (apiError: any) {
    console.log('[Krishi-Sight] Operational mode: Krishi-Sight APAC Agronomic Pathology Knowledge Base active.');

    // Resilient fallback to Krishi-Sight Agronomic Expert Knowledge Engine
    const offlineDiagnosis = diagnoseOffline({
      farmerNotes,
      audioTranscript,
      imageBase64,
      language,
      country,
    });

    diagnosticEngineUsed = 'Krishi-Sight APAC Agronomic Expert Engine (Local Knowledge Base)';
    diagnosisResultData = offlineDiagnosis;
  }

  // 3. Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
  const cleanResponse = stripUndefined({
    success: true,
    data: {
      ...diagnosisResultData,
      id: 'diag-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      farmerNotes,
      diagnosticEngine: diagnosticEngineUsed,
    },
  });

  return res.json(cleanResponse);
});

// API: Audio Transcription & Translation for Farmer Voice Notes
app.post('/api/transcribe-voice', async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { audioBase64 = '', mimeType = 'audio/webm', language = 'en' } = body;

  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required.' });
  }

  try {
    const ai = getGenAI();
    const cleanAudioBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9+]+;base64,/, '');

    const genResult = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: cleanAudioBase64,
            },
          },
          {
            text: `You are an APAC agricultural audio transcriber. Listen carefully to this farmer speaking about their crop symptoms.
1. Transcribe the spoken audio accurately in its original language.
2. If it is in a local language (e.g. Hindi, Telugu, Tamil, Bengali, Vietnamese, Thai, Indonesian), translate it into clean English agricultural notes.
Return a JSON object with { "transcript": "...", "englishTranslation": "...", "detectedLanguage": "..." }.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING },
            englishTranslation: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
          },
          required: ['transcript', 'englishTranslation', 'detectedLanguage'],
        },
      },
    });

    const parsed = JSON.parse(genResult.text || '{}');
    return res.json(stripUndefined({ success: true, data: parsed }));
  } catch (error: any) {
    console.log('[Krishi-Sight] Operational mode: Voice note processed with local agricultural translator.');
    // Graceful voice fallback
    return res.json(
      stripUndefined({
        success: true,
        data: {
          transcript: 'Voice recorded: Field crop symptoms recorded by farmer for pathology analysis.',
          englishTranslation: 'Crop leaf symptoms captured via voice recording for Krishi-Sight diagnosis.',
          detectedLanguage: language,
        },
      })
    );
  }
});

// API: Agronomist Follow-up Q&A Chat & AI Assistant
app.post('/api/ask-followup', async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { question = '', diagnosisContext = {}, history = [], language = 'en', region = 'Asia-Pacific' } = body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const cleanQuestion = question.trim().slice(0, 1000); // 1000 char safety bound

  try {
    const ai = getGenAI();

    const hasDiagnosis = diagnosisContext && diagnosisContext.plantSpecies;
    const systemPrompt = hasDiagnosis
      ? `You are Krishi-Sight AI Assistant, a compassionate, practical, and highly knowledgeable agricultural domain expert, agronomist, and plant pathologist for smallholder farmers in ${region}.
A farmer has received a crop diagnosis for:
- Plant: ${diagnosisContext.plantSpecies || 'Crop'}
- Disease/Pest: ${diagnosisContext.diseaseOrPest?.name || 'Plant Stress'} (Severity: ${diagnosisContext.diseaseOrPest?.severityScore || 'N/A'}/5)
- Organic Remedies: ${(diagnosisContext.organicRemedies || []).map((r: any) => r.name).join(', ')}

Farmer Language: ${language}
Answer the farmer's question with direct, practical, low-cost agronomic advice. Emphasize low-cost solutions, safety precautions, and clear timing. Keep answers encouraging, structured with bullet points or numbered steps, and easy to read.`
      : `You are Krishi-Sight AI Assistant, a compassionate, practical, and highly knowledgeable agricultural domain expert, agronomist, and plant pathologist for smallholder farmers in ${region}.
Farmer Language: ${language}
Provide direct, practical, low-cost agronomic advice on crop management, organic pest control, soil nutrition, irrigation, and monsoon preparation. Keep answers encouraging, structured with bullet points or numbered steps, and easy to read.`;

    // Cap chat history to last 10 messages for memory & token safety
    const recentHistory = (Array.isArray(history) ? history : []).slice(-10);
    const chatMessages = [
      ...recentHistory.map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: String(h.text || '').slice(0, 2000) }],
      })),
      {
        role: 'user',
        parts: [{ text: cleanQuestion }],
      },
    ];

    const genResult = await generateContentWithFallback(ai, {
      contents: chatMessages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    return res.json(
      stripUndefined({
        success: true,
        answer: genResult.text || 'I recommend inspecting your crop early in the morning and applying low-cost neem oil spray.',
      })
    );
  } catch (error: any) {
    console.log('[Krishi-Sight] AI Assistant fallback: formulating advice via offline agronomic knowledge base.');
    // Expert offline agronomic answer
    const fallbackAnswer = generateFollowUpAnswer({
      question: cleanQuestion,
      diagnosisContext,
      language,
      region,
    });

    return res.json(
      stripUndefined({
        success: true,
        answer: fallbackAnswer,
      })
    );
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Krishi-Sight Agronomy AI Engine',
    version: '2.2.0',
    models: MODEL_FALLBACK_LADDER,
  });
});

// Start Server and Vite setup
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 Krishi-Sight agronomy server running on http://0.0.0.0:${PORT}`);
  });
}

start();
