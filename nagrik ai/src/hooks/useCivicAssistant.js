import { useMemo } from 'react';
import { analyzeCivicIssue } from '../services/aiClassifier';

/**
 * useCivicAssistant - React hook wrapping the deterministic civic NLP & priority engine.
 * Memoized on title & description for fast re-renders.
 */
export function useCivicAssistant(title = '', description = '') {
  return useMemo(() => {
    const safeTitle = typeof title === 'string' ? title : '';
    const safeDesc = typeof description === 'string' ? description : '';
    return analyzeCivicIssue(safeTitle, safeDesc);
  }, [title, description]);
}
