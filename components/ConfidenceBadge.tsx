import React, { memo } from "react";
import type { ConfidenceSignal } from "../services/aiService";

// ═══════════════════════════════════════════════════════════════════
// CONFIDENCE BADGE
// Renders the confidence level for each assistant response.
// This is Nexus's key differentiator — users see certainty, not just answers.
// Replaces the need to re-validate answers on other platforms.
// ═══════════════════════════════════════════════════════════════════

interface Props {
  confidence: ConfidenceSignal;
  /** If true, shows the full tooltip on click rather than hover */
  mobile?: boolean;
}

const CONFIG = {
  high: {
    dot:   "#10b981", // emerald-500
    text:  "#10b981",
    bg:    "rgba(16, 185, 129, 0.08)",
    border:"rgba(16, 185, 129, 0.2)",
    icon:  "✓",
  },
  moderate: {
    dot:   "#f59e0b", // amber-500
    text:  "#f59e0b",
    bg:    "rgba(245, 158, 11, 0.08)",
    border:"rgba(245, 158, 11, 0.2)",
    icon:  "◎",
  },
  low: {
    dot:   "#f87171", // red-400
    text:  "#f87171",
    bg:    "rgba(248, 113, 113, 0.08)",
    border:"rgba(248, 113, 113, 0.2)",
    icon:  "⚠",
  },
  live: {
    dot:   "#60a5fa", // blue-400
    text:  "#60a5fa",
    bg:    "rgba(96, 165, 250, 0.08)",
    border:"rgba(96, 165, 250, 0.2)",
    icon:  "◉",
  },
} as const;

export const ConfidenceBadge = memo(({ confidence, mobile = false }: Props) => {
  const [showTip, setShowTip] = React.useState(false);
  const cfg = CONFIG[confidence.level];

  return (
    <div className="confidence-badge-root">
      {/* Badge */}
      <button
        onClick={() => setShowTip((v) => !v)}
        onMouseEnter={() => !mobile && setShowTip(true)}
        onMouseLeave={() => !mobile && setShowTip(false)}
        className="confidence-badge-btn"
        data-badge-bg={cfg.bg}
        data-badge-border={cfg.border}
        aria-label={`Confidence: ${confidence.label}. ${confidence.reason}`}
      >
        {/* Animated dot for live, static for others */}
        <span
          className={`confidence-badge-dot${confidence.level === "live" ? " confidence-badge-dot-live" : ""}`}
          data-badge-dot={cfg.dot}
        />
        <span
          className="confidence-badge-label"
          data-badge-text={cfg.text}
        >
          {confidence.label}
        </span>
      </button>

      {/* Tooltip */}
      {showTip && (
        <div
          role="tooltip"
          className={`confidence-badge-tooltip${mobile ? " confidence-badge-tooltip-mobile" : ""}`}
        >
          {/* Arrow */}
          <div className="confidence-badge-tooltip-arrow" />
          <p className="confidence-badge-tooltip-title" data-badge-text={cfg.text}>
            {cfg.icon} {confidence.label}
          </p>
          <p className="confidence-badge-tooltip-reason">
            {confidence.reason}
          </p>
        </div>
      )}

      {/* Keyframes moved to CSS */}
    </div>
  );
});

ConfidenceBadge.displayName = "ConfidenceBadge";
export default ConfidenceBadge;