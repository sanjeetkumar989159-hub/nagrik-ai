/**
 * NAGRIK - Civic Issue Triage & AI Service
 * 
 * IMPORTANT ARCHITECTURE NOTE:
 * This service implements a clean, production-grade interface for automated civic issue
 * categorization and priority assessment.
 * 
 * Current Execution Mode: Local Rule-Based Keyword Matcher (Demo Fallback).
 * 
 * When an external API key (such as Google Gemini or municipal LLM) is configured in settings,
 * calls are routed to the live endpoint. If unconfigured, the system explicitly operates
 * in local heuristic mode and clearly informs the user.
 */

const AI_CONFIG_KEY = 'nagrik_ai_integration_config_v2';

export const CIVIC_CATEGORIES = [
  { 
    id: 'roads', 
    name: 'Roads & Infrastructure', 
    department: 'Public Works Department (PWD)',
    description: 'Potholes, broken footpaths, damaged curbs, road cave-ins'
  },
  { 
    id: 'sanitation', 
    name: 'Sanitation & Solid Waste', 
    department: 'Solid Waste Management (SWM)',
    description: 'Uncollected garbage, overflowing community bins, open dumping'
  },
  { 
    id: 'water', 
    name: 'Water Supply & Drainage', 
    department: 'Municipal Water & Sewerage Board',
    description: 'Pipeline leakage, sewage overflow, contaminated water, blocked drains'
  },
  { 
    id: 'electrical', 
    name: 'Street Lighting & Power', 
    department: 'Electricity Distribution Company (DISCOM)',
    description: 'Non-functional streetlights, sparking wires, exposed junction boxes'
  },
  { 
    id: 'parks', 
    name: 'Public Parks & Amenities', 
    department: 'Horticulture Department',
    description: 'Fallen trees, hazardous play equipment, overgrown vegetation'
  },
  { 
    id: 'traffic', 
    name: 'Traffic & Encroachments', 
    department: 'Traffic Police & Urban Planning',
    description: 'Illegal parking blocking emergency lanes, unauthorized footpath stalls'
  },
  { 
    id: 'other', 
    name: 'General Civic Grievance', 
    department: 'Central Grievance Redressal Cell',
    description: 'Other civic matters not covered above'
  }
];

export function getAiConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }

  return {
    provider: 'local_heuristic', // 'local_heuristic' | 'gemini' | 'custom'
    apiKey: '',
    endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    autoSuggestEnabled: true
  };
}

export function saveAiConfig(config) {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Analyzes grievance text and returns category & priority suggestions.
 * Transparently indicates whether results come from local heuristics or an external API.
 */
export async function triageCivicIssue(title = '', description = '') {
  const config = getAiConfig();
  const text = `${title} ${description}`.toLowerCase().trim();

  // If text is too short, return neutral state
  if (text.length < 5) {
    return {
      suggestedCategory: 'roads',
      suggestedPriority: 'Medium',
      suggestedDepartment: 'Public Works Department (PWD)',
      confidence: null,
      source: 'local_heuristic',
      isLiveApi: false,
      statusLabel: 'Local Heuristic Mode (Waiting for input)',
      matchedKeywords: [],
      reasoning: 'Enter issue details to view automated category suggestions.'
    };
  }

  // If live Gemini API key is configured, invoke endpoint
  if (config.provider === 'gemini' && config.apiKey) {
    try {
      const response = await fetch(`${config.endpointUrl}?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a municipal dispatch assistant. Classify this civic issue: "${title}. ${description}". Respond in JSON with keys: category (one of: roads, sanitation, water, electrical, parks, traffic, other), priority (Low, Medium, High, Emergency), department, reasoning.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Extract JSON from response if available
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            suggestedCategory: parsed.category || 'roads',
            suggestedPriority: parsed.priority || 'Medium',
            suggestedDepartment: parsed.department || 'Public Works Department (PWD)',
            source: 'gemini_api',
            isLiveApi: true,
            statusLabel: 'Google Gemini Live API',
            matchedKeywords: [],
            reasoning: parsed.reasoning || 'Classified using configured Gemini API endpoint.'
          };
        }
      }
    } catch (err) {
      console.warn('External AI API call failed, falling back to local heuristics:', err);
    }
  }

  // --- LOCAL DETERMINISTIC HEURISTICS (Transparent Demo Mode) ---
  const rules = {
    roads: ['pothole', 'road', 'asphalt', 'crater', 'tar', 'curb', 'footpath', 'pavement', 'ditch', 'speed breaker', 'caved'],
    sanitation: ['garbage', 'trash', 'waste', 'dump', 'dustbin', 'bin', 'stench', 'smell', 'plastic', 'litter', 'filth', 'debris'],
    water: ['water', 'pipe', 'leak', 'drain', 'drainage', 'sewage', 'sewer', 'gutter', 'contamination', 'drinking water', 'overflowing'],
    electrical: ['light', 'streetlight', 'lamp', 'dark', 'blackout', 'wire', 'pole', 'electric', 'spark', 'sparks', 'transformer'],
    parks: ['park', 'garden', 'tree', 'branch', 'fallen', 'bench', 'playground', 'swing', 'grass'],
    traffic: ['traffic', 'parking', 'jam', 'congestion', 'encroachment', 'hawker', 'blocked', 'signal', 'sidewalk']
  };

  const emergencyKeywords = ['spark', 'live wire', 'electrocution', 'collapsed', 'gas leak', 'major burst', 'ambulance blocked'];
  const highKeywords = ['pothole', 'accident', 'overflowing sewage', 'deep crater', 'dark alley', 'stagnant', 'school'];

  let matchedCategory = 'roads';
  let highestCount = 0;
  const matchedWords = [];

  for (const [cat, words] of Object.entries(rules)) {
    let count = 0;
    for (const w of words) {
      if (text.includes(w)) {
        count += (title.toLowerCase().includes(w) ? 2 : 1);
        matchedWords.push(w);
      }
    }
    if (count > highestCount) {
      highestCount = count;
      matchedCategory = cat;
    }
  }

  let priority = 'Medium';
  if (emergencyKeywords.some(w => text.includes(w))) {
    priority = 'Emergency';
  } else if (highKeywords.some(w => text.includes(w)) || highestCount >= 3) {
    priority = 'High';
  } else if (text.length < 30) {
    priority = 'Low';
  }

  const categoryObj = CIVIC_CATEGORIES.find(c => c.id === matchedCategory) || CIVIC_CATEGORIES[0];

  return {
    suggestedCategory: categoryObj.id,
    suggestedPriority: priority,
    suggestedDepartment: categoryObj.department,
    source: 'local_heuristic',
    isLiveApi: false,
    statusLabel: 'Local Rule-Based Classifier (Demo Mode)',
    matchedKeywords: [...new Set(matchedWords)].slice(0, 4),
    reasoning: matchedWords.length > 0 
      ? `Matched civic keywords: [${[...new Set(matchedWords)].slice(0, 3).join(', ')}]`
      : 'Default baseline classification based on input length.'
  };
}

