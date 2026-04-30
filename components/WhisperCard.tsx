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

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { MoreHorizontal, Ban, Flag, VolumeX } from "lucide-react";
import { EchoGlyph, PassGlyph, SaveGlyph } from "./icons/ChatterIcons";
import {
  bestInsiderCredential,
  relativeTime,
  type WhisperRow,
} from "@/lib/whisper";
import { toggleEcho, toggleSave } from "@/lib/engagement-actions";
import { blockUser, muteUser } from "@/lib/trust-actions";
import { PassSheet } from "./PassSheet";
import { CharterBadge } from "./CharterBadge";
import { ImageLightbox } from "./ImageLightbox";
import { LinkPreview, firstUrl } from "./LinkPreview";
import { TopicMuteSheet } from "./TopicMuteSheet";

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
  const [, setEchoCount] = useState(whisper.echo_count);
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
  const detectedUrl = firstUrl(quoteText);

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [topicMuteOpen, setTopicMuteOpen] = useState(false);
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

  if (hidden) {
    return (
      <div className="px-5 py-4 border-b border-line text-center">
        <p className="mono-text text-[11px] text-muted">whisper hidden</p>
      </div>
    );
  }

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

        {/* TM2: review-status label visible to all readers when a moderator
            has flagged this whisper. Pact 11: investigations are public. */}
        {whisper.review_status && (
          <div className="mb-3 -mx-5 px-5 py-2 border-l-2 border-warn bg-warn/5 mono-text text-[10px] uppercase tracking-wider text-warn">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="block w-1.5 h-1.5 rounded-full bg-warn" />
              {whisper.review_status === "claim_under_review"
                ? "[claim under review] · a specific factual claim is being verified"
                : "[under review] · this whisper is being investigated"}
            </span>
          </div>
        )}

        {/* Open Graph preview for first URL in body (IP2) */}
        {detectedUrl && !obscured && whisper.modality === "text" && (
          <LinkPreview url={detectedUrl} />
        )}

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
          {(whisper.edit_count ?? 0) > 0 && (
            <span
              className="text-muted/70 italic text-[10px]"
              title={whisper.edited_at ? `edited ${relativeTime(whisper.edited_at)} ago` : "edited"}
            >
              · edited
            </span>
          )}
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
            <span className="mono-text text-[10px] uppercase tracking-wider">{echoed ? "echoed" : "echo"}</span>
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
          <div className="ml-auto relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="text-muted hover:text-ink transition-colors"
              aria-label="More"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-30"
                  aria-label="close menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  className="absolute right-0 top-full mt-1 z-40 min-w-[180px] bg-canvas border border-line shadow-sm py-1 mono-text text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isAuthed && (
                    <Link
                      href={`/compose?quoteId=${whisper.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2 hover:bg-paper text-ink flex items-center gap-2 no-underline-link"
                    >
                      <span className="w-3.5">”</span>
                      <span>Quote whisper</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setHidden(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-paper text-ink flex items-center gap-2"
                  >
                    <span className="w-3.5">→</span>
                    <span>Hide this whisper</span>
                  </button>
                  {isAuthed && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setTopicMuteOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-paper text-ink flex items-center gap-2"
                    >
                      <VolumeX size={12} strokeWidth={1.5} />
                      <span>Mute {whisper.topic.name}</span>
                    </button>
                  )}
                  {isAuthed && (
                    <button
                      type="button"
                      onClick={() => {
                        startTransition(async () => {
                          await muteUser(whisper.author_id);
                          setMenuOpen(false);
                          setHidden(true);
                        });
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-paper text-ink flex items-center gap-2"
                    >
                      <VolumeX size={12} strokeWidth={1.5} />
                      <span>Mute @{whisper.author.handle}</span>
                    </button>
                  )}
                  {isAuthed && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm(`Block @${whisper.author.handle}? You won't see their whispers anywhere.`)) return;
                        startTransition(async () => {
                          await blockUser(whisper.author_id);
                          setMenuOpen(false);
                          setHidden(true);
                        });
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-paper text-ink flex items-center gap-2"
                    >
                      <Ban size={12} strokeWidth={1.5} />
                      <span>Block @{whisper.author.handle}</span>
                    </button>
                  )}
                  <Link
                    href={`/w/${whisper.id}#report`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 hover:bg-paper text-ink flex items-center gap-2"
                  >
                    <Flag size={12} strokeWidth={1.5} />
                    <span>Report</span>
                  </Link>
                </div>
              </>
            )}
          </div>
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

      {topicMuteOpen && (
        <TopicMuteSheet
          topicId={whisper.topic.id}
          topicName={whisper.topic.name}
          onClose={() => setTopicMuteOpen(false)}
          onMuted={() => setHidden(true)}
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
  const BARS = 40;
  const heights = useRef(
    Array.from({ length: BARS }, (_, i) => {
      const seed = Math.sin(i * 1.618) * 0.5 + 0.5;
      return Math.max(8, Math.floor(seed * 26));
    }),
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [resolvedDuration, setResolvedDuration] = useState(duration || 0);

  // Track playback progress
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (!a.duration || isNaN(a.duration)) return;
      setProgress(a.currentTime / a.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      a.currentTime = 0;
    };
    const onLoaded = () => {
      if (a.duration && !isNaN(a.duration)) setResolvedDuration(Math.round(a.duration));
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("loadedmetadata", onLoaded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [url]);

  if (!url) {
    // Stub waveform — for old seed whispers without media URL
    return (
      <div className="flex items-end gap-[2px] h-7 mb-3 opacity-60">
        {heights.current.map((h, i) => (
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

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = Math.max(0, Math.min(1, ratio)) * a.duration;
    setProgress(ratio);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const elapsed = resolvedDuration ? Math.floor(progress * resolvedDuration) : 0;

  return (
    <div className="mb-3 flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-red text-paper flex items-center justify-center hover:bg-paper hover:text-red border border-red transition shrink-0"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><rect x="2" y="2" width="3" height="8" /><rect x="7" y="2" width="3" height="8" /></svg>
        ) : (
          <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><polygon points="3,2 10,6 3,10" /></svg>
        )}
      </button>
      <div
        className="flex-1 flex items-end gap-[2px] h-7 cursor-pointer"
        onClick={scrub}
        role="slider"
        aria-label="Seek audio"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
      >
        {heights.current.map((h, i) => {
          const barRatio = i / heights.current.length;
          const past = barRatio <= progress;
          return (
            <span
              key={i}
              className={past ? "bg-red w-[3px]" : "bg-red/30 w-[3px]"}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>
      <span className="mono-text text-[10px] text-muted shrink-0 tabular-nums">
        {formatTime(elapsed)} / {formatTime(resolvedDuration || duration)}
      </span>
      <audio ref={audioRef} src={url} preload="metadata" className="hidden" />
    </div>
  );
}

function ImageBlock({ url }: { url: string | null }) {
  const [open, setOpen] = useState(false);
  if (!url || !url.startsWith("http")) {
    // No image attached or seed-placeholder URL — render nothing rather than show
    // a broken/empty preview frame.
    return null;
  }
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="block w-full p-0 border-0 bg-transparent mb-3 group"
        aria-label="Open image"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="whisper attachment"
          className="w-full max-h-96 object-cover border border-line transition-opacity group-hover:opacity-95"
          loading="lazy"
          decoding="async"
        />
      </button>
      {open && <ImageLightbox url={url} onClose={() => setOpen(false)} />}
    </>
  );
}
