/*
 * Troubleshooting Page — Blueprint Design
 * Searchable, filterable table of common Docker and network errors
 * Features: live search, category + severity filters, expandable entries, copy-to-clipboard fixes
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronDown, ChevronUp, AlertTriangle,
  Info, CheckCircle2, Copy, Check, ExternalLink,
  Filter, Wrench, Wifi, Box, Key, MessageCircle, Settings, HelpCircle, RefreshCw
} from "lucide-react";
import {
  TROUBLESHOOTING_ENTRIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  SEVERITY_LABELS,
  ALL_CATEGORIES,
  type TroubleshootingCategory,
  type Severity,
  type TroubleshootingEntry,
  type TroubleshootingFix,
} from "@/lib/troubleshootingData";

const CATEGORY_ICONS: Record<TroubleshootingCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  docker: Box,
  network: Wifi,
  api: Key,
  openclaw: Settings,
  telegram: MessageCircle,
  syncthing: RefreshCw,
  general: HelpCircle,
};

const SEVERITY_CONFIG = {
  critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: AlertTriangle,
    label: "Critical",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: AlertTriangle,
    label: "Warning",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
    icon: Info,
    label: "Info",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[oklch(0.64_0.03_250)] hover:text-white hover:bg-[oklch(0.28_0.04_250)] transition-all duration-150 font-['Source_Sans_3',sans-serif]"
    >
      {copied ? <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy size={11} /><span>Copy</span></>}
    </button>
  );
}

function FixBlock({ fix }: { fix: TroubleshootingFix }) {
  const osLabel = fix.os && fix.os !== "all"
    ? { windows: "Windows", macos: "macOS", linux: "Linux" }[fix.os]
    : null;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.32_0.12_250)] flex-shrink-0" />
        <p className="text-sm font-semibold text-[oklch(0.18_0.04_250)] font-['Source_Sans_3',sans-serif]">
          {fix.label}
        </p>
        {osLabel && (
          <span className="text-xs px-1.5 py-0.5 bg-[oklch(0.95_0.005_250)] text-[oklch(0.42_0.04_250)] rounded font-['Source_Sans_3',sans-serif] border border-[oklch(0.88_0.01_250)]">
            {osLabel}
          </span>
        )}
      </div>
      {fix.note && (
        <p className="text-sm text-[oklch(0.42_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed ml-3.5 mb-2">
          {fix.note}
        </p>
      )}
      {fix.code && (
        <div className="ml-3.5 rounded-lg overflow-hidden border border-[oklch(0.28_0.04_250)]">
          <div className="flex items-center justify-between bg-[oklch(0.18_0.04_250)] px-3 py-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.2_25)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.74_0.19_60)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.60_0.16_162)]" />
            </div>
            <CopyButton text={fix.code} />
          </div>
          <pre className="bg-[oklch(0.14_0.04_250)] p-4 text-xs font-['JetBrains_Mono',monospace] leading-relaxed overflow-x-auto">
            {fix.code.split("\n").map((line, i) => (
              <span key={i}>
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
  );
}

function EntryCard({ entry, isExpanded, onToggle }: {
  entry: TroubleshootingEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sev = SEVERITY_CONFIG[entry.severity];
  const catColor = CATEGORY_COLORS[entry.category];
  const CatIcon = CATEGORY_ICONS[entry.category];

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isExpanded
          ? "border-[oklch(0.64_0.03_250)] shadow-md"
          : "border-[oklch(0.88_0.01_250)] hover:border-[oklch(0.64_0.03_250)] hover:shadow-sm"
      } bg-white`}
    >
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-4"
      >
        {/* Severity dot */}
        <div className={`w-2 h-2 rounded-full ${sev.dot} flex-shrink-0 mt-2`} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${catColor.bg} ${catColor.text} ${catColor.border} font-['Source_Sans_3',sans-serif]`}>
              <CatIcon size={10} />
              {CATEGORY_LABELS[entry.category]}
            </span>
            {/* Severity badge */}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sev.bg} ${sev.text} ${sev.border} font-['Source_Sans_3',sans-serif]`}>
              {sev.label}
            </span>
          </div>
          <h3 className="font-['Fraunces',serif] font-600 text-base text-[oklch(0.18_0.04_250)] leading-snug">
            {entry.title}
          </h3>
          <p className="text-xs text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mt-1 line-clamp-2">
            {entry.symptom}
          </p>
        </div>

        {/* Expand icon */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
          isExpanded ? "bg-[oklch(0.32_0.12_250)] text-white" : "bg-[oklch(0.95_0.005_250)] text-[oklch(0.52_0.03_250)]"
        }`}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[oklch(0.88_0.01_250)] pt-4">
              {/* Symptom */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-1.5">
                  Symptom
                </p>
                <p className="text-sm text-[oklch(0.25_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed bg-[oklch(0.97_0.003_250)] rounded-lg p-3 border border-[oklch(0.88_0.01_250)]">
                  {entry.symptom}
                </p>
              </div>

              {/* Cause */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-1.5">
                  Cause
                </p>
                <p className="text-sm text-[oklch(0.25_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed">
                  {entry.cause}
                </p>
              </div>

              {/* Fixes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-3">
                  How to Fix ({entry.fixes.length} {entry.fixes.length === 1 ? "solution" : "solutions"})
                </p>
                <div className="space-y-4">
                  {entry.fixes.map((fix, i) => (
                    <FixBlock key={i} fix={fix} />
                  ))}
                </div>
              </div>

              {/* Related steps */}
              {entry.relatedStepIds && entry.relatedStepIds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[oklch(0.88_0.01_250)] flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif]">
                    Related setup steps:
                  </span>
                  {entry.relatedStepIds.map((stepId) => (
                    <span
                      key={stepId}
                      className="text-xs px-2 py-0.5 bg-[oklch(0.32_0.12_250)/10%] text-[oklch(0.32_0.12_250)] rounded border border-[oklch(0.32_0.12_250)/20%] font-semibold font-['Source_Sans_3',sans-serif]"
                    >
                      Step {stepId}
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

export default function Troubleshooting({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<TroubleshootingCategory | "all">("all");
  const [activeSeverity, setActiveSeverity] = useState<Severity | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TROUBLESHOOTING_ENTRIES.filter((e) => {
      if (activeCategory !== "all" && e.category !== activeCategory) return false;
      if (activeSeverity !== "all" && e.severity !== activeSeverity) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.symptom.toLowerCase().includes(q) ||
        e.cause.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.fixes.some(
          (f) =>
            f.label.toLowerCase().includes(q) ||
            (f.code && f.code.toLowerCase().includes(q)) ||
            (f.note && f.note.toLowerCase().includes(q))
        )
      );
    });
  }, [query, activeCategory, activeSeverity]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TROUBLESHOOTING_ENTRIES.length };
    TROUBLESHOOTING_ENTRIES.forEach((e) => {
      counts[e.category] = (counts[e.category] ?? 0) + 1;
    });
    return counts;
  }, []);

  const toggleEntry = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 pb-24">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[oklch(0.52_0.03_250)] hover:text-[oklch(0.32_0.12_250)] transition-colors font-['Source_Sans_3',sans-serif] mb-6"
      >
        <ChevronDown className="rotate-90" size={14} />
        Back to Setup Guide
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[oklch(0.32_0.12_250)] flex items-center justify-center">
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-['Fraunces',serif] font-700 text-2xl sm:text-3xl text-[oklch(0.18_0.04_250)]">
              Troubleshooting
            </h1>
            <p className="text-sm text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif]">
              {TROUBLESHOOTING_ENTRIES.length} common issues across Docker, networking, API, and more
            </p>
          </div>
        </div>
        <div className="h-px bg-[oklch(0.88_0.01_250)]" />
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.52_0.03_250)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search errors, symptoms, commands…"
          className="w-full pl-10 pr-10 py-3 border border-[oklch(0.88_0.01_250)] rounded-xl bg-white text-[oklch(0.18_0.04_250)] placeholder-[oklch(0.64_0.03_250)] font-['Source_Sans_3',sans-serif] text-sm focus:outline-none focus:border-[oklch(0.32_0.12_250)] focus:ring-2 focus:ring-[oklch(0.32_0.12_250)/15%] transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.52_0.03_250)] hover:text-[oklch(0.18_0.04_250)] transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter toggle + active filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-['Source_Sans_3',sans-serif] transition-all ${
            showFilters || activeCategory !== "all" || activeSeverity !== "all"
              ? "border-[oklch(0.32_0.12_250)] bg-[oklch(0.32_0.12_250)/10%] text-[oklch(0.32_0.12_250)]"
              : "border-[oklch(0.88_0.01_250)] text-[oklch(0.52_0.03_250)] hover:border-[oklch(0.64_0.03_250)]"
          }`}
        >
          <Filter size={12} />
          Filters
          {(activeCategory !== "all" || activeSeverity !== "all") && (
            <span className="w-4 h-4 rounded-full bg-[oklch(0.32_0.12_250)] text-white text-[10px] flex items-center justify-center">
              {(activeCategory !== "all" ? 1 : 0) + (activeSeverity !== "all" ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Active filter chips */}
        {activeCategory !== "all" && (
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold font-['Source_Sans_3',sans-serif] ${CATEGORY_COLORS[activeCategory].bg} ${CATEGORY_COLORS[activeCategory].text} ${CATEGORY_COLORS[activeCategory].border}`}
          >
            {CATEGORY_LABELS[activeCategory]}
            <X size={10} />
          </button>
        )}
        {activeSeverity !== "all" && (
          <button
            onClick={() => setActiveSeverity("all")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold font-['Source_Sans_3',sans-serif] ${SEVERITY_CONFIG[activeSeverity].bg} ${SEVERITY_CONFIG[activeSeverity].text} ${SEVERITY_CONFIG[activeSeverity].border}`}
          >
            {SEVERITY_LABELS[activeSeverity]}
            <X size={10} />
          </button>
        )}

        <span className="ml-auto text-xs text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif]">
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </span>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white border border-[oklch(0.88_0.01_250)] rounded-xl p-4 space-y-4">
              {/* Category filter */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-2">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-['Source_Sans_3',sans-serif] transition-all ${
                      activeCategory === "all"
                        ? "bg-[oklch(0.32_0.12_250)] text-white border-[oklch(0.32_0.12_250)]"
                        : "border-[oklch(0.88_0.01_250)] text-[oklch(0.52_0.03_250)] hover:border-[oklch(0.64_0.03_250)]"
                    }`}
                  >
                    All ({categoryCounts.all})
                  </button>
                  {ALL_CATEGORIES.map((cat) => {
                    const CatIcon = CATEGORY_ICONS[cat];
                    const colors = CATEGORY_COLORS[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-['Source_Sans_3',sans-serif] transition-all ${
                          activeCategory === cat
                            ? `${colors.bg} ${colors.text} ${colors.border}`
                            : "border-[oklch(0.88_0.01_250)] text-[oklch(0.52_0.03_250)] hover:border-[oklch(0.64_0.03_250)]"
                        }`}
                      >
                        <CatIcon size={11} />
                        {CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity filter */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-2">
                  Severity
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveSeverity("all")}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-['Source_Sans_3',sans-serif] transition-all ${
                      activeSeverity === "all"
                        ? "bg-[oklch(0.32_0.12_250)] text-white border-[oklch(0.32_0.12_250)]"
                        : "border-[oklch(0.88_0.01_250)] text-[oklch(0.52_0.03_250)] hover:border-[oklch(0.64_0.03_250)]"
                    }`}
                  >
                    All
                  </button>
                  {(["critical", "warning", "info"] as Severity[]).map((sev) => {
                    const s = SEVERITY_CONFIG[sev];
                    return (
                      <button
                        key={sev}
                        onClick={() => setActiveSeverity(sev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-['Source_Sans_3',sans-serif] transition-all ${
                          activeSeverity === sev
                            ? `${s.bg} ${s.text} ${s.border}`
                            : "border-[oklch(0.88_0.01_250)] text-[oklch(0.52_0.03_250)] hover:border-[oklch(0.64_0.03_250)]"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[oklch(0.95_0.005_250)] flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-[oklch(0.64_0.03_250)]" />
          </div>
          <h3 className="font-['Fraunces',serif] font-600 text-lg text-[oklch(0.32_0.04_250)] mb-2">
            No results found
          </h3>
          <p className="text-sm text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] mb-4">
            Try different keywords, or clear your filters.
          </p>
          <button
            onClick={() => { setQuery(""); setActiveCategory("all"); setActiveSeverity("all"); }}
            className="text-sm text-[oklch(0.32_0.12_250)] font-semibold font-['Source_Sans_3',sans-serif] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedId === entry.id}
              onToggle={() => toggleEntry(entry.id)}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-10 p-4 bg-[oklch(0.97_0.003_250)] rounded-xl border border-[oklch(0.88_0.01_250)]">
        <div className="flex items-start gap-3">
          <ExternalLink size={15} className="text-[oklch(0.52_0.03_250)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif] leading-relaxed">
            Can't find your issue here? Check the{" "}
            <a
              href="https://github.com/openclaw/openclaw/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.32_0.12_250)] font-semibold hover:underline"
            >
              OpenClaw GitHub Issues
            </a>{" "}
            page, or the{" "}
            <a
              href="https://docs.docker.com/engine/install/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.32_0.12_250)] font-semibold hover:underline"
            >
              Docker documentation
            </a>{" "}
            for further help.
          </p>
        </div>
      </div>
    </div>
  );
}
