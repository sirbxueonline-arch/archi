import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-primary/40" />
        </div>
        <h1 className="font-heading text-7xl font-bold text-primary mb-3">
          404
        </h1>
        <h2 className="font-heading text-2xl font-semibold mb-3">
          Səhifə tapılmadı
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Axtardığınız səhifə mövcud deyil və ya köçürülüb.
        </p>
        <Link href="/">
          <Button variant="gradient" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Ana Səhifəyə Qayıt
          </Button>
        </Link>
      </div>
    </div>
  );
}
