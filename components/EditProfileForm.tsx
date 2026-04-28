"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/app/settings/profile/actions";

interface Props {
  initialName: string;
  initialBio: string;
  initialPronouns: string;
  initialLocation: string;
}

export function EditProfileForm({
  initialName,
  initialBio,
  initialPronouns,
  initialLocation,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [pronouns, setPronouns] = useState(initialPronouns);
  const [location, setLocation] = useState(initialLocation);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("display_name", name);
      fd.set("bio", bio);
      fd.set("pronouns", pronouns);
      fd.set("location", location);
      const res = await saveProfile(fd);
      if (!res.ok) {
        setError(res.error ?? "couldn't save.");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="display name" max={60}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          className="w-full bg-transparent border border-line focus:border-red text-ink px-3 py-2 outline-none transition-colors"
          placeholder="amit chawla"
        />
      </Field>

      <Field label="bio" max={280} count={bio.length}>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 280))}
          rows={3}
          className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm resize-none"
          placeholder="who you are · what you whisper about"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="pronouns" max={30}>
          <input
            type="text"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value.slice(0, 30))}
            className="w-full bg-transparent border border-line focus:border-red text-ink px-3 py-2 outline-none transition-colors"
            placeholder="he / they / she"
          />
        </Field>
        <Field label="location" max={60}>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value.slice(0, 60))}
            className="w-full bg-transparent border border-line focus:border-red text-ink px-3 py-2 outline-none transition-colors"
            placeholder="bengaluru · london"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full justify-center"
      >
        {pending ? "saving…" : saved ? "✓ saved" : "save"}
      </button>

      {error && <p className="text-warn text-sm">{error}</p>}
    </form>
  );
}

function Field({
  label,
  max,
  count,
  children,
}: {
  label: string;
  max?: number;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label-text text-muted">{label}</label>
        {max && count !== undefined && (
          <span className="mono-text text-[10px] text-muted">
            {count} / {max}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
