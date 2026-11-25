import { GoogleGenerativeAI } from '@google/generative-ai';
import { COMPLAINT_CATEGORIES } from './complaintsService';
import { DEFAULT_DEPARTMENTS } from './departmentService';

function getGeminiApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();

  try {
    const stored = localStorage.getItem('nagrik_gemini_api_key');
    if (stored && stored.trim().length > 0) return stored.trim();
  } catch (e) {
    // ignore
  }

  return null;
}

export function isGeminiConfigured() {
  const key = getGeminiApiKey();
  return Boolean(key && key !== 'your_gemini_api_key' && key.length > 10);
}

export function saveRuntimeGeminiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem('nagrik_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('nagrik_gemini_api_key');
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Real Gemini API Analysis
 * Performs multimodal categorization, severity estimation, department routing,
 * and duplicate detection using Google's Gemini models.
 */
export async function analyzeComplaintWithGemini(
  title, 
  description, 
  imageBase64 = null, 
  recentComplaints = []
) {
  if (!isGeminiConfigured()) {
    return {
      isAvailable: false,
      status: 'UNCONFIGURED',
      error: 'Google Gemini API key not configured in .env. Real AI analysis requires a valid API key from Google AI Studio.'
    };
  }

  const apiKey = getGeminiApiKey();
  const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const categoryList = COMPLAINT_CATEGORIES.map(c => c.name).join(', ');
    const departmentList = DEFAULT_DEPARTMENTS.map(d => d.name).join(', ');

    // Sample recent complaints summary for duplicate detection
    const recentSample = recentComplaints.slice(0, 8).map(c => ({
      id: c.id,
      title: c.title,
      category: c.categoryName,
      ward: c.ward
    }));

    const systemPrompt = `You are an expert municipal grievance triage officer.
Analyze this civic issue report submitted by a citizen:
Issue Title: "${title}"
Issue Description: "${description}"

Allowed Categories: [${categoryList}]
Allowed Departments: [${departmentList}]

Recent Complaints in the same city for duplicate check:
${JSON.stringify(recentSample)}

Evaluate and return valid JSON with the following schema:
{
  "suggestedCategory": "Exact match from Allowed Categories",
  "suggestedSeverity": "Low" | "Medium" | "High" | "Emergency",
  "suggestedDepartment": "Exact match from Allowed Departments",
  "summary": "1 concise sentence summarizing the core physical problem",
  "isPotentialDuplicate": boolean,
  "duplicateComplaintId": "ID if duplicate found, else null",
  "reasoning": "1 sentence explanation citing detected hazard factors"
}`;

    const parts = [{ text: systemPrompt }];

    // If an image was provided, add multimodal inline data
    if (imageBase64 && imageBase64.includes(',')) {
      const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
      const base64Data = imageBase64.split(',')[1];
      if (base64Data && mimeType) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }
    }

    const result = await model.generateContent(parts);
    const textResponse = result.response.text();
    const parsed = JSON.parse(textResponse);

    return {
      isAvailable: true,
      status: 'SUCCESS',
      isAiSuggestion: true,
      modelUsed: modelName,
      generatedAt: new Date().toISOString(),
      suggestedCategory: parsed.suggestedCategory || 'Road Damage',
      suggestedSeverity: parsed.suggestedSeverity || 'Medium',
      suggestedDepartment: parsed.suggestedDepartment || 'Public Works Department',
      summary: parsed.summary || title,
      isPotentialDuplicate: Boolean(parsed.isPotentialDuplicate),
      duplicateComplaintId: parsed.duplicateComplaintId || null,
      reasoning: parsed.reasoning || 'Evaluated using Google Gemini model.'
    };
  } catch (err) {
    console.error('Gemini API call failed:', err);
    return {
      isAvailable: false,
      status: 'API_ERROR',
      error: `Gemini API request failed: ${err.message || 'Unknown network error'}`
    };
  }
}

