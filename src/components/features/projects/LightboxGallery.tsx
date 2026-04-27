"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxGalleryProps {
  images: LightboxImage[];
  columns?: 2 | 3 | 4;
}

export function LightboxGallery({ images, columns = 2 }: LightboxGalleryProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Touch tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const openLightbox = useCallback((index: number) => {
    setCurrent(index);
    setZoomed(false);
    setOpen(true);
    requestAnimationFrame(() => setFadeIn(true));
  }, []);

  const closeLightbox = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => {
      setOpen(false);
      setZoomed(false);
    }, 200);
  }, []);

  const goNext = useCallback(() => {
    if (zoomed) return;
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length, zoomed]);

  const goPrev = useCallback(() => {
    if (zoomed) return;
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length, zoomed]);

  const toggleZoom = useCallback(() => {
    setZoomed((z) => !z);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, closeLightbox, goNext, goPrev]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold) {
      if (delta > 0) goNext();
      else goPrev();
    }
  };

  if (images.length === 0) return null;

  const gridCols =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openLightbox(i)}
            className={`relative rounded-xl overflow-hidden cursor-pointer group ${
              i === 0 && columns === 2 ? "col-span-2 aspect-video" : "aspect-square"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {open && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-medium bg-black/30 px-3 py-1.5 rounded-full">
            {current + 1} / {images.length}
          </div>

          {/* Zoom toggle */}
          <button
            onClick={toggleZoom}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label={zoomed ? "Kiçilt" : "Böyüt"}
          >
            {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          {/* Previous arrow */}
          {images.length > 1 && !zoomed && (
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Əvvəlki"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && !zoomed && (
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Sonrakı"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Main image */}
          <div
            className={`relative z-[1] ${
              zoomed
                ? "w-full h-full overflow-auto cursor-zoom-out"
                : "w-[90vw] h-[80vh] max-w-5xl cursor-zoom-in"
            }`}
            onClick={(e) => {
              // Only toggle zoom if clicking the image area, not arrows
              if (e.target === e.currentTarget) {
                if (!zoomed) closeLightbox();
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`relative ${zoomed ? "w-full min-h-full" : "w-full h-full"}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
            >
              {zoomed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={images[current].src}
                  alt={images[current].alt}
                  className="w-full h-auto"
                  draggable={false}
                />
              ) : (
                <Image
                  src={images[current].src}
                  alt={images[current].alt}
                  fill
                  className="object-contain select-none"
                  sizes="90vw"
                  priority
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
