"use client";

import { useState } from "react";
import {
  FileSignature, ArrowLeft, Printer, Copy, CheckCheck,
  User, Building2, Calendar, CreditCard, FileText, Shield, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

interface ContractFields {
  contractNo: string;
  professionalName: string;
  professionalAddress: string;
  professionalPhone: string;
  professionalEmail: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  projectTitle: string;
  projectDescription: string;
  projectLocation: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  depositAmount: string;
  paymentTerms: string;
  revisionRounds: string;
  servicesIncluded: string;
  deliverablesFormat: string;
  specialTerms: string;
}

const defaultFields: ContractFields = {
  contractNo: `MQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  professionalName: "",
  professionalAddress: "",
  professionalPhone: "",
  professionalEmail: "",
  clientName: "",
  clientAddress: "",
  clientPhone: "",
  projectTitle: "",
  projectDescription: "",
  projectLocation: "",
  startDate: "",
  endDate: "",
  totalPrice: "",
  depositAmount: "",
  paymentTerms: "50/50",
  revisionRounds: "2",
  servicesIncluded: "",
  deliverablesFormat: "",
  specialTerms: "",
};

const paymentTermsLabel: Record<string, string> = {
  tam: "Tam ödəniş (100% əvvəlcədən)",
  "50/50": "50% əvvəlcədən, 50% tamamlandıqda",
  "30/70": "30% əvvəlcədən, 70% tamamlandıqda",
  merheleli: "Mərhələli ödəniş (hər mərhələ sonunda)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-slate-900 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ContractDocument({ f }: { f: ContractFields }) {
  const today = new Date().toLocaleDateString("az-AZ", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div
      id="contract-document"
      className="bg-white border border-slate-200 rounded-2xl max-w-3xl mx-auto text-slate-800 text-sm leading-relaxed overflow-hidden"
    >
      {/* Header with logo */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-10 py-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/ArchiLink.png" alt="ArchiLink" width={140} height={40} className="brightness-0 invert" />
        </div>
        <div className="text-right">
          <p className="text-white/50 text-[10px] uppercase tracking-widest">Müqavilə №</p>
          <p className="text-white font-mono font-bold text-sm mt-0.5">{f.contractNo}</p>
          <p className="text-white/40 text-[10px] mt-1">{today}</p>
        </div>
      </div>

      <div className="px-10 py-8">
        {/* Title */}
        <div className="text-center mb-8 pb-6 border-b border-slate-100">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-slate-900">
            Xidmət Müqaviləsi
          </h2>
          <p className="text-slate-400 text-xs mt-2">ArchiLink Platforması vasitəsilə hazırlanmışdır · archilink.az</p>
        </div>

        {/* Parties */}
        <section className="mb-7">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-primary mb-4">
            1. Tərəflər
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-semibold">İcraçı</p>
              <p className="font-bold text-slate-900 text-base">{f.professionalName || "—"}</p>
              {f.professionalAddress && <p className="text-slate-500 text-xs mt-1">{f.professionalAddress}</p>}
              {f.professionalPhone && <p className="text-slate-500 text-xs mt-0.5">📞 {f.professionalPhone}</p>}
              {f.professionalEmail && <p className="text-slate-500 text-xs mt-0.5">✉ {f.professionalEmail}</p>}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-semibold">Sifarişçi</p>
              <p className="font-bold text-slate-900 text-base">{f.clientName || "—"}</p>
              {f.clientAddress && <p className="text-slate-500 text-xs mt-1">{f.clientAddress}</p>}
              {f.clientPhone && <p className="text-slate-500 text-xs mt-0.5">📞 {f.clientPhone}</p>}
            </div>
          </div>
          <p className="mt-4 text-slate-600 text-xs">
            Aşağıda göstərilən şərtlər əsasında <strong>{f.professionalName || "İcraçı"}</strong> (bundan sonra "İcraçı") ilə{" "}
            <strong>{f.clientName || "Sifarişçi"}</strong> (bundan sonra "Sifarişçi") arasında bu müqavilə bağlanmışdır.
          </p>
        </section>

        {/* Services */}
        <section className="mb-7">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-primary mb-4">
            2. Xidmətlər
          </h3>
          <div className="space-y-2">
            <p><span className="font-semibold">Layihənin adı:</span> {f.projectTitle || "—"}</p>
            {f.projectLocation && <p><span className="font-semibold">Yer:</span> {f.projectLocation}</p>}
            <p className="mt-2"><span className="font-semibold">Layihənin təsviri:</span></p>
            <p className="text-slate-600">{f.projectDescription || "—"}</p>
          </div>
          {f.servicesIncluded && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Daxil olan xidmətlər:</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-700 whitespace-pre-line text-xs">
                {f.servicesIncluded}
              </div>
            </div>
          )}
          {f.deliverablesFormat && (
            <div className="mt-3">
              <p className="font-semibold mb-1 text-xs">Təhvil formatı:</p>
              <p className="text-xs text-slate-600">{f.deliverablesFormat}</p>
            </div>
          )}
          {f.revisionRounds && (
            <p className="mt-3 text-xs text-slate-600">
              <span className="font-semibold">Düzəliş turları:</span> {f.revisionRounds} dəfə (əlavə düzəliş əlavə ödənişlə)
            </p>
          )}
        </section>

        {/* Duration */}
        <section className="mb-7">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-primary mb-4">
            3. Müddət
          </h3>
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Başlama tarixi</p>
              <p className="font-semibold">{f.startDate || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Bitmə tarixi</p>
              <p className="font-semibold">{f.endDate || "—"}</p>
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="mb-7">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-primary mb-4">
            4. Ödəniş Şərtləri
          </h3>
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex flex-wrap gap-8">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Ümumi məbləğ</p>
              <p className="font-bold text-2xl text-primary">{f.totalPrice ? `${Number(f.totalPrice).toLocaleString("az-AZ")} AZN` : "— AZN"}</p>
            </div>
            {f.depositAmount && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">İlkin ödəniş (depozit)</p>
                <p className="font-bold text-lg text-slate-700">{Number(f.depositAmount).toLocaleString("az-AZ")} AZN</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Ödəniş şərtləri</p>
              <p className="font-semibold text-sm">{paymentTermsLabel[f.paymentTerms] || f.paymentTerms}</p>
            </div>
          </div>
        </section>

        {/* Standard clauses */}
        <section className="mb-7">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-primary mb-4">
            5. Ümumi Şərtlər
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p>5.1. İcraçı müqavilədə göstərilən xidmətləri peşəkar səviyyədə yerinə yetirməyi öhdəsinə götürür.</p>
            <p>5.2. Sifarişçi lazımi məlumat, sənəd və materialları vaxtında təqdim etməyi öhdəsinə götürür.</p>
            <p>5.3. İlkin ödəniş alındıqdan sonra layihə rəsmi olaraq başlanmış hesab olunur.</p>
            <p>5.4. Müqavilə şərtlərindən kənara çıxan işlər əlavə razılaşma və ödənişlə yerinə yetirilir.</p>
            <p>5.5. Hər iki tərəf layihəyə dair məxfi məlumatları üçüncü tərəflərə açıqlamamağa razıdır.</p>
            <p>5.6. Müqaviləni ləğv etmək istəyən tərəf 14 gün əvvəlcədən bildiriş verməlidir.</p>
          </div>
        </section>

        {/* Special terms */}
        {f.specialTerms && (
          <section className="mb-7">
            <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-primary mb-4">
              6. Xüsusi Şərtlər
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-slate-700 whitespace-pre-line text-xs">
              {f.specialTerms}
            </div>
          </section>
        )}

        {/* Signatures */}
        <section className="mt-10 pt-6 border-t border-slate-100">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-primary mb-6">
            {f.specialTerms ? "7." : "6."} İmzalar
          </h3>
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-8 font-semibold">İcraçı</p>
              <div className="border-b-2 border-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">{f.professionalName || "Ad, Soyad"}</p>
              {f.professionalPhone && <p className="text-[10px] text-slate-400">{f.professionalPhone}</p>}
              <p className="text-[10px] text-slate-400 mt-3">Tarix: _______________</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-8 font-semibold">Sifarişçi</p>
              <div className="border-b-2 border-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">{f.clientName || "Ad, Soyad"}</p>
              {f.clientPhone && <p className="text-[10px] text-slate-400">{f.clientPhone}</p>}
              <p className="text-[10px] text-slate-400 mt-3">Tarix: _______________</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-40">
          <Image src="/ArchiLink.png" alt="ArchiLink" width={80} height={24} />
        </div>
        <p className="text-[10px] text-slate-400">archilink.az · Müqavilə №: {f.contractNo}</p>
      </div>
    </div>
  );
}

function buildContractText(f: ContractFields): string {
  const today = new Date().toLocaleDateString("az-AZ");
  return `XİDMƏT MÜQAVİLƏSİ № ${f.contractNo}
Tarix: ${today}

1. TƏRƏFLƏR
İcraçı: ${f.professionalName}
Ünvan: ${f.professionalAddress}
Telefon: ${f.professionalPhone}
E-poçt: ${f.professionalEmail}

Sifarişçi: ${f.clientName}
Ünvan: ${f.clientAddress}
Telefon: ${f.clientPhone}

2. XİDMƏTLƏR
Layihənin adı: ${f.projectTitle}
Yer: ${f.projectLocation}
Təsvir: ${f.projectDescription}
Daxil olan xidmətlər:
${f.servicesIncluded}
Təhvil formatı: ${f.deliverablesFormat}
Düzəliş turları: ${f.revisionRounds}

3. MÜDDƏT
Başlama: ${f.startDate}
Bitmə: ${f.endDate}

4. ÖDƏNİŞ
Ümumi məbləğ: ${f.totalPrice} AZN
İlkin ödəniş: ${f.depositAmount} AZN
Şərtlər: ${paymentTermsLabel[f.paymentTerms] || f.paymentTerms}

5. XÜSUSİ ŞƏRTLƏR
${f.specialTerms || "Yoxdur"}

İCRAÇI İMZASI: _________________   SİFARİŞÇİ İMZASI: _________________

ArchiLink Platforması · archilink.az`;
}

export default function MuqavilePage() {
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2>(1);
  const [fields, setFields] = useState<ContractFields>(defaultFields);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof ContractFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handlePrint = () => {
    const el = document.getElementById("contract-document");
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const origin = window.location.origin;
    const html = el.innerHTML
      .replace(/src="\/ArchiLink\.png"/g, `src="${origin}/ArchiLink.png"`);
    win.document.write(`<!DOCTYPE html>
<html><head>
<title>Müqavilə ${fields.contractNo}</title>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: white; }
  img { display: inline-block; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 0; }
  }
</style>
</head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildContractText(fields));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FileSignature className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">{t("contract.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("contract.subtitle")}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: "Məlumatları Doldurun" },
          { n: 2, label: t("contract.preview") },
        ].map(({ n, label }, i, arr) => (
          <div key={n} className="flex items-center gap-3 flex-1">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-1 justify-center ${step === n ? "bg-primary text-white shadow-md shadow-primary/20" : step > n ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === n ? "bg-white/20" : step > n ? "bg-emerald-200" : "bg-slate-200"}`}>{n}</span>
              {label}
            </div>
            {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          {/* Parties */}
          <Section icon={User} title="Tərəflər">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("contract.proName")}>
                <input className={input} placeholder="Ad Soyad / Şirkət adı" value={fields.professionalName} onChange={set("professionalName")} />
              </Field>
              <Field label={t("contract.proAddress")}>
                <input className={input} placeholder="Şəhər, küçə, bina" value={fields.professionalAddress} onChange={set("professionalAddress")} />
              </Field>
              <Field label="Peşəkarın telefonu">
                <input className={input} placeholder="+994 50 000 00 00" value={fields.professionalPhone} onChange={set("professionalPhone")} />
              </Field>
              <Field label="Peşəkarın e-poçtu">
                <input className={input} placeholder="email@example.com" value={fields.professionalEmail} onChange={set("professionalEmail")} />
              </Field>
              <Field label={t("contract.clientName")}>
                <input className={input} placeholder="Ad Soyad / Şirkət adı" value={fields.clientName} onChange={set("clientName")} />
              </Field>
              <Field label={t("contract.clientAddress")}>
                <input className={input} placeholder="Şəhər, küçə, bina" value={fields.clientAddress} onChange={set("clientAddress")} />
              </Field>
              <Field label="Müştərinin telefonu" >
                <input className={input} placeholder="+994 50 000 00 00" value={fields.clientPhone} onChange={set("clientPhone")} />
              </Field>
            </div>
          </Section>

          {/* Project */}
          <Section icon={Building2} title="Layihə Məlumatları">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("contract.projectTitle")}>
                  <input className={input} placeholder="məs. 3 otaqlı mənzilin dizaynı" value={fields.projectTitle} onChange={set("projectTitle")} />
                </Field>
                <Field label="Layihənin yeri">
                  <input className={input} placeholder="Bakı, Nərimanov rayonu" value={fields.projectLocation} onChange={set("projectLocation")} />
                </Field>
              </div>
              <Field label={t("contract.projectDesc")}>
                <textarea className={input} rows={3} placeholder="Layihə haqqında qısa məlumat..." value={fields.projectDescription} onChange={set("projectDescription")} />
              </Field>
              <Field label={t("contract.services")}>
                <textarea className={input} rows={4} placeholder="- 3D vizualizasiya&#10;- Texniki çertyoj&#10;- Avtor nəzarəti" value={fields.servicesIncluded} onChange={set("servicesIncluded")} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Təhvil formatı">
                  <input className={input} placeholder="PDF, DWG, 3DS, JPG..." value={fields.deliverablesFormat} onChange={set("deliverablesFormat")} />
                </Field>
                <Field label="Düzəliş turları">
                  <select className={input} value={fields.revisionRounds} onChange={set("revisionRounds")}>
                    {["1","2","3","5","Limitsiz"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </Section>

          {/* Dates & Payment */}
          <Section icon={Calendar} title="Müddət">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("contract.startDate")}>
                <input type="date" className={input} value={fields.startDate} onChange={set("startDate")} />
              </Field>
              <Field label={t("contract.endDate")}>
                <input type="date" className={input} value={fields.endDate} onChange={set("endDate")} />
              </Field>
            </div>
          </Section>

          <Section icon={CreditCard} title="Ödəniş">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("contract.price") + " (AZN)"}>
                <input type="number" className={input} placeholder="0.00" value={fields.totalPrice} onChange={set("totalPrice")} />
              </Field>
              <Field label="İlkin ödəniş / Depozit (AZN)">
                <input type="number" className={input} placeholder="0.00" value={fields.depositAmount} onChange={set("depositAmount")} />
              </Field>
              <Field label={t("contract.paymentTerms")}>
                <select className={input} value={fields.paymentTerms} onChange={set("paymentTerms")}>
                  <option value="tam">Tam ödəniş (100% əvvəlcədən)</option>
                  <option value="50/50">50% əvvəlcədən, 50% tamamlandıqda</option>
                  <option value="30/70">30% əvvəlcədən, 70% tamamlandıqda</option>
                  <option value="merheleli">Mərhələli ödəniş</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Special terms */}
          <Section icon={Shield} title="Xüsusi Şərtlər (İstəyə görə)">
            <textarea
              className={input}
              rows={4}
              placeholder="Xüsusi şərtlər, qeydlər, məhdudiyyətlər..."
              value={fields.specialTerms}
              onChange={set("specialTerms")}
            />
          </Section>

          <div className="flex justify-end pt-2">
            <Button variant="gradient" size="lg" className="gap-2" onClick={() => setStep(2)}>
              <FileText className="w-4 h-4" />
              Müqaviləni Hazırla
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Action bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button variant="outline" className="gap-2" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" />
              {t("contract.newContract")}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={handleCopy}>
                {copied ? (
                  <><CheckCheck className="w-4 h-4 text-emerald-500" />{t("contract.copied")}</>
                ) : (
                  <><Copy className="w-4 h-4" />{t("contract.copyText")}</>
                )}
              </Button>
              <Button variant="gradient" className="gap-2" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                {t("contract.download")}
              </Button>
            </div>
          </div>

          <ContractDocument f={fields} />
        </div>
      )}
    </div>
  );
}
