/**
 * CompletionScreen — Blueprint Design
 * Shown when all 20 steps are marked complete.
 * Displays a celebratory header, completion timestamp, notes summary
 * grouped by part, and copy/download actions.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Download, Copy, Check, RotateCcw,
  BookOpen, FileText, Shield, Clock, Star, ChevronDown, ChevronUp
} from "lucide-react";
import { PARTS, STEPS, type Part } from "@/lib/guideData";

interface CompletionScreenProps {
  completedAt: string | null; // ISO string stored in localStorage
  onReset: () => void;
  onViewNotes: () => void;
}

interface NoteEntry {
  stepId: number;
  stepTitle: string;
  partId: number;
  note: string;
}

function loadAllNotes(): NoteEntry[] {
  const entries: NoteEntry[] = [];
  STEPS.forEach((step) => {
    const raw = localStorage.getItem(`openclaw-note-${step.id}`);
    if (raw && raw.trim()) {
      entries.push({
        stepId: step.id,
        stepTitle: step.title,
        partId: step.part,
        note: raw.trim(),
      });
    }
  });
  return entries;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

function buildExportText(notes: NoteEntry[], completedAt: string | null): string {
  const lines: string[] = [
    "OpenClaw AI Agent — Setup Complete",
    "====================================",
    completedAt ? `Completed: ${formatDate(completedAt)}` : "",
    "",
  ];

  const byPart: Record<number, NoteEntry[]> = {};
  notes.forEach((n) => {
    if (!byPart[n.partId]) byPart[n.partId] = [];
    byPart[n.partId].push(n);
  });

  PARTS.forEach((part) => {
    const partNotes = byPart[part.id];
    if (!partNotes?.length) return;
    lines.push(`PART ${part.id}: ${part.title.toUpperCase()}`);
    lines.push("-".repeat(40));
    partNotes.forEach((n) => {
      lines.push(`[Step ${n.stepId}] ${n.stepTitle}`);
      lines.push(n.note);
      lines.push("");
    });
    lines.push("");
  });

  if (notes.length === 0) {
    lines.push("No notes were saved during setup.");
  }

  return lines.join("\n");
}

export default function CompletionScreen({ completedAt, onReset, onViewNotes }: CompletionScreenProps) {
  const [notes] = useState<NoteEntry[]>(() => loadAllNotes());
  const [copied, setCopied] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set(PARTS.map((p) => p.id)));

  const totalNotes = notes.length;
  const exportText = buildExportText(notes, completedAt);

  const byPart: Record<number, NoteEntry[]> = {};
  notes.forEach((n) => {
    if (!byPart[n.partId]) byPart[n.partId] = [];
    byPart[n.partId].push(n);
  });

  const partsWithNotes = PARTS.filter((p) => (byPart[p.id]?.length ?? 0) > 0);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* silent */
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openclaw-setup-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePart = (partId: number) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) next.delete(partId);
      else next.add(partId);
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 pb-24">

      {/* ── Celebration Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.08_250)] to-[oklch(0.18_0.06_250)] border border-[oklch(0.35_0.10_250)] shadow-2xl mb-8 p-8 text-center"
      >
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[oklch(0.60_0.16_162)]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[oklch(0.55_0.18_60)]/10 blur-2xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[oklch(0.60_0.16_162)]/20 border-2 border-[oklch(0.60_0.16_162)] mb-5"
        >
          <CheckCircle2 size={40} className="text-[oklch(0.72_0.18_162)]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-['Fraunces',serif] text-3xl sm:text-4xl font-bold text-white mb-2"
        >
          Setup Complete!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[oklch(0.72_0.04_250)] font-['Source_Sans_3',sans-serif] text-base mb-5"
        >
          Your OpenClaw AI Agent is deployed and secured on your home network.
          {completedAt && (
            <span className="block mt-1 text-sm text-[oklch(0.60_0.04_250)]">
              Completed on {formatDate(completedAt)}
            </span>
          )}
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 flex-wrap"
        >
          {[
            { icon: <CheckCircle2 size={14} />, label: "20 steps done", color: "text-[oklch(0.72_0.18_162)]" },
            { icon: <Shield size={14} />, label: "8 security layers", color: "text-[oklch(0.65_0.14_250)]" },
            { icon: <FileText size={14} />, label: `${totalNotes} note${totalNotes !== 1 ? "s" : ""} saved`, color: "text-[oklch(0.75_0.16_60)]" },
          ].map((stat) => (
            <div key={stat.label} className={`flex items-center gap-1.5 text-sm font-['Source_Sans_3',sans-serif] ${stat.color}`}>
              {stat.icon}
              <span>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Action Buttons ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border text-sm font-semibold font-['Source_Sans_3',sans-serif] text-foreground hover:bg-accent transition-colors"
        >
          {copied ? <Check size={15} className="text-[oklch(0.60_0.16_162)]" /> : <Copy size={15} />}
          {copied ? "Copied!" : "Copy all notes"}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border text-sm font-semibold font-['Source_Sans_3',sans-serif] text-foreground hover:bg-accent transition-colors"
        >
          <Download size={15} />
          Download .txt
        </button>
        <button
          onClick={onViewNotes}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border text-sm font-semibold font-['Source_Sans_3',sans-serif] text-foreground hover:bg-accent transition-colors"
        >
          <BookOpen size={15} />
          Full notes view
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-destructive/40 text-sm font-semibold font-['Source_Sans_3',sans-serif] text-destructive hover:bg-destructive/10 transition-colors ml-auto"
        >
          <RotateCcw size={14} />
          Reset progress
        </button>
      </motion.div>

      {/* ── Notes Summary ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-[oklch(0.75_0.16_60)]" />
          <h2 className="font-['Fraunces',serif] text-xl font-semibold text-foreground">
            Your Configuration Notes
          </h2>
          <span className="ml-auto text-xs text-muted-foreground font-['Source_Sans_3',sans-serif]">
            {totalNotes} note{totalNotes !== 1 ? "s" : ""} across {partsWithNotes.length} part{partsWithNotes.length !== 1 ? "s" : ""}
          </span>
        </div>

        {totalNotes === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <FileText size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
              No notes were saved during setup. You can add notes by going back to any step.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {PARTS.map((part) => {
              const partNotes = byPart[part.id];
              if (!partNotes?.length) return null;
              const isExpanded = expandedParts.has(part.id);

              return (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + part.id * 0.04 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Part header */}
                  <button
                    onClick={() => togglePart(part.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/50 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {part.id}
                    </span>
                    <span className="font-semibold text-sm font-['Source_Sans_3',sans-serif] text-foreground flex-1">
                      Part {part.id}: {part.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif] mr-2">
                      {partNotes.length} note{partNotes.length !== 1 ? "s" : ""}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={15} className="text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown size={15} className="text-muted-foreground flex-shrink-0" />
                    )}
                  </button>

                  {/* Notes list */}
                  {isExpanded && (
                    <div className="border-t border-border divide-y divide-border">
                      {partNotes.map((entry) => (
                        <NoteCard key={entry.stepId} entry={entry} />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── What's Next ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="mt-8 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="font-['Fraunces',serif] text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield size={16} className="text-primary" />
          What to do next
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground font-['Source_Sans_3',sans-serif]">
          {[
            "Run monthly updates: cd ~/openclaw && git pull && docker compose pull && docker compose up -d",
            "Review your OpenClaw activity logs weekly via the dashboard → Logs tab",
            "Consider a managed switch (e.g. TP-Link TL-SG108E, ~$30) for true VLAN isolation",
            "Explore Cloudflare Tunnel for remote access without port forwarding",
            "Enable human-in-the-loop approval in Settings → Agent Behavior for sensitive tasks",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-[oklch(0.60_0.16_162)] mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

// ── NoteCard sub-component ──────────────────────────────────────────────────
function NoteCard({ entry }: { entry: NoteEntry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.note);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="px-5 py-4 group">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-muted-foreground font-['Source_Sans_3',sans-serif] uppercase tracking-wide">
          Step {entry.stepId}
        </span>
        <span className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif]">·</span>
        <span className="text-xs text-foreground font-['Source_Sans_3',sans-serif] font-medium">
          {entry.stepTitle}
        </span>
        <button
          onClick={handleCopy}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
        >
          {copied ? <Check size={11} className="text-[oklch(0.60_0.16_162)]" /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-sm text-foreground font-['Source_Sans_3',sans-serif] whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
        {entry.note}
      </pre>
    </div>
  );
}
