import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  Cpu, 
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';
import { getAiConfig, saveAiConfig } from '../services/aiService';

export function AiSettingsPage() {
  const [config, setConfig] = useState(getAiConfig());
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('local_heuristic');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const loaded = getAiConfig();
    setConfig(loaded);
    setApiKey(loaded.apiKey || '');
    setProvider(loaded.provider || 'local_heuristic');
    setEndpointUrl(loaded.endpointUrl || '');
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...config,
      provider,
      apiKey: apiKey.trim(),
      endpointUrl: endpointUrl.trim()
    };
    saveAiConfig(updated);
    setConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    if (provider === 'local_heuristic') {
      setTimeout(() => {
        setTesting(false);
        setTestResult({
          success: true,
          message: 'Local heuristic engine is active. Deterministic municipal keyword matching is operating normally with zero external network dependencies.'
        });
      }, 400);
      return;
    }

    if (!apiKey.trim()) {
      setTesting(false);
      setTestResult({
        success: false,
        message: 'Please provide a valid API key to test external endpoint connectivity.'
      });
      return;
    }

    try {
      const response = await fetch(`${endpointUrl}?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with {"status": "ok"}' }] }]
        })
      });

      setTesting(false);
      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Connection successful. External Gemini API responded with HTTP 200 OK.'
        });
      } else {
        const errorData = await response.json();
        setTestResult({
          success: false,
          message: `API Error: ${errorData.error?.message || 'Authentication failed'}`
        });
      }
    } catch (err) {
      setTesting(false);
      setTestResult({
        success: false,
        message: `Network Error: ${err.message}`
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
          <Sliders className="w-4 h-4" />
          <span>System Architecture & Integration</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          AI & Automated Classification Settings
        </h1>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          NAGRIK uses a transparent integration framework. When no external AI key is supplied, the platform operates in local rule-based heuristic mode to ensure absolute reliability without pretending to make external API calls.
        </p>
      </div>

      {/* Active Mode Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          provider === 'gemini' && apiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-900'
        }`}>
          <Cpu className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Active Classification Engine:
            </span>
            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
              provider === 'gemini' && apiKey
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}>
              {provider === 'gemini' && apiKey ? 'Google Gemini Live API' : 'Local Rule-Based Keyword Matcher (Local Fallback)'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {provider === 'gemini' && apiKey
              ? 'External LLM integration is active. Issue titles and descriptions are analyzed using Gemini 1.5 Flash.'
              : 'Local deterministic keyword heuristics are active. Civic issues are categorized using standard municipal rule clusters. No external network requests are made.'}
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Engine Configuration
        </h2>

        {saveSuccess && (
          <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully to browser local storage.</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Classification Engine Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`p-3 rounded border text-xs cursor-pointer flex flex-col gap-1 ${
              provider === 'local_heuristic' ? 'border-blue-900 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="provider"
                  value="local_heuristic"
                  checked={provider === 'local_heuristic'}
                  onChange={() => setProvider('local_heuristic')}
                  className="text-blue-900"
                />
                <span className="font-bold text-slate-900">Local Rule-Based Heuristic (Demo)</span>
              </div>
              <span className="text-[11px] text-slate-500 pl-5">
                Zero external dependencies. Deterministic keyword matching for Indian municipal categories.
              </span>
            </label>

            <label className={`p-3 rounded border text-xs cursor-pointer flex flex-col gap-1 ${
              provider === 'gemini' ? 'border-blue-900 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={provider === 'gemini'}
                  onChange={() => setProvider('gemini')}
                  className="text-blue-900"
                />
                <span className="font-bold text-slate-900">Google Gemini LLM Endpoint</span>
              </div>
              <span className="text-[11px] text-slate-500 pl-5">
                Routes grievance triage through Google Gemini 1.5 API. Requires valid API key below.
              </span>
            </label>
          </div>
        </div>

        {provider === 'gemini' && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono rounded border border-slate-300 px-3 py-2 text-slate-900"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Key is stored only in your local browser storage and used strictly for complaint triage.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                API Endpoint URL
              </label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="w-full text-xs font-mono rounded border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
          </div>
        )}

        {testResult && (
          <div className={`p-3 rounded text-xs border flex items-start gap-2 ${
            testResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <div>
              <span className="font-semibold block">{testResult.success ? 'Engine Verification Passed' : 'Verification Issue'}</span>
              <span>{testResult.message}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="py-2 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Verify Engine Connection'}</span>
          </button>

          <button
            type="submit"
            className="py-2 px-5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Save Configuration
          </button>
        </div>

      </form>

      {/* Code Architecture Documentation Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2 text-xs">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
          <Code className="w-4 h-4 text-slate-600" />
          <span>Integration Architecture Overview</span>
        </h3>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          The service contract in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">src/services/aiService.js</code> exports an asynchronous <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">triageCivicIssue(title, description)</code> function. When the portal is deployed in production behind a municipal gateway, this contract connects to fine-tuned civic classification endpoints without requiring changes to form or dashboard components.
        </p>
      </div>

    </div>
  );
}

