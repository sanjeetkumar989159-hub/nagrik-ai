import { describe, it, expect } from 'vitest';
import {
  classifyCivicComplaint,
  calculateUrgencyAndPriority,
  extractCivicEntities,
  detectLanguage,
  processAssistantTurn
} from '../src/services/civicAssistantEngine';
import { analyzeCivicIssue } from '../src/services/aiClassifier';

describe('NAGRIK AI Civic Classifier & Assistant Engine', () => {
  it('classifies all 8 core civic grievance categories accurately', () => {
    const cases = [
      { text: 'Huge crater pothole on asphalt main road', expected: 'road-damage' },
      { text: 'Burst drinking water pipeline causing outage', expected: 'water-supply' },
      { text: 'Hanging live wire sparking near electric transformer', expected: 'electricity' },
      { text: 'Uncollected garbage dump overflowing near community bin', expected: 'garbage-collection' },
      { text: 'Blocked stormwater drain and raw sewage waterlogging', expected: 'drainage' },
      { text: 'Streetlight poles dark at night on residential lane', expected: 'street-lights' },
      { text: 'Illegal encroachment blocking road with open excavation', expected: 'public-safety' },
      { text: 'Uncleaned public restroom and mosquito breeding stagnant water', expected: 'sanitation' }
    ];

    for (const tc of cases) {
      const result = classifyCivicComplaint(tc.text, '');
      expect(result.categoryId).toBe(tc.expected);
      expect(result.confidence).toBeGreaterThanOrEqual(55);
      expect(result.departmentName).toBeTruthy();
    }
  });

  it('understands Hindi/Hinglish natural language complaints and detects language', () => {
    const hinglish = 'Sector 18 main sadak par bada gaddha hai aur paani bhar gaya hai 3 din se';
    expect(detectLanguage(hinglish)).toBe('hi');

    const analysis = analyzeCivicIssue('', hinglish);
    expect(analysis.category).toBe('road-damage');
    expect(analysis.language).toBe('hi');
    expect(analysis.entities.matchedWard).toContain('Ward 07');
  });

  it('computes transparent rule-based urgency score and priority levels', () => {
    const emergencyText = 'Hanging live wire sparking outside school gate life threatening hazard';
    const emergencyRes = analyzeCivicIssue('Live wire sparking', emergencyText);
    expect(emergencyRes.priority).toBe('Emergency');
    expect(emergencyRes.urgencyScore).toBeGreaterThanOrEqual(80);
    expect(emergencyRes.factors.length).toBeGreaterThanOrEqual(2);

    const lowText = 'Minor faded paint near park bench';
    const lowRes = analyzeCivicIssue('', lowText);
    expect(lowRes.urgencyScore).toBeLessThan(60);
    expect(['Low', 'Medium']).toContain(lowRes.priority);
  });

  it('extracts location, municipal ward, duration, and sensitive zones', () => {
    const msg = 'Sewer overflow near Indiranagar flyover opposite metro pillar for 4 days near school';
    const entities = extractCivicEntities(msg);
    expect(entities.matchedWard).toBe('Ward 04 - Indiranagar');
    expect(entities.duration).toMatch(/4 days/i);
    expect(entities.sensitiveZones).toContain('School / Children');
    expect(entities.locationText).toBeTruthy();
  });

  it('maintains multi-turn conversation context, prunes answered follow-ups, and separates verified facts vs suggestions', () => {
    // Turn 1: Issue mentioned, location and duration missing
    const turn1 = processAssistantTurn(null, 'There is a deep pothole causing accidents');
    expect(turn1.classification.categoryId).toBe('road-damage');
    expect(turn1.guidance.missingInfo).toContain('location');
    expect(turn1.guidance.missingInfo).toContain('duration');

    // Turn 2: User supplies ward, street, and duration in follow-up
    const turn2 = processAssistantTurn(turn1, 'It is near Indiranagar Outer Ring Road for 5 days');
    expect(turn2.classification.categoryId).toBe('road-damage');
    expect(turn2.entities.matchedWard).toBe('Ward 04 - Indiranagar');
    expect(turn2.entities.duration).toMatch(/5 days/i);
    expect(turn2.guidance.missingInfo).not.toContain('location');
    expect(turn2.guidance.missingInfo).not.toContain('duration');
    expect(turn2.guidance.verifiedInformation.length).toBeGreaterThan(0);
    expect(turn2.guidance.aiSuggestions.length).toBeGreaterThan(0);
    expect(turn2.readyToPrefill).toBe(true);
  });

  it('handles empty input gracefully without fabricating confidence', () => {
    const empty = analyzeCivicIssue('', '');
    expect(empty.category).toBe('other');
    expect(empty.confidence).toBe(0);
    expect(empty.isDemoAI).toBe(true);
  });
});

