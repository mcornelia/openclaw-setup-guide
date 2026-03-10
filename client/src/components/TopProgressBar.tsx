/**
 * TopProgressBar — Blueprint Design
 * A rich, segmented progress bar for the top header.
 * - Taller animated fill bar (h-3)
 * - 8 part segments separated by white dividers
 * - Hovering any segment shows a tooltip with part name + completion
 * - Clicking a segment navigates to that part's first step
 * - Percentage label + step count on the right
 * - "All done!" celebration state in emerald
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PARTS, STEPS, TOTAL_STEPS } from "@/lib/guideData";

interface TopProgressBarProps {
  completedSteps: Set<number>;
  onNavigateToPart?: (firstStepId: number) => void;
}

export default function TopProgressBar({ completedSteps, onNavigateToPart }: TopProgressBarProps) {
  const [hoveredPart, setHoveredPart] = useState<number | null>(null);

  const progressPct = (completedSteps.size / TOTAL_STEPS) * 100;
  const isComplete = completedSteps.size === TOTAL_STEPS;

  // Compute per-part data
  const partData = PARTS.map((part) => {
    const partSteps = STEPS.filter((s) => s.part === part.id);
    const completedCount = partSteps.filter((s) => completedSteps.has(s.id)).length;
    const firstStepId = partSteps[0]?.id ?? 1;
    const widthPct = (partSteps.length / TOTAL_STEPS) * 100;
    const isPartDone = completedCount === partSteps.length;
    const isPartStarted = completedCount > 0;
    return { ...part, partSteps, completedCount, firstStepId, widthPct, isPartDone, isPartStarted };
  });

  const hoveredPartData = hoveredPart !== null ? partData.find((p) => p.id === hoveredPart) : null;

  return (
    <div className="flex-1 max-w-md mx-6 hidden sm:flex items-center gap-3">
      {/* Segmented bar — full clickable/hoverable width */}
      <div className="relative flex-1 h-3 rounded-full overflow-hidden bg-[oklch(0.91_0.008_250)] cursor-pointer">
        {/* Animated fill */}
        <motion.div
          className={`absolute left-0 top-0 h-full ${
            isComplete
              ? "bg-[oklch(0.60_0.16_162)]"
              : "bg-[oklch(0.38_0.14_250)]"
          }`}
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Segment hit areas + dividers */}
        <div className="absolute inset-0 flex">
          {partData.map((part, idx) => (
            <div
              key={part.id}
              className="relative h-full"
              style={{ width: `${part.widthPct}%` }}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
              onClick={() => onNavigateToPart?.(part.firstStepId)}
            >
              {/* Divider line between segments (not after last) */}
              {idx < partData.length - 1 && (
                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/70 z-10" />
              )}

              {/* Tooltip */}
              {hoveredPart === part.id && hoveredPartData && (
                <div
                  className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-50
                    bg-[oklch(0.18_0.04_250)] text-white rounded-lg px-3 py-2
                    shadow-xl pointer-events-none whitespace-nowrap"
                  style={{ fontSize: "11px", fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <div className="font-semibold leading-tight">
                    Part {part.id}: {part.shortTitle}
                  </div>
                  <div
                    className="mt-0.5 leading-tight"
                    style={{ color: "oklch(0.70 0.03 250)" }}
                  >
                    {hoveredPartData.completedCount}/{hoveredPartData.partSteps.length} steps
                    {hoveredPartData.isPartDone ? " · Complete ✓" : hoveredPartData.isPartStarted ? " · In progress" : " · Not started"}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                    border-l-4 border-r-4 border-t-4
                    border-l-transparent border-r-transparent border-t-[oklch(0.18_0.04_250)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right label */}
      {isComplete ? (
        <div className="flex items-center gap-1.5 text-[oklch(0.50_0.16_162)] flex-shrink-0">
          <Check size={13} strokeWidth={3} />
          <span
            className="text-xs font-bold whitespace-nowrap"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            All done!
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="text-xs font-bold tabular-nums text-[oklch(0.38_0.12_250)]"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {Math.round(progressPct)}%
          </span>
          <span
            className="text-[10px] text-[oklch(0.60_0.03_250)] whitespace-nowrap"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {completedSteps.size}/{TOTAL_STEPS}
          </span>
        </div>
      )}
    </div>
  );
}
