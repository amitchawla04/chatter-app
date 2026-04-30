/**
 * WhisperSkeleton — the loading state for whisper cards.
 * Designer pass: shimmer instead of plain pulse, with the brand's red period
 * breathing as the progress signal. Pact-aligned: feels intentional, not generic.
 */
export function WhisperSkeleton() {
  return (
    <div className="px-5 py-5 border-b border-line/60 chatter-shimmer relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-3 rounded-full bg-line/70" />
        <div className="h-3 w-20 bg-line/60" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-line/70 w-full" />
        <div className="h-5 bg-line/70 w-11/12" />
        <div className="h-5 bg-line/70 w-3/4" />
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
