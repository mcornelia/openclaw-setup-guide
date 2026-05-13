/*
 * CommonIssuesPanel — Blueprint Design
 * Quick-access panel showing the top 3 most common setup problems.
 * Lives on the hero/home page. Each card expands inline to show cause + fixes.
 * Links through to the full Troubleshooting section.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ChevronDown, ChevronUp, Copy, Check,
  AlertTriangle, Info, ArrowRight, Box, Wifi, Key,
  Settings, MessageCircle, HelpCircle, RefreshCw,
} from "lucide-react";
import { TOP_ISSUES, CATEGORY_LABELS, CATEGORY_COLORS, type TroubleshootingEntry, type TroubleshootingCategory } from "@/lib/troubleshootingData";

const CATEGORY_ICONS: Record<TroubleshootingCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  docker: Box,
  network: Wifi,
  api: Key,
  openclaw: Settings,
  telegram: MessageCircle,
  syncthing: RefreshCw,
  general: HelpCircle,
};

const SEVERITY_STYLES = {
  critical: { dot: "bg-red-500", label: "Critical", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  warning:  { dot: "bg-amber-500", label: "Warning", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  info:     { dot: "bg-blue-400", label: "Info", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

const RANK_LABELS = ["Most Common", "2nd Most Common", "3rd Most Common"];
const RANK_COLORS = [
  "bg-[oklch(0.32_0.12_250)] text-white",
  "bg-[oklch(0.42_0.04_250)] text-white",
  "bg-[oklch(0.64_0.03_250)] text-white",
];

function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ }
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-[oklch(0.64_0.03_250)] hover:text-white hover:bg-[oklch(0.28_0.04_250)] transition-all font-['Source_Sans_3',sans-serif]">
      {copied ? <><Check size={10} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy size={10} /><span>Copy</span></>}
    </button>
  );
}

function IssueCard({
  entry,
  rank,
  isExpanded,
  onToggle,
}: {
  entry: TroubleshootingEntry;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sev = SEVERITY_STYLES[entry.severity];
  const cat = CATEGORY_COLORS[entry.category];
  const CatIcon = CATEGORY_ICONS[entry.category];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "border-[oklch(0.32_0.12_250)/40%] shadow-lg shadow-[oklch(0.32_0.12_250)/8%]"
          : "border-[oklch(0.88_0.01_250)] hover:border-[oklch(0.64_0.03_250)] hover:shadow-md"
      } bg-white`}
    >
      {/* ── Card header ── */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-4 group"
      >
        {/* Rank badge */}
        <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold font-['Source_Sans_3',sans-serif] mt-0.5 ${RANK_COLORS[rank]}`}>
          #{rank + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border} font-['Source_Sans_3',sans-serif]`}>
              <CatIcon size={9} />
              {CATEGORY_LABELS[entry.category]}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sev.bg} ${sev.border} ${sev.text} font-['Source_Sans_3',sans-serif]`}>
              <div className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
              {sev.label}
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-['Fraunces',serif] font-600 text-sm leading-snug transition-colors ${isExpanded ? "text-[oklch(0.32_0.12_250)]" : "text-[oklch(0.18_0.04_250)] group-hover:text-[oklch(0.32_0.12_250)]"}`}>
            {entry.title}
          </h3>

          {/* Symptom preview — hidden when expanded */}
          {!isExpanded && (
            <p className="text-xs text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mt-1 line-clamp-1">
              {entry.symptom}
            </p>
          )}
        </div>

        {/* Chevron */}
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          isExpanded ? "bg-[oklch(0.32_0.12_250)] text-white rotate-0" : "bg-[oklch(0.95_0.005_250)] text-[oklch(0.52_0.03_250)]"
        }`}>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {/* ── Expanded body ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[oklch(0.88_0.01_250)] pt-4 space-y-4">

              {/* Symptom */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-1.5">
                  Symptom
                </p>
                <p className="text-xs text-[oklch(0.32_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed bg-[oklch(0.97_0.003_250)] rounded-lg p-3 border border-[oklch(0.88_0.01_250)]">
                  {entry.symptom}
                </p>
              </div>

              {/* Cause */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-1.5">
                  Why This Happens
                </p>
                <p className="text-xs text-[oklch(0.32_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed">
                  {entry.cause}
                </p>
              </div>

              {/* Fixes */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-2">
                  Quick Fix{entry.fixes.length > 1 ? "es" : ""}
                </p>
                <div className="space-y-3">
                  {entry.fixes.map((fix, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-1 rounded-full bg-[oklch(0.32_0.12_250)] flex-shrink-0" />
                        <p className="text-xs font-semibold text-[oklch(0.18_0.04_250)] font-['Source_Sans_3',sans-serif]">
                          {fix.label}
                        </p>
                        {fix.os && fix.os !== "all" && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[oklch(0.95_0.005_250)] text-[oklch(0.42_0.04_250)] rounded border border-[oklch(0.88_0.01_250)] font-['Source_Sans_3',sans-serif]">
                            {{ windows: "Windows", macos: "macOS", linux: "Linux" }[fix.os]}
                          </span>
                        )}
                      </div>
                      {fix.note && (
                        <p className="text-xs text-[oklch(0.42_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed ml-3 mb-1.5">
                          {fix.note}
                        </p>
                      )}
                      {fix.code && (
                        <div className="ml-3 rounded-lg overflow-hidden border border-[oklch(0.28_0.04_250)]">
                          <div className="flex items-center justify-between bg-[oklch(0.18_0.04_250)] px-3 py-1.5">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_25)]" />
                              <div className="w-2 h-2 rounded-full bg-[oklch(0.74_0.19_60)]" />
                              <div className="w-2 h-2 rounded-full bg-[oklch(0.60_0.16_162)]" />
                            </div>
                            <CopyBtn code={fix.code} />
                          </div>
                          <pre className="bg-[oklch(0.14_0.04_250)] px-4 py-3 text-[11px] font-['JetBrains_Mono',monospace] leading-relaxed overflow-x-auto">
                            {fix.code.split("\n").map((line, li) => (
                              <span key={li}>
                                <span className={line.trim().startsWith("#") ? "text-[oklch(0.52_0.03_250)]" : "text-[oklch(0.88_0.01_250)]"}>
                                  {line}
                                </span>
                                {"\n"}
                              </span>
                            ))}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related steps */}
              {entry.relatedStepIds && entry.relatedStepIds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[10px] text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif]">
                    Related steps:
                  </span>
                  {entry.relatedStepIds.map((sid) => (
                    <span key={sid} className="text-[10px] px-2 py-0.5 bg-[oklch(0.32_0.12_250)/10%] text-[oklch(0.32_0.12_250)] rounded border border-[oklch(0.32_0.12_250)/20%] font-semibold font-['Source_Sans_3',sans-serif]">
                      Step {sid}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CommonIssuesPanelProps {
  onOpenTroubleshooting: () => void;
}

export default function CommonIssuesPanel({ onOpenTroubleshooting }: CommonIssuesPanelProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggle = (idx: number) => setExpandedIdx((prev) => (prev === idx ? null : idx));

  return (
    <section className="mt-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-['Fraunces',serif] font-700 text-xl text-[oklch(0.18_0.04_250)] leading-none">
              Common Issues
            </h2>
            <p className="text-xs text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mt-0.5">
              The 3 problems people hit most often — click to expand
            </p>
          </div>
        </div>
        <button
          onClick={onOpenTroubleshooting}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.32_0.12_250)] hover:text-[oklch(0.25_0.04_250)] font-['Source_Sans_3',sans-serif] transition-colors group"
        >
          View all {22} issues
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Issue cards */}
      <div className="space-y-3">
        {TOP_ISSUES.map((entry, idx) => (
          <IssueCard
            key={entry.id}
            entry={entry}
            rank={idx}
            isExpanded={expandedIdx === idx}
            onToggle={() => toggle(idx)}
          />
        ))}
      </div>

      {/* Mobile "view all" link */}
      <button
        onClick={onOpenTroubleshooting}
        className="sm:hidden mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[oklch(0.88_0.01_250)] text-sm font-semibold text-[oklch(0.32_0.12_250)] hover:border-[oklch(0.32_0.12_250)] hover:bg-[oklch(0.97_0.003_250)] transition-all font-['Source_Sans_3',sans-serif]"
      >
        View all 22 issues
        <ArrowRight size={15} />
      </button>

      {/* Subtle divider */}
      <div className="mt-10 h-px bg-[oklch(0.88_0.01_250)]" />
    </section>
  );
}
