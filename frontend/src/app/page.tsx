"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import {
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Zap,
  ArrowRight,
  GraduationCap,
  Mail,
  Code2,
  Rocket,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// Popular field presets
const FIELD_PRESETS = [
  { id: "cs", label: "Computer Science", icon: GraduationCap },
  { id: "web", label: "Web Development", icon: Code2 },
  { id: "ai", label: "AI & Data Science", icon: Sparkles },
  { id: "cloud", label: "Cloud & DevOps", icon: Zap },
  { id: "mobile", label: "Mobile Dev", icon: Rocket },
];

// Popular tech presets
const TECH_PRESETS = [
  "Next.js",
  "React",
  "Python",
  "Docker",
  "Node.js",
  "TypeScript",
  "PyTorch",
  "PostgreSQL",
  "GraphQL",
];

// Animated loading steps that cycle while waiting for the AI
const LOADING_STEPS = [
  "Connecting to EduBot AI...",
  "Analysing your learning goals...",
  "Generating your 7-day roadmap...",
  "Crafting mentor introduction...",
  "Composing your email...",
  "Almost there — finalising roadmap...",
];

export default function Home() {
  const [field, setField] = useState("Computer Science");
  const [tech, setTech] = useState("Next.js");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; roadmap: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Cycle through loading steps and animate progress bar while generating
  useEffect(() => {
    if (loading) {
      setLoadingStepIndex(0);
      setLoadingStep(LOADING_STEPS[0]);
      setProgress(5);

      let stepIdx = 0;
      stepTimerRef.current = setInterval(() => {
        stepIdx = (stepIdx + 1) % LOADING_STEPS.length;
        setLoadingStepIndex(stepIdx);
        setLoadingStep(LOADING_STEPS[stepIdx]);
        // Progress creeps up to ~85% while waiting (never reaches 100 until done)
        setProgress((prev) => Math.min(prev + Math.random() * 12 + 4, 85));
      }, 2200);
    } else {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setProgress(0);
    }
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [loading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field.trim() || !tech.trim() || !email.trim()) {
      setError("Please fill out all fields before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(5);

    // Simulate progress steps for smooth UX
    setLoadingStep("Connecting to Edubot AI service...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/edubot/roadmap";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field, tech, email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("API error:", err);
      setError(
        err.message || "Failed to connect to the EduBot backend service. Ensure the server is running on http://localhost:3000."
      );
    } finally {
      setProgress(100);
      // Brief flash of 100% before hiding
      setTimeout(() => setLoading(false), 350);
    }
  };

  const handleCopy = () => {
    if (result?.roadmap) {
      navigator.clipboard.writeText(result.roadmap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // HTML from Markdown
  const renderedMarkdown = result?.roadmap ? marked.parse(result.roadmap) : "";

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Decorative Pastel Rainbow Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-300/40 via-purple-300/40 to-indigo-200/40 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-teal-200/40 via-sky-300/40 to-blue-200/40 blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-yellow-200/40 via-orange-200/40 to-pink-200/40 blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "1s" }} />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-purple-100/60 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-400 via-purple-400 to-sky-400 p-0.5 shadow-md shadow-purple-200/50">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-700 via-pink-600 to-sky-600 bg-clip-text text-transparent">
                EduBot
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                AI Roadmap Engine
              </span>
            </div>
          </div>

          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/80 px-3 py-1.5 rounded-lg border border-purple-200/60 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Swagger API Docs
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-100 via-purple-100 to-sky-100 border border-purple-200/80 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-pink-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
              1-Week Targeted Action Plans
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
            Master Any Technology With Your Personalized{" "}
            <span className="rainbow-gradient-text">AI Roadmap</span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            Select your field of study, pick a technology to learn, and get a structured day-by-day learning roadmap generated by AI and delivered straight to your email.
          </p>
        </div>

        {/* Generator Form Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="rainbow-border-glow rounded-3xl">
            <div className="glass-card rounded-[22px] p-6 sm:p-8 shadow-xl shadow-purple-100/60">
              <form onSubmit={handleGenerate} className="space-y-6">
                {/* 1. Field of Study */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>1. Field of Study / Career Path</span>
                    <span className="text-xs font-normal text-slate-500">e.g. Computer Science</span>
                  </label>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {FIELD_PRESETS.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = field === preset.label;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setField(preset.label)}
                          className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                              : "bg-white/80 text-slate-700 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 mr-1.5 opacity-90" />
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="Enter your field of study..."
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-purple-200/80 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 text-slate-800 placeholder-slate-400 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* 2. Target Technology */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>2. Technology / Skill to Learn</span>
                    <span className="text-xs font-normal text-slate-500">e.g. Next.js, Python</span>
                  </label>

                  {/* Quick Pick Tech Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {TECH_PRESETS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTech(t)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          tech === t
                            ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                            : "bg-white/70 text-slate-600 border-slate-200 hover:border-pink-300 hover:bg-pink-50/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => setTech(e.target.value)}
                    placeholder="Enter tech name (e.g. Next.js, Flutter, PyTorch)..."
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-purple-200/80 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 text-slate-800 placeholder-slate-400 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* 3. Student Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>3. Your Email Address</span>
                    <span className="text-xs font-normal text-slate-500">For direct delivery</span>
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 border border-purple-200/80 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-slate-800 placeholder-slate-400 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button + Progress Bar */}
                <div className="space-y-2">
                  <button
                    type="submit"
                    id="generate-btn"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg shadow-purple-300/50 bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 hover:from-pink-600 hover:via-purple-700 hover:to-sky-600 active:scale-[0.99] transition-all disabled:opacity-90 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                  >
                    {loading ? (
                      <>
                        {/* SVG Spinner */}
                        <svg
                          className="w-5 h-5 animate-spin shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12" cy="12" r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        <span className="truncate">
                          {loadingStep || "Generating Roadmap & Sending Email..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 shrink-0" />
                        <span>Generate &amp; Send Roadmap</span>
                        <ArrowRight className="w-5 h-5 shrink-0" />
                      </>
                    )}
                  </button>

                  {/* Animated Progress Bar */}
                  {loading && (
                    <div className="w-full h-1.5 rounded-full bg-purple-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-sky-400 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Hint text */}
                  {loading && (
                    <p className="text-center text-xs text-slate-500 animate-pulse">
                      ⏳ This may take 15–30 seconds — please don&apos;t close this tab.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-10 p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 flex items-start space-x-3 shadow-md">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-red-800">Connection or Generation Error</h4>
              <p className="text-xs mt-0.5 text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State Skeleton Placeholder */}
        {loading && (
          <div className="max-w-3xl mx-auto p-8 rounded-3xl glass-card border border-purple-100 shadow-xl space-y-4 animate-pulse">
            <div className="h-6 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg w-2/3" />
            <div className="h-4 bg-slate-200 rounded-md w-full" />
            <div className="h-4 bg-slate-200 rounded-md w-4/5" />
            <div className="pt-6 space-y-3">
              <div className="h-20 bg-purple-100/60 rounded-xl w-full" />
              <div className="h-20 bg-pink-100/60 rounded-xl w-full" />
              <div className="h-20 bg-sky-100/60 rounded-xl w-full" />
            </div>
          </div>
        )}

        {/* Result Display Section */}
        {result && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Delivery Confirmation Alert */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                    Roadmap Successfully Generated & Emailed!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-700">
                    A copy of this 1-week plan has been dispatched to <span className="font-semibold underline">{email}</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 transition-colors shadow-sm hidden sm:inline-flex"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print
                </button>
              </div>
            </div>

            {/* Markdown Display Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl border border-purple-100/80">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {field}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                    {tech}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  7-Day Study Plan
                </div>
              </div>

              {/* Rendered HTML from Markdown */}
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-purple-100/60 text-center py-6 text-xs text-slate-500">
        <p>
          EduBot AI Roadmap Generator — Powered by Google Gemini AI & Resend Emailer
        </p>
      </footer>
    </div>
  );
}
