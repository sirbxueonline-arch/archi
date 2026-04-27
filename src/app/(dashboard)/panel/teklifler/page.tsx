"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getMyProposals } from "@/server/actions/projects";
import Link from "next/link";
import {
  FileText,
  RefreshCw,
  Loader2,
  Inbox,
  User,
  Calendar,
  DollarSign,
  Clock,
  XCircle,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClientOffer {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  duration: string | null;
  status: string;
  createdAt: string;
  client: { name: string | null; image: string | null } | null;
}

type Proposal = Awaited<ReturnType<typeof getMyProposals>>[number];

const statusLabels: Record<string, string> = {
  pending: "Gözləyir",
  accepted: "Qəbul edildi",
  rejected: "Rədd edildi",
  withdrawn: "Geri çəkildi",
  countered: "Əks-Təklif Göndərildi",
};

const statusVariants: Record<string, "warning" | "success" | "destructive" | "secondary" | "outline"> = {
  pending: "warning",
  accepted: "success",
  rejected: "destructive",
  withdrawn: "secondary",
  countered: "outline",
};

interface CounterOfferForm {
  proposedPrice: string;
  estimatedDuration: string;
}

const clientOfferStatusLabels: Record<string, string> = {
  pending: "Gözləyir",
  accepted: "Qəbul edildi",
  rejected: "Rədd edildi",
  countered: "Əks-Təklif",
};

const clientOfferStatusVariants: Record<string, "warning" | "success" | "destructive" | "outline"> = {
  pending: "warning",
  accepted: "success",
  rejected: "destructive",
  countered: "outline",
};

export default function ProposalsPage() {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const [clientOffers, setClientOffers] = useState<ClientOffer[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [architectUserId, setArchitectUserId] = useState<string | null>(null);
  const [counterFormId, setCounterFormId] = useState<string | null>(null);
  const [counterForm, setCounterForm] = useState<CounterOfferForm>({
    proposedPrice: "",
    estimatedDuration: "",
  });
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setArchitectUserId(session.user.id);
        const data = await getMyProposals(session.user.id);
        setProposals(data);

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("userId", session.user.id)
          .single();

        if (profile) {
          setProfileId(profile.id);
          const { data: offers, error: offersError } = await supabase
            .from("clientOffers")
            .select("id, title, description, budget, duration, status, createdAt, clientId")
            .eq("architectProfileId", profile.id)
            .order("createdAt", { ascending: false });
          if (offersError) {
            console.error("clientOffers fetch error:", offersError.message);
          }
          if (offers && offers.length > 0) {
            const clientIds = [...new Set(offers.map((o: any) => o.clientId))];
            const { data: clientUsers } = await supabase
              .from("users")
              .select("id, name, image")
              .in("id", clientIds);
            const clientMap = Object.fromEntries((clientUsers ?? []).map((u: any) => [u.id, u]));
            setClientOffers(offers.map((o: any) => ({
              ...o,
              client: clientMap[o.clientId] ?? null,
            })));
          } else {
            setClientOffers([]);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const openCounterForm = (proposalId: string, currentPrice?: number | null, currentDuration?: string | null) => {
    setCounterFormId(proposalId);
    setCounterForm({
      proposedPrice: currentPrice?.toString() ?? "",
      estimatedDuration: currentDuration ?? "",
    });
  };

  const closeCounterForm = () => {
    setCounterFormId(null);
    setCounterForm({ proposedPrice: "", estimatedDuration: "" });
  };

  const handleCounterSubmit = async (proposalId: string) => {
    if (!counterForm.proposedPrice && !counterForm.estimatedDuration) {
      toast.error("Ən azı bir sahəni doldurun");
      return;
    }

    setSubmittingCounter(true);
    try {
      const supabase = createClient();
      const updatePayload: Record<string, unknown> = {
        status: "countered",
      };
      if (counterForm.proposedPrice) {
        updatePayload.proposedPrice = parseFloat(counterForm.proposedPrice);
      }
      if (counterForm.estimatedDuration) {
        updatePayload.estimatedDuration = counterForm.estimatedDuration;
      }

      const { error } = await supabase
        .from("proposals")
        .update(updatePayload)
        .eq("id", proposalId);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Əks-təklif göndərildi!");
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  status: "countered",
                  proposedPrice: counterForm.proposedPrice
                    ? parseFloat(counterForm.proposedPrice)
                    : p.proposedPrice,
                  estimatedDuration: counterForm.estimatedDuration || p.estimatedDuration,
                }
              : p
          )
        );
        closeCounterForm();
      }
    } finally {
      setSubmittingCounter(false);
    }
  };

  const handleWithdraw = async (proposalId: string) => {
    setWithdrawingId(proposalId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("proposals")
        .update({ status: "withdrawn" })
        .eq("id", proposalId);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Təklif geri çəkildi");
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposalId ? { ...p, status: "withdrawn" } : p
          )
        );
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="space-y-4 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const handleClientOfferStatus = async (offerId: string, status: "accepted" | "rejected") => {
    const supabase = createClient();
    const offer = clientOffers.find((o) => o.id === offerId);
    const { error } = await supabase.from("clientOffers").update({ status }).eq("id", offerId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(status === "accepted" ? "Təklif qəbul edildi!" : "Təklif rədd edildi");
      if (status === "rejected") {
        setClientOffers((prev) => prev.filter((o) => o.id !== offerId));
      } else {
        setClientOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status } : o));
      }

      if (offer) {
        const { data: offerRow } = await supabase
          .from("clientOffers")
          .select("clientId")
          .eq("id", offerId)
          .single();
        const notifLink = status === "accepted" && architectUserId
          ? `/panel/mesajlar/yeni?to=${architectUserId}`
          : "/panel/tekliflerim";
        if (offerRow?.clientId) {
          await supabase.from("notifications").insert({
            userId: offerRow.clientId,
            type: "proposal",
            title: status === "accepted" ? "Təklifiniz qəbul edildi!" : "Təklifiniz rədd edildi",
            message: status === "accepted"
              ? `"${offer.title}" təklifiniz qəbul edildi. Memar ilə əlaqə saxlamaq üçün bura basın.`
              : `"${offer.title}" təklifiniz memar tərəfindən rədd edildi.`,
            link: notifLink,
            isRead: false,
          });
        }
      }
    }
  };

  const pendingIncoming = clientOffers.filter((o) => o.status === "pending").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Təkliflər</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gələn müştəri təklifləri və göndərdiyiniz layihə təklifləri
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("incoming")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            tab === "incoming" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Gələn Təkliflər
          {pendingIncoming > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
              {pendingIncoming}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("outgoing")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            tab === "outgoing" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Göndərdiklərim
          {proposals.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({proposals.length})
            </span>
          )}
        </button>
      </div>

      {/* ===== INCOMING CLIENT OFFERS ===== */}
      {tab === "incoming" && (
        clientOffers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-semibold mb-2">Hələ gələn təklif yoxdur</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Müştərilər profilinizə baxaraq sizə birbaşa təklif göndərə bilər
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clientOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Top row: client info + status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {offer.client?.image ? (
                          <img
                            src={offer.client.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-primary/60" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {offer.client?.name ?? "Müştəri"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(offer.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={clientOfferStatusVariants[offer.status] ?? "secondary"}
                      className="shrink-0 text-xs"
                    >
                      {clientOfferStatusLabels[offer.status] ?? offer.status}
                    </Badge>
                  </div>

                  {/* Project title + description */}
                  <h3 className="font-heading font-semibold text-foreground mb-1.5">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {offer.description}
                  </p>

                  {/* Budget + Duration chips */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {offer.budget && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5" />
                        {offer.budget.toLocaleString()} AZN
                      </span>
                    )}
                    {offer.duration && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {offer.duration}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  {offer.status === "pending" && (
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                      <Button
                        size="sm"
                        variant="gradient"
                        className="gap-1.5"
                        onClick={() => handleClientOfferStatus(offer.id, "accepted")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Qəbul Et
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleClientOfferStatus(offer.id, "rejected")}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rədd Et
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50 ml-auto"
                        onClick={() => openCounterForm(offer.id, offer.budget, offer.duration)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Əks-təklif
                      </Button>
                    </div>
                  )}

                  {offer.status === "accepted" && (
                    <div className="pt-4 border-t border-border">
                      <Link href={`/panel/mesajlar`}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Müştəriyə yaz
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Counter-offer inline form for client offers */}
                {counterFormId === offer.id && (
                  <div className="px-5 pb-5">
                    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-amber-800 mb-3">
                        Əks-Təklif Göndər
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-amber-700">Yeni Qiymət (AZN)</Label>
                          <Input
                            type="number"
                            placeholder="25000"
                            value={counterForm.proposedPrice}
                            onChange={(e) =>
                              setCounterForm((f) => ({
                                ...f,
                                proposedPrice: e.target.value,
                              }))
                            }
                            disabled={submittingCounter}
                            className="border-amber-200 focus-visible:ring-amber-300"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-amber-700">Yeni Müddət</Label>
                          <Input
                            placeholder="3 ay"
                            value={counterForm.estimatedDuration}
                            onChange={(e) =>
                              setCounterForm((f) => ({
                                ...f,
                                estimatedDuration: e.target.value,
                              }))
                            }
                            disabled={submittingCounter}
                            className="border-amber-200 focus-visible:ring-amber-300"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-1.5 bg-amber-600 hover:bg-amber-700"
                          onClick={() => handleCounterSubmit(offer.id)}
                          disabled={submittingCounter}
                        >
                          {submittingCounter && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Göndər
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={closeCounterForm}
                          disabled={submittingCounter}
                          className="border-amber-200"
                        >
                          Ləğv et
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ===== OUTGOING PROPOSALS ===== */}
      {tab === "outgoing" && (
        proposals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-semibold mb-2">Hələ təklif yoxdur</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Layihə bazarında açıq layihələrə təklif göndərin
            </p>
            <Link href="/bazar">
              <Button size="sm" className="gap-1.5">
                Bazara Get
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {proposals.map((proposal) => {
              const isCounterFormOpen = counterFormId === proposal.id;
              const isWithdrawing = withdrawingId === proposal.id;

              return (
                <div
                  key={proposal.id}
                  className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-heading font-semibold text-foreground truncate">
                        {proposal.clientProject?.title ?? "Layihə"}
                      </h3>
                      <Badge
                        variant={statusVariants[proposal.status] ?? "secondary"}
                        className={cn(
                          "shrink-0 text-xs",
                          proposal.status === "countered" &&
                            "border-amber-400 text-amber-700 bg-amber-50"
                        )}
                      >
                        {statusLabels[proposal.status] ?? proposal.status}
                      </Badge>
                    </div>

                    {/* Message preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {proposal.message}
                    </p>

                    {/* Price + Duration + Date */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {proposal.proposedPrice && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
                          <DollarSign className="w-3.5 h-3.5" />
                          {proposal.proposedPrice.toLocaleString()} AZN
                        </span>
                      )}
                      {proposal.estimatedDuration && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {proposal.estimatedDuration}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {formatRelativeTime(proposal.createdAt.toISOString())}
                      </span>
                    </div>

                    {/* Actions for pending proposals */}
                    {proposal.status === "pending" && !isCounterFormOpen && (
                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 hover:border-amber-400"
                          onClick={() =>
                            openCounterForm(
                              proposal.id,
                              proposal.proposedPrice,
                              proposal.estimatedDuration
                            )
                          }
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Qiymət dəyiş
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50 ml-auto"
                          onClick={() => handleWithdraw(proposal.id)}
                          disabled={isWithdrawing}
                        >
                          {isWithdrawing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Geri çək
                        </Button>
                      </div>
                    )}

                    {/* Counter-offer details when countered */}
                    {proposal.status === "countered" && (
                      <div className="pt-4 border-t border-amber-200">
                        <p className="text-xs font-semibold text-amber-700 mb-2">
                          Göndərilmiş Əks-Təklif
                        </p>
                        <div className="flex gap-6 text-sm">
                          {proposal.proposedPrice && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">Yeni Qiymət</p>
                              <p className="font-semibold text-amber-800">
                                {proposal.proposedPrice.toLocaleString()} AZN
                              </p>
                            </div>
                          )}
                          {proposal.estimatedDuration && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">Yeni Müddət</p>
                              <p className="font-semibold text-amber-800">
                                {proposal.estimatedDuration}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inline counter-offer form */}
                  {isCounterFormOpen && (
                    <div className="px-5 pb-5">
                      <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-amber-800 mb-3">
                          Əks-Təklif Göndər
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-amber-700">Yeni Qiymət (AZN)</Label>
                            <Input
                              type="number"
                              placeholder="25000"
                              value={counterForm.proposedPrice}
                              onChange={(e) =>
                                setCounterForm((f) => ({
                                  ...f,
                                  proposedPrice: e.target.value,
                                }))
                              }
                              disabled={submittingCounter}
                              className="border-amber-200 focus-visible:ring-amber-300"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-amber-700">Yeni Müddət</Label>
                            <Input
                              placeholder="3 ay"
                              value={counterForm.estimatedDuration}
                              onChange={(e) =>
                                setCounterForm((f) => ({
                                  ...f,
                                  estimatedDuration: e.target.value,
                                }))
                              }
                              disabled={submittingCounter}
                              className="border-amber-200 focus-visible:ring-amber-300"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1.5 bg-amber-600 hover:bg-amber-700"
                            onClick={() => handleCounterSubmit(proposal.id)}
                            disabled={submittingCounter}
                          >
                            {submittingCounter && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Göndər
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={closeCounterForm}
                            disabled={submittingCounter}
                            className="border-amber-200"
                          >
                            Ləğv et
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
