"use client";

/**
 * WhisperCard — Craft Bet B (Pull-Quote) + C (Identity-Merged).
 *
 * Engagement now persists to Supabase:
 *  - Echo toggle → echoes table + whispers.echo_count
 *  - Save toggle → saves table
 *  - Pass tap → opens PassSheet
 *
 * Vanishing whispers honored via `expires_at` — if past, renders "vanished" shell.
 * Spoiler mask obscures content until tap.
 */

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { EchoGlyph, PassGlyph, SaveGlyph } from "./icons/ChatterIcons";
import {
  bestInsiderCredential,
  relativeTime,
  type WhisperRow,
} from "@/lib/whisper";
import { toggleEcho, toggleSave } from "@/lib/engagement-actions";
import { PassSheet } from "./PassSheet";
import { CharterBadge } from "./CharterBadge";

interface WhisperCardProps {
  whisper: WhisperRow;
  rankingRule?: string;
  initiallyEchoed?: boolean;
  initiallySaved?: boolean;
  isAuthed?: boolean;
  correction?: {
    count: number;
    latest_text: string;
    author_handle: string;
    insider_tag: string | null;
  } | null;
}

export function WhisperCard({
  whisper,
  rankingRule,
  initiallyEchoed = false,
  initiallySaved = false,
  isAuthed = false,
  correction = null,
}: WhisperCardProps) {
  const router = useRouter();
  const [echoed, setEchoed] = useState(initiallyEchoed);
  const [echoCount, setEchoCount] = useState(whisper.echo_count);
  const [saved, setSaved] = useState(initiallySaved);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [, startTransition] = useTransition();

  const credential = bestInsiderCredential(whisper.author.insider_tags);
  const when = relativeTime(whisper.created_at);

  // Scope hairline color (Principle 2 — atmospheric not chipped)
  // Whisper-tier gets RED prominence; public default = subtle line; village = blue
  const scopeColor = whisper.is_whisper_tier
    ? "#FF2D2D"
    : ({
        public: "#E8E4DC",
        network: "#2D5BFF",
        circle: "#2D5BFF",
        private: "#A8A4A0",
      }[whisper.scope]);

  const quoteText =
    whisper.modality === "voice" && whisper.content_transcript
      ? whisper.content_transcript
      : whisper.content_text ?? "";

  const obscured = whisper.is_spoiler && !spoilerRevealed;

  const handleEcho = () => {
    if (!isAuthed) {
      router.push("/auth/sign-in");
      return;
    }
    const next = !echoed;
    setEchoed(next);
    setEchoCount((c) => c + (next ? 1 : -1));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([8, 40, 8]); // Chatter's 2-pulse signature
    }
    startTransition(async () => {
      const res = await toggleEcho(whisper.id, next);
      if (!res.ok) {
        // Revert
        setEchoed(!next);
        setEchoCount((c) => c - (next ? 1 : -1));
      }
    });
  };

  const handleSave = () => {
    if (!isAuthed) {
      router.push("/auth/sign-in");
      return;
    }
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await toggleSave(whisper.id, next);
      if (!res.ok) setSaved(!next);
    });
  };

  const handlePass = () => {
    if (!isAuthed) {
      router.push("/auth/sign-in");
      return;
    }
    setPassOpen(true);
  };

  // Double-tap echo (Visual DNA Principle 8 — direct gesture)
  const lastTap = useRef<number>(0);
  const [bloom, setBloom] = useState(false);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      lastTap.current = 0;
      if (!echoed) handleEcho();
      setBloom(true);
      setTimeout(() => setBloom(false), 600);
    } else {
      lastTap.current = now;
    }
  };

  // Long-press whisper-back — third gesture (after swipe-pass and double-tap-echo)
  // Hold for 600ms without moving > 8px → opens an in-card mini-composer.
  const [replyOpen, setReplyOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const longPressOrigin = useRef<{ x: number; y: number } | null>(null);
  const longPressFired = useRef<boolean>(false);

  const startLongPress = (e: React.PointerEvent) => {
    if (!isAuthed) return;
    longPressOrigin.current = { x: e.clientX, y: e.clientY };
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([10, 30, 10, 30, 10]); // 3-pulse signature distinct from pass
      }
      setReplyOpen(true);
    }, 600);
  };
  const moveLongPress = (e: React.PointerEvent) => {
    if (!longPressTimer.current || !longPressOrigin.current) return;
    const dx = e.clientX - longPressOrigin.current.x;
    const dy = e.clientY - longPressOrigin.current.y;
    if (Math.hypot(dx, dy) > 8) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  const endLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Swipe-right pass (Visual DNA Principle 6 — pass-signature move)
  const x = useMotionValue(0);
  const passHint = useTransform(x, [0, 80, 160], [0, 0.6, 1]);
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120) {
      // Trigger pass with custom 2-pulse haptic
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([12, 60, 12]);
      }
      handlePass();
    }
    x.set(0);
  };

  const handleClick = () => {
    // If long-press fired, suppress the click-through to double-tap handler
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    handleDoubleTap();
  };

  return (
    <>
      <motion.article
        drag={isAuthed ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onPointerDown={startLongPress}
        onPointerMove={moveLongPress}
        onPointerUp={endLongPress}
        onPointerCancel={endLongPress}
        onPointerLeave={endLongPress}
        style={{ x, borderLeft: `2px solid ${scopeColor}` }}
        className="relative block pl-5 pr-5 py-5 border-b border-line bg-paper select-none"
      >
        {/* Swipe-right Pass hint — appears as user drags */}
        <motion.div
          style={{ opacity: passHint }}
          className="absolute inset-y-0 left-0 w-full pointer-events-none flex items-center px-5"
        >
          <span className="mono-text text-xs text-red font-medium flex items-center gap-1.5">
            <PassGlyph size={14} strokeWidth={1.8} /> pass →
          </span>
        </motion.div>
        {bloom && (
          <motion.span
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full bg-red/30"
          />
        )}
        {rankingRule && <p className="proof-whisper-ranking-rule mb-3">{rankingRule}</p>}

        <div className="flex items-center gap-2 mb-3 text-xs text-muted">
          {whisper.topic.emoji && <span>{whisper.topic.emoji}</span>}
          <Link
            href={`/t/${whisper.topic.id}`}
            className="text-ink/80 hover:text-red transition-colors font-medium"
          >
            {whisper.topic.name}
          </Link>
          {whisper.is_whisper_tier && (
            <>
              <span className="opacity-40">·</span>
              <span className="text-red text-[10px] label-text">🤫 Whisper</span>
            </>
          )}
        </div>

        {whisper.modality === "voice" && (
          <VoiceBlock
            url={whisper.content_media_url}
            duration={whisper.content_duration_sec ?? 0}
          />
        )}
        {whisper.modality === "image" && (
          <ImageBlock url={whisper.content_media_url} />
        )}

        {/* Pull-quote body with optional spoiler mask + correction-induced reset */}
        <div className="relative mb-4">
          <p
            className={`display-italic text-xl sm:text-2xl leading-snug tracking-tighter transition ${
              obscured ? "blur-md select-none" : ""
            } ${
              correction
                ? "text-muted line-through decoration-1 decoration-warn/60"
                : "text-ink"
            }`}
          >
            &ldquo;{quoteText}&rdquo;
          </p>
          {obscured && (
            <button
              type="button"
              onClick={() => setSpoilerRevealed(true)}
              className="absolute inset-0 flex items-center justify-center bg-canvas/40 backdrop-blur-sm"
              aria-label="Tap to reveal spoiler"
            >
              <span className="px-4 py-2 bg-red text-paper text-xs font-medium">
                🔒 tap to reveal spoiler
              </span>
            </button>
          )}
        </div>

        {/* Inline insider correction strip — Pact 5/11: truth visible in feed, not buried in detail */}
        {correction && (
          <Link
            href={`/w/${whisper.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block border-l-2 border-gold bg-gold/5 px-3 py-2 mb-4 hover:bg-gold/10 transition-colors"
          >
            <p className="mono-text text-[10px] uppercase tracking-wider text-red mb-1">
              {correction.count > 1
                ? `${correction.count} insiders pushed back`
                : "an insider pushed back"}
            </p>
            <p className="body-text text-sm text-ink leading-snug line-clamp-2">
              {correction.latest_text}
            </p>
            <p className="mono-text text-[10px] text-muted mt-1">
              <span className="text-ink">@{correction.author_handle}</span>
              {correction.insider_tag && (
                <span className="text-gold italic"> · {correction.insider_tag}</span>
              )}
            </p>
          </Link>
        )}

        {/* Identity-merged byline — timestamp links to detail (permalink convention) */}
        <div className="mono-text text-xs text-muted mb-4 flex items-center gap-1.5 flex-wrap">
          <span className="text-ink">@{whisper.author.handle}</span>
          {whisper.author.is_charter && <CharterBadge size="sm" />}
          {credential && (
            <>
              <span>·</span>
              <span className="italic text-gold">{credential}</span>
            </>
          )}
          <span>·</span>
          <Link
            href={`/w/${whisper.id}`}
            className="hover:text-red transition-colors underline-offset-2 hover:underline"
          >
            {when}
          </Link>
          {whisper.scope !== "public" && (
            <>
              <span>·</span>
              <span className="text-blue mono-text text-[10px] uppercase tracking-wider">
                {whisper.scope === "circle" ? "village" : whisper.scope}
              </span>
            </>
          )}
          {whisper.ttl === "view_once" && (
            <>
              <span>·</span>
              <span className="text-warn mono-text text-[10px] uppercase tracking-wider">
                view-once
              </span>
            </>
          )}
          {whisper.ttl === "24h" && (
            <>
              <span>·</span>
              <span className="text-warn mono-text text-[10px] uppercase tracking-wider">
                24h
              </span>
            </>
          )}
        </div>

        {/* 3 reactions (Principle 8) */}
        <div className="flex items-center gap-6 text-sm">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleEcho(); }}
            className={`flex items-center gap-1.5 transition-colors ${
              echoed ? "text-red" : "text-muted hover:text-ink"
            }`}
            aria-label="Echo — silently corroborate"
          >
            <EchoGlyph size={16} strokeWidth={1.6} filled={echoed} />
            <span className="mono-text">{echoCount}</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlePass(); }}
            className="flex items-center gap-1.5 text-muted hover:text-red transition-colors"
            aria-label="Pass — send to one person"
          >
            <PassGlyph size={16} strokeWidth={1.6} />
            <span>Pass</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            className={`flex items-center gap-1.5 transition-colors ${
              saved ? "text-red" : "text-muted hover:text-ink"
            }`}
            aria-label="Save"
          >
            <SaveGlyph size={16} strokeWidth={1.6} filled={saved} />
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto text-muted hover:text-ink transition-colors"
            aria-label="More"
          >
            <MoreHorizontal size={16} strokeWidth={1.5} />
          </button>
        </div>
      </motion.article>

      {passOpen && (
        <PassSheet
          whisperId={whisper.id}
          whisperExcerpt={quoteText.slice(0, 80)}
          onClose={() => setPassOpen(false)}
        />
      )}

      {replyOpen && (
        <InlineReplyMini
          parentId={whisper.id}
          topicId={whisper.topic_id}
          parentExcerpt={quoteText.slice(0, 80)}
          onClose={() => setReplyOpen(false)}
        />
      )}
    </>
  );
}

/**
 * InlineReplyMini — long-press-triggered mini composer that appears
 * as a card-sized overlay without leaving the home flow.
 * Pact: same reply-approval rules as full /w/[id] flow.
 */
function InlineReplyMini({
  parentId,
  topicId,
  parentExcerpt,
  onClose,
}: {
  parentId: string;
  topicId: string;
  parentExcerpt: string;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    setError(null);
    const { postReply } = await import("@/lib/reply-actions");
    const res = await postReply({ parentId, topicId, content: text.trim() });
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "couldn't send.");
      return;
    }
    setPosted(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-canvas/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-4"
      onClick={onClose}
      role="dialog"
      aria-label="Long-press whisper-back"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-paper border border-line p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="mono-text text-[10px] uppercase tracking-wider text-red">
            whisper-back
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="display-italic text-sm text-muted border-l-2 border-gold/40 pl-3 line-clamp-2">
          &ldquo;{parentExcerpt}…&rdquo;
        </p>
        {posted ? (
          <p className="display-italic text-2xl text-red text-center py-4">
            sent.
          </p>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 280))}
              placeholder="say it back…"
              className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
              rows={3}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="mono-text text-[10px] text-muted">
                {text.length} / 280
              </span>
              <button
                type="submit"
                disabled={pending || !text.trim()}
                className="btn-primary px-5 py-2 text-sm disabled:opacity-30"
              >
                {pending ? "sending…" : "whisper back"}
              </button>
            </div>
            {error && <p className="text-warn text-xs">{error}</p>}
          </>
        )}
      </form>
    </div>
  );
}

function VoiceBlock({ url, duration }: { url: string | null; duration: number }) {
  const bars = 32;
  const heights = Array.from({ length: bars }, (_, i) => {
    const seed = Math.sin(i * 1.618) * 0.5 + 0.5;
    return Math.max(6, Math.floor(seed * 22));
  });
  if (!url) {
    // Stub waveform — for old seed whispers without media URL
    return (
      <div className="flex items-end gap-[2px] h-6 mb-3 opacity-70">
        {heights.map((h, i) => (
          <span key={i} className="bg-red/40 w-[3px]" style={{ height: `${h}px` }} />
        ))}
        {duration > 0 && (
          <span className="ml-3 mono-text text-[10px] text-muted self-center">
            0:{duration.toString().padStart(2, "0")}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="mb-3 flex items-center gap-3">
      <audio controls src={url} className="w-full h-8" preload="metadata" />
    </div>
  );
}

function ImageBlock({ url }: { url: string | null }) {
  if (!url || !url.startsWith("http")) {
    // No image attached or seed-placeholder URL — render nothing rather than show
    // a broken/empty preview frame.
    return null;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt="whisper attachment"
      className="w-full max-h-96 object-cover border border-line mb-3"
      loading="lazy"
    />
  );
}
