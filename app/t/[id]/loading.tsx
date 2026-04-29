import { ChatterMark } from "@/components/ChatterMark";
import { WhisperSkeleton } from "@/components/WhisperSkeleton";

export default function TopicLoading() {
  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <div className="w-4" />
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>
      <section className="px-5 py-6 border-b border-line space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-line/60 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-40 bg-line/60 animate-pulse" />
            <div className="h-3 w-44 bg-line/60 animate-pulse" />
          </div>
        </div>
        <div className="h-9 w-24 bg-line/60 animate-pulse" />
      </section>
      <section>
        <WhisperSkeleton />
        <WhisperSkeleton />
        <WhisperSkeleton />
      </section>
    </main>
  );
}
