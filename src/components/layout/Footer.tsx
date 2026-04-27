"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useI18n();

  const footerLinks = {
    platform: [
      { href: "/memarlar", key: "footer.link.architects" },
      { href: "/layiheler", key: "footer.link.portfolio" },
      { href: "/bazar", key: "footer.link.marketplace" },
      { href: "/xerite", key: "footer.link.map" },
    ],
    professionals: [
      { href: "/qeydiyyat?rol=professional", key: "footer.link.proRegister" },
      { href: "/panel/portfolio/yeni", key: "footer.link.uploadPortfolio" },
      { href: "/panel/profil", key: "footer.link.createProfile" },
      { href: "/panel", key: "footer.link.proPanel" },
    ],
    clients: [
      { href: "/qeydiyyat?rol=client", key: "footer.link.clientRegister" },
      { href: "/bazar/yeni", key: "footer.link.postProject" },
      { href: "/memarlar", key: "footer.link.findArchitect" },
      { href: "/giris", key: "footer.link.signIn" },
    ],
    company: [
      { href: "/haqqimizda", key: "footer.link.about" },
      { href: "/elaqe", key: "footer.link.contact" },
      { href: "/blog", key: "footer.link.blog" },
      { href: "/yardim", key: "footer.link.help" },
    ],
  };

  return (
    <footer className="bg-[#111111] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex mb-5">
              <Image
                src="/ArchiLink.png"
                alt="ArchiLink"
                width={160}
                height={48}
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              {t("footer.desc")}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-[#0D9488] shrink-0" />
                Bakı, Azərbaycan
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-[#0D9488] shrink-0" />
                info@archilink.az
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <Phone className="w-4 h-4 text-[#0D9488] shrink-0" />
                <a href="tel:+994991106600" className="hover:text-white transition-colors">
                  +994 99 110 66 00
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-6">
              {[
                { icon: Instagram, href: "https://instagram.com/archilink.az", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-md bg-white/5 hover:bg-[#0D9488] flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-gray-500 mb-4">
              {t("footer.platform")}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionals */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-gray-500 mb-4">
              {t("footer.professionals")}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.professionals.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clients */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-gray-500 mb-4">
              {t("footer.clients")}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.clients.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-gray-500 mb-4">
              {t("footer.company")}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} ArchiLink. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-5">
              <Link href="/gizlilik" className="text-xs text-gray-600 hover:text-gray-300 transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link href="/sertler" className="text-xs text-gray-600 hover:text-gray-300 transition-colors">
                {t("footer.terms")}
              </Link>
              <Link href="/kukiler" className="text-xs text-gray-600 hover:text-gray-300 transition-colors">
                {t("footer.cookies")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '0.75rem 0 1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <style>{`.birclick-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 9px;font-family:-apple-system,sans-serif;font-size:11px;color:#555;text-decoration:none;border:1px solid transparent;border-radius:100px;background:rgba(255,255,255,0.03);transition:all 0.3s ease}.birclick-badge:hover{color:#ccc;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.1)}`}</style>
        <a href="https://birclick.az" target="_blank" rel="noopener" className="birclick-badge"><img src="https://www.birclick.az/icon.png" alt="BirClick" width={16} height={16} style={{borderRadius:'4px',flexShrink:0}} /><span style={{width:'1px',height:'12px',background:'rgba(255,255,255,0.1)',flexShrink:0}}></span><span><strong style={{fontWeight:600,color:'inherit'}}>BirClick Group</strong> tərəfindən hazırlanıb</span></a>
      </div>
    </footer>
  );
}
