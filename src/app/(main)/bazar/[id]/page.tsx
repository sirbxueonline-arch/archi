"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Ruler,
  Send,
  Building2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getClientProjectById, submitProposal } from "@/server/actions/projects";
import { toast } from "sonner";
import { CATEGORY_LABELS, BUDGET_RANGE_LABELS, formatDate } from "@/lib/utils";

const proposalSchema = z.object({
  message: z.string().min(50, "Ən az 50 simvol"),
  proposedPrice: z.coerce.number().optional(),
  estimatedDuration: z.string().optional(),
});

type ProposalForm = z.infer<typeof proposalSchema>;

type Project = NonNullable<Awaited<ReturnType<typeof getClientProjectById>>>;

interface CounterProposal {
  id: string;
  status: string;
  proposedPrice?: number | null;
  estimatedDuration?: string | null;
  message?: string | null;
}

export default function ClientProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  // Counter-offer state: the current user's proposal on this project (if any)
  const [myProposal, setMyProposal] = useState<CounterProposal | null>(null);
  const [respondingCounter, setRespondingCounter] = useState<"accepted" | "rejected" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProposalForm>({ resolver: zodResolver(proposalSchema) });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setUserRole(session.user.user_metadata?.role ?? null);

        // Load user's existing proposal on this project (if they are a professional)
        const role = session.user.user_metadata?.role ?? null;
        if (role === "professional") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("userId", session.user.id)
            .maybeSingle();

          if (profile) {
            const { data: existingProposal } = await supabase
              .from("proposals")
              .select("id, status, proposedPrice, estimatedDuration, message")
              .eq("clientProjectId", params.id as string)
              .eq("professionalId", profile.id)
              .maybeSingle();

            if (existingProposal) {
              setMyProposal(existingProposal as CounterProposal);
            }
          }
        }
      }

      const proj = await getClientProjectById(params.id as string);
      setProject(proj ?? null);
      setLoading(false);
    };
    load();
  }, [params.id]);

  const onSubmit = async (data: ProposalForm) => {
    if (!userId) {
      router.push("/giris");
      return;
    }

    const result = await submitProposal(userId, {
      clientProjectId: params.id as string,
      message: data.message,
      proposedPrice: data.proposedPrice,
      estimatedDuration: data.estimatedDuration,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Təklifiniz göndərildi!");
      router.push("/panel/teklifler");
    }
  };

  const handleCounterResponse = async (response: "accepted" | "rejected") => {
    if (!myProposal) return;
    setRespondingCounter(response);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("proposals")
        .update({ status: response })
        .eq("id", myProposal.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(
          response === "accepted"
            ? "Əks-təklif qəbul edildi!"
            : "Əks-təklif rədd edildi"
        );
        setMyProposal((prev) => (prev ? { ...prev, status: response } : prev));
      }
    } finally {
      setRespondingCounter(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Building2 className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Layihə tapılmadı</p>
          <Link href="/bazar">
            <Button variant="ghost" className="mt-4">Bazara qayıt</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/bazar">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Bazara qayıt
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary">
                    {CATEGORY_LABELS[project.category] ?? project.category}
                  </Badge>
                  {project.isUrgent && (
                    <Badge className="bg-red-100 text-red-700 border-0">
                      🔥 Təcili
                    </Badge>
                  )}
                  <Badge variant="success">Açıq</Badge>
                </div>

                <h1 className="font-heading text-2xl font-bold mb-3">
                  {project.title}
                </h1>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {project.description}
                </p>

                <Separator className="mb-5" />

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { icon: MapPin, label: "Şəhər", value: project.city },
                    { icon: Ruler, label: "Sahə", value: project.area ? `${project.area} m²` : null },
                    {
                      icon: DollarSign,
                      label: "Büdcə",
                      value: project.budgetRange
                        ? BUDGET_RANGE_LABELS[project.budgetRange]
                        : null,
                    },
                    { icon: Clock, label: "Elan tarixi", value: formatDate(project.createdAt as string) },
                  ]
                    .filter((d) => d.value)
                    .map((d) => (
                      <div key={d.label} className="flex items-start gap-2">
                        <d.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">{d.label}</p>
                          <p className="font-medium">{d.value}</p>
                        </div>
                      </div>
                    ))}
                </div>

                {project.requirements && (
                  <>
                    <Separator className="my-5" />
                    <div>
                      <p className="font-semibold text-sm mb-2">Xüsusi Tələblər</p>
                      <p className="text-sm text-muted-foreground">
                        {project.requirements}
                      </p>
                    </div>
                  </>
                )}

                {/* Reference images */}
                {Array.isArray((project as any).referenceImages) && (project as any).referenceImages.length > 0 && (
                  <>
                    <Separator className="my-5" />
                    <div>
                      <p className="font-semibold text-sm mb-3">İstinad Şəkilləri</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {((project as any).referenceImages as string[]).map((url: string, idx: number) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity">
                              <Image
                                src={url}
                                alt={`İstinad ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 33vw"
                              />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Counter-offer banner: shown to professionals when their proposal was countered */}
            {userRole === "professional" && myProposal?.status === "countered" && (
              <Card className="border-amber-300 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                    <RefreshCw className="w-4 h-4" />
                    Müştəri Əks-Təklif Göndərib
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-700 mb-4">
                    Müştəri təklifinizə yeni qiymət və ya müddət təklif etdi. Qəbul edin və ya rədd edin.
                  </p>

                  <div className="flex gap-6 text-sm mb-5">
                    {myProposal.proposedPrice != null && (
                      <div>
                        <p className="text-xs text-amber-600 mb-0.5">Təklif olunan qiymət</p>
                        <p className="font-bold text-amber-900 text-lg">
                          {myProposal.proposedPrice.toLocaleString()} AZN
                        </p>
                      </div>
                    )}
                    {myProposal.estimatedDuration && (
                      <div>
                        <p className="text-xs text-amber-600 mb-0.5">Müddət</p>
                        <p className="font-bold text-amber-900 text-lg">
                          {myProposal.estimatedDuration}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleCounterResponse("accepted")}
                      disabled={respondingCounter !== null}
                    >
                      {respondingCounter === "accepted" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Qəbul et
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5"
                      onClick={() => handleCounterResponse("rejected")}
                      disabled={respondingCounter !== null}
                    >
                      {respondingCounter === "rejected" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Rədd et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Already responded to counter-offer */}
            {userRole === "professional" &&
              myProposal &&
              (myProposal.status === "accepted" || myProposal.status === "rejected") && (
                <Card
                  className={
                    myProposal.status === "accepted"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-destructive/30 bg-destructive/5"
                  }
                >
                  <CardContent className="p-5 flex items-center gap-3">
                    {myProposal.status === "accepted" ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm text-emerald-800 font-medium">
                          Təklifiniz qəbul edildi! Müştəri sizinlə əlaqə saxlayacaq.
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-destructive shrink-0" />
                        <p className="text-sm text-destructive font-medium">
                          Təklifiniz rədd edildi.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Proposal Form — only show if professional has no existing proposal */}
            {userRole === "professional" && !myProposal && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Təklif Göndər</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Mesajınız *</Label>
                      <Textarea
                        placeholder="Bu layihə üçün niyə uyğun olduğunuzu, yanaşmanızı və təcrübənizi izah edin..."
                        className="min-h-[140px]"
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Təklif olunan qiymət (AZN)</Label>
                        <Input
                          type="number"
                          placeholder="25000"
                          {...register("proposedPrice")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Təxmini müddət</Label>
                        <Input
                          placeholder="3 ay"
                          {...register("estimatedDuration")}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="gradient"
                      className="gap-2"
                      loading={isSubmitting}
                    >
                      <Send className="w-4 h-4" />
                      Təklif Göndər
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Already submitted a proposal (non-countered) */}
            {userRole === "professional" &&
              myProposal &&
              myProposal.status === "pending" && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      Bu layihəyə artıq təklif göndərdiniz. Cavab gözlənilir.
                    </p>
                  </CardContent>
                </Card>
              )}

            {!userId && (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-3">
                    Təklif göndərmək üçün giriş etməlisiniz
                  </p>
                  <Link href="/giris">
                    <Button variant="gradient">Giriş et</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold">
                    {(project.client as { email?: string })?.email?.[0]?.toUpperCase() ?? "M"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Müştəri</p>
                    <p className="text-xs text-muted-foreground">
                      {(project.client as { email?: string })?.email ?? ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Cəmi təkliflər</span>
                    <span className="font-medium text-foreground">
                      {project.proposalCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-5">
                <p className="text-sm font-medium mb-2">💡 Məsləhət</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Güclü bir təklif yazın: özünüzü, keçmiş işlərinizi və bu
                  layihə üçün yanaşmanızı izah edin.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
