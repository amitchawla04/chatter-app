import { ChatterMark } from "@/components/ChatterMark";
import { WhisperSkeleton } from "@/components/WhisperSkeleton";

export default function LiveEventLoading() {
  return (
    <main className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <div className="w-4" />
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>
      <section className="px-5 py-7 border-b border-line text-center space-y-4">
        <div className="h-3 w-44 bg-line/60 animate-pulse mx-auto" />
        <div className="flex items-center justify-center gap-6">
          <div className="h-6 w-20 bg-line/60 animate-pulse" />
          <div className="h-12 w-24 bg-line/60 animate-pulse" />
          <div className="h-6 w-20 bg-line/60 animate-pulse" />
        </div>
        <div className="h-4 w-12 bg-line/60 animate-pulse mx-auto" />
      </section>
      <section className="px-5 py-5 border-b border-line space-y-3">
        <div className="h-3 w-20 bg-line/60 animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 h-12 bg-line/60 animate-pulse"
            />
          ))}
        </div>
      </section>
      <section>
        <WhisperSkeleton />
        <WhisperSkeleton />
      </section>
    </main>
  );
}
