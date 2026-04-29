import { ChatterMark } from "@/components/ChatterMark";
import { WhisperSkeleton } from "@/components/WhisperSkeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" pulse="breath" />
        <div className="h-3 w-24 bg-line/60 animate-pulse" />
      </header>
      <section className="border-b border-line bg-paper">
        <div className="px-5 pt-4 pb-1 flex items-baseline justify-between">
          <div className="h-3 w-28 bg-line/60 animate-pulse" />
          <div className="h-3 w-8 bg-line/60 animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 py-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-none flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-line/60 animate-pulse" />
              <div className="h-2 w-12 bg-line/60 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
      <section className="pb-8 pt-3">
        <WhisperSkeleton />
        <WhisperSkeleton />
        <WhisperSkeleton />
      </section>
    </main>
  );
}
