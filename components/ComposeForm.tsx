"use client";

/**
 * ComposeForm — with the 6 P1 features baked in:
 *  X1 Breath whisper (5th modality · 60-char · village-locked · 24h TTL)
 *  X2 Spoiler toggle
 *  X3 Reply agency (require_reply_approval toggle)
 *  X10 Vanishing whispers (TTL picker, scope-derived defaults)
 * Craft Bet B pull-quote styling for the input area.
 */
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Type,
  Mic,
  Image as ImageIcon,
  Video,
  Wind,
  ShieldAlert,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import { postWhisper } from "@/app/compose/actions";
import { uploadMedia } from "@/lib/upload-actions";
import { VoiceRecorder } from "./VoiceRecorder";
import { ImagePicker } from "./ImagePicker";

type Modality = "text" | "voice" | "image" | "video" | "breath";
type Scope = "public" | "network" | "circle" | "private";
type TTL = "permanent" | "24h" | "view_once";

interface Topic {
  id: string;
  name: string;
  emoji: string | null;
}

interface Props {
  topics: Topic[];
  initialTopicId?: string;
}

export function ComposeForm({ topics, initialTopicId }: Props) {
  const router = useRouter();
  const [modality, setModality] = useState<Modality>("text");
  const [scope, setScope] = useState<Scope>("public");
  const [topicId, setTopicId] = useState<string>(initialTopicId || topics[0]?.id || "");
  const [text, setText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [requireReplyApproval, setRequireReplyApproval] = useState(false);
  const [ttl, setTtl] = useState<TTL | null>(null); // null = use default
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Media state
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isBreath = modality === "breath";
  const charLimit = isBreath ? 60 : 280;
  const effectiveScope = isBreath ? "circle" : scope;
  const isMediaMode = modality === "voice" || modality === "image" || modality === "video";
  const hasMedia = (modality === "voice" && voiceBlob) || (modality === "image" && imageFile);

  // Scope-derived TTL default
  const defaultTtl: TTL = useMemo(() => {
    if (isBreath) return "24h";
    if (effectiveScope === "public") return "permanent";
    if (effectiveScope === "private") return "view_once";
    return "24h";
  }, [isBreath, effectiveScope]);

  const effectiveTtl = ttl ?? defaultTtl;
  const remaining = charLimit - text.length;
  const canPost =
    isMediaMode
      ? Boolean(hasMedia && topicId && text.length <= charLimit)
      : Boolean(text.trim().length > 0 && text.length <= charLimit && topicId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) return;
    setError(null);
    startTransition(async () => {
      let mediaUrl: string | null = null;
      let mediaDuration: number | null = null;

      // Upload media first if present
      if (modality === "voice" && voiceBlob) {
        const uploadFd = new FormData();
        uploadFd.set("file", new File([voiceBlob], "voice.webm", { type: "audio/webm" }));
        uploadFd.set("kind", "voice");
        const up = await uploadMedia(uploadFd);
        if (!up.ok) {
          setError(`upload failed: ${up.error}`);
          return;
        }
        mediaUrl = up.url;
        mediaDuration = voiceDuration;
      }
      if (modality === "image" && imageFile) {
        const uploadFd = new FormData();
        uploadFd.set("file", imageFile);
        uploadFd.set("kind", "image");
        const up = await uploadMedia(uploadFd);
        if (!up.ok) {
          setError(`upload failed: ${up.error}`);
          return;
        }
        mediaUrl = up.url;
      }

      const fd = new FormData();
      fd.set("content", text);
      fd.set("topicId", topicId);
      fd.set("scope", effectiveScope);
      fd.set("modality", modality);
      if (effectiveScope !== "public" || isBreath) {
        fd.set("ttl", effectiveTtl);
      }
      if (isSpoiler) fd.set("is_spoiler", "on");
      if (requireReplyApproval) fd.set("require_reply_approval", "on");
      if (mediaUrl) fd.set("media_url", mediaUrl);
      if (mediaDuration) fd.set("media_duration", String(mediaDuration));

      const res = await postWhisper(fd);
      if (!res.ok) {
        setError(res.error ?? "couldn't send. try again.");
        return;
      }
      router.push("/home");
    });
  };

  const selectedTopic = topics.find((t) => t.id === topicId);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-line">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted hover:text-ink"
          aria-label="Close compose"
        >
          <X size={22} strokeWidth={1.5} />
        </button>
        <h1 className="display-text text-xl text-ink">
          {isBreath ? "a breath" : "a whisper"}
        </h1>
        <button
          type="submit"
          form="compose-form"
          disabled={!canPost || pending}
          className="btn-primary px-6 py-2 text-sm"
        >
          {pending ? "sending…" : isBreath ? "breathe" : "whisper"}
        </button>
      </header>

      <form id="compose-form" onSubmit={submit} className="flex-1 p-5 space-y-6">
        {/* Topic chip row */}
        <div>
          <label className="label-text text-muted mb-3 block">to</label>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopicId(t.id)}
                data-selected={topicId === t.id}
                className="topic-chip"
              >
                {t.emoji && <span>{t.emoji}</span>}
                <span>{t.name}</span>
              </button>
            ))}
          </div>
          {selectedTopic && (
            <p className="mt-2 mono-text text-[11px] text-muted">
              whispering to <span className="text-gold">{selectedTopic.name}</span>
            </p>
          )}
        </div>

        {/* Composer body — scope-aware canvas
            Width, border, hue, and placeholder all shift with the chosen scope so
            the surface itself teaches: a village whisper feels intimate (narrow,
            blue-bordered, soft); an open whisper feels broadcast (full-width, red,
            louder placeholder). Pact 5: scope is a felt decision, not just a chip. */}
        {(modality === "text" || modality === "breath") && (
          <div className="flex justify-center">
            <div
              className={`transition-all duration-500 ease-out border-l-2 pl-5 py-3 ${
                isBreath
                  ? "max-w-md w-full border-blue bg-blue/5"
                  : effectiveScope === "circle"
                    ? "max-w-md w-full border-blue bg-blue/5"
                    : effectiveScope === "network"
                      ? "max-w-xl w-full border-blue/60"
                      : effectiveScope === "private"
                        ? "max-w-sm w-full border-ink bg-ink/[0.03]"
                        : "max-w-2xl w-full border-red"
              }`}
            >
              <div className="mono-text text-[10px] uppercase tracking-[0.2em] text-muted mb-3">
                {isBreath
                  ? "breath · 60 chars · your village · 24h"
                  : effectiveScope === "circle"
                    ? "to your village · the people who hear you first"
                    : effectiveScope === "network"
                      ? "to your network · vouched insiders only"
                      : effectiveScope === "private"
                        ? "to one person · view-once · a sealed envelope"
                        : "to the open · every tuned-in topic listener"}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, charLimit))}
                placeholder={
                  isBreath
                    ? "a 60-char breath for your village…"
                    : effectiveScope === "circle"
                      ? "the village hears this first…"
                      : effectiveScope === "network"
                        ? "your insider network is listening…"
                        : effectiveScope === "private"
                          ? "a sealed envelope, opened once…"
                          : "speak softly · facts only · the world is listening…"
                }
                className={`w-full bg-transparent text-ink placeholder-muted-soft resize-none focus:outline-none display-italic min-h-[180px] ${
                  effectiveScope === "public" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
                autoFocus
                maxLength={charLimit}
              />
              <div className="flex items-center justify-between pt-2">
                <span className="mono-text text-[10px] text-muted/70">
                  {effectiveScope === "circle"
                    ? "🏘️"
                    : effectiveScope === "network"
                      ? "🔗"
                      : effectiveScope === "private"
                        ? "🔒"
                        : "🌍"}{" "}
                  {effectiveScope}
                </span>
                <span
                  className={`mono-text text-xs ${
                    remaining < 20 ? "text-warn" : "text-muted"
                  }`}
                >
                  {text.length} / {charLimit}
                </span>
              </div>
            </div>
          </div>
        )}
        {modality === "voice" && (
          <>
            <VoiceRecorder
              onRecorded={(blob, dur) => {
                setVoiceBlob(blob);
                setVoiceDuration(dur);
              }}
              onCleared={() => {
                setVoiceBlob(null);
                setVoiceDuration(0);
              }}
            />
            {voiceBlob && (
              <div>
                <label className="label-text text-muted block mb-2">caption (optional)</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, charLimit))}
                  placeholder="add a caption…"
                  className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
                  rows={2}
                />
              </div>
            )}
          </>
        )}
        {modality === "image" && (
          <>
            <ImagePicker
              onPicked={setImageFile}
              onCleared={() => setImageFile(null)}
            />
            {imageFile && (
              <div>
                <label className="label-text text-muted block mb-2">caption (optional)</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, charLimit))}
                  placeholder="add a caption…"
                  className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
                  rows={2}
                />
              </div>
            )}
          </>
        )}
        {modality === "video" && (
          <div className="py-16 flex items-center justify-center border border-dashed border-line">
            <p className="text-muted text-sm">video coming next session</p>
          </div>
        )}

        {/* Modality switcher — 5 modes including breath */}
        <div>
          <label className="label-text text-muted mb-3 block">mode</label>
          <div className="flex items-center gap-2">
            <ModalityButton current={modality} value="text" icon={Type} onClick={setModality} label="text" />
            <ModalityButton current={modality} value="breath" icon={Wind} onClick={setModality} label="breath" />
            <ModalityButton current={modality} value="voice" icon={Mic} onClick={setModality} label="voice" />
            <ModalityButton current={modality} value="image" icon={ImageIcon} onClick={setModality} label="image" />
            <ModalityButton current={modality} value="video" icon={Video} onClick={setModality} label="video" disabled />
          </div>
          {isBreath && (
            <p className="mt-2 mono-text text-[11px] text-gold">
              breath · 60 chars · to your village only · disappears in 24h
            </p>
          )}
        </div>

        {/* Scope — who hears this (hidden when breath: auto-circle) */}
        {!isBreath && (
          <div className="pt-4 border-t border-line">
            <label className="label-text text-muted mb-3 block">who hears this?</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { v: "public", label: "🌍 public" },
                  { v: "network", label: "🏘️ network" },
                  { v: "circle", label: "👥 circle" },
                  { v: "private", label: "🔒 private" },
                ] as { v: Scope; label: string }[]
              ).map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setScope(v);
                    setTtl(null); // reset to scope-default
                  }}
                  data-selected={scope === v}
                  className="topic-chip"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TTL — vanishing whispers. Hidden when scope=public (permanent-only rule) */}
        {!isBreath && effectiveScope !== "public" && (
          <div className="pt-4 border-t border-line">
            <label className="label-text text-muted mb-3 block">
              how long does this last?
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { v: "permanent", label: "∞ permanent" },
                  { v: "24h", label: "⏳ 24h" },
                  { v: "view_once", label: "👁 view once" },
                ] as { v: TTL; label: string }[]
              ).map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTtl(v)}
                  data-selected={effectiveTtl === v}
                  className="topic-chip"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 mono-text text-[11px] text-muted">
              {effectiveTtl === "permanent" && "stays forever. you can always delete it."}
              {effectiveTtl === "24h" && "disappears 24h after posting. nothing archived."}
              {effectiveTtl === "view_once" && "vanishes the moment someone reads it. one-and-done."}
            </p>
          </div>
        )}

        {/* Spoiler + Reply approval toggles */}
        {!isBreath && (
          <div className="pt-4 border-t border-line space-y-3">
            <ToggleRow
              icon={EyeOff}
              label="mark as spoiler"
              description="readers tap to reveal"
              enabled={isSpoiler}
              onChange={setIsSpoiler}
            />
            <ToggleRow
              icon={ShieldAlert}
              label="pre-approve replies"
              description="replies go to your queue · your village doesn't see them until you approve"
              enabled={requireReplyApproval}
              onChange={setRequireReplyApproval}
            />
          </div>
        )}

        {error && <p className="text-warn text-sm">{error}</p>}
      </form>
    </main>
  );
}

function ModalityButton({
  current,
  value,
  icon: Icon,
  onClick,
  disabled,
  label,
}: {
  current: Modality;
  value: Modality;
  icon: LucideIcon;
  onClick: (m: Modality) => void;
  disabled?: boolean;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      disabled={disabled}
      data-selected={active}
      aria-label={label}
      title={label}
      className={`w-10 h-10 flex items-center justify-center border transition-colors ${
        active ? "border-gold text-red bg-gold/5" : "border-line text-muted hover:text-ink"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  enabled,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`w-full flex items-start gap-3 p-3 border transition-colors text-left ${
        enabled ? "border-gold bg-gold/5" : "border-line hover:border-line"
      }`}
    >
      <Icon size={18} strokeWidth={1.5} className={enabled ? "text-red mt-0.5" : "text-muted mt-0.5"} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${enabled ? "text-ink" : "text-ink/80"}`}>{label}</div>
        <div className="mono-text text-[11px] text-muted mt-0.5">{description}</div>
      </div>
      <div className={`w-8 h-5 rounded-full border transition-colors ${
        enabled ? "bg-red border-gold" : "border-line"
      } relative flex-shrink-0`}>
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-transform ${
            enabled ? "bg-canvas translate-x-[14px]" : "bg-muted/60 translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
