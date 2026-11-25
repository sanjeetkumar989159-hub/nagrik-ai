import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Building2, 
  Zap, 
  ChevronRight, 
  Activity, 
  MapPin, 
  Eye, 
  Sliders,
  HelpCircle,
  ThumbsUp,
  Cpu
} from 'lucide-react';
import { analyzeCivicIssue, DEMO_AI_PRESETS } from '../services/aiClassifier';
import { CategoryIcon } from '../components/CategoryIcon';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';

export function LandingPage({ setActivePage, onPrefillReport }) {
  // Simulator State
  const [simulatorInput, setSimulatorInput] = useState(DEMO_AI_PRESETS[0].title + '. ' + DEMO_AI_PRESETS[0].description);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  // Live Heuristic Evaluation of Simulator Input
  const aiResult = analyzeCivicIssue(simulatorInput, '');

  const handleSelectPreset = (preset, index) => {
    setSelectedPresetIndex(index);
    setSimulatorInput(`${preset.title}. ${preset.description}`);
  };

  const handleTransferToReport = () => {
    if (onPrefillReport) {
      onPrefillReport({
        title: DEMO_AI_PRESETS[selectedPresetIndex]?.title || simulatorInput.slice(0, 60),
        description: simulatorInput,
        category: aiResult.category
      });
    }
    setActivePage('report');
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-navy-800/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-electric/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Live Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-900/90 border border-cyan-400/40 text-cyan-electric text-xs font-semibold tracking-wide shadow-lg shadow-cyan-500/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-electric" style={{ animationDuration: '6s' }} />
              <span>AI-POWERED CIVIC TRIAGE & AUTOMATED WARD ROUTING</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Empowering Citizens,{' '}
              <span className="cyan-gradient-text block mt-1">
                Accelerating City Governance
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Report civic hazards, potholes, water leaks, and electrical faults in seconds. NAGRIK AI triages urgency, prevents duplicates, routes directly to field ward engineers, and delivers transparent resolution tracking.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setActivePage('report')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 font-bold text-sm shadow-xl shadow-cyan-500/30 hover:from-cyan-400 hover:to-cyan-electric transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Report an Issue Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('citizen')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-900/80 hover:bg-navy-800 text-slate-200 hover:text-white border border-cyan-500/30 font-semibold text-sm transition-all duration-200"
              >
                <span>Citizen Dashboard</span>
              </button>

              <button
                onClick={() => setActivePage('track')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-navy-900/40 hover:bg-navy-900/80 text-slate-400 hover:text-cyan-electric text-sm font-medium transition-all duration-200"
              >
                <span>Track by Ticket ID</span>
              </button>
            </div>

            {/* Civic Metrics Strip */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="glass-panel p-4 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-electric font-mono">24,850+</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Issues Resolved</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">4.2 hrs</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Avg First Response</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">94.8%</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Citizen Rating</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">6 Wards</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Real-time Connected</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE AI SIMULATOR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border-cyan-500/30 relative overflow-hidden shadow-2xl">
          {/* Subtle decoration */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>INTERACTIVE AI PLAYGROUND</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Try NAGRIK Heuristic AI Triage in Real-Time
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Type any civic complaint or click sample scenarios below to witness how our client-side heuristic engine computes severity, tags safety hazards, and allocates municipal departments.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-navy-950/80 px-3 py-1.5 rounded-xl border border-navy-800 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine Status: Heuristic NLP Active</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Click a real-world scenario to simulate:
            </span>
            <div className="flex flex-wrap gap-2">
              {DEMO_AI_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset, idx)}
                  className={`text-xs px-3.5 py-2 rounded-xl transition-all font-medium ${
                    selectedPresetIndex === idx
                      ? 'bg-cyan-500 text-navy-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-navy-900/80 text-slate-300 hover:bg-navy-800 hover:text-white border border-navy-700/80'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Grid: Input Box & AI Evaluation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Input Textarea */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-navy-950/90 rounded-2xl p-4 sm:p-5 border border-navy-800">
              <div>
                <label className="text-xs font-medium text-slate-400 flex items-center justify-between mb-2">
                  <span>Enter Civic Issue Description</span>
                  <span className="text-[11px] text-cyan-400">Live evaluation on keystroke</span>
                </label>
                <textarea
                  value={simulatorInput}
                  onChange={(e) => {
                    setSimulatorInput(e.target.value);
                    setSelectedPresetIndex(-1);
                  }}
                  rows={6}
                  className="w-full bg-navy-900/90 border border-navy-700 focus:border-cyan-400 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none font-sans leading-relaxed"
                  placeholder="Describe an issue, e.g. Open manhole on main road with gushing water..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-navy-900 text-xs text-slate-400">
                <span>{simulatorInput.length} characters analyzed</span>
                <button
                  onClick={handleTransferToReport}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-electric hover:bg-cyan-500/30 border border-cyan-400/40 font-semibold transition-all"
                >
                  <span>Use this in Report Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: AI Intelligence Assessment Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-navy-900/95 to-navy-950 rounded-2xl p-5 border border-cyan-500/40 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* Header with Engine Tag */}
                <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-electric" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Heuristic AI Analysis
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
                    Confidence: {aiResult.confidence}%
                  </span>
                </div>

                {/* Category & Department */}
                <div className="flex items-start gap-3 bg-navy-950/60 p-3 rounded-xl border border-navy-800">
                  <CategoryIcon category={aiResult.category} size="md" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-slate-400 block">Classified Category</span>
                    <span className="text-sm font-bold text-white block truncate">
                      {aiResult.categoryName}
                    </span>
                    <span className="text-[11px] text-cyan-300/80 block mt-0.5">
                      Routing: {aiResult.department}
                    </span>
                  </div>
                </div>

                {/* Severity & SLA metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Calculated Urgency</span>
                    <SeverityBadge severity={aiResult.severity} showScore score={aiResult.urgencyScore} />
                  </div>
                  <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Guaranteed SLA</span>
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {aiResult.estimatedSla}
                    </span>
                  </div>
                </div>

                {/* Reasoning Tags */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">Detected Decision Indicators:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiResult.tags.map((tag, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Explanatory footer */}
              <div className="mt-4 pt-3 border-t border-navy-800/80 text-[11px] text-slate-400 leading-normal">
                {aiResult.reasoning}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FOUR-STEP CIVIC LIFECYCLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-cyan-electric tracking-widest uppercase">
            HOW NAGRIK AI OPERATES
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            From Citizen Camera to Verified Civic Resolution
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No endless office rounds or lost paper forms. A completely transparent digital audit chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* Step 1 */}
          <div className="glass-panel p-6 rounded-2xl relative group hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-electric font-mono font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. Snap & Geo-Tag</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a photo from your smartphone. Location, landmark, and ward coordinates are automatically detected.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-6 rounded-2xl relative group hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-electric font-mono font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. Heuristic AI Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI evaluates hazards, scores urgency from 1-100, assigns target SLA, and routes directly to the specific ward division.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-6 rounded-2xl relative group hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-electric font-mono font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. Field Crew Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ward field engineers receive mobile work orders with GPS coordinates and material specs (e.g. cold asphalt, power cable).
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-6 rounded-2xl relative group hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-electric font-mono font-bold text-lg mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-white mb-2">4. Verified Resolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Officers upload proof of work. Citizens receive SMS notifications and provide direct satisfaction ratings (1-5 stars).
            </p>
          </div>

        </div>
      </section>

      {/* 4. KEY CAPABILITIES MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-cyan-electric tracking-widest uppercase">
            CITY INTELLIGENCE SUITE
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Designed for Citizens. Engineered for Municipal Authorities.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-electric" />
            </div>
            <h3 className="text-base font-bold text-white">Smart Duplicate Clustering</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prevents duplicate work orders when multiple citizens report the same crater or burst pipe, merging reports into a unified high-priority cluster.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white">Safety Blackspot Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies chronic accident zones and recurring dark spots, alerting city planners for structural interventions rather than temporary patches.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Guaranteed SLA Accountability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic escalation to higher municipal commissioners if field tickets exceed SLA thresholds without documented progress updates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Notice a civic problem in your neighborhood?
            </h2>
            <p className="text-sm text-slate-300">
              Your report takes less than 60 seconds and directly alerts the municipal ward engineer in charge of your street.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActivePage('report')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 font-bold text-sm shadow-xl shadow-cyan-500/30 hover:from-cyan-400 hover:to-cyan-electric transition-all transform hover:scale-105"
              >
                File Grievance Now
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

