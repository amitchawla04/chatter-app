"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Type, Mic, Image as ImageIcon, Video } from "lucide-react";

type Modality = "text" | "voice" | "image" | "video";
type Scope = "private" | "circle" | "network" | "public";

export default function ComposePage() {
  const router = useRouter();
  const [modality, setModality] = useState<Modality>("text");
  const [scope, setScope] = useState<Scope>("network");
  const [topic, setTopic] = useState("Arsenal FC");
  const [text, setText] = useState("");

  const canPost = text.trim().length > 0 && text.length <= 280;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-line">
        <button onClick={() => router.back()} className="text-muted hover:text-cream">
          <X size={22} strokeWidth={1.5} />
        </button>
        <h1 className="display-text text-xl text-cream">Compose a whisper</h1>
        <button
          type="button"
          disabled={!canPost}
          className="btn-primary px-6 py-2 text-sm"
        >
          Post
        </button>
      </header>

      <div className="flex-1 p-5 space-y-6">
        {/* Topic */}
        <button
          type="button"
          className="topic-chip"
          data-selected="true"
          onClick={() => {
            /* topic picker */
          }}
        >
          <span>🔴</span>
          <span>{topic}</span>
          <span className="text-muted ml-1">▼</span>
        </button>

        {/* Composer body */}
        {modality === "text" && (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 280))}
              placeholder="what's the whisper?"
              className="w-full bg-transparent text-cream placeholder-muted/60 resize-none focus:outline-none display-italic text-2xl min-h-[200px]"
              autoFocus
            />
            <div className="flex justify-end">
              <span className={`mono-text text-xs ${text.length > 260 ? "text-warn" : "text-muted"}`}>
                {text.length} / 280
              </span>
            </div>
          </div>
        )}
        {modality === "voice" && (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-24 h-24 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center">
              <Mic size={36} strokeWidth={1.5} className="text-gold" />
            </div>
            <p className="text-cream">Hold to record</p>
            <p className="text-xs text-muted mono-text">0:00 / 0:30</p>
          </div>
        )}
        {(modality === "image" || modality === "video") && (
          <div className="py-16 flex items-center justify-center border border-dashed border-line">
            <p className="text-muted text-sm">
              {modality === "image" ? "Tap to add an image" : "Tap to record 15–30 sec video"}
            </p>
          </div>
        )}

        {/* Modality switcher */}
        <div className="flex items-center gap-2">
          <ModalityButton current={modality} value="text" icon={Type} onClick={setModality} />
          <ModalityButton current={modality} value="voice" icon={Mic} onClick={setModality} />
          <ModalityButton current={modality} value="image" icon={ImageIcon} onClick={setModality} />
          <ModalityButton current={modality} value="video" icon={Video} onClick={setModality} />
        </div>

        {/* Scope */}
        <div className="pt-4 border-t border-line">
          <p className="label-text text-muted mb-3">Who hears this?</p>
          <div className="flex flex-wrap gap-2">
            {(["private", "circle", "network", "public"] as Scope[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                data-selected={scope === s}
                className="topic-chip"
              >
                {s === "private" && "🔒 Private"}
                {s === "circle" && "👥 Circle"}
                {s === "network" && "🏘️ Network"}
                {s === "public" && "🌍 Public"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function ModalityButton({
  current,
  value,
  icon: Icon,
  onClick,
}: {
  current: Modality;
  value: Modality;
  icon: any;
  onClick: (m: Modality) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      data-selected={active}
      className={`w-10 h-10 flex items-center justify-center border transition-colors ${
        active ? "border-gold text-gold bg-gold/5" : "border-line text-muted hover:text-cream"
      }`}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}
