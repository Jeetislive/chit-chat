"use client";

import { useState, useMemo } from "react";

const COLORS = [
  "#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB",
  "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047",
  "#7CB342", "#C0CA33", "#FDD835", "#FFB300", "#FB8C00",
  "#F4511E", "#6D4C41", "#546E7A", "#78909C", "#4DB6AC",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ name = "?", src, size = 36, className = "" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const color = useMemo(() => getColor(name || "?"), [name]);
  const initials = useMemo(() => getInitials(name || "?"), [name]);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        backgroundColor: color,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  );
}
