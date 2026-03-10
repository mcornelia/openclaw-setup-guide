/*
 * StepContent Component — Blueprint Design
 * Renders all content types: paragraphs, code, callouts, tables, checklists, substeps, images
 */

import { useState } from "react";
import { AlertTriangle, Info, CheckCircle2, Check } from "lucide-react";
import CodeBlock from "./CodeBlock";
import type { StepContent as StepContentData } from "@/lib/guideData";

interface StepContentProps {
  content: StepContentData[];
  stepId: number;
}

function CalloutBox({ type, title, body }: { type: string; title: string; body: string }) {
  const styles = {
    warning: {
      bg: "bg-amber-50",
      border: "border-l-amber-500",
      iconColor: "text-amber-600",
      titleColor: "text-amber-800",
      bodyColor: "text-amber-900",
      Icon: AlertTriangle,
    },
    info: {
      bg: "bg-slate-50",
      border: "border-l-slate-400",
      iconColor: "text-slate-500",
      titleColor: "text-slate-800",
      bodyColor: "text-slate-700",
      Icon: Info,
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-l-emerald-500",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-800",
      bodyColor: "text-emerald-900",
      Icon: CheckCircle2,
    },
  };

  const s = styles[type as keyof typeof styles] ?? styles.info;
  const { Icon } = s;

  return (
    <div className={`${s.bg} border-l-4 ${s.border} rounded-r-lg p-4 my-4`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${s.iconColor} mt-0.5 flex-shrink-0`} />
        <div>
          <p className={`font-semibold text-sm ${s.titleColor} font-['Source_Sans_3',sans-serif] mb-1`}>
            {title}
          </p>
          <p className={`text-sm ${s.bodyColor} font-['Source_Sans_3',sans-serif] leading-relaxed`}>
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function GuideTable({ headers, rows }: { headers: string[]; rows: { cells: string[]; highlight?: boolean }[] }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-[oklch(0.88_0.01_250)] shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="bg-[oklch(0.18_0.04_250)] text-[oklch(0.88_0.01_250)] px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider font-['Source_Sans_3',sans-serif]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-t border-[oklch(0.88_0.01_250)] transition-colors ${
                row.highlight
                  ? "bg-amber-50 hover:bg-amber-100"
                  : "bg-white hover:bg-[oklch(0.97_0.003_250)]"
              }`}
            >
              {row.cells.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-[oklch(0.25_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubstepList({ substeps }: { substeps: string[] }) {
  return (
    <ol className="my-4 space-y-3">
      {substeps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[oklch(0.32_0.12_250)] text-white text-xs font-bold flex items-center justify-center font-['Fraunces',serif] mt-0.5">
            {i + 1}
          </span>
          <p className="text-[oklch(0.25_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed text-sm pt-0.5">
            {step}
          </p>
        </li>
      ))}
    </ol>
  );
}

function ChecklistItem({ text, checked, onChange }: { text: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        checked ? "bg-emerald-50" : "bg-white hover:bg-[oklch(0.97_0.003_250)]"
      } border ${checked ? "border-emerald-200" : "border-[oklch(0.88_0.01_250)]"}`}
    >
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all duration-200 ${
          checked
            ? "bg-emerald-500 border-emerald-500"
            : "border-[oklch(0.64_0.03_250)] bg-white"
        }`}
        onClick={onChange}
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </div>
      <span
        className={`text-sm font-['Source_Sans_3',sans-serif] leading-relaxed transition-all duration-200 ${
          checked ? "text-emerald-700 line-through decoration-emerald-400" : "text-[oklch(0.25_0.04_250)]"
        }`}
      >
        {text}
      </span>
    </label>
  );
}

export default function StepContentRenderer({ content, stepId }: StepContentProps) {
  const checklistItems = content.find((c) => c.type === "checklist")?.items ?? [];
  const [checked, setChecked] = useState<boolean[]>(
    () => {
      const saved = localStorage.getItem(`checklist-${stepId}`);
      if (saved) return JSON.parse(saved);
      return new Array(checklistItems.length).fill(false);
    }
  );

  const toggleCheck = (index: number) => {
    const next = [...checked];
    next[index] = !next[index];
    setChecked(next);
    localStorage.setItem(`checklist-${stepId}`, JSON.stringify(next));
  };

  return (
    <div className="space-y-2">
      {content.map((item, i) => {
        switch (item.type) {
          case "paragraph":
            return (
              <p
                key={i}
                className="text-[oklch(0.25_0.04_250)] font-['Source_Sans_3',sans-serif] leading-relaxed text-base"
              >
                {item.text}
              </p>
            );

          case "code":
            return item.codeBlocks ? (
              <CodeBlock key={i} codeBlocks={item.codeBlocks} />
            ) : null;

          case "callout":
            return item.callout ? (
              <CalloutBox
                key={i}
                type={item.callout.type}
                title={item.callout.title}
                body={item.callout.body}
              />
            ) : null;

          case "table":
            return item.table ? (
              <GuideTable key={i} headers={item.table.headers} rows={item.table.rows} />
            ) : null;

          case "substep":
            return item.substeps ? (
              <SubstepList key={i} substeps={item.substeps} />
            ) : null;

          case "checklist":
            return (
              <div key={i} className="space-y-2 my-4">
                {checklistItems.map((text, idx) => (
                  <ChecklistItem
                    key={idx}
                    text={text}
                    checked={checked[idx] ?? false}
                    onChange={() => toggleCheck(idx)}
                  />
                ))}
                <div className="mt-3 text-sm text-[oklch(0.52_0.03_250)] font-['Source_Sans_3',sans-serif]">
                  {checked.filter(Boolean).length} of {checklistItems.length} items completed
                </div>
              </div>
            );

          case "image":
            return item.imageUrl ? (
              <div key={i} className="my-5">
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt ?? ""}
                  className="w-full rounded-lg border border-[oklch(0.88_0.01_250)] shadow-sm object-cover max-h-72"
                />
                {item.imageCaption && (
                  <p className="text-xs text-[oklch(0.52_0.03_250)] mt-2 text-center font-['Source_Sans_3',sans-serif] italic">
                    {item.imageCaption}
                  </p>
                )}
              </div>
            ) : null;

          default:
            return null;
        }
      })}
    </div>
  );
}
