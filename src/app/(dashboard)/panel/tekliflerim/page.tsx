"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Briefcase, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ClientOffer {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  duration: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  architectProfile: {
    username: string | null;
    users: { name: string | null } | null;
  } | null;
}

const statusLabels: Record<string, string> = {
  pending: "Gözləyir",
  accepted: "Qəbul edildi",
  rejected: "Rədd edildi",
  countered: "Əks-Təklif",
};

const statusVariants: Record<string, "warning" | "success" | "destructive" | "outline"> = {
  pending: "warning",
  accepted: "success",
  rejected: "destructive",
  countered: "outline",
};

export default function MyOffersPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<ClientOffer[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data } = await supabase
        .from("clientOffers")
        .select(`
          id, title, description, budget, duration, category, status, createdAt,
          architectProfile:profiles!clientOffers_architectProfileId_fkey (
            username,
            users ( name )
          )
        `)
        .eq("clientId", session.user.id)
        .neq("status", "rejected")
        .order("createdAt", { ascending: false });

      setOffers((data as unknown as ClientOffer[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Göndərdiyim Təkliflər</h1>
        <p className="text-muted-foreground text-sm">{offers.length} təklif</p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">Hələ təklif yoxdur</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Memar profilinə girib "İş Təklif Et" düyməsini basın
          </p>
          <Link href="/memarlar" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Plus className="w-4 h-4" />
            Memar Tap
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const architectName =
              offer.architectProfile?.users?.name ??
              offer.architectProfile?.username ??
              "Memar";
            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold">{offer.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {architectName} üçün
                    </p>
                  </div>
                  <Badge
                    variant={statusVariants[offer.status] ?? "secondary"}
                    className="shrink-0 text-xs"
                  >
                    {statusLabels[offer.status] ?? offer.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {offer.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {offer.budget && (
                    <span className="font-medium text-foreground">
                      {offer.budget.toLocaleString()} AZN
                    </span>
                  )}
                  {offer.duration && <span>{offer.duration}</span>}
                  <span className="ml-auto">
                    {new Date(offer.createdAt).toLocaleDateString("az-AZ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
