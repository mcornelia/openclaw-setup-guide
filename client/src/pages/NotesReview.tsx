/**
 * NotesReview
 * Blueprint Design — Swiss Modernism
 * Displays all per-step notes grouped by part.
 * Reads from localStorage keys: openclaw-note-step-{id}
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen, Copy, Check, Download, ChevronRight,
  FileText, AlertCircle, Pencil, RefreshCw,
} from "lucide-react";
import { PARTS, STEPS } from "@/lib/guideData";

const STORAGE_KEY_PREFIX = "openclaw-note-step-";

function loadNote(stepId: number): string {
  try {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${stepId}`) ?? "";
  } catch {
    return "";
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepNote {
  stepId: number;
  stepTitle: string;
  stepShortTitle: string;
  partId: number;
  text: string;
}

interface PartGroup {
  partId: number;
  partTitle: string;
  partShortTitle: string;
  partIcon: string;
  notes: StepNote[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildGroups(): PartGroup[] {
  return PARTS.map((part) => {
    const notes: StepNote[] = part.steps
      .map((stepId) => {
        const step = STEPS.find((s) => s.id === stepId);
        if (!step) return null;
        const text = loadNote(stepId);
        if (!text.trim()) return null;
        return {
          stepId,
          stepTitle: step.title,
          stepShortTitle: step.shortTitle,
          partId: part.id,
          text,
        };
      })
      .filter(Boolean) as StepNote[];
    return {
      partId: part.id,
      partTitle: part.title,
      partShortTitle: part.shortTitle,
      partIcon: part.icon,
      notes,
    };
  });
}

function buildPlainText(groups: PartGroup[]): string {
  const lines: string[] = [
    "OpenClaw Home Server Setup — My Configuration Notes",
    `Exported: ${new Date().toLocaleString()}`,
    "=".repeat(60),
    "",
  ];
  groups.forEach((g) => {
    if (g.notes.length === 0) return;
    lines.push(`PART ${g.partId}: ${g.partTitle.toUpperCase()}`);
    lines.push("-".repeat(40));
    g.notes.forEach((n) => {
      lines.push(`Step ${n.stepId} — ${n.stepTitle}`);
      lines.push(n.text);
      lines.push("");
    });
    lines.push("");
  });
  return lines.join("\n");
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-semibold font-['Source_Sans_3',sans-serif] px-3 py-1.5 rounded-lg border transition-colors ${
        copied
          ? "border-emerald-400/50 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
      } ${className}`}
    >
      {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ── Single note card ──────────────────────────────────────────────────────────

function NoteCard({
  note,
  onGoToStep,
}: {
  note: StepNote;
  onGoToStep: (stepId: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-primary font-['Source_Sans_3',sans-serif]">
            {note.stepId}
          </span>
        </div>
        <p className="flex-1 text-sm font-semibold text-foreground font-['Source_Sans_3',sans-serif] truncate">
          {note.stepTitle}
        </p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <CopyButton text={note.text} label="Copy" />
          <button
            onClick={() => onGoToStep(note.stepId)}
            className="flex items-center gap-1 text-xs font-semibold font-['Source_Sans_3',sans-serif] px-2.5 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            title="Go to this step to edit the note"
          >
            <Pencil size={11} />
            Edit
          </button>
        </div>
      </div>

      {/* Note text */}
      <div className="px-4 py-3">
        <pre className="text-sm text-foreground font-['Source_Sans_3',sans-serif] leading-relaxed whitespace-pre-wrap break-words">
          {note.text}
        </pre>
      </div>
    </motion.div>
  );
}

// ── Part group section ────────────────────────────────────────────────────────

function PartSection({
  group,
  onGoToStep,
}: {
  group: PartGroup;
  onGoToStep: (stepId: number) => void;
}) {
  if (group.notes.length === 0) return null;

  return (
    <section>
      {/* Part header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-base">{group.partIcon}</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold font-['Source_Sans_3',sans-serif]">
            Part {group.partId}
          </p>
          <h3 className="text-base font-bold text-foreground font-['Fraunces',serif] leading-tight">
            {group.partTitle}
          </h3>
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-['Source_Sans_3',sans-serif]">
          {group.notes.length} note{group.notes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Note cards */}
      <div className="space-y-3 pl-11">
        {group.notes.map((note) => (
          <NoteCard key={note.stepId} note={note} onGoToStep={onGoToStep} />
        ))}
      </div>
    </section>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onGoToGuide }: { onGoToGuide: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-6">
        <NotebookPen size={28} className="text-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground font-['Fraunces',serif] mb-2">
        No notes yet
      </h2>
      <p className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif] leading-relaxed mb-8">
        As you work through the setup steps, use the <strong>My Notes</strong> panel at the bottom of each step to record your server's IP address, API key details, dates, and anything else you want to remember. All notes will appear here.
      </p>
      <button
        onClick={onGoToGuide}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold font-['Source_Sans_3',sans-serif] hover:opacity-90 transition-opacity"
      >
        Start the guide
        <ChevronRight size={15} />
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface NotesReviewProps {
  onClose: () => void;
  onGoToStep: (stepId: number) => void;
}

export default function NotesReview({ onClose, onGoToStep }: NotesReviewProps) {
  const [groups, setGroups] = useState<PartGroup[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load notes from localStorage
  useEffect(() => {
    setGroups(buildGroups());
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const allNotes = groups.flatMap((g) => g.notes);
  const totalNotes = allNotes.length;
  const plainText = buildPlainText(groups);

  // Download as .txt
  const handleDownload = useCallback(() => {
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openclaw-notes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [plainText]);

  const stepsWithNotes = allNotes.map((n) => n.stepId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 pb-24">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-['Source_Sans_3',sans-serif] mb-4">
          <button onClick={onClose} className="hover:text-foreground transition-colors">
            Guide
          </button>
          <ChevronRight size={12} />
          <span className="text-foreground font-semibold">My Configuration Notes</span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                <FileText size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground font-['Fraunces',serif]">
                My Configuration Notes
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
              {totalNotes > 0
                ? `${totalNotes} note${totalNotes !== 1 ? "s" : ""} across ${
                    groups.filter((g) => g.notes.length > 0).length
                  } part${groups.filter((g) => g.notes.length > 0).length !== 1 ? "s" : ""} — your personal setup reference`
                : "Notes you add during setup will appear here"}
            </p>
          </div>

          {/* Action buttons */}
          {totalNotes > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={refresh}
                className="flex items-center gap-1.5 text-xs font-semibold font-['Source_Sans_3',sans-serif] px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh notes from storage"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
              <CopyButton text={plainText} label="Copy all" />
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-semibold font-['Source_Sans_3',sans-serif] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Download size={12} />
                Download .txt
              </button>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {totalNotes > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {/* Steps with notes */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <NotebookPen size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-foreground font-['Source_Sans_3',sans-serif]">
                {stepsWithNotes.length} / {STEPS.length} steps have notes
              </span>
            </div>
            {/* Total characters */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <FileText size={13} className="text-blue-500" />
              <span className="text-xs font-semibold text-foreground font-['Source_Sans_3',sans-serif]">
                {allNotes.reduce((acc, n) => acc + n.text.length, 0).toLocaleString()} characters total
              </span>
            </div>
            {/* Warning about localStorage */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-400/30">
              <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-400 font-['Source_Sans_3',sans-serif]">
                Saved in this browser only — download to keep a permanent copy
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        {totalNotes > 0 && <div className="mt-6 h-px bg-border" />}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {totalNotes === 0 ? (
          <EmptyState key="empty" onGoToGuide={onClose} />
        ) : (
          <motion.div
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {groups.map((group) => (
              <PartSection
                key={group.partId}
                group={group}
                onGoToStep={(stepId) => {
                  onGoToStep(stepId);
                }}
              />
            ))}

            {/* Footer copy/download repeat */}
            <div className="pt-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif]">
                Notes are stored locally in your browser. Download to keep a permanent copy.
              </p>
              <div className="flex items-center gap-2">
                <CopyButton text={plainText} label="Copy all notes" />
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs font-semibold font-['Source_Sans_3',sans-serif] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Download size={12} />
                  Download .txt
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
