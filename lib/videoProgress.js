// Shared pipeline progress model.
// The Inngest function writes `currentStep` + `progress` to the video_data row,
// and the progress UI derives its step states from those real values here.

export const PIPELINE_STEPS = [
  { key: "audio", label: "Writing voiceover", activeLabel: "Synthesizing narration..." },
  { key: "scenes", label: "Creating AI scenes", activeLabel: "Generating visuals..." },
  { key: "captions", label: "Syncing captions", activeLabel: "Aligning timestamps..." },
  { key: "render", label: "Rendering video", activeLabel: "Rendering final cut..." },
];

// Returns 'complete' | 'active' | 'pending' for a single pipeline step.
export function getStepState(stepKey, { currentStep, status }) {
  if (status === "completed" || currentStep === "done") return "complete";

  const currentIndex = PIPELINE_STEPS.findIndex((s) => s.key === currentStep);
  const stepIndex = PIPELINE_STEPS.findIndex((s) => s.key === stepKey);

  // No marker yet (e.g. 'queued') — nothing has started.
  if (currentIndex === -1) return "pending";
  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}
