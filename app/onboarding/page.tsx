"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChatterMark } from "@/components/ChatterMark";
import { competitionTopics, worldCupTeams, premierLeagueClubs, breakoutPlayers } from "@/lib/topics";

// Featured topics for the onboarding picker — curated top 24 for fast decision
const featured = [
  ...competitionTopics.slice(0, 3),
  ...worldCupTeams.filter((t) =>
    ["nt-england", "nt-france", "nt-spain", "nt-brazil", "nt-argentina", "nt-usa", "nt-india"].includes(t.id),
  ),
  ...premierLeagueClubs.filter((t) =>
    ["epl-arsenal", "epl-man-united", "epl-liverpool", "epl-man-city", "epl-chelsea", "epl-tottenham"].includes(t.id),
  ),
  ...breakoutPlayers.slice(0, 6),
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const proceed = () => {
    if (selected.length < 5) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("chatter_onboarded_topics", JSON.stringify(selected));
    }
    router.push("/home");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-8 flex justify-between items-center">
        <ChatterMark size="sm" />
        <span className="label-text text-muted">Step 1 of 2</span>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="label-text text-gold mb-6"
          >
            Tune into what you care about
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="display-text text-4xl sm:text-5xl text-cream mb-3"
          >
            What do you want to hear about?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="body-text text-muted mb-10"
          >
            Pick at least 5 to start. You can follow more later.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-2"
          >
            {featured.map((topic) => {
              const isSelected = selected.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => toggle(topic.id)}
                  className="topic-chip"
                >
                  {topic.emoji && <span>{topic.emoji}</span>}
                  <span>{topic.name}</span>
                </button>
              );
            })}
          </motion.div>

          <div className="mt-16 flex items-center justify-between">
            <span className="mono-text text-sm text-muted">
              {selected.length} / 5 selected
            </span>
            <button
              type="button"
              onClick={proceed}
              disabled={selected.length < 5}
              className="btn-primary"
            >
              Continue
              <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
