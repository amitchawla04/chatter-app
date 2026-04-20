"use client";

interface ChatterMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChatterMark({ size = "md", className = "" }: ChatterMarkProps) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  return (
    <span
      className={`display-italic ${sizeClass} text-cream tracking-tight ${className}`}
    >
      chatter<span className="text-gold">.</span>
    </span>
  );
}
