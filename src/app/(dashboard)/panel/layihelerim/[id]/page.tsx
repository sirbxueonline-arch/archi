"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  getClientProjectById,
  getProjectProposals,
  respondToProposal,
  updateProjectStatus,
} from "@/server/actions/projects";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  MapPin,
  Briefcase,
  Plus,
  CalendarDays,
  ListChecks,
  Circle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getInitials,
  SPECIALIZATION_LABELS,
  formatRelativeTime,
  formatDate,
} from "@/lib/utils";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Project = Awaited<ReturnType<typeof getClientProjectById>>;
type Proposal = Awaited<ReturnType<typeof getProjectProposals>>[number];

type MilestoneStatus = "pending" | "in_progress" | "completed";

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: MilestoneStatus;
  dueDate?: string | null;
  order: number;
  /** true when this record exists only in local state (not yet persisted) */
  local?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const proposalStatusLabels: Record<string, string> = {
  pending: "Gözləyir",
  accepted: "Qəbul edildi",
  rejected: "Rədd edildi",
  countered: "Əks-Təklif",
};

const proposalStatusVariants: Record<
  string,
  "warning" | "success" | "destructive" | "secondary"
> = {
  pending: "warning",
  accepted: "success",
  rejected: "destructive",
  countered: "secondary",
};

const milestoneStatusConfig: Record<
  MilestoneStatus,
  {
    label: string;
    badgeClass: string;
    icon: React.ElementType;
    lineClass: string;
    dotClass: string;
  }
> = {
  pending: {
    label: "Gözləyir",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Circle,
    lineClass: "bg-slate-200",
    dotClass: "border-slate-300 bg-white text-slate-400",
  },
  in_progress: {
    label: "Davam edir",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    icon: AlertCircle,
    lineClass: "bg-primary/30",
    dotClass: "border-primary bg-primary/10 text-primary",
  },
  completed: {
    label: "Tamamlandı",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    lineClass: "bg-emerald-400",
    dotClass: "border-emerald-500 bg-emerald-500 text-white",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Auth
  const [userId, setUserId] = useState<string | null>(null);

  // Project + proposals
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(true);
  const [milestonesSupported, setMilestonesSupported] = useState(true); // false when table doesn't exist
  const [completingId, setCompletingId] = useState<string | null>(null);

  // New milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);

  // ─── Load project + proposals ─────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/giris");
        return;
      }
      setUserId(session.user.id);

      const [proj, props] = await Promise.all([
        getClientProjectById(id),
        getProjectProposals(id),
      ]);
      setProject(proj ?? null);
      setProposals(props);
      setLoading(false);
    };
    load();
  }, [id, router]);

  // ─── Load milestones ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setMilestonesLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projectMilestones")
        .select("*")
        .eq("projectId", id)
        .order("order", { ascending: true });

      if (error) {
        // Table may not exist yet — fall back to local-only mode
        setMilestonesSupported(false);
      } else {
        setMilestones((data as Milestone[]) ?? []);
      }
      setMilestonesLoading(false);
    };
    load();
  }, [id]);

  // ─── Proposal handlers ────────────────────────────────────────────────────

  const handleRespond = async (
    proposalId: string,
    status: "accepted" | "rejected"
  ) => {
    setRespondingId(proposalId);
    const result = await respondToProposal(userId!, proposalId, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        status === "accepted" ? "Təklif qəbul edildi!" : "Təklif rədd edildi"
      );
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status } : p))
      );
      if (status === "accepted" && project) {
        setProject({ ...project, status: "in_progress" });
      }
    }
    setRespondingId(null);
  };

  const handleStatusUpdate = async (
    status: "open" | "in_progress" | "completed" | "cancelled"
  ) => {
    if (!project) return;
    setUpdatingStatus(true);
    const result = await updateProjectStatus(userId!, project.id, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      setProject({ ...project, status });
      toast.success("Layihə statusu yeniləndi");
    }
    setUpdatingStatus(false);
  };

  // ─── Milestone handlers ───────────────────────────────────────────────────

  const handleAddMilestone = async () => {
    if (!newTitle.trim()) {
      toast.error("Başlıq daxil edin");
      return;
    }

    setAddingMilestone(true);
    const nextOrder = milestones.length;

    if (!milestonesSupported) {
      // Local-only mode: just add to state
      const localMilestone: Milestone = {
        id: `local-${Date.now()}`,
        projectId: id,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        status: "pending",
        dueDate: newDueDate || null,
        order: nextOrder,
        local: true,
      };
      setMilestones((prev) => [...prev, localMilestone]);
      toast.success("Mərhələ əlavə edildi (yalnız lokal)");
    } else {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projectMilestones")
        .insert({
          projectId: id,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          status: "pending",
          dueDate: newDueDate || null,
          order: nextOrder,
        })
        .select()
        .single();

      if (error) {
        // Table might not exist — switch to local mode
        if (
          error.code === "42P01" ||
          error.message?.toLowerCase().includes("does not exist")
        ) {
          setMilestonesSupported(false);
          const localMilestone: Milestone = {
            id: `local-${Date.now()}`,
            projectId: id,
            title: newTitle.trim(),
            description: newDescription.trim() || null,
            status: "pending",
            dueDate: newDueDate || null,
            order: nextOrder,
            local: true,
          };
          setMilestones((prev) => [...prev, localMilestone]);
          toast.success("Mərhələ əlavə edildi (lokal rejim)");
        } else {
          toast.error(error.message);
          setAddingMilestone(false);
          return;
        }
      } else {
        setMilestones((prev) => [...prev, data as Milestone]);
        toast.success("Mərhələ əlavə edildi!");
      }
    }

    setNewTitle("");
    setNewDescription("");
    setNewDueDate("");
    setShowMilestoneForm(false);
    setAddingMilestone(false);
  };

  const handleCompleteMilestone = async (milestone: Milestone) => {
    const newStatus: MilestoneStatus =
      milestone.status === "completed" ? "pending" : "completed";

    if (milestone.local || !milestonesSupported) {
      // Local state only
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestone.id ? { ...m, status: newStatus } : m
        )
      );
      return;
    }

    setCompletingId(milestone.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("projectMilestones")
      .update({ status: newStatus })
      .eq("id", milestone.id);

    if (error) {
      toast.error(error.message);
    } else {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestone.id ? { ...m, status: newStatus } : m
        )
      );
      if (newStatus === "completed") toast.success("Mərhələ tamamlandı!");
    }
    setCompletingId(null);
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const completedCount = milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const totalCount = milestones.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // ─── Render guards ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Layihə tapılmadı</p>
        <Link href="/panel/layihelerim">
          <Button variant="ghost" className="mt-4">
            Geri qayıt
          </Button>
        </Link>
      </div>
    );
  }

  const pendingCount = proposals.filter((p) => p.status === "pending").length;
  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;

  const projectStatusOptions: Array<{
    value: "open" | "in_progress" | "completed" | "cancelled";
    label: string;
  }> = [
    { value: "open", label: "Açıq" },
    { value: "in_progress", label: "Davam edir" },
    { value: "completed", label: "Tamamlandı" },
    { value: "cancelled", label: "Ləğv edildi" },
  ];

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/panel/layihelerim">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-xl font-bold truncate">
            {project.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {proposals.length} təklif · {pendingCount} gözləyir ·{" "}
            {acceptedCount} qəbul edildi
          </p>
        </div>
        {/* Project status badge */}
        <Badge
          variant={
            project.status === "completed"
              ? "success"
              : project.status === "cancelled"
              ? "destructive"
              : project.status === "in_progress"
              ? "warning"
              : "secondary"
          }
          className="shrink-0"
        >
          {project.status === "open"
            ? "Açıq"
            : project.status === "in_progress"
            ? "Davam edir"
            : project.status === "completed"
            ? "Tamamlandı"
            : "Ləğv edildi"}
        </Badge>
      </div>

      {/* ── Project Status Tracker ── */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <p className="text-sm font-semibold mb-4">Layihə Statusu</p>

        {project.status !== "cancelled" && (
          <div className="flex items-center mb-5">
            {[
              { key: "open", label: "Açıq" },
              { key: "in_progress", label: "Davam edir" },
              { key: "completed", label: "Tamamlandı" },
            ].map((s, i, arr) => {
              const order = ["open", "in_progress", "completed"];
              const currentIdx = order.indexOf(project.status ?? "open");
              const stepIdx = order.indexOf(s.key);
              const done = currentIdx >= stepIdx;
              const isCurrent = s.key === project.status;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20 scale-110"
                          : done
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done && !isCurrent ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium whitespace-nowrap ${
                        done ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${
                        done && currentIdx > stepIdx
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {project.status === "cancelled" && (
          <Badge variant="destructive" className="mb-4">
            Ləğv edildi
          </Badge>
        )}

        <div className="flex gap-2 flex-wrap">
          {projectStatusOptions
            .filter((opt) => opt.value !== project.status)
            .map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(opt.value)}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  opt.label
                )}
              </Button>
            ))}
        </div>
      </div>

      {/* ── Milestone Tracking ── */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Mərhələlər</p>
            {!milestonesSupported && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Lokal rejim
              </Badge>
            )}
          </div>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground font-medium">
              {completedCount}/{totalCount} tamamlandı
            </span>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mb-5">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {progressPct === 100
                ? "Bütün mərhələlər tamamlandı!"
                : `${Math.round(progressPct)}% irəliləyiş`}
            </p>
          </div>
        )}

        {/* Timeline */}
        {milestonesLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-10">
            <ListChecks className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Hələ mərhələ əlavə edilməyib
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Layihənizin gedişatını izləmək üçün mərhələ əlavə edin
            </p>
          </div>
        ) : (
          <ol className="relative space-y-0">
            {milestones.map((milestone, index) => {
              const cfg = milestoneStatusConfig[milestone.status];
              const Icon = cfg.icon;
              const isLast = index === milestones.length - 1;
              const isCompleting = completingId === milestone.id;

              return (
                <li key={milestone.id} className="flex gap-4">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    {/* Step dot */}
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all ${cfg.dotClass}`}
                    >
                      {milestone.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 my-1 min-h-[2rem] transition-all ${cfg.lineClass}`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold leading-tight ${
                            milestone.status === "completed"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(milestone.dueDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          className={`text-[10px] px-2 py-0.5 border ${cfg.badgeClass}`}
                        >
                          {cfg.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant={
                            milestone.status === "completed"
                              ? "outline"
                              : "ghost"
                          }
                          className={`h-7 px-2 text-xs gap-1 ${
                            milestone.status === "completed"
                              ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => handleCompleteMilestone(milestone)}
                          disabled={isCompleting}
                        >
                          {isCompleting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : milestone.status === "completed" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {milestone.status === "completed"
                            ? "Geri al"
                            : "Tamamlandı"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* New milestone form */}
        {showMilestoneForm ? (
          <div className="mt-5 pt-4 border-t border-border space-y-3">
            <p className="text-sm font-semibold">Yeni Mərhələ</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Başlıq *</Label>
              <Input
                placeholder="Məsələn: Konseptual dizayn"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={addingMilestone}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Təsvir</Label>
              <Textarea
                placeholder="Bu mərhələdə nə ediləcək?"
                className="min-h-[72px] text-sm"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={addingMilestone}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Son tarix</Label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                disabled={addingMilestone}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="gradient"
                onClick={handleAddMilestone}
                disabled={addingMilestone}
              >
                {addingMilestone ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                )}
                Əlavə et
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowMilestoneForm(false);
                  setNewTitle("");
                  setNewDescription("");
                  setNewDueDate("");
                }}
                disabled={addingMilestone}
              >
                Ləğv et
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5 w-full border-dashed"
            onClick={() => setShowMilestoneForm(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Mərhələ əlavə et
          </Button>
        )}
      </div>

      {/* ── Proposals ── */}
      <div>
        <p className="text-sm font-semibold mb-3 px-1">Gələn Təkliflər</p>

        {proposals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Hələ təklif yoxdur</p>
            <p className="text-xs text-muted-foreground mt-1">
              Memarlar layihənizi görüb təklif göndərəcək
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const pro = proposal.professional as any;
              const name = pro?.user?.name ?? pro?.username ?? "Memar";
              const isResponding = respondingId === proposal.id;

              return (
                <div
                  key={proposal.id}
                  className="bg-white rounded-2xl border border-border p-5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-11 h-11 shrink-0">
                      <AvatarImage
                        src={pro?.avatarImage ?? pro?.user?.image}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-0.5">
                        <p className="font-semibold text-sm">{name}</p>
                        <Badge
                          variant={
                            proposalStatusVariants[proposal.status] ??
                            "secondary"
                          }
                          className="text-xs shrink-0"
                        >
                          {proposalStatusLabels[proposal.status] ??
                            proposal.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {pro?.specialization && (
                          <span>
                            {SPECIALIZATION_LABELS[pro.specialization] ??
                              pro.specialization}
                          </span>
                        )}
                        {pro?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {pro.city}
                          </span>
                        )}
                        {pro?.averageRating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {pro.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {proposal.message}
                  </p>

                  {(proposal.proposedPrice || proposal.estimatedDuration) && (
                    <>
                      <Separator className="mb-4" />
                      <div className="flex gap-6 text-sm mb-4">
                        {proposal.proposedPrice && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Qiymət
                            </p>
                            <p className="font-semibold">
                              {proposal.proposedPrice.toLocaleString()} AZN
                            </p>
                          </div>
                        )}
                        {proposal.estimatedDuration && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Müddət
                            </p>
                            <p className="font-semibold">
                              {proposal.estimatedDuration}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Counter-offer details */}
                  {proposal.status === "countered" && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Əks-Təklif Göndərilib
                      </p>
                      <div className="flex gap-4 text-sm">
                        {proposal.proposedPrice && (
                          <div>
                            <p className="text-xs text-amber-600">Yeni qiymət</p>
                            <p className="font-bold text-amber-800">
                              {proposal.proposedPrice.toLocaleString()} AZN
                            </p>
                          </div>
                        )}
                        {proposal.estimatedDuration && (
                          <div>
                            <p className="text-xs text-amber-600">Yeni müddət</p>
                            <p className="font-bold text-amber-800">
                              {proposal.estimatedDuration}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(proposal.createdAt)}
                    </span>

                    {(proposal.status === "pending" ||
                      proposal.status === "countered") && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50"
                          onClick={() =>
                            handleRespond(proposal.id, "rejected")
                          }
                          disabled={isResponding}
                        >
                          {isResponding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Rədd et
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() =>
                            handleRespond(proposal.id, "accepted")
                          }
                          disabled={isResponding}
                        >
                          {isResponding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Qəbul et
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
