/**
 * StepTroubleshootingHelper
 * Blueprint Design — Swiss Modernism
 * Shows troubleshooting entries tagged to the current step ID.
 * Sits at the bottom of each StepView, above the action buttons.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, ChevronDown, ChevronUp, Copy, Check,
  ExternalLink, Wrench, Info, AlertCircle,
} from "lucide-react";
import {
  TROUBLESHOOTING_ENTRIES,
  CATEGORY_LABELS,
  type TroubleshootingEntry,
  type Severity,
} from "@/lib/troubleshootingData";

// ── Severity config ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<Severity, {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  labelClass: string;
  dotClass: string;
}> = {
  critical: {
    icon: AlertCircle,
    labelClass: "text-red-600 dark:text-red-400",
    dotClass: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    labelClass: "text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-400",
  },
  info: {
    icon: Info,
    labelClass: "text-blue-600 dark:text-blue-400",
    dotClass: "bg-blue-400",
  },
};

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold font-['Source_Sans_3',sans-serif] bg-white/10 hover:bg-white/20 text-[oklch(0.76_0.02_250)] transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={10} strokeWidth={3} /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Single entry card ─────────────────────────────────────────────────────────

function EntryCard({
  entry,
  onOpenFull,
}: {
  entry: TroubleshootingEntry;
  onOpenFull: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[entry.severity];
  const SevIcon = sev.icon;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden transition-colors duration-200">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Severity dot */}
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${sev.dotClass}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {/* Category pill */}
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-['Source_Sans_3',sans-serif]">
              {CATEGORY_LABELS[entry.category]}
            </span>
            {/* Severity label */}
            <span className={`flex items-center gap-0.5 text-[10px] font-semibold font-['Source_Sans_3',sans-serif] ${sev.labelClass}`}>
              <SevIcon size={10} />
              {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground font-['Source_Sans_3',sans-serif] leading-snug">
            {entry.title}
          </p>
        </div>

        {/* Expand toggle */}
        <span className="flex-shrink-0 text-muted-foreground mt-0.5">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
              {/* Symptom */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold font-['Source_Sans_3',sans-serif] mb-1">
                  Symptom
                </p>
                <p className="text-xs text-foreground font-['Source_Sans_3',sans-serif] leading-relaxed">
                  {entry.symptom}
                </p>
              </div>

              {/* Cause */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold font-['Source_Sans_3',sans-serif] mb-1">
                  Cause
                </p>
                <p className="text-xs text-foreground font-['Source_Sans_3',sans-serif] leading-relaxed">
                  {entry.cause}
                </p>
              </div>

              {/* Fixes */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold font-['Source_Sans_3',sans-serif] mb-2">
                  Fix{entry.fixes.length > 1 ? "es" : ""}
                </p>
                <div className="space-y-2">
                  {entry.fixes.map((fix, i) => (
                    <div key={i} className="rounded-md overflow-hidden border border-border">
                      {/* Fix label row */}
                      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/60">
                        <span className="text-xs font-semibold text-foreground font-['Source_Sans_3',sans-serif] leading-snug">
                          {fix.label}
                        </span>
                        {fix.os && fix.os !== "all" && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground font-['Source_Sans_3',sans-serif] flex-shrink-0">
                            {fix.os}
                          </span>
                        )}
                      </div>

                      {/* Code block */}
                      {fix.code && (
                        <div className="bg-[oklch(0.14_0.04_250)] relative">
                          <div className="absolute top-2 right-2">
                            <CopyButton code={fix.code} />
                          </div>
                          <pre className="px-4 py-3 pr-16 text-[oklch(0.88_0.01_250)] text-xs font-['JetBrains_Mono',monospace] leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                            {fix.code}
                          </pre>
                        </div>
                      )}

                      {/* Note */}
                      {fix.note && (
                        <div className="px-3 py-2 bg-[oklch(0.96_0.01_250)] dark:bg-[oklch(0.20_0.04_250)] border-t border-border">
                          <p className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif] leading-relaxed italic">
                            {fix.note}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Link to full troubleshooting */}
              <button
                onClick={onOpenFull}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-['Source_Sans_3',sans-serif] font-semibold"
              >
                <ExternalLink size={11} />
                View in full Troubleshooting section
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface StepTroubleshootingHelperProps {
  stepId: number;
  onOpenTroubleshooting: () => void;
}

export default function StepTroubleshootingHelper({
  stepId,
  onOpenTroubleshooting,
}: StepTroubleshootingHelperProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  // Filter entries that mention this stepId
  const relevant = TROUBLESHOOTING_ENTRIES.filter(
    (e) => e.relatedStepIds?.includes(stepId)
  );

  if (relevant.length === 0) return null;

  // Sort: critical first, then warning, then info
  const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  const sorted = [...relevant].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const criticalCount = sorted.filter((e) => e.severity === "critical").length;

  return (
    <div className="mt-8">
      {/* Toggle header */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left group ${
          panelOpen
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
        }`}
      >
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          panelOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}>
          <Wrench size={15} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground font-['Source_Sans_3',sans-serif]">
            Stuck on this step?
          </p>
          <p className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif]">
            {sorted.length} relevant troubleshooting article{sorted.length !== 1 ? "s" : ""}
            {criticalCount > 0 && (
              <span className="ml-1.5 text-red-500 font-semibold">
                · {criticalCount} critical
              </span>
            )}
          </p>
        </div>

        {/* Count badge */}
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-['Source_Sans_3',sans-serif] transition-colors ${
          criticalCount > 0
            ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
        }`}>
          {sorted.length}
        </span>

        {/* Chevron */}
        <span className="flex-shrink-0 text-muted-foreground">
          {panelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Entries list */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="entries"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {sorted.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onOpenFull={onOpenTroubleshooting}
                />
              ))}

              {/* Footer link */}
              <div className="pt-1 pb-1 text-center">
                <button
                  onClick={onOpenTroubleshooting}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors font-['Source_Sans_3',sans-serif] inline-flex items-center gap-1"
                >
                  <ExternalLink size={11} />
                  Browse all 22 troubleshooting articles
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
