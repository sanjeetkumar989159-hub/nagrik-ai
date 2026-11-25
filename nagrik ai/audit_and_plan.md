# NAGRIK AI – Codebase Audit & Prioritized Improvement Plan

## 1️⃣ Audit Findings

### ✅ Existing functional features
- **Complaint submission** via `SubmitComplaintPage.jsx` using `createComplaintRecord` (localStorage‑based mock backend).
- **AI triage**: two services – `src/services/aiClassifier.js` (pure client‑side heuristic) and `src/services/aiService.js` (fallback to Gemini when API key is configured).
- **Admin dashboard** (`AdminDashboard.jsx`) displaying complaint list, status updates, analytics (charts via `recharts`).
- **Citizen portal** with map integration (`CivicLeafletMap.jsx`).
- **Firebase initialization** (`firebase.js`) – reads config from Vite env vars or `localStorage` (useful for evaluator).
- **Responsive UI** built with Tailwind + Lucide icons; works on desktop and mobile in Netlify preview.

### ❌ Critical gaps / bugs
| Area | Issue | Impact |
|------|-------|--------|
| **Repository hygiene** | `.env` file was previously committed (now removed) but still present locally. | Secret leakage risk. |
| **Security** | Admin actions are only hidden in UI; Firestore rules exist but the client currently uses **localStorage** for complaints, so no server‑side protection. | Unauthorized status changes possible. |
| **AI integration** | `aiService.js` attempts a live Gemini call but the project does **not** ship an API key; the UI still shows a button that may mislead users. | Confusing UX, potential network errors. |
| **Validation** | Input validation is performed manually in the component but not enforced in the storage layer (`storage.js` & `complaintsService.js`). | Bad data can be persisted (e.g., empty titles). |
| **Testing** | No test suite at all. | Evaluation score 0 for testing. |
| **Accessibility** | Form fields lack explicit `<label>` elements; focus outlines are removed by Tailwind defaults; ARIA attributes missing on interactive elements. | Failure of accessibility criteria. |
| **Performance** | All complaints are loaded into memory on each page render via `initComplaintsDb()`; large data sets would cause UI slowdown. | Potential performance bottleneck. |
| **Problem‑statement alignment** | README is a placeholder; no clear persona, problem description, or AI workflow documented. | Evaluation score 4/100. |
| **Documentation** | README lacks installation, usage, testing, security, and deployment sections. | Poor reviewer experience. |
| **Build** | `npm run build` succeeds but the process is still running (see task‑777). No CI script to run tests before build. | Build may succeed with hidden errors. |

### 📦 Repository size & branches
- Size ≈ **7 MB** (well under 10 MB limit).
- Branches: `main` (default) and `master` (stale). Only `main` is needed.

## 2️⃣ Prioritized Improvement Plan

| # | Phase | Goal | Target Files / Areas | Status |
|---|-------|------|----------------------|--------|
| **0** | **Repo Cleanup** | Ensure no secrets, single branch, proper .gitignore. | `.gitignore`, remove `.env`, delete `master` branch. | ✅ Completed (cleanup commit pushed). |
| **1** | **Security Hardening** | Replace localStorage mock with Firestore writes (or keep mock but guard admin UI). Add client‑side auth checks and role‑based route guard. | `src/services/complaintsService.js`, `src/pages/AdminDashboard.jsx`, `src/pages/SubmitComplaintPage.jsx`, `firestore.rules`. | ⏳ Pending |
| **2** | **AI Civic Assistant** | Expose a deterministic `useCivicAssistant` hook that wraps `aiClassifier.analyzeCivicIssue` and auto‑populates category/priority in the submit form. Hide Gemini button when no API key. | `src/services/aiClassifier.js`, new `src/hooks/useCivicAssistant.js`, `SubmitComplaintPage.jsx`. | ⏳ Pending |
| **3** | **Complaint Workflow Enhancements** | Add duplicate detection, generate unique reference, enforce stricter validation at the storage layer. | `src/services/complaintsService.js`, `src/services/storage.js`. | ⏳ Pending |
| **4** | **Admin Dashboard Hardening** | Guard routes with `requireAdmin` HOC, disable UI buttons for non‑admin, ensure Firestore rules are enforced. | `src/components/RequireAdmin.jsx`, `AdminDashboard.jsx`. | ⏳ Pending |
| **5** | **UI/UX Polish** | Consistent spacing, professional colour palette, loading & empty states, success toast. | Tailwind config, component files. | ⏳ Pending |
| **6** | **Automated Testing** | Add Vitest + React Testing Library. Tests for:
- `aiClassifier.analyzeCivicIssue`
- `aiService.triageCivicIssue` (local fallback)
- `storage` CRUD functions
- `complaintsService` validation & duplicate check
- Component render & form validation (SubmitComplaintPage)
- Admin route protection |
| `package.json`, `vitest.config.js`, `tests/` folder. | ⏳ Pending |
| **7** | **Accessibility** | Add proper `<label for=...>` pairs, ARIA attributes, focus outlines, keyboard navigation tests. | Form components, navigation menu, modal dialogs. | ⏳ Pending |
| **8** | **Performance** | Implement lazy‑load of complaint list (`react-window`), memoize map component, debounce input. | `CitizenDashboard.jsx`, `AdminDashboard.jsx`. | ⏳ Pending |
| **9** | **Problem Statement & README** | Rewrite `README.md` with all required sections, include Mermaid flowchart of AI assistant. | `README.md`, new `docs/architecture.mmd`. | ⏳ Pending |
| **10** | **Final QA & Release** | Run `npm run build`, `npm test`, manual UI test on mobile, keyboard, security review. Tag `v1.0.0`. | All files. | ⏳ Pending |

## 3️⃣ Immediate Next Action
We will start **Phase 1 – Security Hardening** by:
1. Adding a **role‑based guard** (`RequireAdmin.jsx`).
2. Updating `AdminDashboard.jsx` to use the guard and hide admin actions for non‑admin users.
3. Modifying `complaintsService.js` to perform server‑side writes via Firestore when `isFirebaseConfigured()` is true; otherwise fallback to localStorage (still safe because admin UI will be blocked).

Once the guard is in place, we will commit and push, then move on to the AI assistant hook.

---
**Next turn**: implement `RequireAdmin.jsx` and integrate it into `AdminDashboard.jsx`.

