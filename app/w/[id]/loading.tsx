import { ChatterMark } from "@/components/ChatterMark";
import { WhisperSkeleton } from "@/components/WhisperSkeleton";

export default function WhisperDetailLoading() {
  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <div className="w-4" />
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>
      <WhisperSkeleton />
      <section className="pt-2 pb-4">
        <WhisperSkeleton />
        <WhisperSkeleton />
      </section>
    </main>
  );
}
