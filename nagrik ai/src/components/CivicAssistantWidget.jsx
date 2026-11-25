import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Languages,
  ShieldCheck,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { processAssistantTurn } from '../services/civicAssistantEngine';

const QUICK_PROMPTS = [
  {
    label: 'Live Wire Near School',
    text: 'Hanging live electrical wire sparking outside St. Jude School Gate 2 in Ward 12 since morning'
  },
  {
    label: 'Deep Road Pothole',
    text: 'Deep crater pothole on Outer Ring Road near Indiranagar flyover causing bike accidents for 4 days'
  },
  {
    label: 'Sewage & Drain Overflow',
    text: 'Open manhole and raw sewage overflowing near Sector 18 market road causing stench'
  },
  {
    label: 'Hinglish Complaint',
    text: 'Sector 18 main road par 3 din se paani ki pipeline toot gayi hai aur sadak par gaddha ban gaya hai'
  }
];

export function CivicAssistantWidget({
  isOpen,
  onClose,
  onOpen,
  onPrefillComplaint,
  embedded = false
}) {
  const [preferredLang, setPreferredLang] = useState('auto');
  const [inputText, setInputText] = useState('');
  const [assistantState, setAssistantState] = useState(() => ({
    combinedText: '',
    language: 'en',
    classification: null,
    urgency: null,
    entities: null,
    guidance: null,
    readyToPrefill: false,
    messages: [
      {
        id: 'welcome-msg',
        role: 'assistant',
        text: 'Namaste! I am NAGRIK AI Civic Assistant. Describe any civic problem in English or Hindi/Hinglish (e.g., pothole, water leak, sparking wire, garbage, dark streetlight, overflowing drain). I will classify the issue, score urgency transparently, ask follow-ups for missing details, and prepare your complaint.',
        engineMode: 'local_heuristic',
        timestamp: new Date().toISOString()
      }
    ]
  }));

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantState.messages.length]);

  useEffect(() => {
    if (!isOpen || embedded) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, embedded, onClose]);

  const handleSend = (textToSend) => {
    const clean = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!clean) return;

    const nextState = processAssistantTurn(assistantState, clean, preferredLang);
    setAssistantState(nextState);
    if (textToSend === undefined) {
      setInputText('');
    }
  };

  const handleReset = () => {
    setInputText('');
    setAssistantState({
      combinedText: '',
      language: preferredLang === 'hi' ? 'hi' : 'en',
      classification: null,
      urgency: null,
      entities: null,
      guidance: null,
      readyToPrefill: false,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          text:
            preferredLang === 'hi'
              ? 'Naya session shuru ho gaya hai. Kripya apni nagrik samasya aur uska sthan batayein.'
              : 'Started a fresh triage conversation. Describe your civic issue and location to begin.',
          engineMode: 'local_heuristic',
          timestamp: new Date().toISOString()
        }
      ]
    });
  };

  const handleApplyToForm = () => {
    if (!onPrefillComplaint || !assistantState.classification) return;
    const { classification, urgency, entities, combinedText } = assistantState;
    const generatedTitle =
      combinedText.length > 90 ? `${combinedText.slice(0, 87).trim()}...` : combinedText;

    onPrefillComplaint({
      title: generatedTitle,
      description: combinedText,
      category: classification.categoryId,
      subcategory: classification.subcategory,
      severity: urgency?.priority || 'Medium',
      ward: entities?.matchedWard || '',
      address: entities?.locationText || '',
      aiAnalysis: {
        suggestedCategory: classification.categoryName,
        suggestedSeverity: urgency?.priority || 'Medium',
        suggestedDepartment: classification.departmentName,
        urgencyScore: urgency?.urgencyScore,
        isAiSuggestion: true,
        reasoning: `Rule-based civic assistant classification (${classification.confidence}% confidence, urgency ${urgency?.urgencyScore}/100).`
      }
    });
    if (onClose && !embedded) onClose();
  };

  if (!embedded && !isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open NAGRIK AI Civic Assistant"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-lg border border-blue-700 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
      >
        <Bot className="w-4 h-4" aria-hidden="true" />
        <span>AI Civic Assistant</span>
      </button>
    );
  }

  const content = (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate">NAGRIK AI Civic Assistant</h2>
            <p className="text-[11px] text-slate-300 truncate">
              Rule-Based Context-Aware Triage • Bilingual EN/HI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <label htmlFor="assistant-lang-select" className="sr-only">
            Assistant Response Language
          </label>
          <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1 text-[11px]">
            <Languages className="w-3.5 h-3.5 text-blue-300" aria-hidden="true" />
            <select
              id="assistant-lang-select"
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="bg-transparent text-white text-[11px] focus:outline-none"
            >
              <option value="auto" className="text-slate-900">Auto</option>
              <option value="en" className="text-slate-900">English</option>
              <option value="hi" className="text-slate-900">Hindi/Hinglish</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleReset}
            title="Reset conversation"
            aria-label="Reset conversation"
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>

          {!embedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Civic Assistant"
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Transparency Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-[11px] text-blue-950 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-800 flex-shrink-0" aria-hidden="true" />
          <span>
            <strong>Transparent Mode:</strong> Distinguishes verified facts from rule-based AI suggestions.
          </span>
        </span>
      </div>

      {/* Quick Scenario Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mr-1">
          Try sample:
        </span>
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => handleSend(q.text)}
            className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-900 transition-colors"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40"
        aria-live="polite"
      >
        {assistantState.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 text-xs space-y-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>

              {msg.role === 'assistant' && msg.classification && msg.classification.categoryId !== 'other' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* AI Suggestions Section (explicitly labeled) */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-950">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-800" aria-hidden="true" />
                        <span>AI Suggestions (Rule-Based Heuristic)</span>
                      </span>
                      <span className="font-mono text-[10px] bg-blue-100 px-1.5 py-0.5 rounded">
                        {msg.classification.confidence}% conf.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div>
                        Category: <strong className="text-slate-900">{msg.classification.categoryName}</strong>
                      </div>
                      <div>
                        Priority:{' '}
                        <strong
                          className={
                            msg.urgency.priority === 'Emergency'
                              ? 'text-red-700'
                              : msg.urgency.priority === 'High'
                              ? 'text-orange-700'
                              : 'text-slate-900'
                          }
                        >
                          {msg.urgency.priority} ({msg.urgency.urgencyScore}/100)
                        </strong>
                      </div>
                      <div className="col-span-2">
                        Suggested Dept: <strong>{msg.classification.departmentName}</strong> (SLA: {msg.urgency.estimatedSla})
                      </div>
                    </div>

                    {/* Transparent scoring factors */}
                    <div className="text-[10px] text-slate-600 pt-1">
                      Urgency breakdown:{' '}
                      {msg.urgency.factors.map((f) => `${f.rule} (+${f.points})`).join(' • ')}
                    </div>
                  </div>

                  {/* Verified Information Section */}
                  {msg.guidance?.verifiedInformation?.length > 0 && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded p-2.5 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                        <span>Verified Context & Official Directory</span>
                      </div>
                      <ul className="list-disc pl-4 text-[11px] text-emerald-950 space-y-0.5">
                        {msg.guidance.verifiedInformation.map((info, i) => (
                          <li key={i}>{info}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Next Steps */}
                  {msg.guidance?.nextSteps?.length > 0 && (
                    <div className="space-y-1 text-[11px]">
                      <div className="font-semibold text-slate-900">Recommended Next Steps:</div>
                      <ul className="list-disc pl-4 text-slate-700 space-y-0.5">
                        {msg.guidance.nextSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Context Follow-up Questions */}
                  {msg.guidance?.followUpQuestions?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2.5 space-y-1">
                      <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                        <span>Follow-up Details Needed</span>
                      </div>
                      <ul className="list-disc pl-4 text-[11px] text-amber-950 space-y-0.5">
                        {msg.guidance.followUpQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Bar to Pre-Fill Official Complaint Form */}
      {assistantState.classification && assistantState.classification.categoryId !== 'other' && onPrefillComplaint && (
        <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between gap-2">
          <span className="text-[11px] text-emerald-950 font-medium">
            Ready to file under <strong>{assistantState.classification.categoryName}</strong> ({assistantState.urgency?.priority})
          </span>
          <button
            type="button"
            onClick={handleApplyToForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Pre-fill Complaint Form</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex gap-2"
      >
        <label htmlFor="civic-assistant-input" className="sr-only">
          Describe your civic issue or reply to follow-up questions
        </label>
        <input
          id="civic-assistant-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe issue or answer follow-up (e.g. 'Ward 4 Outer Ring Road for 3 days')..."
          className="flex-1 text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          aria-label="Send message to AI Civic Assistant"
          className="px-3.5 py-2 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );

  if (embedded) {
    return <div className="h-[540px]">{content}</div>;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NAGRIK AI Civic Assistant Dialog"
      className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[600px] max-h-[85vh]"
    >
      {content}
    </div>
  );
}

