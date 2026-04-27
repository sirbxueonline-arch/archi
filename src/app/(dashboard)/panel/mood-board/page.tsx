"use client";

import { useState } from "react";
import {
  Palette, Plus, X, Copy, Check, ArrowLeft,
  Image as ImageIcon, Share2, Trash2, LayoutGrid,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface MoodBoard {
  id: string;
  name: string;
  itemCount: number;
  coverGradient: string;
  createdAt: string;
  images: BoardImage[];
}

interface BoardImage {
  id: string;
  url: string;
  label?: string;
}

const INITIAL_BOARDS: MoodBoard[] = [
  {
    id: "1",
    name: "Müasir Minimalizm",
    itemCount: 6,
    coverGradient: "from-primary to-teal-700",
    createdAt: "2025-03-01",
    images: [
      { id: "i1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", label: "Oturma otağı" },
      { id: "i2", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400", label: "Mətbəx" },
      { id: "i3", url: "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=400" },
    ],
  },
  {
    id: "2",
    name: "Skandinav Dizayn",
    itemCount: 4,
    coverGradient: "from-teal-400 to-primary",
    createdAt: "2025-02-20",
    images: [
      { id: "i4", url: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=400" },
      { id: "i5", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" },
    ],
  },
  {
    id: "3",
    name: "Industrial Estetika",
    itemCount: 8,
    coverGradient: "from-slate-600 to-slate-800",
    createdAt: "2025-02-10",
    images: [
      { id: "i6", url: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400" },
    ],
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MoodBoardPage() {
  const { t } = useI18n();
  const [boards, setBoards] = useState<MoodBoard[]>(INITIAL_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [addingImage, setAddingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageLabel, setNewImageLabel] = useState("");
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState("");

  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null;

  // ── Board list actions ──────────────────────────────────────────────────────

  const handleCreateBoard = () => {
    const name = newBoardName.trim();
    if (!name) return;
    const gradients = [
      "from-primary to-teal-700",
      "from-teal-500 to-primary",
      "from-emerald-500 to-teal-700",
      "from-amber-400 to-orange-600",
      "from-teal-400 to-primary",
      "from-primary to-teal-700",
    ];
    const newBoard: MoodBoard = {
      id: Date.now().toString(),
      name,
      itemCount: 0,
      coverGradient: gradients[boards.length % gradients.length],
      createdAt: new Date().toISOString().slice(0, 10),
      images: [],
    };
    setBoards((prev) => [newBoard, ...prev]);
    setNewBoardName("");
    setCreatingNew(false);
    setActiveBoardId(newBoard.id);
  };

  const handleDeleteBoard = (boardId: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    if (activeBoardId === boardId) setActiveBoardId(null);
  };

  // ── Inside-board actions ────────────────────────────────────────────────────

  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (!url.startsWith("http")) {
      setImageError("Düzgün URL daxil edin (http/https ilə başlamalıdır)");
      return;
    }
    const newImage: BoardImage = {
      id: Date.now().toString(),
      url,
      label: newImageLabel.trim() || undefined,
    };
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? { ...b, images: [...b.images, newImage], itemCount: b.itemCount + 1 }
          : b
      )
    );
    setNewImageUrl("");
    setNewImageLabel("");
    setImageError("");
    setAddingImage(false);
  };

  const handleRemoveImage = (imageId: string) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? {
              ...b,
              images: b.images.filter((img) => img.id !== imageId),
              itemCount: Math.max(0, b.itemCount - 1),
            }
          : b
      )
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `https://archilink.az/mood-board/${activeBoardId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render: inside a board ──────────────────────────────────────────────────

  if (activeBoard) {
    return (
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveBoardId(null)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("moodboard.back")}
            </button>
            <span className="text-slate-300">/</span>
            <h1 className="font-heading text-xl font-bold text-slate-900">{activeBoard.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-semibold text-slate-700 hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? t("referral.copied") : t("moodboard.shareBoard")}
            </button>
            <button
              onClick={() => setAddingImage(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("moodboard.addUrl")}
            </button>
          </div>
        </div>

        {/* Add image form */}
        {addingImage && (
          <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-700">{t("moodboard.enterUrl")}</p>
            <div className="space-y-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => { setNewImageUrl(e.target.value); setImageError(""); }}
                placeholder={t("moodboard.urlPlaceholder")}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {imageError && <p className="text-xs text-red-500">{imageError}</p>}
              <input
                type="text"
                value={newImageLabel}
                onChange={(e) => setNewImageLabel(e.target.value)}
                placeholder="Etiket (ixtiyari)"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddImage}
                className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {t("moodboard.add")}
              </button>
              <button
                onClick={() => { setAddingImage(false); setImageError(""); setNewImageUrl(""); setNewImageLabel(""); }}
                className="px-5 py-2 rounded-xl border border-border text-sm font-semibold text-slate-600 hover:bg-muted transition-colors"
              >
                Ləğv et
              </button>
            </div>
          </div>
        )}

        {/* Images grid */}
        {activeBoard.images.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-white">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-slate-500 font-medium mb-2">Lövhə boşdur</p>
            <p className="text-sm text-muted-foreground mb-4">
              İlham üçün şəkil URL-ləri əlavə etməyə başlayın
            </p>
            <button
              onClick={() => setAddingImage(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("moodboard.add")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeBoard.images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden border border-border bg-muted aspect-square"
              >
                <img
                  src={img.url}
                  alt={img.label ?? "Şəkil"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%2394a3b8' dominant-baseline='middle' text-anchor='middle'%3ESəkil yüklənmədi%3C/text%3E%3C/svg%3E";
                  }}
                />
                {img.label && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{img.label}</p>
                  </div>
                )}
                <button
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add more tile */}
            <button
              onClick={() => setAddingImage(true)}
              className="rounded-xl border-2 border-dashed border-border aspect-square flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-medium">{t("moodboard.add")}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Render: boards list view ────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">{t("moodboard.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("moodboard.subtitle")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setCreatingNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("moodboard.newBoard")}
        </button>
      </div>

      {/* Create new board inline form */}
      {creatingNew && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">{t("moodboard.nameLabel")}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateBoard(); if (e.key === "Escape") setCreatingNew(false); }}
              placeholder="Məs: Müştəri layihəsi – Minimalist"
              autoFocus
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={handleCreateBoard}
              disabled={!newBoardName.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {t("moodboard.create")}
            </button>
            <button
              onClick={() => { setCreatingNew(false); setNewBoardName(""); }}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-slate-600 hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Boards grid */}
      {boards.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-white">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-slate-500 font-medium mb-2">{t("moodboard.empty")}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {t("moodboard.emptySub")}
          </p>
          <button
            onClick={() => setCreatingNew(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("moodboard.newBoard")}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveBoardId(board.id)}
            >
              {/* Gradient cover */}
              <div className={`bg-gradient-to-br ${board.coverGradient} h-36 flex items-center justify-center relative`}>
                {board.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 w-28 h-24 rounded-lg overflow-hidden opacity-80">
                    {board.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="bg-white/20 overflow-hidden">
                        <img
                          src={img.url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Palette className="w-12 h-12 text-white/30" />
                )}
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board.id); }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card info */}
              <div className="p-4">
                <h3 className="font-heading font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                  {board.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {board.itemCount} {t("moodboard.images")}
                  </span>
                  <span>{formatDate(board.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* New board tile */}
          <button
            onClick={() => setCreatingNew(true)}
            className="rounded-2xl border-2 border-dashed border-border min-h-[200px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary hover:text-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">{t("moodboard.newBoard")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
