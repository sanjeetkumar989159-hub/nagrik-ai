/**
 * NAGRIK AI - Intelligent Context-Aware Civic Assistant Engine
 *
 * ARCHITECTURE & TRANSPARENCY:
 * - Deterministic, zero-black-box rule-based NLP engine supporting English, Hinglish, and Hindi keywords.
 * - Classifies into 8 core civic issue domains (+ public-infrastructure / other) aligned with
 *   COMPLAINT_CATEGORIES in complaintsService.js.
 * - Extracts structured context (location, ward match, duration, safety hazards) across multi-turn chats.
 * - Estimates priority & urgency (0-100) using weighted transparent scoring rules.
 * - Generates targeted follow-up questions for missing dispatch fields.
 * - Explicitly separates VERIFIED INFORMATION (from user input & municipal directory) from
 *   AI SUGGESTIONS (heuristic estimates).
 */

import { MUNICIPAL_WARDS } from './storage';

export const CIVIC_CATEGORY_RULES = [
  {
    id: 'road-damage',
    name: 'Road Damage',
    departmentId: 'dept-rmd',
    departmentName: 'Road Maintenance Division',
    helpline: '1913',
    defaultSubcategory: 'Potholes and Craters',
    keywords: [
      { term: 'pothole', weight: 4 },
      { term: 'potholes', weight: 4 },
      { term: 'crater', weight: 4 },
      { term: 'road', weight: 2 },
      { term: 'asphalt', weight: 3 },
      { term: 'tar', weight: 2 },
      { term: 'footpath', weight: 3 },
      { term: 'pavement', weight: 3 },
      { term: 'speed breaker', weight: 3 },
      { term: 'cave-in', weight: 4 },
      { term: 'caved', weight: 4 },
      { term: 'divider', weight: 2 },
      { term: 'curb', weight: 2 },
      { term: 'skid', weight: 2 },
      // Hindi / Hinglish
      { term: 'gaddha', weight: 4 },
      { term: 'gaddhe', weight: 4 },
      { term: 'sadak', weight: 3 },
      { term: 'गड्ढा', weight: 4 },
      { term: 'सड़क', weight: 3 }
    ]
  },
  {
    id: 'water-supply',
    name: 'Water Supply',
    departmentId: 'dept-wsb',
    departmentName: 'Water Supply Department',
    helpline: '1916',
    defaultSubcategory: 'Pipeline Leakage / Burst',
    keywords: [
      { term: 'drinking water', weight: 5 },
      { term: 'water supply', weight: 5 },
      { term: 'pipeline', weight: 4 },
      { term: 'pipe', weight: 3 },
      { term: 'burst pipe', weight: 5 },
      { term: 'leak', weight: 3 },
      { term: 'leakage', weight: 3 },
      { term: 'no water', weight: 5 },
      { term: 'low pressure', weight: 4 },
      { term: 'dirty water', weight: 4 },
      { term: 'contaminated water', weight: 5 },
      { term: 'water outage', weight: 4 },
      { term: 'water', weight: 2 },
      // Hindi / Hinglish
      { term: 'paani', weight: 4 },
      { term: 'pani', weight: 4 },
      { term: 'nal', weight: 3 },
      { term: 'peene ka pani', weight: 5 },
      { term: 'पानी', weight: 4 }
    ]
  },
  {
    id: 'electricity',
    name: 'Electricity',
    departmentId: 'dept-discom',
    departmentName: 'Electricity & Street Lighting Board',
    helpline: '1912',
    defaultSubcategory: 'Hanging Live Wire / Sparking',
    keywords: [
      { term: 'live wire', weight: 5 },
      { term: 'hanging wire', weight: 5 },
      { term: 'spark', weight: 4 },
      { term: 'sparking', weight: 5 },
      { term: 'transformer', weight: 5 },
      { term: 'short circuit', weight: 5 },
      { term: 'electrocution', weight: 5 },
      { term: 'electric pole', weight: 4 },
      { term: 'power cut', weight: 4 },
      { term: 'blackout', weight: 4 },
      { term: 'voltage', weight: 3 },
      { term: 'electricity', weight: 4 },
      { term: 'electric', weight: 3 },
      { term: 'wire', weight: 3 },
      { term: 'current', weight: 3 },
      // Hindi / Hinglish
      { term: 'bijli', weight: 4 },
      { term: 'taar', weight: 4 },
      { term: 'khamba', weight: 3 },
      { term: 'बिजली', weight: 4 },
      { term: 'तार', weight: 4 }
    ]
  },
  {
    id: 'garbage-collection',
    name: 'Waste Management',
    departmentId: 'dept-swm',
    departmentName: 'Sanitation & Solid Waste Management',
    helpline: '1913',
    defaultSubcategory: 'Uncollected Garbage Dump',
    keywords: [
      { term: 'garbage', weight: 4 },
      { term: 'trash', weight: 4 },
      { term: 'waste', weight: 4 },
      { term: 'dustbin', weight: 4 },
      { term: 'community bin', weight: 4 },
      { term: 'dump', weight: 3 },
      { term: 'dumping', weight: 4 },
      { term: 'litter', weight: 3 },
      { term: 'uncollected', weight: 4 },
      { term: 'plastic', weight: 2 },
      { term: 'bio-medical', weight: 5 },
      { term: 'dead animal', weight: 4 },
      // Hindi / Hinglish
      { term: 'kachra', weight: 4 },
      { term: 'kuda', weight: 4 },
      { term: 'kooda', weight: 4 },
      { term: 'कचरा', weight: 4 },
      { term: 'कूड़ा', weight: 4 }
    ]
  },
  {
    id: 'drainage',
    name: 'Drainage',
    departmentId: 'dept-drn',
    departmentName: 'Drainage & Stormwater Board',
    helpline: '1913',
    defaultSubcategory: 'Sewage Overflow on Street',
    keywords: [
      { term: 'drainage', weight: 5 },
      { term: 'drain', weight: 4 },
      { term: 'sewage', weight: 5 },
      { term: 'sewer', weight: 5 },
      { term: 'manhole', weight: 5 },
      { term: 'gutter', weight: 4 },
      { term: 'waterlogging', weight: 5 },
      { term: 'flooding', weight: 4 },
      { term: 'clogged', weight: 4 },
      { term: 'blocked drain', weight: 5 },
      { term: 'stormwater', weight: 4 },
      // Hindi / Hinglish
      { term: 'naali', weight: 5 },
      { term: 'nali', weight: 5 },
      { term: 'ganda pani', weight: 4 },
      { term: 'नाली', weight: 5 }
    ]
  },
  {
    id: 'street-lights',
    name: 'Street Lighting',
    departmentId: 'dept-discom',
    departmentName: 'Electricity & Street Lighting Board',
    helpline: '1912',
    defaultSubcategory: 'Streetlight Not Working (Dark Corridor)',
    keywords: [
      { term: 'streetlight', weight: 5 },
      { term: 'street light', weight: 5 },
      { term: 'streetlights', weight: 5 },
      { term: 'street lamp', weight: 5 },
      { term: 'lamp post', weight: 4 },
      { term: 'light pole', weight: 4 },
      { term: 'dark street', weight: 4 },
      { term: 'dark road', weight: 4 },
      { term: 'flickering', weight: 3 },
      { term: 'no light', weight: 3 },
      { term: 'darkness', weight: 3 },
      // Hindi / Hinglish
      { term: 'andhera', weight: 4 },
      { term: 'batti', weight: 3 },
      { term: 'लाइट', weight: 3 },
      { term: 'अंधेरा', weight: 4 }
    ]
  },
  {
    id: 'public-safety',
    name: 'Public Safety',
    departmentId: 'dept-psd',
    departmentName: 'Public Safety & Encroachment Cell',
    helpline: '112',
    defaultSubcategory: 'Illegal Encroachment Blocking Road',
    keywords: [
      { term: 'public safety', weight: 5 },
      { term: 'encroachment', weight: 4 },
      { term: 'illegal parking', weight: 4 },
      { term: 'excavation', weight: 4 },
      { term: 'collapsed', weight: 4 },
      { term: 'unsafe building', weight: 5 },
      { term: 'warning sign', weight: 3 },
      { term: 'accident prone', weight: 4 },
      { term: 'stray dog', weight: 3 },
      { term: 'harassment', weight: 4 },
      { term: 'traffic jam', weight: 3 },
      { term: 'blocked road', weight: 3 },
      // Hindi / Hinglish
      { term: 'suraksha', weight: 4 },
      { term: 'khatra', weight: 3 },
      { term: 'तिक्रमण', weight: 4 },
      { term: 'खतरा', weight: 3 }
    ]
  },
  {
    id: 'sanitation',
    name: 'Sanitation',
    departmentId: 'dept-swm',
    departmentName: 'Sanitation & Solid Waste Management',
    helpline: '1913',
    defaultSubcategory: 'Mosquito Breeding Stagnant Water',
    keywords: [
      { term: 'sanitation', weight: 5 },
      { term: 'restroom', weight: 5 },
      { term: 'public toilet', weight: 5 },
      { term: 'toilet', weight: 4 },
      { term: 'urination', weight: 4 },
      { term: 'mosquito', weight: 4 },
      { term: 'stagnant water', weight: 4 },
      { term: 'stench', weight: 3 },
      { term: 'foul smell', weight: 3 },
      { term: 'unhygienic', weight: 4 },
      { term: 'hygiene', weight: 4 },
      // Hindi / Hinglish
      { term: 'gandagi', weight: 4 },
      { term: 'safai', weight: 4 },
      { term: 'badboo', weight: 4 },
      { term: 'गंदगी', weight: 4 },
      { term: 'सफाई', weight: 4 }
    ]
  }
];

const EMERGENCY_SIGNALS = [
  { term: 'live wire', points: 45, label: 'Live exposed electrical conductor' },
  { term: 'spark', points: 40, label: 'Active electrical sparking' },
  { term: 'electrocution', points: 50, label: 'Electrocution hazard' },
  { term: 'open manhole', points: 45, label: 'Open / uncovered manhole hazard' },
  { term: 'gas leak', points: 50, label: 'Gas leak emergency' },
  { term: 'collapsed', points: 40, label: 'Structural / road collapse' },
  { term: 'burst pipe', points: 35, label: 'Major pipeline burst' },
  { term: 'life threatening', points: 45, label: 'Immediate life-safety threat' },
  { term: 'dengue', points: 30, label: 'Vector-borne disease risk' },
  { term: 'short circuit', points: 40, label: 'Electrical short-circuit risk' },
  { term: 'contaminated drinking water', points: 38, label: 'Potable water contamination' },
  { term: 'turant', points: 25, label: 'Urgent citizen escalation (Hindi)' }
];

const HIGH_SIGNALS = [
  { term: 'accident', points: 25, label: 'Active accident risk' },
  { term: 'school', points: 20, label: 'School / student proximity' },
  { term: 'hospital', points: 22, label: 'Hospital / ambulance corridor' },
  { term: 'children', points: 18, label: 'Child safety vulnerability' },
  { term: 'overflowing', points: 18, label: 'Continuous overflow' },
  { term: 'flooding', points: 22, label: 'Street waterlogging / flooding' },
  { term: 'blackout', points: 20, label: 'Area power outage' },
  { term: 'toxic', points: 22, label: 'Toxic / health exposure' },
  { term: 'dangerous', points: 18, label: 'Explicit danger reported' },
  { term: 'main road', points: 15, label: 'High-traffic arterial road' },
  { term: 'flyover', points: 15, label: 'High-speed flyover zone' },
  { term: 'contaminated', points: 22, label: 'Contamination reported' },
  { term: 'khatra', points: 20, label: 'Hazard indicator (Hindi)' }
];

const HINDI_MARKERS = [
  'gaddha', 'sadak', 'paani', 'pani', 'bijli', 'taar', 'kachra', 'kuda',
  'naali', 'nali', 'andhera', 'batti', 'gandagi', 'safai', 'badboo',
  'turant', 'khatra', 'din se', 'kal se', 'bhai', 'madad', 'कृपया', 'सड़क', 'पानी', 'बिजली', 'कचरा', 'नाली'
];

/**
 * Detects if message uses Hindi/Hinglish terms or Devanagari script.
 */
export function detectLanguage(text = '') {
  const lower = text.toLowerCase();
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  const hitCount = HINDI_MARKERS.filter((m) => lower.includes(m)).length;
  return hitCount >= 2 ? 'hi' : 'en';
}

/**
 * Extracts structured entities (location, ward, duration, sensitive zones) from natural text.
 */
export function extractCivicEntities(text = '') {
  const clean = String(text || '').trim();
  const lower = clean.toLowerCase();

  // 1. Ward matching against MUNICIPAL_WARDS
  let matchedWard = null;
  for (const w of MUNICIPAL_WARDS) {
    const wardNum = w.name.match(/Ward\s+0?(\d+)/i)?.[1];
    const placeName = w.name.split('-')[1]?.trim().toLowerCase() || '';
    const firstWord = placeName.split(' ')[0];
    if (
      (wardNum && new RegExp(`ward\\s*0?${wardNum}\\b`, 'i').test(clean)) ||
      (firstWord && firstWord.length > 3 && lower.includes(firstWord))
    ) {
      matchedWard = w.name;
      break;
    }
  }

  // 2. Location phrase extraction
  let locationText = null;
  const locPatterns = [
    /(?:near|at|outside|beside|behind|opposite|on|in|ke paas|ke samne)\s+([A-Za-z0-9][A-Za-z0-9\s,.-]{3,55}?)(?=\s+(?:for|since|from|and|causing|with|is|are|has|have|mein|se)\b|[.!?]|$)/i,
    /([A-Za-z0-9\s.-]{2,35}\b(?:Road|Street|Lane|Marg|Chowk|Sector\s*\d+|Phase\s*\d+|Colony|Nagar|Market|Flyover|Gate\s*\d*|Station|Hospital|School|Layout|Hub|Corridor))/i
  ];
  for (const rx of locPatterns) {
    const m = clean.match(rx);
    if (m && m[1] && m[1].trim().length >= 4) {
      locationText = m[1].trim().replace(/[,.]+$/, '');
      break;
    }
  }

  // 3. Duration extraction
  let duration = null;
  const durRx = /(?:for|since|past|last|pichle)?\s*(\d+\s*(?:hours?|hrs?|days?|weeks?|months?|din|ghante|hafte)|yesterday|today|morning|tonight|kal se|aaj se)/i;
  const durMatch = clean.match(durRx);
  if (durMatch) {
    duration = durMatch[0].trim();
  }

  // 4. Sensitive locations / vulnerable groups
  const sensitiveZones = [];
  if (/\b(school|college|students?|children|kids)\b/i.test(clean)) sensitiveZones.push('School / Children');
  if (/\b(hospital|clinic|ambulance|patient)\b/i.test(clean)) sensitiveZones.push('Hospital / Medical Route');
  if (/\b(market|metro|station|bus stop|junction|highway)\b/i.test(clean)) sensitiveZones.push('High-Footfall Public Transit');

  return {
    locationText,
    matchedWard,
    duration,
    sensitiveZones
  };
}

/**
 * Classifies complaint text across the 8+ civic categories with transparent confidence and score table.
 */
export function classifyCivicComplaint(title = '', description = '') {
  const combined = `${title} ${description}`.trim();
  const lowerTitle = String(title || '').toLowerCase();
  const lowerAll = combined.toLowerCase();

  if (!lowerAll) {
    return {
      categoryId: 'other',
      categoryName: 'Other Civic Grievance',
      departmentId: 'dept-pwd',
      departmentName: 'Public Works Department',
      subcategory: 'General Civic Problem',
      helpline: '1913',
      confidence: 0,
      matchedKeywords: [],
      categoryScores: {}
    };
  }

  const categoryScores = {};
  const matchedByCategory = {};

  for (const rule of CIVIC_CATEGORY_RULES) {
    let score = 0;
    const hits = [];
    for (const kw of rule.keywords) {
      if (lowerAll.includes(kw.term)) {
        const multiplier = lowerTitle.includes(kw.term) ? 1.5 : 1;
        score += kw.weight * multiplier;
        hits.push(kw.term);
      }
    }
    categoryScores[rule.id] = Math.round(score * 10) / 10;
    matchedByCategory[rule.id] = [...new Set(hits)];
  }

  // Pick top scoring category
  let bestRule = null;
  let maxScore = 0;
  for (const rule of CIVIC_CATEGORY_RULES) {
    if (categoryScores[rule.id] > maxScore) {
      maxScore = categoryScores[rule.id];
      bestRule = rule;
    }
  }

  if (!bestRule || maxScore === 0) {
    return {
      categoryId: 'other',
      categoryName: 'Other Civic Grievance',
      departmentId: 'dept-pwd',
      departmentName: 'Public Works Department',
      subcategory: 'General Civic Problem',
      helpline: '1913',
      confidence: 45,
      matchedKeywords: [],
      categoryScores
    };
  }

  // Margin over runner-up increases confidence
  const sortedScores = Object.values(categoryScores).sort((a, b) => b - a);
  const margin = sortedScores.length > 1 ? sortedScores[0] - sortedScores[1] : sortedScores[0];
  const confidence = Math.min(98, Math.max(55, Math.round(62 + maxScore * 3 + margin * 2)));

  return {
    categoryId: bestRule.id,
    categoryName: bestRule.name,
    departmentId: bestRule.departmentId,
    departmentName: bestRule.departmentName,
    subcategory: bestRule.defaultSubcategory,
    helpline: bestRule.helpline,
    confidence,
    matchedKeywords: matchedByCategory[bestRule.id].slice(0, 6),
    categoryScores
  };
}

/**
 * Computes transparent urgency score (0-100), priority level, SLA, and exact rule factors.
 */
export function calculateUrgencyAndPriority(text = '', entities = {}, classification = {}) {
  const lower = String(text || '').toLowerCase();
  let score = 20; // Baseline civic report score
  const factors = [{ rule: 'Baseline civic report', points: 20 }];

  for (const sig of EMERGENCY_SIGNALS) {
    if (lower.includes(sig.term)) {
      score += sig.points;
      factors.push({ rule: sig.label, points: sig.points });
    }
  }

  for (const sig of HIGH_SIGNALS) {
    if (lower.includes(sig.term)) {
      score += sig.points;
      factors.push({ rule: sig.label, points: sig.points });
    }
  }

  if (entities?.duration && /(week|month|hafte|\b[3-9]\s*days|\d{2,}\s*days)/i.test(entities.duration)) {
    score += 12;
    factors.push({ rule: `Prolonged unresolved issue (${entities.duration})`, points: 12 });
  }

  if (classification?.confidence >= 80 && classification?.categoryId !== 'other') {
    score += 8;
    factors.push({ rule: 'High-clarity category evidence', points: 8 });
  }

  const urgencyScore = Math.min(99, Math.max(15, score));

  let priority = 'Low';
  let estimatedSla = '5 - 7 Days';
  if (urgencyScore >= 80) {
    priority = 'Emergency';
    estimatedSla = '2 - 6 Hours';
  } else if (urgencyScore >= 60) {
    priority = 'High';
    estimatedSla = '12 - 24 Hours';
  } else if (urgencyScore >= 35) {
    priority = 'Medium';
    estimatedSla = '2 - 4 Days';
  }

  return {
    urgencyScore,
    priority,
    estimatedSla,
    factors
  };
}

/**
 * Generates actionable next steps and missing-information follow-up questions.
 */
export function buildGuidanceAndFollowUps(classification, urgency, entities, combinedText, lang = 'en') {
  const isHi = lang === 'hi';
  const missingInfo = [];
  const followUpQuestions = [];

  if (!combinedText || combinedText.trim().length < 15) {
    missingInfo.push('issue_details');
    followUpQuestions.push(
      isHi
        ? 'Kripya samasya ka thoda vistar batayein (kya toot gaya hai ya kya khatra hai)?'
        : 'Could you briefly describe what happened or the visible damage/hazard?'
    );
  }

  if (!entities.locationText && !entities.matchedWard) {
    missingInfo.push('location');
    followUpQuestions.push(
      isHi
        ? 'Yeh samasya kis road, landmark ya Municipal Ward ke paas hai?'
        : 'Where exactly is this issue located (street name, nearby landmark, or Municipal Ward)?'
    );
  }

  if (!entities.duration) {
    missingInfo.push('duration');
    followUpQuestions.push(
      isHi
        ? 'Yeh samasya kitne dinon se chal rahi hai?'
        : 'How long has this issue been ongoing (e.g., since today or 3 days)?'
    );
  }

  const nextSteps = [];
  if (urgency.priority === 'Emergency') {
    nextSteps.push(
      isHi
        ? `Aapattkalin Chetavani: Khatre se surakshit doori banayein aur turant helpline ${classification.helpline} ya 112 par call karein.`
        : `Safety First: Keep pedestrians clear of the hazard and alert Municipal Emergency Helpline ${classification.helpline} (or 112) immediately.`
    );
  }

  nextSteps.push(
    isHi
      ? `Is shikayat ko "${classification.departmentName}" ke paas bhejne ki salah di jaati hai (Anumanit SLA: ${urgency.estimatedSla}).`
      : `Recommended Municipal Routing: ${classification.departmentName} (Estimated SLA: ${urgency.estimatedSla}).`
  );

  nextSteps.push(
    isHi
      ? 'Behtar satyapan ke liye ghatnasthal ki photo upload karein aur map par GPS pin set karein.'
      : 'Attach an on-site photograph (<5 MB) and pin exact GPS coordinates on the map for faster field crew dispatch.'
  );

  // Strict separation between Verified Information and AI Suggestions
  const verifiedInformation = [];
  if (entities.locationText) verifiedInformation.push(`Location reported by you: "${entities.locationText}"`);
  if (entities.matchedWard) verifiedInformation.push(`Matched municipal jurisdiction: ${entities.matchedWard}`);
  if (entities.duration) verifiedInformation.push(`Reported duration: ${entities.duration}`);
  verifiedInformation.push(`Official directory helpline for ${classification.categoryName}: ${classification.helpline}`);

  const aiSuggestions = [
    `Suggested Category: ${classification.categoryName} (${classification.confidence}% rule confidence)`,
    `Estimated Urgency: ${urgency.priority} (${urgency.urgencyScore}/100)`,
    `Suggested Department: ${classification.departmentName}`
  ];

  return {
    missingInfo,
    followUpQuestions,
    nextSteps,
    verifiedInformation,
    aiSuggestions
  };
}

/**
 * Multi-turn conversational processor for NAGRIK AI Civic Assistant.
 * Merges new user input into conversation state, updates classification & extracted facts,
 * and formats a structured, context-aware assistant response.
 */
export function processAssistantTurn(prevState, userMessage, preferredLang = 'auto') {
  const cleanMsg = String(userMessage || '').trim();
  const prevCombined = prevState?.combinedText || '';
  const combinedText = prevCombined ? `${prevCombined}. ${cleanMsg}` : cleanMsg;

  const lang = preferredLang === 'auto'
    ? detectLanguage(combinedText)
    : preferredLang;

  const entities = extractCivicEntities(combinedText);
  const classification = classifyCivicComplaint('', combinedText);
  const urgency = calculateUrgencyAndPriority(combinedText, entities, classification);
  const guidance = buildGuidanceAndFollowUps(classification, urgency, entities, combinedText, lang);

  const isHi = lang === 'hi';
  let replySummary = '';
  if (classification.categoryId === 'other' && combinedText.length < 15) {
    replySummary = isHi
      ? 'Namaste! Main NAGRIK AI Sahayak hoon. Kripya apni nagrik samasya (jaise sadak gaddha, paani, bijli, kachra, ya naali) aur uska sthan batayein.'
      : 'Hello! I am the NAGRIK AI Civic Assistant. Describe the civic problem (road, water, electricity, garbage, drainage, streetlight, safety, or sanitation) and its location so I can classify urgency and prepare your ticket.';
  } else {
    replySummary = isHi
      ? `Maine aapki samasya ko "${classification.categoryName}" ke roop mein pehchana hai (${urgency.priority} prathmikta, Urgency Score ${urgency.urgencyScore}/100).`
      : `I have classified this issue under ${classification.categoryName} with ${urgency.priority} priority (Urgency Score: ${urgency.urgencyScore}/100, Engine: Rule-Based Heuristic).`;
  }

  const userTurn = {
    id: `msg-u-${Date.now()}`,
    role: 'user',
    text: cleanMsg,
    timestamp: new Date().toISOString()
  };

  const assistantTurn = {
    id: `msg-a-${Date.now() + 1}`,
    role: 'assistant',
    text: replySummary,
    language: lang,
    classification,
    urgency,
    entities,
    guidance,
    engineMode: 'local_heuristic',
    timestamp: new Date().toISOString()
  };

  return {
    combinedText,
    language: lang,
    classification,
    urgency,
    entities,
    guidance,
    readyToPrefill: Boolean(combinedText.length >= 15 && classification.categoryId !== 'other'),
    messages: [...(prevState?.messages || []), userTurn, assistantTurn]
  };
}

