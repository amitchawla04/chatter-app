/**
 * WhisperSkeleton — the loading state for whisper cards.
 * Methodology rule: skeletons only, no spinners (per 24-VISUAL-DNA + 00-METHODOLOGY).
 */
export function WhisperSkeleton() {
  return (
    <div className="px-5 py-5 border-b border-line/60 animate-pulse">
      <div className="h-3 w-24 bg-line/60 mb-3" />
      <div className="h-3 w-32 bg-line/60 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-line/80 w-full" />
        <div className="h-4 bg-line/80 w-11/12" />
        <div className="h-4 bg-line/80 w-3/4" />
      </div>
      <div className="h-3 w-40 bg-line/60 mb-4" />
      <div className="flex gap-6">
        <div className="h-3 w-10 bg-line/60" />
        <div className="h-3 w-12 bg-line/60" />
        <div className="h-3 w-6 bg-line/60" />
      </div>
    </div>
  );
}
