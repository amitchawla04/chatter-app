import { ChatterMark } from "@/components/ChatterMark";
import { WhisperSkeleton } from "@/components/WhisperSkeleton";

export default function SearchLoading() {
  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <div className="w-4" />
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>
      <div className="px-5 py-4">
        <div className="h-12 bg-line/40 animate-pulse" />
      </div>
      <section>
        <WhisperSkeleton />
        <WhisperSkeleton />
        <WhisperSkeleton />
      </section>
    </main>
  );
}
