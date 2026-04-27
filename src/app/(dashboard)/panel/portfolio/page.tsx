"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getMyProfile } from "@/server/actions/profiles";
import Link from "next/link";
import { Plus, Building2, Eye, Pencil, ShieldCheck, X, Send, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Profile = Awaited<ReturnType<typeof getMyProfile>>;
type PortfolioProject = NonNullable<Profile>["portfolioProjects"][number];

interface VerificationState {
  // projectId → status: "none" | "sent" | "verified"
  [projectId: string]: "none" | "sent" | "verified";
}

interface ModalState {
  open: boolean;
  projectId: string | null;
  email: string;
  sending: boolean;
}

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationState>({});
  const [modal, setModal] = useState<ModalState>({
    open: false,
    projectId: null,
    email: "",
    sending: false,
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        const profile = await getMyProfile(session.user.id);
        setProjects(profile?.portfolioProjects ?? []);

        // Load existing verification requests for this user's projects
        const projectIds = (profile?.portfolioProjects ?? []).map((p: { id: string }) => p.id);
        if (projectIds.length > 0) {
          const { data } = await supabase
            .from("verificationRequests")
            .select("portfolioProjectId, status")
            .in("portfolioProjectId", projectIds);

          if (data) {
            const state: VerificationState = {};
            for (const row of data) {
              state[row.portfolioProjectId] =
                row.status === "verified" ? "verified" : "sent";
            }
            setVerification(state);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const openModal = (projectId: string) => {
    setModal({ open: true, projectId, email: "", sending: false });
  };

  const closeModal = () => {
    setModal({ open: false, projectId: null, email: "", sending: false });
  };

  const sendVerificationRequest = async () => {
    if (!modal.projectId || !modal.email || !userId) return;
    setModal((m) => ({ ...m, sending: true }));

    try {
      const supabase = createClient();
      await supabase.from("verificationRequests").insert({
        portfolioProjectId: modal.projectId,
        clientEmail: modal.email,
        type: "portfolio_verification",
        requestedBy: userId,
        status: "pending",
      });
      setVerification((prev) => ({ ...prev, [modal.projectId!]: "sent" }));
      closeModal();
    } catch {
      setModal((m) => ({ ...m, sending: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-36 bg-muted animate-pulse rounded-lg" />
          <div className="h-9 w-36 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground text-sm">{projects.length} layihə</p>
        </div>
        <Link href="/panel/portfolio/yeni">
          <Button variant="gradient" className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Layihə
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2">Portfolio boşdur</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            İlk portfolio layihənizi əlavə edin. Müştərilər sizi tapıb işinizi görəcəklər.
          </p>
          <Link href="/panel/portfolio/yeni">
            <Button variant="gradient" className="gap-2">
              <Plus className="w-4 h-4" />
              İlk Layihəni Əlavə Et
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const vStatus = verification[proj.id] ?? "none";
            return (
              <div
                key={proj.id}
                className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {proj.coverImage ? (
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Link href={`/panel/portfolio/${proj.id}/duzenle`}>
                      <Button size="icon-sm" variant="secondary" className="w-8 h-8 shadow">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                  {!proj.isPublished && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs">Gizli</Badge>
                    </div>
                  )}
                  {(proj as any).videoUrl && (
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                        <Play className="w-2.5 h-2.5 fill-white" />
                        Video
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate mb-1">{proj.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{proj.year ?? ""}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {proj.viewCount}
                    </span>
                  </div>

                  {/* Verification section */}
                  {vStatus === "verified" ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Təsdiqləndi ✓
                    </div>
                  ) : vStatus === "sent" ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Təsdiq gözlənilir…
                    </div>
                  ) : (
                    <button
                      onClick={() => openModal(proj.id)}
                      className="w-full flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 border border-dashed border-slate-200 hover:border-primary/30 rounded-xl px-3 py-2 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Müştəri Təsdiqi İstə
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-slate-900">Müştəri Təsdiqi</h3>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Müştərinin e-poçtunu daxil edin. Ona doğrulama linki göndəriləcək.
            </p>
            <input
              type="email"
              placeholder="musteri@email.com"
              value={modal.email}
              onChange={(e) => setModal((m) => ({ ...m, email: e.target.value }))}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition mb-4"
              onKeyDown={(e) => { if (e.key === "Enter") sendVerificationRequest(); }}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={closeModal}>
                Ləğv et
              </Button>
              <Button
                variant="gradient"
                className="flex-1 gap-2"
                onClick={sendVerificationRequest}
                disabled={!modal.email || modal.sending}
              >
                {modal.sending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Göndər
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
