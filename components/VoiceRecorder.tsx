"use client";

/**
 * VoiceRecorder — 30-second cap, hold to record (or tap-toggle).
 * Uses MediaRecorder API. Returns audio blob + duration.
 */

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";

interface VoiceRecorderProps {
  onRecorded: (blob: Blob, durationSec: number) => void;
  onCleared: () => void;
}

export function VoiceRecorder({ onRecorded, onCleared }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const duration = Math.min(30, Math.round((Date.now() - startTimeRef.current) / 1000));
        onRecorded(blob, duration);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      startTimeRef.current = Date.now();
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 30) {
            stop();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("microphone permission denied");
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const clear = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
    setPlaying(false);
    onCleared();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="py-10 flex flex-col items-center justify-center gap-4 text-center">
      {!audioUrl ? (
        <>
          <button
            type="button"
            onClick={recording ? stop : start}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              recording
                ? "bg-red text-paper scale-110 animate-pulse"
                : "bg-paper border-2 border-red text-red hover:bg-red/5"
            }`}
            aria-label={recording ? "Stop recording" : "Start recording"}
          >
            {recording ? (
              <Square size={32} strokeWidth={1.8} fill="currentColor" />
            ) : (
              <Mic size={36} strokeWidth={1.5} />
            )}
          </button>
          <p className="text-ink text-sm">
            {recording ? "recording…" : "tap to record"}
          </p>
          <p className="mono-text text-xs text-muted">
            0:{seconds.toString().padStart(2, "0")} / 0:30
          </p>
        </>
      ) : (
        <div className="w-full max-w-xs space-y-3">
          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
          <div className="flex items-center gap-3 p-3 border border-line bg-paper">
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-red text-paper flex items-center justify-center"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>
            <div className="flex-1 mono-text text-xs text-muted">
              0:{Math.min(seconds, 30).toString().padStart(2, "0")} recorded
            </div>
            <button
              type="button"
              onClick={clear}
              className="w-9 h-9 flex items-center justify-center text-muted hover:text-warn transition"
              aria-label="Discard recording"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-warn text-xs">{error}</p>}
    </div>
  );
}
