/*
 * CodeBlock Component — Blueprint Design
 * Terminal-style code display with OS tabs and copy-to-clipboard
 * Fonts: JetBrains Mono for code, Source Sans 3 for labels
 */

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import type { CodeBlock as CodeBlockData, OS } from "@/lib/guideData";

interface CodeBlockProps {
  codeBlocks: CodeBlockData[];
}

const OS_LABELS: Record<OS, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

const OS_ICONS: Record<OS, string> = {
  windows: "⊞",
  macos: "",
  linux: "🐧",
};

export default function CodeBlock({ codeBlocks }: CodeBlockProps) {
  const hasOSTabs = codeBlocks.some((b) => b.os);
  const [activeOS, setActiveOS] = useState<OS | undefined>(
    hasOSTabs ? (codeBlocks[0].os as OS) : undefined
  );
  const [copied, setCopied] = useState(false);

  const activeBlock = hasOSTabs
    ? codeBlocks.find((b) => b.os === activeOS) ?? codeBlocks[0]
    : codeBlocks[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeBlock.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[oklch(0.28_0.04_250)] shadow-md my-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[oklch(0.18_0.04_250)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.2_25)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.74_0.19_60)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.60_0.16_162)]" />
          </div>
          {/* OS Tabs */}
          {hasOSTabs ? (
            <div className="flex gap-1">
              {codeBlocks.map((block) => (
                <button
                  key={block.os}
                  onClick={() => setActiveOS(block.os as OS)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all duration-150 font-['Source_Sans_3',sans-serif] ${
                    activeOS === block.os
                      ? "bg-[oklch(0.32_0.12_250)] text-white"
                      : "text-[oklch(0.64_0.03_250)] hover:text-white hover:bg-[oklch(0.25_0.04_250)]"
                  }`}
                >
                  {block.os && OS_ICONS[block.os as OS]} {block.label ?? (block.os && OS_LABELS[block.os as OS])}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[oklch(0.64_0.03_250)]">
              <Terminal size={14} />
              <span className="text-xs font-['Source_Sans_3',sans-serif]">
                {activeBlock.label ?? "Terminal"}
              </span>
            </div>
          )}
        </div>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-[oklch(0.64_0.03_250)] hover:text-white hover:bg-[oklch(0.25_0.04_250)] transition-all duration-150 font-['Source_Sans_3',sans-serif]"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[oklch(0.60_0.16_162)]" />
              <span className="text-[oklch(0.60_0.16_162)]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <div className="bg-[oklch(0.14_0.04_250)] overflow-x-auto">
        <pre className="p-5 text-[oklch(0.88_0.01_250)] text-sm leading-relaxed font-['JetBrains_Mono',monospace] whitespace-pre">
          {activeBlock.code.split("\n").map((line, i) => {
            const isComment = line.trim().startsWith("#");
            return (
              <span key={i}>
                <span
                  className={
                    isComment
                      ? "text-[oklch(0.52_0.03_250)]"
                      : "text-[oklch(0.88_0.01_250)]"
                  }
                >
                  {line}
                </span>
                {"\n"}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
