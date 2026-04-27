"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

  return null;
}

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [open, setOpen] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) return null;

  return (
    <>
      {/* Play button overlay on hero */}
      <button
        onClick={() => setOpen(true)}
        className="absolute inset-0 z-10 flex items-center justify-center group/play"
        aria-label="Videonu oynat"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover/play:bg-white/30 group-hover/play:scale-110 transition-all duration-300">
          <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
        </div>
      </button>

      {/* Video modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Bağla"
            >
              <X className="w-4 h-4" />
            </button>
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-xl"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
