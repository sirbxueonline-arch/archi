import { AuthQuote } from "@/components/layout/AuthQuote";
import { AuthTestimonial } from "@/components/layout/AuthTestimonial";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#111111]">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D9488]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0D9488]/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div className="-ml-4">
            <Image src="/authlogo.png" alt="ArchiLink" width={200} height={60} priority className="w-auto" />
          </div>
          {/* Main Quote */}
          <AuthQuote />

          {/* Testimonial */}
          <AuthTestimonial />
        </div>
      </div>

      {/* Right Panel - Form (scrollable on small viewports) */}
      <div className="flex items-start justify-center p-6 sm:p-12 bg-background overflow-y-auto min-h-screen lg:min-h-0">
        <div className="w-full max-w-md py-8 lg:py-0">
          {children}
        </div>
      </div>
    </div>
  );
}
