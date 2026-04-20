"use client";

import { Heart, Send, MessageCircle, MoreHorizontal } from "lucide-react";

export interface WhisperCardData {
  id: string;
  topicName: string;
  topicEmoji?: string;
  author: {
    handle: string;
    initial: string;
    insiderTag?: string;
  };
  timestamp: string;
  content: string;
  modality: "text" | "voice" | "image" | "video";
  echoCount: number;
  passCount: number;
  isWhisperTier?: boolean;
  matchMinute?: string;
}

interface WhisperCardProps {
  whisper: WhisperCardData;
}

export function WhisperCard({ whisper }: WhisperCardProps) {
  return (
    <article className="whisper-card">
      {/* Meta row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm">
          {whisper.topicEmoji && <span>{whisper.topicEmoji}</span>}
          <span className="text-cream font-medium">{whisper.topicName}</span>
          {whisper.matchMinute && (
            <span className="mono-text text-gold text-xs">· {whisper.matchMinute}</span>
          )}
          <span className="mono-text text-muted text-xs">· {whisper.timestamp}</span>
        </div>
        {whisper.isWhisperTier && (
          <span className="label-text text-gold text-[10px] flex items-center gap-1">
            <span>🤫</span> Whisper
          </span>
        )}
      </div>

      {/* Content */}
      <p className="body-text text-cream text-base leading-relaxed mb-4">
        {whisper.content}
      </p>

      {/* Author row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-line flex items-center justify-center text-xs text-cream/80 font-medium">
          {whisper.author.initial}
        </div>
        <span className="text-sm text-cream/80">{whisper.author.handle}</span>
        {whisper.author.insiderTag && (
          <span className="label-text text-gold text-[9px] px-2 py-0.5 border border-gold/40">
            {whisper.author.insiderTag}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 text-sm text-muted">
        <button type="button" className="flex items-center gap-1.5 hover:text-cream transition-colors">
          <Heart size={16} strokeWidth={1.5} />
          <span className="mono-text">{whisper.echoCount}</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 hover:text-gold transition-colors">
          <Send size={16} strokeWidth={1.5} />
          <span>Pass</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 hover:text-cream transition-colors">
          <MessageCircle size={16} strokeWidth={1.5} />
        </button>
        <button type="button" className="ml-auto hover:text-cream transition-colors">
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
}
