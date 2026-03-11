/**
 * StepNotes
 * Blueprint Design — Swiss Modernism
 * Per-step personal notes textarea with auto-save to localStorage.
 * Sits between step content and the troubleshooting helper.
 *
 * Storage key: `openclaw-note-step-{stepId}`
 * Max length: 1000 characters
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotebookPen, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react";

// ── Per-step placeholder prompts ─────────────────────────────────────────────

const STEP_PLACEHOLDERS: Record<number, string> = {
  1:  "e.g. I'm using a mini-PC running Ubuntu 22.04...",
  2:  "e.g. My router's admin page is at 192.168.86.1 · My Nest H2D firmware version is...",
  3:  "e.g. WPA3 enabled on: [date] · Guest network name: OpenClaw-Guest",
  4:  "e.g. Guest network SSID: OpenClaw-Guest · Password stored in 1Password",
  5:  "e.g. UPnP disabled on: [date]",
  6:  "e.g. Server connected to guest network via ethernet · Server MAC: AA:BB:CC:DD:EE:FF",
  7:  "e.g. Docker version installed: 27.x.x · Installed on: [date]",
  8:  "e.g. Git version: 2.x.x · Installed on: [date]",
  9:  "e.g. API provider: Anthropic · Key name: openclaw-home · Spending limit set: $10/month",
  10: "e.g. Cloned to: ~/openclaw · Branch: main",
  11: "e.g. Setup script ran successfully on: [date] · Workspace path: ~/openclaw/workspace",
  12: "e.g. Onboarding completed on: [date] · Model selected: claude-3-5-sonnet",
  13: "e.g. OpenClaw started successfully · Container ID: abc123",
  14: "e.g. Dashboard URL: http://192.168.86.50:18789 · Token expires: [date]",
  15: "e.g. Telegram bot username: @MyOpenClawBot · Bot created on: [date]",
  16: "e.g. Telegram channel paired on: [date] · My Telegram User ID: 123456789",
  17: "e.g. Update schedule: first Sunday of each month · Last updated: [date]",
  18: "e.g. Human-in-the-loop enabled on: [date] · Approval timeout: 30 minutes",
  19: "e.g. Cloudflare Tunnel domain: openclaw.yourdomain.com",
  20: "e.g. All checklist items verified on: [date] · Setup complete!",
};

const DEFAULT_PLACEHOLDER = "Add your personal notes for this step — server IP, passwords, dates, or anything you want to remember...";
const MAX_LENGTH = 1000;
const STORAGE_KEY_PREFIX = "openclaw-note-step-";
const DEBOUNCE_MS = 600;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStorageKey(stepId: number) {
  return `${STORAGE_KEY_PREFIX}${stepId}`;
}

function loadNote(stepId: number): string {
  try {
    return localStorage.getItem(getStorageKey(stepId)) ?? "";
  } catch {
    return "";
  }
}

function saveNote(stepId: number, text: string) {
  try {
    if (text.trim() === "") {
      localStorage.removeItem(getStorageKey(stepId));
    } else {
      localStorage.setItem(getStorageKey(stepId), text);
    }
  } catch {
    // localStorage unavailable — silently ignore
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface StepNotesProps {
  stepId: number;
}

export default function StepNotes({ stepId }: StepNotesProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => loadNote(stepId));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When stepId changes (user navigates to another step), reload note
  useEffect(() => {
    setText(loadNote(stepId));
    setSaveState("idle");
    setShowClearConfirm(false);
  }, [stepId]);

  // Auto-expand if there's already a note for this step
  useEffect(() => {
    const existing = loadNote(stepId);
    if (existing.trim().length > 0) {
      setOpen(true);
    }
  }, [stepId]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open]);

  // Debounced auto-save
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value.slice(0, MAX_LENGTH);
      setText(val);
      setSaveState("saving");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveNote(stepId, val);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      }, DEBOUNCE_MS);
    },
    [stepId]
  );

  // Clear note
  const handleClear = useCallback(() => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
      return;
    }
    setText("");
    saveNote(stepId, "");
    setSaveState("idle");
    setShowClearConfirm(false);
    textareaRef.current?.focus();
  }, [showClearConfirm, stepId]);

  const hasNote = text.trim().length > 0;
  const charPct = (text.length / MAX_LENGTH) * 100;
  const nearLimit = text.length > MAX_LENGTH * 0.85;

  return (
    <div className="mt-6">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left group ${
          open
            ? "border-amber-400/40 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-500/30"
            : hasNote
            ? "border-amber-400/50 bg-amber-50/40 dark:bg-amber-950/10 dark:border-amber-500/20 hover:border-amber-400/70"
            : "border-border bg-card hover:border-amber-400/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/10"
        }`}
      >
        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            open || hasNote
              ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
              : "bg-muted text-muted-foreground group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/30 dark:group-hover:text-amber-400"
          }`}
        >
          <NotebookPen size={15} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground font-['Source_Sans_3',sans-serif]">
            My Notes
          </p>
          <p className="text-xs text-muted-foreground font-['Source_Sans_3',sans-serif] truncate">
            {hasNote
              ? text.trim().slice(0, 60) + (text.trim().length > 60 ? "…" : "")
              : "Tap to add personal notes for this step"}
          </p>
        </div>

        {/* Save state indicator */}
        <AnimatePresence mode="wait">
          {saveState === "saved" && (
            <motion.span
              key="saved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-['Source_Sans_3',sans-serif]"
            >
              <Check size={11} strokeWidth={3} />
              Saved
            </motion.span>
          )}
          {saveState === "saving" && (
            <motion.span
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0 text-[10px] text-muted-foreground font-['Source_Sans_3',sans-serif]"
            >
              Saving…
            </motion.span>
          )}
        </AnimatePresence>

        {/* Note dot indicator when closed */}
        {!open && hasNote && (
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400" />
        )}

        {/* Chevron */}
        <span className="flex-shrink-0 text-muted-foreground">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Notes panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="notes-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="rounded-xl border border-amber-400/30 bg-amber-50/40 dark:bg-amber-950/10 dark:border-amber-500/20 overflow-hidden">
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleChange}
                  placeholder={STEP_PLACEHOLDERS[stepId] ?? DEFAULT_PLACEHOLDER}
                  maxLength={MAX_LENGTH}
                  rows={4}
                  className="w-full px-4 py-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 font-['Source_Sans_3',sans-serif] leading-relaxed resize-none focus:outline-none focus:ring-0 border-0"
                  style={{ minHeight: "6rem" }}
                />

                {/* Footer bar */}
                <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-amber-400/20 bg-amber-50/60 dark:bg-amber-950/20">
                  {/* Progress bar + char count */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-1 h-1 rounded-full bg-amber-200/60 dark:bg-amber-900/40 overflow-hidden max-w-[80px]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          nearLimit ? "bg-red-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(charPct, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-['Source_Sans_3',sans-serif] tabular-nums flex-shrink-0 ${
                        nearLimit
                          ? "text-red-500 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {text.length}/{MAX_LENGTH}
                    </span>
                  </div>

                  {/* Clear button */}
                  {hasNote && (
                    <button
                      onClick={handleClear}
                      className={`flex items-center gap-1 text-[11px] font-semibold font-['Source_Sans_3',sans-serif] px-2 py-1 rounded transition-colors ${
                        showClearConfirm
                          ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                          : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                      title={showClearConfirm ? "Click again to confirm" : "Clear note"}
                    >
                      <Trash2 size={11} />
                      {showClearConfirm ? "Confirm clear?" : "Clear"}
                    </button>
                  )}

                  {/* Auto-save notice */}
                  <span className="text-[10px] text-muted-foreground/60 font-['Source_Sans_3',sans-serif] flex-shrink-0">
                    Auto-saved locally
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
