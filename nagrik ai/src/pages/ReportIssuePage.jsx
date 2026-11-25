import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  Info,
  X,
  Compass,
  Building2,
  FileCheck2,
  Image as ImageIcon
} from 'lucide-react';
import { analyzeCivicIssue, CIVIC_CATEGORIES } from '../services/aiClassifier';
import { CITY_WARDS, createComplaint } from '../services/storage';
import { SeverityBadge } from '../components/StatusBadge';
import { CategoryIcon } from '../components/CategoryIcon';

const SAMPLE_PHOTOS = [
  { label: 'Deep Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Broken Streetlight', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Overflowing Trash', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80' },
  { label: 'Burst Water Pipe', url: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80' },
];

export function ReportIssuePage({ 
  setActivePage, 
  setSelectedComplaintId, 
  prefilledData = null,
  onComplaintCreated
}) {
  // Form State
  const [title, setTitle] = useState(prefilledData?.title || '');
  const [description, setDescription] = useState(prefilledData?.description || '');
  const [category, setCategory] = useState(prefilledData?.category || 'roads');
  const [ward, setWard] = useState(CITY_WARDS[0].name);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [citizenName, setCitizenName] = useState('Deepak Sharma');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765-43210');
  const [citizenEmail, setCitizenEmail] = useState('deepak.s@example.com');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageUrl, setImageUrl] = useState(SAMPLE_PHOTOS[0].url);
  const [customImageName, setCustomImageName] = useState('');

  // Auto AI override toggle: allow citizen to manually change or auto-sync
  const [manualCategoryOverride, setManualCategoryOverride] = useState(false);

  // Validation & Submission States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  // Live Heuristic AI analysis based on current text
  const aiTriage = analyzeCivicIssue(title, description);

  // Sync category with AI unless citizen manually intervened
  useEffect(() => {
    if (!manualCategoryOverride && aiTriage.category && aiTriage.category !== 'other') {
      setCategory(aiTriage.category);
    }
  }, [aiTriage.category, manualCategoryOverride]);

  // Handle HTML5 Geolocation or realistic simulation
  const handleDetectGPS = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLoading(false);
          setGpsSuccess(true);
          setAddress(prev => prev || `Near Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`);
          setLandmark(prev => prev || 'GPS Verified Coordinates');
        },
        () => {
          // Fallback to simulated high-precision ward GPS
          setTimeout(() => {
            setGpsLoading(false);
            setGpsSuccess(true);
            setAddress(prev => prev || 'Main Arterial Sector Road, Near Ward Boundary');
            setLandmark(prev => prev || 'GPS Location Tagged');
          }, 800);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setGpsLoading(false);
        setGpsSuccess(true);
        setAddress(prev => prev || 'Main Arterial Sector Road');
      }, 500);
    }
  };

  // Image upload handler (converts file to Base64)
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setCustomImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Please enter a clear title for the civic issue.';
    } else if (title.trim().length < 8) {
      errs.title = 'Title must be at least 8 characters long.';
    }

    if (!description.trim()) {
      errs.description = 'Please describe the problem and context.';
    } else if (description.trim().length < 15) {
      errs.description = 'Please provide at least 15 characters of detail.';
    }

    if (!address.trim()) {
      errs.address = 'Please provide the street address or location description.';
    }

    if (!isAnonymous && citizenPhone.trim() && !/^[0-9+ -]{7,15}$/.test(citizenPhone.trim())) {
      errs.citizenPhone = 'Please enter a valid phone number for SMS tracking updates.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const categoryObj = CIVIC_CATEGORIES.find(c => c.id === category) || CIVIC_CATEGORIES[0];
    const selectedWardObj = CITY_WARDS.find(w => w.name === ward) || CITY_WARDS[0];

    setTimeout(() => {
      const newGrievance = createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        categoryName: categoryObj.name,
        severity: aiTriage.severity,
        urgencyScore: aiTriage.urgencyScore,
        department: categoryObj.defaultDept,
        address: address.trim(),
        ward: selectedWardObj.name,
        zone: selectedWardObj.zone,
        landmark: landmark.trim(),
        citizenName: isAnonymous ? 'Anonymous Citizen' : citizenName.trim(),
        citizenPhone: isAnonymous ? '' : citizenPhone.trim(),
        citizenEmail: isAnonymous ? '' : citizenEmail.trim(),
        isAnonymous,
        imageUrl,
        estimatedSla: aiTriage.estimatedSla,
        aiAssessment: {
          confidence: aiTriage.confidence,
          tags: aiTriage.tags,
          engine: 'NAGRIK Heuristic AI Engine (Demo/Client-Side)',
          reasoning: aiTriage.reasoning
        }
      });

      setIsSubmitting(false);
      setCreatedTicket(newGrievance);
      if (onComplaintCreated) onComplaintCreated(newGrievance);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-navy-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-electric">
            Citizen Grievance Ingestion
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
            Smart Form v2.4
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Report a Civic Issue or Hazard
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Submit details and photograph of the civic issue. Our heuristic AI model analyzes your description in real-time to compute urgency and route directly to the designated ward engineers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Reporting Form (8 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Issue Description */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-xs font-bold text-cyan-electric">
                1
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Problem Summary & Details
              </h3>
            </div>

            {/* Issue Title */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Issue Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole causing skid accidents near Metro Pillar 140"
                className={`w-full bg-navy-950 border ${errors.title ? 'border-rose-500' : 'border-navy-700'} focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400`}
              />
              {errors.title && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Civic Category <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {manualCategoryOverride ? (
                    <button 
                      type="button" 
                      onClick={() => setManualCategoryOverride(false)}
                      className="text-cyan-400 hover:underline"
                    >
                      Re-enable AI Auto-Match
                    </button>
                  ) : (
                    <span className="text-cyan-electric">AI Auto-Suggested</span>
                  )}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CIVIC_CATEGORIES.filter(c => c.id !== 'other').map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        setManualCategoryOverride(true);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected 
                          ? 'bg-cyan-500/20 text-white border-cyan-400 shadow-sm shadow-cyan-500/20 font-semibold' 
                          : 'bg-navy-950/60 text-slate-400 border-navy-800 hover:border-navy-700'
                      }`}
                    >
                      <CategoryIcon category={cat.id} size="sm" />
                      <span className="truncate">{cat.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">{description.length} chars</span>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific danger or dimensions (e.g. depth of pothole, live spark hazard, foul smell near school gate, impact on pedestrians)..."
                className={`w-full bg-navy-950 border ${errors.description ? 'border-rose-500' : 'border-navy-700'} focus:border-cyan-400 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none`}
              />
              {errors.description && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.description}</span>
                </p>
              )}

              {/* Quick Append Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400">Insert tag:</span>
                {['Sparks visible', 'Accident risk', 'Deep crater', 'School zone', 'Ambulance route', 'Water shortage'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDescription(prev => `${prev ? prev + ' ' : ''}[${tag}]`)}
                    className="text-[10px] px-2 py-0.5 rounded bg-navy-900 text-slate-300 hover:text-cyan-electric border border-navy-700 hover:border-cyan-500/30"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Section 2: Location Details */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-xs font-bold text-cyan-electric">
                  2
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Location & Municipal Ward
                </h3>
              </div>

              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-navy-900 hover:bg-navy-800 text-cyan-electric text-xs font-medium border border-cyan-500/30 transition-all"
              >
                <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Detecting GPS...' : gpsSuccess ? 'GPS Tagged' : 'Auto-Detect Location'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Municipal Ward / Zone <span className="text-rose-400">*</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3.5 py-3 focus:border-cyan-400 focus:outline-none"
                >
                  {CITY_WARDS.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Prominent Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Pillar 142 or Near Gate 2"
                  className="w-full bg-navy-950 border border-navy-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Exact Street / Road Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Outer Ring Road, Near Flyover Descent, Sector 14"
                  className={`w-full bg-navy-950 border ${errors.address ? 'border-rose-500' : 'border-navy-700'} focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Photo Evidence Upload */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-xs font-bold text-cyan-electric">
                3
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Photo Evidence Upload
              </h3>
            </div>

            {/* Preset Samples */}
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-2">
                Click a realistic sample photo or upload your own file:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {SAMPLE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(sample.url);
                      setCustomImageName('');
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all ${
                      imageUrl === sample.url && !customImageName
                        ? 'bg-cyan-500/20 text-cyan-electric border-cyan-400 font-semibold'
                        : 'bg-navy-950 text-slate-400 border-navy-800 hover:border-navy-700'
                    }`}
                  >
                    <img src={sample.url} alt={sample.label} className="w-6 h-6 rounded-lg object-cover" />
                    <span className="truncate">{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-navy-700 hover:border-cyan-500/50 rounded-2xl p-4 text-center transition-all bg-navy-950/40">
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-electric">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {customImageName ? `Selected: ${customImageName}` : 'Click to browse image or drag and drop'}
                </div>
                <p className="text-[11px] text-slate-500">Supports PNG, JPG, WebP up to 5MB</p>
              </label>
            </div>

            {/* Photo Preview Thumbnail */}
            {imageUrl && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-950 border border-navy-800">
                <img src={imageUrl} alt="Attached Evidence" className="w-16 h-16 rounded-lg object-cover border border-navy-700" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    {customImageName || 'Photo Evidence Attached'}
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Geo-metadata & timestamp bound</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Citizen Contact Details */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-xs font-bold text-cyan-electric">
                  4
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Citizen Identification
                </h3>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded bg-navy-950 border-navy-700 text-cyan-500 focus:ring-0"
                />
                <span>Report Anonymously</span>
              </label>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Phone (SMS Updates)</label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className={`w-full bg-navy-950 border ${errors.citizenPhone ? 'border-rose-500' : 'border-navy-700'} focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Anonymous Mode: Your personal details will not be stored or visible to field staff.</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 font-bold text-sm shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-cyan-electric transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing AI Triage & Submitting Grievance...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Grievance to Municipal Dispatch</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Submission triggers automated ticket ID generation and ward routing.
            </p>
          </div>

        </form>

        {/* Right Sidebar: Real-Time Heuristic AI Triage Inspector (5 Cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-electric animate-spin" style={{ animationDuration: '8s' }} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  NAGRIK AI Live Triage
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
                Demo NLP Active
              </span>
            </div>

            {/* Real-time Category detection */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Classified Category:</span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-950 border border-navy-800">
                <CategoryIcon category={aiTriage.category} size="md" />
                <div>
                  <span className="text-sm font-bold text-white block">
                    {aiTriage.categoryName}
                  </span>
                  <span className="text-[11px] text-cyan-400 block font-mono">
                    Routing: {aiTriage.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Severity & Urgency Score Meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Severity Assessment:</span>
                <span className="font-mono text-cyan-300 font-bold">{aiTriage.urgencyScore}/100</span>
              </div>
              
              {/* Urgency Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-navy-950 overflow-hidden border border-navy-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    aiTriage.severity === 'Critical' ? 'bg-rose-500' :
                    aiTriage.severity === 'High' ? 'bg-orange-500' :
                    aiTriage.severity === 'Medium' ? 'bg-cyan-400' : 'bg-slate-400'
                  }`}
                  style={{ width: `${aiTriage.urgencyScore}%` }}
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <SeverityBadge severity={aiTriage.severity} />
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Target SLA: {aiTriage.estimatedSla}
                </span>
              </div>
            </div>

            {/* Safety Reasoning Tags */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Decision Indicators:</span>
              <div className="flex flex-wrap gap-1.5">
                {aiTriage.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Explanatory text */}
            <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 text-[11px] text-slate-400 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1 -mt-0.5" />
              {aiTriage.reasoning}
            </div>

            {/* Transparency Note */}
            <div className="pt-2 border-t border-navy-800/80 text-[10px] text-slate-500">
              * Client-side heuristic triage model designed for hackathon demonstration. Predicts municipal SLA without external API dependencies.
            </div>

          </div>

        </div>

      </div>

      {/* Success Modal upon Creation */}
      {createdTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-navy-900 border border-cyan-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                Grievance Lodged Successfully!
              </h2>
              <p className="text-xs text-slate-300">
                Your ticket has been registered in the municipal central database and dispatched to the ward team.
              </p>
            </div>

            {/* Ticket Credentials Card */}
            <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Unique Complaint ID:</span>
                <span className="font-mono text-base font-black text-cyan-electric">
                  {createdTicket.id}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Assigned Ward:</span>
                <span className="font-semibold text-white">{createdTicket.location.ward.split('-')[0]}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-cyan-300">{createdTicket.department}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Target SLA:</span>
                <span className="font-mono font-bold text-amber-300">{createdTicket.estimatedSla}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedComplaintId(createdTicket.id);
                  setActivePage('track');
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-cyan-electric transition-all"
              >
                Track Ticket Live
              </button>

              <button
                onClick={() => {
                  setCreatedTicket(null);
                  setActivePage('citizen');
                }}
                className="py-3 px-4 rounded-xl bg-navy-800 text-slate-200 hover:text-white text-xs font-semibold border border-navy-700"
              >
                Return to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

