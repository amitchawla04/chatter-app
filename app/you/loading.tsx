import { ChatterMark } from "@/components/ChatterMark";
import { WhisperSkeleton } from "@/components/WhisperSkeleton";

export default function YouLoading() {
  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>
      <section className="px-5 pt-8 pb-6 border-b border-line">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-line/60 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 bg-line/60 animate-pulse" />
            <div className="h-3 w-24 bg-line/60 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-line/50">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-6 w-12 bg-line/60 animate-pulse mx-auto" />
              <div className="h-2 w-14 bg-line/60 animate-pulse mx-auto" />
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border border-line px-3 py-2.5 space-y-1.5">
              <div className="h-2 w-12 bg-line/60 animate-pulse mx-auto" />
              <div className="h-3 w-16 bg-line/60 animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </section>
      <section className="pb-8 pt-3">
        <WhisperSkeleton />
        <WhisperSkeleton />
      </section>
    </main>
  );
}
