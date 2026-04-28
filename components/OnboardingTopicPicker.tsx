"use client";

/**
 * Client-side topic picker for onboarding step 1.
 * Calls saveTunes server action + routes to handle claim.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { saveTunes } from "@/app/onboarding/actions";

interface Topic {
  id: string;
  name: string;
  emoji: string | null;
}

export function OnboardingTopicPicker({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const proceed = () => {
    setError(null);
    startTransition(async () => {
      const res = await saveTunes(selected);
      if (!res.ok) {
        setError(res.error ?? "something went wrong");
        return;
      }
      router.push("/onboarding/handle");
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        {topics.map((topic) => {
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

      <div className="mt-12 flex items-center justify-between">
        <span className="mono-text text-sm text-muted">
          {selected.length} / 5 selected
        </span>
        <button
          type="button"
          onClick={proceed}
          disabled={selected.length < 5 || pending}
          className="btn-primary"
        >
          {pending ? "saving…" : "continue"}
          {!pending && <span>→</span>}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-warn text-sm">{error}</p>
      )}
    </>
  );
}
