/*
 * Home Page — Blueprint Design (Swiss Modernism)
 * Layout: Fixed left sidebar (step index + progress) + scrollable right content
 * Colors: Off-white bg, deep slate primary, amber warnings, emerald success
 * Fonts: Fraunces (headings), Source Sans 3 (body), JetBrains Mono (code)
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Wifi, Server, Download, LayoutDashboard,
  MessageCircle, ShieldCheck, CheckSquare, ChevronRight,
  ChevronLeft, Clock, Menu, X, Check, Lock, Network,
  ShieldOff, Plug, Package, GitBranch, Key, Play,
  Wand2, Rocket, Monitor, Bot, Link, RefreshCw,
  Shield, UserCheck, Box, AlertTriangle, Wrench, Sun, Moon
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PARTS, STEPS, TOTAL_STEPS, type Part, type Step } from "@/lib/guideData";
import StepContentRenderer from "@/components/StepContent";
import Troubleshooting from "./Troubleshooting";
import CommonIssuesPanel from "@/components/CommonIssuesPanel";
import TopProgressBar from "@/components/TopProgressBar";
import StepTroubleshootingHelper from "@/components/StepTroubleshootingHelper";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen, Wifi, Server, Download, LayoutDashboard,
  MessageCircle, ShieldCheck, CheckSquare, Lock, Network,
  ShieldOff, Plug, Package, GitBranch, Key, Play,
  Wand2, Rocket, Monitor, Bot, Link, RefreshCw,
  Shield, UserCheck, Box, AlertTriangle
};

function getIcon(name: string, size = 16) {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon size={size} /> : null;
}

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663316870629/h86LJCyEcebf7LCbpydtGg/hero-banner-TkqCPPU46LFP5wFf6tvtg6.webp";

export default function Home() {
  const [currentStepId, setCurrentStepId] = useState<number>(() => {
    const saved = localStorage.getItem("openclaw-current-step");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("openclaw-completed-steps");
    return saved ? new Set<number>(JSON.parse(saved) as number[]) : new Set<number>();
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentStep = STEPS.find((s) => s.id === currentStepId) ?? STEPS[0];
  const currentPart = PARTS.find((p) => p.id === currentStep.part);
  const progressPct = Math.round((completedSteps.size / TOTAL_STEPS) * 100);

  // Live time-remaining calculation
  const minutesRemaining = useMemo(() => {
    return STEPS
      .filter((s) => !completedSteps.has(s.id))
      .reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0);
  }, [completedSteps]);

  const formatTimeRemaining = (mins: number) => {
    if (mins === 0) return null; // all done
    if (mins < 60) return { value: String(mins), unit: `min${mins !== 1 ? "s" : ""}` };
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return { value: String(h), unit: `hr${h !== 1 ? "s" : ""}` };
    return { value: `${h}h ${m}`, unit: "min" };
  };

  const timeDisplay = formatTimeRemaining(minutesRemaining);

  useEffect(() => {
    localStorage.setItem("openclaw-current-step", String(currentStepId));
  }, [currentStepId]);

  useEffect(() => {
    localStorage.setItem("openclaw-completed-steps", JSON.stringify(Array.from(completedSteps)));
  }, [completedSteps]);

  const navigateTo = (stepId: number) => {
    setCurrentStepId(stepId);
    setShowHero(false);
    setShowTroubleshooting(false);
    setSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTroubleshooting = () => {
    setShowTroubleshooting(true);
    setShowHero(false);
    setSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markComplete = () => {
    const next = new Set(completedSteps);
    next.add(currentStepId);
    setCompletedSteps(next);
    // Auto-advance to next step
    const idx = STEPS.findIndex((s) => s.id === currentStepId);
    if (idx < STEPS.length - 1) {
      setTimeout(() => navigateTo(STEPS[idx + 1].id), 300);
    }
  };

  const prevStep = STEPS[STEPS.findIndex((s) => s.id === currentStepId) - 1];
  const nextStep = STEPS[STEPS.findIndex((s) => s.id === currentStepId) + 1];

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between px-4 lg:px-8 h-14">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              onClick={() => setShowHero(true)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-md bg-[oklch(0.32_0.12_250)] flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="font-['Fraunces',serif] font-700 text-foreground text-sm hidden sm:block">
                OpenClaw Setup Guide
              </span>
            </button>
          </div>

          {/* Center: rich segmented progress bar */}
          <TopProgressBar
            completedSteps={completedSteps}
            onNavigateToPart={(firstStepId) => navigateTo(firstStepId)}
          />

          {/* Right: dark mode toggle + troubleshooting button + current part badge */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <motion.div
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </motion.div>
            </button>

            <button
              onClick={openTroubleshooting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-['Source_Sans_3',sans-serif] transition-all ${
                showTroubleshooting
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Wrench size={13} />
              <span className="hidden sm:block">Troubleshooting</span>
            </button>
            {currentPart && !showHero && !showTroubleshooting && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-['Source_Sans_3',sans-serif]">
                <span className="hidden md:block">Part {currentPart.id}:</span>
                <span className="font-semibold text-primary hidden md:block">
                  {currentPart.shortTitle}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            className={`
              fixed lg:static top-14 left-0 z-30 h-[calc(100vh-3.5rem)]
              w-72 bg-[oklch(0.18_0.04_250)] text-[oklch(0.88_0.01_250)]
              flex flex-col overflow-hidden transition-transform duration-300
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            {/* Sidebar header */}
            <div className="px-5 py-4 border-b border-[oklch(0.28_0.04_250)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] font-semibold">
                  Progress
                </span>
                <span className="text-xs text-[oklch(0.60_0.16_162)] font-semibold font-['Source_Sans_3',sans-serif]">
                  {progressPct}%
                </span>
              </div>
              <div className="h-1.5 bg-[oklch(0.28_0.04_250)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[oklch(0.60_0.16_162)] rounded-full progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {/* Steps complete + time remaining */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif]">
                  {completedSteps.size} of {TOTAL_STEPS} steps done
                </p>
                {timeDisplay ? (
                  <div className="flex items-center gap-1 text-[oklch(0.74_0.19_60)]">
                    <Clock size={10} />
                    <span className="text-xs font-semibold font-['Source_Sans_3',sans-serif] tabular-nums">
                      {timeDisplay.value}
                    </span>
                    <span className="text-[10px] text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif]">
                      {timeDisplay.unit} left
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[oklch(0.60_0.16_162)]">
                    <Check size={10} strokeWidth={3} />
                    <span className="text-xs font-semibold font-['Source_Sans_3',sans-serif]">All done!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step list */}
            <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
              {PARTS.map((part) => {
                const partSteps = STEPS.filter((s) => s.part === part.id);
                const partCompleted = partSteps.every((s) => completedSteps.has(s.id));
                const partActive = partSteps.some((s) => s.id === currentStepId);

                return (
                  <div key={part.id} className="mb-1">
                    {/* Part header */}
                    <div
                      className={`flex items-center gap-2 px-5 py-2.5 ${
                        partActive ? "text-white" : "text-[oklch(0.64_0.03_250)]"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          partCompleted
                            ? "bg-[oklch(0.60_0.16_162)]"
                            : partActive
                            ? "bg-white"
                            : "bg-[oklch(0.42_0.04_250)]"
                        }`}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider font-['Source_Sans_3',sans-serif]">
                        Part {part.id}: {part.shortTitle}
                      </span>
                    </div>

                    {/* Steps in part */}
                    {partSteps.map((step) => {
                      const isActive = step.id === currentStepId && !showHero;
                      const isDone = completedSteps.has(step.id);

                      return (
                        <button
                          key={step.id}
                          onClick={() => navigateTo(step.id)}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-150 ${
                            isActive
                              ? "bg-[oklch(0.32_0.12_250)] text-white"
                              : "hover:bg-[oklch(0.25_0.04_250)] text-[oklch(0.76_0.02_250)]"
                          }`}
                        >
                          {/* Step indicator */}
                          <div
                            className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${
                              isDone
                                ? "bg-[oklch(0.60_0.16_162)] text-white"
                                : isActive
                                ? "bg-white text-[oklch(0.32_0.12_250)]"
                                : "border border-[oklch(0.42_0.04_250)] text-[oklch(0.52_0.03_250)]"
                            }`}
                          >
                            {isDone ? <Check size={10} strokeWidth={3} /> : step.id}
                          </div>
                          <span className="text-xs font-['Source_Sans_3',sans-serif] leading-tight">
                            {step.shortTitle}
                          </span>
                          {step.estimatedMinutes && (
                            <span className="ml-auto text-[10px] text-[oklch(0.42_0.04_250)] flex items-center gap-0.5 flex-shrink-0">
                              <Clock size={9} />
                              {step.estimatedMinutes}m
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Troubleshooting + Reset */}
            <div className="px-5 py-4 border-t border-[oklch(0.28_0.04_250)] space-y-2">
              <button
                onClick={openTroubleshooting}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold font-['Source_Sans_3',sans-serif] transition-all ${
                  showTroubleshooting
                    ? "bg-[oklch(0.32_0.12_250)] text-white"
                    : "bg-[oklch(0.25_0.04_250)] text-[oklch(0.76_0.02_250)] hover:bg-[oklch(0.28_0.04_250)]"
                }`}
              >
                <Wrench size={13} />
                Troubleshooting
              </button>
              <button
                onClick={() => {
                  if (confirm("Reset all progress?")) {
                    setCompletedSteps(new Set<number>());
                    setCurrentStepId(1);
                    setShowHero(true);
                    setShowTroubleshooting(false);
                  }
                }}
                className="w-full text-xs text-[oklch(0.52_0.03_250)] hover:text-[oklch(0.64_0.03_250)] transition-colors font-['Source_Sans_3',sans-serif] text-center py-1"
              >
                Reset progress
              </button>
            </div>
          </aside>
        </>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto bg-background transition-colors duration-300"
        >
          <AnimatePresence mode="wait">
            {showTroubleshooting ? (
              <motion.div
                key="troubleshooting"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Troubleshooting
                  onBack={() => {
                    setShowTroubleshooting(false);
                    setShowHero(true);
                    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </motion.div>
            ) : showHero ? (
              <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HeroSection
                  onStart={() => navigateTo(1)}
                  completedSteps={completedSteps.size}
                  totalSteps={TOTAL_STEPS}
                  progressPct={progressPct}
                  parts={PARTS}
                  completedSet={completedSteps}
                  onNavigate={navigateTo}
                  steps={STEPS}
                  onTroubleshooting={openTroubleshooting}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`step-${currentStepId}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto px-4 sm:px-8 py-8 pb-24"
              >
                <StepView
                  step={currentStep}
                  isCompleted={completedSteps.has(currentStepId)}
                  onMarkComplete={markComplete}
                  prevStep={prevStep}
                  nextStep={nextStep}
                  onNavigate={navigateTo}
                  currentPart={currentPart}
                  onOpenTroubleshooting={openTroubleshooting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({
  onStart,
  onTroubleshooting,
  completedSteps,
  totalSteps,
  progressPct,
  parts,
  completedSet,
  onNavigate,
  steps,
}: {
  onStart: () => void;
  onTroubleshooting: () => void;
  completedSteps: number;
  totalSteps: number;
  progressPct: number;
  parts: Part[];
  completedSet: Set<number>;
  onNavigate: (id: number) => void;
  steps: Step[];
}) {
  return (
    <div>
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Home server setup"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.04_250)] via-[oklch(0.18_0.04_250)/60%] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-8">
          <p className="text-[oklch(0.60_0.16_162)] text-sm font-semibold uppercase tracking-widest font-['Source_Sans_3',sans-serif] mb-2">
            Step-by-Step Guide
          </p>
          <h1 className="text-white font-['Fraunces',serif] font-900 text-3xl sm:text-5xl leading-tight mb-3">
            OpenClaw AI Agent<br />Home Server Setup
          </h1>
          <p className="text-[oklch(0.76_0.02_250)] font-['Source_Sans_3',sans-serif] text-base sm:text-lg max-w-xl">
            Deploy a secure, Docker-containerized personal AI agent on your home network — designed for the Google Nest H2D.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-card border-b border-border px-6 sm:px-12 py-4 transition-colors duration-300">
        <div className="flex flex-wrap items-center gap-6 max-w-4xl">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
              ~90 minutes total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
              {totalSteps} steps across 8 parts
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
              Beginner-friendly
            </span>
          </div>
          {completedSteps > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-[oklch(0.53_0.15_162)] rounded-full progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[oklch(0.53_0.15_162)] font-['Source_Sans_3',sans-serif]">
                {progressPct}% done
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10">
        {/* CTA */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold font-['Source_Sans_3',sans-serif] hover:opacity-90 transition-all shadow-md"
          >
            {completedSteps > 0 ? "Continue Setup" : "Start Setup"}
            <ChevronRight size={18} />
          </button>
          {completedSteps > 0 && (
            <button
              onClick={() => onNavigate(1)}
              className="flex items-center gap-2 px-6 py-3 bg-card text-primary border border-primary rounded-lg font-semibold font-['Source_Sans_3',sans-serif] hover:bg-muted transition-colors"
            >
              Start from beginning
            </button>
          )}
        </div>

        {/* Parts overview grid */}
        <h2 className="font-['Fraunces',serif] font-700 text-2xl text-foreground mb-6">
          What You'll Cover
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {parts.map((part) => {
            const partSteps = steps.filter((s) => s.part === part.id);
            const doneCount = partSteps.filter((s) => completedSet.has(s.id)).length;
            const allDone = doneCount === partSteps.length;
            const firstStep = partSteps[0];

            return (
              <button
                key={part.id}
                onClick={() => onNavigate(firstStep.id)}
                className={`text-left p-5 rounded-xl border transition-all duration-200 hover:shadow-md group ${
                  allDone
                    ? "border-[oklch(0.60_0.16_162)/40%] bg-[oklch(0.60_0.16_162)/8%] hover:border-[oklch(0.60_0.16_162)/60%]"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      allDone ? "bg-[oklch(0.53_0.15_162)]" : "bg-primary"
                    }`}
                  >
                    {allDone ? (
                      <Check size={18} className="text-white" />
                    ) : (
                      <span className="text-white">{getIcon(part.icon, 18)}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold font-['Source_Sans_3',sans-serif] ${
                      allDone ? "text-[oklch(0.53_0.15_162)]" : "text-muted-foreground"
                    }`}
                  >
                    {doneCount}/{partSteps.length} steps
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif] uppercase tracking-wider mb-1">
                  Part {part.id}
                </p>
                <h3 className="font-['Fraunces',serif] font-600 text-base text-foreground mb-2 group-hover:text-primary transition-colors">
                  {part.title}
                </h3>
                <p className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif] leading-relaxed">
                  {part.description}
                </p>
                {doneCount > 0 && doneCount < partSteps.length && (
                  <div className="mt-3 h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(doneCount / partSteps.length) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Common Issues quick-access panel */}
        <CommonIssuesPanel onOpenTroubleshooting={onTroubleshooting} />
      </div>
    </div>
  );
}

// ── Step View ─────────────────────────────────────────────────────────────────

function StepView({
  step,
  isCompleted,
  onMarkComplete,
  prevStep,
  nextStep,
  onNavigate,
  currentPart,
  onOpenTroubleshooting,
}: {
  step: Step;
  isCompleted: boolean;
  onMarkComplete: () => void;
  prevStep?: Step;
  nextStep?: Step;
  onNavigate: (id: number) => void;
  currentPart?: Part;
  onOpenTroubleshooting: () => void;
}) {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-['Source_Sans_3',sans-serif] mb-6">
        <span>Part {step.part}</span>
        <ChevronRight size={12} />
        <span className="text-primary font-semibold">{currentPart?.shortTitle}</span>
      </div>

      {/* Step header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          {/* Large step number */}
          <div className="flex-shrink-0">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-['Fraunces',serif] font-900 text-xl shadow-sm ${
                isCompleted
                  ? "bg-[oklch(0.53_0.15_162)] text-white"
                  : "bg-[oklch(0.32_0.12_250)] text-white"
              }`}
            >
              {isCompleted ? <Check size={24} strokeWidth={3} /> : step.id}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-['Fraunces',serif] font-700 text-2xl sm:text-3xl text-foreground leading-tight mb-2">
              {step.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-['Source_Sans_3',sans-serif]">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                ~{step.estimatedMinutes} minutes
              </span>
              <span>·</span>
              <span>Step {step.id} of {TOTAL_STEPS}</span>
              {isCompleted && (
                <>
                  <span>·</span>
                  <span className="text-[oklch(0.53_0.15_162)] font-semibold flex items-center gap-1">
                    <Check size={12} />
                    Completed
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />
      </div>

      {/* Step content */}
      <div className="step-content">
        <StepContentRenderer content={step.content} stepId={step.id} />
      </div>

      {/* Contextual troubleshooting helper */}
      <StepTroubleshootingHelper
        stepId={step.id}
        onOpenTroubleshooting={onOpenTroubleshooting}
      />

      {/* Action buttons */}
      <div className="mt-10 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Mark complete */}
          {!isCompleted ? (
            <button
              onClick={onMarkComplete}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold font-['Source_Sans_3',sans-serif] hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              <Check size={18} />
              Mark Step Complete
              {nextStep && <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-[oklch(0.60_0.16_162)/10%] text-[oklch(0.53_0.15_162)] rounded-lg border border-[oklch(0.53_0.15_162)/30%] font-semibold font-['Source_Sans_3',sans-serif]">
              <Check size={18} />
              Step Completed
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex items-center gap-2">
            {prevStep && (
              <button
                onClick={() => onNavigate(prevStep.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors font-['Source_Sans_3',sans-serif]"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
            )}
            {nextStep && (
              <button
                onClick={() => onNavigate(nextStep.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors font-['Source_Sans_3',sans-serif]"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
