/**
 * NAGRIK AI - Client-Side Heuristic Classification Engine
 *
 * Delegates to the unified civicAssistantEngine so all category IDs,
 * urgency scores, SLAs, and department mappings match COMPLAINT_CATEGORIES
 * cleanly across the application and tests.
 */

import {
  CIVIC_CATEGORY_RULES,
  classifyCivicComplaint,
  calculateUrgencyAndPriority,
  extractCivicEntities,
  buildGuidanceAndFollowUps,
  detectLanguage
} from './civicAssistantEngine';

export const CIVIC_CATEGORIES = [
  ...CIVIC_CATEGORY_RULES.map((r) => ({
    id: r.id,
    name: r.name,
    defaultDept: r.departmentName
  })),
  { id: 'public-infrastructure', name: 'Public Infrastructure', defaultDept: 'Public Works Department' },
  { id: 'other', name: 'Other Civic Grievance', defaultDept: 'Public Works Department' }
];

/**
 * Analyzes issue title and description to produce transparent heuristic intelligence:
 * Category, Confidence, Severity/Priority, Urgency Score (0-100), SLA, Department,
 * Follow-up questions, Extracted entities, and Verified vs Suggested breakdown.
 */
export function analyzeCivicIssue(title = '', description = '') {
  const combined = `${title} ${description}`.trim();

  if (!combined) {
    return {
      category: 'other',
      categoryName: 'Other Civic Grievance',
      subcategory: 'General Civic Problem',
      confidence: 0,
      severity: 'Medium',
      priority: 'Medium',
      urgencyScore: 40,
      estimatedSla: '2 - 4 Days',
      department: 'Public Works Department',
      departmentId: 'dept-pwd',
      tags: ['Awaiting Description'],
      factors: [{ rule: 'Baseline triage level', points: 40 }],
      entities: { locationText: null, matchedWard: null, duration: null, sensitiveZones: [] },
      followUpQuestions: ['Describe the civic problem and specify the street/ward location.'],
      nextSteps: ['Enter at least 15 characters describing the issue for automated classification.'],
      verifiedInformation: [],
      aiSuggestions: [],
      isDemoAI: true,
      engineName: 'NAGRIK Deterministic Rule Engine (Offline-Ready)',
      reasoning: 'Insufficient text to compute granular heuristics. Using baseline triage level.'
    };
  }

  const lang = detectLanguage(combined);
  const entities = extractCivicEntities(combined);
  const classification = classifyCivicComplaint(title, description);
  const urgency = calculateUrgencyAndPriority(combined, entities, classification);
  const guidance = buildGuidanceAndFollowUps(classification, urgency, entities, combined, lang);

  const tags = [];
  if (urgency.priority === 'Emergency') tags.push('Public Safety Emergency');
  if (urgency.priority === 'High') tags.push('Priority Municipal SLA');
  if (classification.matchedKeywords.length > 0) {
    tags.push(`Matched: ${classification.matchedKeywords.slice(0, 3).join(', ')}`);
  }
  tags.push(`Route: ${classification.departmentName}`);

  return {
    category: classification.categoryId,
    categoryName: classification.categoryName,
    subcategory: classification.subcategory,
    confidence: classification.confidence,
    severity: urgency.priority,
    priority: urgency.priority,
    urgencyScore: urgency.urgencyScore,
    estimatedSla: urgency.estimatedSla,
    department: classification.departmentName,
    departmentId: classification.departmentId,
    helpline: classification.helpline,
    matchedKeywords: classification.matchedKeywords,
    tags,
    factors: urgency.factors,
    entities,
    language: lang,
    followUpQuestions: guidance.followUpQuestions,
    nextSteps: guidance.nextSteps,
    verifiedInformation: guidance.verifiedInformation,
    aiSuggestions: guidance.aiSuggestions,
    isDemoAI: true,
    engineName: 'NAGRIK Deterministic Rule Engine (Offline-Ready)',
    reasoning:
      classification.matchedKeywords.length > 0
        ? `Classified as ${classification.categoryName} (${urgency.priority}, ${urgency.urgencyScore}/100) from indicators [${classification.matchedKeywords.slice(0, 4).join(', ')}].`
        : `No domain-specific keywords matched; routed to ${classification.departmentName} for manual review.`
  };
}

export const DEMO_AI_PRESETS = [
  {
    title: 'Deep crater pothole on Ring Road near flyover causing vehicle skids',
    description: 'A 2-foot deep crater has opened up on the right lane of Outer Ring Road in Ward 4. Vehicles are swerving dangerously and an accident happened this morning.',
    label: 'Road Damage (High)'
  },
  {
    title: 'Hanging live electrical wire sparking near St. Jude School gate',
    description: 'During yesterday storm, a power line snapped from the pole and is hanging 4 feet above the pavement beside the school gate. Sparks are visible. Life threatening hazard!',
    label: 'Electrical Hazard (Emergency)'
  },
  {
    title: 'Severe sewage overflow from open manhole near Market Road',
    description: 'Main drainage manhole has burst and raw black sewage water is overflowing onto Sector 18 shopping lane for 3 days. Foul stench and waterlogging.',
    label: 'Drainage Overflow (Emergency)'
  },
  {
    title: 'Streetlights not working on Green Glen dark corridor for 5 days',
    description: 'Four LED streetlight poles near Green Glen Ward 12 have been completely dark at night causing safety risk for pedestrians.',
    label: 'Street Lighting (High)'
  }
];
