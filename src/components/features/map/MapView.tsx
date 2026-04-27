"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, X, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/utils";

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  city?: string | null;
  author: string;
  image?: string | null;
}

interface MapViewProps {
  markers: MarkerData[];
}

export function MapView({ markers }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<MarkerData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    // Dynamic import for Leaflet (SSR safe)
    Promise.all([
      import("leaflet"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (!mapRef.current) return;

      // Fix default icon
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map centered on Azerbaijan
      const map = L.map(mapRef.current, {
        center: [40.4093, 49.8671],
        zoom: 8,
        zoomControl: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Create custom icon
      const createCustomIcon = (category: string) => {
        const colors: Record<string, string> = {
          architecture: "#0D9488",
          interior: "#0D9488",
          landscape: "#059669",
          urban: "#D97706",
          default: "#0D9488",
        };
        const color = colors[category] ?? colors.default;

        return L.divIcon({
          className: "custom-map-marker",
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: ${color};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            ">
              <div style="
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
      };

      // Add markers
      markers.forEach((marker) => {
        const leafletMarker = L.marker([marker.lat, marker.lng], {
          icon: createCustomIcon(marker.category),
        }).addTo(map);

        leafletMarker.on("click", () => {
          setSelectedProject(marker);
        });

        leafletMarker.bindTooltip(marker.title, {
          direction: "top",
          offset: [0, -28],
          className: "leaflet-custom-tooltip",
        });
      });

      setMapLoaded(true);

      return () => {
        map.remove();
      };
    });
  }, [markers]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-sm rounded-xl shadow-premium p-3 border border-border">
        <p className="font-heading font-semibold text-xs mb-2 text-foreground">
          Kateqoriyalar
        </p>
        {[
          { key: "architecture", label: "Memarlıq", color: "#0D9488" },
          { key: "interior", label: "İnteryer", color: "#0D9488" },
          { key: "landscape", label: "Landşaft", color: "#059669" },
          { key: "urban", label: "Urban", color: "#D97706" },
        ].map((cat) => (
          <div key={cat.key} className="flex items-center gap-2 text-xs mb-1.5">
            <span
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ background: cat.color }}
            />
            <span className="text-muted-foreground">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Stats Badge */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-sm rounded-xl shadow-premium p-3 border border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <div>
            <p className="font-heading font-bold text-sm">{markers.length}</p>
            <p className="text-xs text-muted-foreground">Layihə</p>
          </div>
        </div>
      </div>

      {/* No markers fallback */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-[300]">
          <div className="text-center">
            <Building2 className="w-10 h-10 text-primary/30 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">Xəritə yüklənir...</p>
          </div>
        </div>
      )}

      {/* Project Preview Card */}
      {selectedProject && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] w-80 bg-white rounded-2xl shadow-premium border border-border overflow-hidden">
          {selectedProject.image && (
            <div className="relative h-40">
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-heading font-semibold text-sm leading-tight">
                {selectedProject.title}
              </h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="shrink-0 p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[selectedProject.category] ??
                  selectedProject.category}
              </Badge>
              {selectedProject.city && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {selectedProject.city}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {selectedProject.author}
            </p>
            <Link href={`/layiheler/${selectedProject.id}`}>
              <Button size="sm" className="w-full">
                Layihəyə Bax
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
