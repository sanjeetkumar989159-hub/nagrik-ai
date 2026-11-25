import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  Camera,
  RefreshCw,
  Bot,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import {
  COMPLAINT_CATEGORIES,
  createComplaintRecord
} from '../services/complaintsService';
import { MUNICIPAL_WARDS } from '../services/storage';
import { CivicLeafletMap } from '../components/CivicLeafletMap';
import { analyzeComplaintWithGemini, isGeminiConfigured } from '../services/geminiAiService';
import { useCivicAssistant } from '../hooks/useCivicAssistant';
import { validateComplaintInput, validateImageFile } from '../utils/security';

export function SubmitComplaintPage({
  currentUser,
  setActivePage,
  setSelectedComplaintId,
  onComplaintCreated,
  recentComplaints = [],
  assistantDraft = null,
  onClearAssistantDraft = null,
  onOpenAssistant = null
}) {
  const [title, setTitle] = useState(assistantDraft?.title || '');
  const [description, setDescription] = useState(assistantDraft?.description || '');
  const [category, setCategory] = useState(assistantDraft?.category || COMPLAINT_CATEGORIES[0].id);
  const [subcategory, setSubcategory] = useState(
    assistantDraft?.subcategory || COMPLAINT_CATEGORIES[0].subcategories[0]
  );
  const [priority, setPriority] = useState(assistantDraft?.severity || 'Medium');
  const [ward, setWard] = useState(assistantDraft?.ward || MUNICIPAL_WARDS[0].name);
  const [address, setAddress] = useState(assistantDraft?.address || '');
  const [landmark, setLandmark] = useState('');
  const [pickedLocation, setPickedLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Citizen Contact Details
  const [citizenName, setCitizenName] = useState(currentUser?.name || '');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phoneNumber || '');
  const [citizenEmail, setCitizenEmail] = useState(currentUser?.email || '');

  // Image Upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');

  // Live Rule-Based Civic Assistant Hook (Always Available Offline)
  const liveAssistant = useCivicAssistant(title, description);

  // External Gemini AI Triage State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(assistantDraft?.aiAnalysis || null);
  const [aiNotice, setAiNotice] = useState('');

  // Form Submission & Validation
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessRecord, setSubmitSuccessRecord] = useState(null);

  // Sync draft if user applies suggestions from AI Civic Assistant drawer
  useEffect(() => {
    if (!assistantDraft) return;
    if (assistantDraft.title) setTitle(assistantDraft.title);
    if (assistantDraft.description) setDescription(assistantDraft.description);
    if (assistantDraft.category) {
      const catObj = COMPLAINT_CATEGORIES.find((c) => c.id === assistantDraft.category);
      if (catObj) {
        setCategory(catObj.id);
        setSubcategory(assistantDraft.subcategory || catObj.subcategories[0]);
      }
    }
    if (assistantDraft.severity) setPriority(assistantDraft.severity);
    if (assistantDraft.ward) setWard(assistantDraft.ward);
    if (assistantDraft.address) setAddress(assistantDraft.address);
    if (assistantDraft.aiAnalysis) setAiResult(assistantDraft.aiAnalysis);
    if (onClearAssistantDraft) onClearAssistantDraft();
  }, [assistantDraft, onClearAssistantDraft]);

  useEffect(() => {
    if (!submitSuccessRecord) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSubmitSuccessRecord(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [submitSuccessRecord]);

  const currentCategoryObj =
    COMPLAINT_CATEGORIES.find((c) => c.id === category) || COMPLAINT_CATEGORIES[0];

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    setCategory(newCatId);
    const cat = COMPLAINT_CATEGORIES.find((c) => c.id === newCatId);
    if (cat && cat.subcategories.length > 0) {
      setSubcategory(cat.subcategories[0]);
    }
  };

  const handleApplyRuleAssistant = () => {
    if (!liveAssistant || liveAssistant.category === 'other') return;
    const matchedCat = COMPLAINT_CATEGORIES.find((c) => c.id === liveAssistant.category);
    if (matchedCat) {
      setCategory(matchedCat.id);
      setSubcategory(liveAssistant.subcategory || matchedCat.subcategories[0]);
    }
    setPriority(liveAssistant.priority || 'Medium');
    if (liveAssistant.entities?.matchedWard && !ward) {
      setWard(liveAssistant.entities.matchedWard);
    } else if (liveAssistant.entities?.matchedWard) {
      setWard(liveAssistant.entities.matchedWard);
    }
    if (liveAssistant.entities?.locationText && !address.trim()) {
      setAddress(liveAssistant.entities.locationText);
    }
    setAiResult({
      suggestedCategory: liveAssistant.categoryName,
      suggestedSeverity: liveAssistant.priority,
      suggestedDepartment: liveAssistant.department,
      urgencyScore: liveAssistant.urgencyScore,
      isAiSuggestion: true,
      reasoning: liveAssistant.reasoning
    });
  };

  const handleImageChange = (e) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateImageFile(file);
    if (!check.valid) {
      setImageError(check.error);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setImagePreview(loadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
  };

  const handleLocationPicked = (lat, lng, accuracy) => {
    setPickedLocation({ lat, lng });
    if (accuracy) setLocationAccuracy(Math.round(accuracy));
    if (!address) {
      setAddress(`GPS Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    }
  };

  // Trigger Gemini AI Triage (or inform clearly when unconfigured)
  const handleTriggerGeminiAnalysis = async () => {
    if (!title.trim() && !description.trim()) {
      setAiNotice('Please enter an issue title or description before requesting AI triage.');
      return;
    }

    setAiLoading(true);
    setAiNotice('');

    const res = await analyzeComplaintWithGemini(
      title,
      description,
      imagePreview,
      recentComplaints
    );

    setAiLoading(false);
    if (!res.isAvailable) {
      setAiNotice(
        `${res.error || 'Gemini API key not configured.'} Transparent local rule-based classification remains active below.`
      );
      return;
    }

    setAiResult(res);
    const matchedCat = COMPLAINT_CATEGORIES.find(
      (c) => c.name.toLowerCase() === res.suggestedCategory.toLowerCase()
    );
    if (matchedCat) {
      setCategory(matchedCat.id);
      if (matchedCat.subcategories.length > 0) {
        setSubcategory(matchedCat.subcategories[0]);
      }
    }
    if (res.suggestedSeverity) {
      setPriority(res.suggestedSeverity);
    }
  };

  const validate = () => {
    const check = validateComplaintInput({
      title,
      description,
      category,
      address,
      landmark,
      citizenName,
      citizenPhone,
      citizenEmail,
      latitude: pickedLocation.lat,
      longitude: pickedLocation.lng
    });
    setErrors(check.errors);
    return check.valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const selectedWardObj = MUNICIPAL_WARDS.find((w) => w.name === ward) || MUNICIPAL_WARDS[0];
      const effectiveAi = aiResult || (liveAssistant.confidence > 0 ? {
        suggestedCategory: liveAssistant.categoryName,
        suggestedSeverity: liveAssistant.priority,
        suggestedDepartment: liveAssistant.department,
        urgencyScore: liveAssistant.urgencyScore,
        isAiSuggestion: true,
        reasoning: liveAssistant.reasoning
      } : null);

      const record = await createComplaintRecord(
        {
          userId: currentUser?.uid || 'usr-citizen',
          citizenName,
          citizenPhone,
          citizenEmail,
          title,
          description,
          category,
          subcategory,
          severity: priority || liveAssistant.priority || 'Medium',
          address,
          landmark,
          ward: selectedWardObj.name,
          zone: selectedWardObj.zone,
          latitude: pickedLocation.lat,
          longitude: pickedLocation.lng,
          imageUrl: imagePreview,
          aiAnalysis: effectiveAi
        },
        imageFile
      );

      setSubmitSuccessRecord(record);
      if (onComplaintCreated) onComplaintCreated(record);

      // Reset form fields for next submission
      setTitle('');
      setDescription('');
      setCategory(COMPLAINT_CATEGORIES[0].id);
      setSubcategory(COMPLAINT_CATEGORIES[0].subcategories[0]);
      setPriority('Medium');
      setWard(MUNICIPAL_WARDS[0].name);
      setAddress('');
      setLandmark('');
      setPickedLocation({ lat: 28.6139, lng: 77.2090 });
      setLocationAccuracy(null);
      setImageFile(null);
      setImagePreview('');
      setImageError('');
      setAiResult(null);
      setAiNotice('');
      setErrors({});
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasLiveAnalysis = title.trim().length + description.trim().length >= 8;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-900" aria-hidden="true" />
            <span>Municipal Issue Registration Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Report a Civic Problem</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Submit verified civic issues to municipal departments. Generates a unique tracking ID (<code className="font-mono">NAG-2026-XXXXXXXX</code>) with transparent AI urgency triage.
          </p>
        </div>

        {onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-blue-900 bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-semibold self-start"
          >
            <Bot className="w-4 h-4" aria-hidden="true" />
            <span>Need help describing? Ask AI Assistant</span>
          </button>
        )}
      </div>

      {submitError && (
        <div
          role="alert"
          className="p-3.5 rounded bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold block">Submission Blocked</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Section 1: Categorization & Live AI Assistant */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Issue Details & Smart Classification
            </h2>
            <span className="text-[11px] text-slate-500">10 Standard Civic Categories</span>
          </div>

          <div>
            <label htmlFor="complaint-title" className="block text-xs font-semibold text-slate-800 mb-1">
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              id="complaint-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'error-title' : undefined}
              placeholder="e.g. Deep pothole on right lane of Ring Road flyover causing skid hazard"
              className={`w-full text-xs rounded border ${errors.title ? 'border-red-500' : 'border-slate-300'} px-3.5 py-2.5 text-slate-900 placeholder-slate-400`}
              required
            />
            {errors.title && (
              <p id="error-title" role="alert" className="text-[11px] text-red-700 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="complaint-description" className="block text-xs font-semibold text-slate-800">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">{description.length} chars</span>
            </div>
            <textarea
              id="complaint-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'error-description' : undefined}
              placeholder="State dimensions, safety risks, duration (e.g. 'since 3 days'), and landmarks..."
              className={`w-full text-xs rounded border ${errors.description ? 'border-red-500' : 'border-slate-300'} p-3 text-slate-900 placeholder-slate-400 resize-none`}
              required
            />
            {errors.description && (
              <p id="error-description" role="alert" className="text-[11px] text-red-700 mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Real-time Transparent Rule-Based AI Triage Panel */}
          {hasLiveAnalysis && (
            <div
              aria-live="polite"
              className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 space-y-2.5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-800" aria-hidden="true" />
                  <span>Live AI Triage Analysis (Rule-Based Heuristic)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                    Confidence: {liveAssistant.confidence}% • Urgency: {liveAssistant.urgencyScore}/100
                  </span>
                  {liveAssistant.category !== 'other' && (
                    <button
                      type="button"
                      onClick={handleApplyRuleAssistant}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-semibold"
                    >
                      <Wand2 className="w-3 h-3" aria-hidden="true" />
                      <span>Apply AI Suggestion</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
                <div>Suggested Category: <strong className="text-slate-900">{liveAssistant.categoryName}</strong></div>
                <div>Estimated Priority: <strong className="text-slate-900">{liveAssistant.priority}</strong> (SLA: {liveAssistant.estimatedSla})</div>
                <div>Target Dept: <strong className="text-slate-900">{liveAssistant.department}</strong></div>
              </div>

              <p className="text-[11px] text-slate-600">{liveAssistant.reasoning}</p>

              {liveAssistant.followUpQuestions?.length > 0 && (
                <div className="pt-1 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded p-2">
                  <strong>Helpful details to include:</strong> {liveAssistant.followUpQuestions.join(' ')}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="complaint-category" className="block text-xs font-semibold text-slate-800 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint-category"
                value={category}
                onChange={handleCategoryChange}
                className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
              >
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="complaint-subcategory" className="block text-xs font-semibold text-slate-800 mb-1">
                Subcategory <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint-subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
              >
                {currentCategoryObj.subcategories.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="complaint-priority" className="block text-xs font-semibold text-slate-800 mb-1">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
              >
                <option value="Low">Low (Routine)</option>
                <option value="Medium">Medium (Standard SLA)</option>
                <option value="High">High (Urgent Attention)</option>
                <option value="Emergency">Emergency (Life/Safety Hazard)</option>
              </select>
            </div>
          </div>

          {/* Optional External Gemini AI Triage */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-900" aria-hidden="true" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Optional Multimodal Gemini AI Check
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {isGeminiConfigured()
                      ? 'Gemini API configured: inspect text & photo for duplicate check and routing.'
                      : 'No Gemini API key configured — using transparent local heuristic classifier above.'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerGeminiAnalysis}
                disabled={aiLoading}
                className="py-1.5 px-3 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{aiLoading ? 'Analyzing...' : 'Run Gemini Check'}</span>
              </button>
            </div>

            {aiNotice && (
              <div role="status" className="mt-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-1.5">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{aiNotice}</span>
              </div>
            )}

            {aiResult && aiResult.isAvailable && (
              <div className="mt-2 p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-800" aria-hidden="true" />
                    <span>Gemini AI Suggestion (Subject to Admin Review)</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                    {aiResult.modelUsed}
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-1 pt-1">
                  <div>Category: <strong className="text-blue-900">{aiResult.suggestedCategory}</strong></div>
                  <div>Severity: <strong className="text-blue-900">{aiResult.suggestedSeverity}</strong></div>
                  <div>Department: <strong className="text-blue-900">{aiResult.suggestedDepartment}</strong></div>
                </div>
                <p className="text-[11px] text-slate-600 italic">"{aiResult.reasoning}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Photograph Evidence */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Photograph Evidence Upload
            </h2>
            <span className="text-[11px] text-slate-500">Max 5MB (JPEG, PNG, WebP)</span>
          </div>

          {imageError && (
            <div role="alert" className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{imageError}</span>
            </div>
          )}

          {!imagePreview ? (
            <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-6 text-center bg-slate-50 transition-colors">
              <input
                type="file"
                id="file-evidence"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageChange}
                className="sr-only"
              />
              <label
                htmlFor="file-evidence"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  Click to select photo evidence from your device
                </span>
                <span className="text-[11px] text-slate-500">
                  Validates MIME type, file extension, and size (&le; 5 MB)
                </span>
              </label>
            </div>
          ) : (
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Uploaded civic issue photographic evidence preview"
                  className="w-16 h-16 rounded object-cover border border-slate-300 flex-shrink-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    {imageFile?.name || 'Evidence Photograph Attached'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB • Validated` : 'Attached'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="Remove attached evidence photo"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Location & Map */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Incident Location & Interactive Map
            </h2>
            <span className="text-[11px] text-slate-500">OpenStreetMap & Live Geolocation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="complaint-ward" className="block text-xs font-semibold text-slate-800 mb-1">
                Municipal Ward / Jurisdiction <span className="text-red-500">*</span>
              </label>
              <select
                id="complaint-ward"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
              >
                {MUNICIPAL_WARDS.map((w) => (
                  <option key={w.id} value={w.name}>{w.name} ({w.zone} Zone)</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="complaint-landmark" className="block text-xs font-semibold text-slate-800 mb-1">
                Prominent Landmark (Optional)
              </label>
              <input
                id="complaint-landmark"
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Pillar 142 or Beside School Gate"
                className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="complaint-address" className="block text-xs font-semibold text-slate-800 mb-1">
              Exact Street Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="complaint-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-invalid={Boolean(errors.address)}
                aria-describedby={errors.address ? 'error-address' : undefined}
                placeholder="e.g. Outer Ring Road, Cross Lane 4, Indiranagar"
                className={`w-full text-xs rounded border ${errors.address ? 'border-red-500' : 'border-slate-300'} pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400`}
                required
              />
            </div>
            {errors.address && (
              <p id="error-address" role="alert" className="text-[11px] text-red-700 mt-1">
                {errors.address}
              </p>
            )}
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-800 mb-1.5">
              Pin Exact Incident Coordinates on Map
            </span>
            <CivicLeafletMap
              mode="picker"
              height="260px"
              pickedLocation={pickedLocation}
              onLocationPicked={handleLocationPicked}
            />
            {locationAccuracy && (
              <span className="text-[11px] text-slate-500 mt-1 block">
                GPS Accuracy: &plusmn;{locationAccuracy} meters
              </span>
            )}
          </div>
        </div>

        {/* Section 4: Citizen Identification */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            4. Citizen Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="citizen-name" className="block text-xs font-semibold text-slate-800 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="citizen-name"
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                aria-invalid={Boolean(errors.citizenName)}
                aria-describedby={errors.citizenName ? 'error-citizen-name' : undefined}
                placeholder="Aditya Sharma"
                className={`w-full text-xs rounded border ${errors.citizenName ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-slate-900`}
                required
              />
              {errors.citizenName && (
                <p id="error-citizen-name" role="alert" className="text-[11px] text-red-700 mt-1">
                  {errors.citizenName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="citizen-phone" className="block text-xs font-semibold text-slate-800 mb-1">
                Mobile Number (10 digits) <span className="text-red-500">*</span>
              </label>
              <input
                id="citizen-phone"
                type="tel"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                aria-invalid={Boolean(errors.citizenPhone)}
                aria-describedby={errors.citizenPhone ? 'error-citizen-phone' : undefined}
                placeholder="9845012891"
                className={`w-full text-xs rounded border ${errors.citizenPhone ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-slate-900`}
                required
              />
              {errors.citizenPhone && (
                <p id="error-citizen-phone" role="alert" className="text-[11px] text-red-700 mt-1">
                  {errors.citizenPhone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="citizen-email" className="block text-xs font-semibold text-slate-800 mb-1">
                Email Address (Optional)
              </label>
              <input
                id="citizen-email"
                type="email"
                value={citizenEmail}
                onChange={(e) => setCitizenEmail(e.target.value)}
                aria-invalid={Boolean(errors.citizenEmail)}
                aria-describedby={errors.citizenEmail ? 'error-citizen-email' : undefined}
                placeholder="citizen@example.in"
                className={`w-full text-xs rounded border ${errors.citizenEmail ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-slate-900`}
              />
              {errors.citizenEmail && (
                <p id="error-citizen-email" role="alert" className="text-[11px] text-red-700 mt-1">
                  {errors.citizenEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="py-2 px-4 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 px-6 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Validating & Registering Complaint...</span>
              </>
            ) : (
              <span>Submit Complaint to Dispatch</span>
            )}
          </button>
        </div>
      </form>

      {/* Accessible Confirmation Modal */}
      {submitSuccessRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-success-heading"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h2 id="submit-success-heading" className="text-base font-bold text-slate-900">
                  Complaint Successfully Registered
                </h2>
                <span className="text-xs text-slate-500">Confirmed record created</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Complaint Reference ID:</span>
                <span className="font-mono font-bold text-blue-900 text-sm">{submitSuccessRecord.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Target Department:</span>
                <span className="font-medium text-slate-800">{submitSuccessRecord.departmentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Priority:</span>
                <span className="font-medium text-slate-800">{submitSuccessRecord.severity}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Initial Status:</span>
                <span className="font-semibold text-slate-800">{submitSuccessRecord.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedComplaintId(submitSuccessRecord.id);
                  setSubmitSuccessRecord(null);
                  setActivePage('track');
                }}
                className="py-2 px-4 rounded bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800"
              >
                Track This Complaint Live
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccessRecord(null);
                  setActivePage('home');
                }}
                className="py-2 px-4 rounded border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
