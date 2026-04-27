"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { deleteAccount } from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Lock,
  LogOut,
  Mail,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Check,
  FileCheck,
  Upload,
  AlertCircle,
  X,
  Users,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

const MAX_DOC_SIZE_MB = 5;
const MAX_DOC_SIZE_BYTES = MAX_DOC_SIZE_MB * 1024 * 1024;

export default function SettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [proposalNotifs, setProposalNotifs] = useState(true);
  const prefsLoaded = useRef(false);

  // Role change state
  const [pendingRole, setPendingRole] = useState("");
  const [changingRole, setChangingRole] = useState(false);

  // Profile visibility state
  const [isPublic, setIsPublic] = useState(true);
  const [changingVisibility, setChangingVisibility] = useState(false);

  // Document verification state
  const [verificationStatus, setVerificationStatus] = useState<
    "none" | "pending" | "verified"
  >("none");
  const [docUploading, setDocUploading] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email ?? "");
        setUserName(session.user.user_metadata?.name ?? "");
        setUserId(session.user.id);

        // Always read role from users table (more reliable than user_metadata)
        const { data: userRow } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = userRow?.role || session.user.user_metadata?.role || "client";
        setUserRole(role);
        setPendingRole(role);

        // Load profile visibility
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("isPublic")
          .eq("userId", session.user.id)
          .maybeSingle();
        setIsPublic(profileRow?.isPublic ?? true);

        // Load verification status for professional users
        if (role === "professional") {
          const { data: verReq } = await supabase
            .from("verificationRequests")
            .select("status")
            .eq("userId", session.user.id)
            .order("createdAt", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (verReq) {
            if (verReq.status === "approved") {
              setVerificationStatus("verified");
            } else {
              setVerificationStatus("pending");
            }
          }
        }
      }
    });

    if (!prefsLoaded.current) {
      prefsLoaded.current = true;
      const saved = localStorage.getItem("notif_prefs");
      if (saved) {
        try {
          const p = JSON.parse(saved);
          setEmailNotifs(p.email ?? true);
          setMessageNotifs(p.message ?? true);
          setProposalNotifs(p.proposal ?? true);
        } catch {}
      }
    }
  }, []);

  const saveNotifPrefs = (key: string, val: boolean) => {
    const current = {
      email: emailNotifs,
      message: messageNotifs,
      proposal: proposalNotifs,
      [key]: val,
    };
    localStorage.setItem("notif_prefs", JSON.stringify(current));
    toast.success(t("parametrler.notifs.saved"));
  };

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      toast.error("Yeni email daxil edin");
      return;
    }
    if (newEmail.trim().toLowerCase() === userEmail.toLowerCase()) {
      toast.error("Yeni email cari email ilə eynidir");
      return;
    }
    setChangingEmail(true);
    setEmailChangeSuccess(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
        toast.error("Bu email artıq qeydiyyatdadır");
      } else {
        toast.error(error.message);
      }
    } else {
      setEmailChangeSuccess(true);
      setNewEmail("");
      toast.success("Yeni emailə təsdiq linki göndərildi");
    }
    setChangingEmail(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail.trim().toLowerCase() !== userEmail.toLowerCase()) {
      toast.error("Email düzgün deyil. Zəhmət olmasa dəqiq daxil edin.");
      return;
    }
    setDeleting(true);
    const result = await deleteAccount(userId);
    if (result.error) {
      toast.error(result.error);
      setDeleting(false);
      return;
    }
    // Account deleted, redirect to homepage
    router.push("/");
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) { toast.error(t("parametrler.password.err.current")); return; }
    if (newPassword.length < 6) { toast.error(t("parametrler.password.err.min")); return; }
    if (newPassword !== confirmPassword) { toast.error(t("parametrler.password.err.mismatch")); return; }

    setChangingPw(true);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      toast.error(t("parametrler.password.err.wrong"));
      setChangingPw(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("parametrler.password.success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPw(false);
  };

  const handleRoleChange = async () => {
    if (pendingRole === userRole) return;
    setChangingRole(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ role: pendingRole })
      .eq("id", userId);
    if (error) {
      toast.error(error.message);
    } else {
      await supabase.auth.updateUser({ data: { role: pendingRole } });
      setUserRole(pendingRole);
      toast.success("Hesab növü dəyişdirildi. Səhifəni yeniləyin.");
    }
    setChangingRole(false);
  };

  const handleVisibilityChange = async (val: boolean) => {
    if (!userId) return;
    setIsPublic(val);
    setChangingVisibility(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ userId, isPublic: val }, { onConflict: "userId" });
    if (error) {
      setIsPublic(!val); // revert on failure
      toast.error("Dəyişiklik saxlanılmadı");
    } else {
      toast.success(val ? "Profil ictimaiyyətə açıldı" : "Profil gizlədildi");
    }
    setChangingVisibility(false);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_DOC_SIZE_BYTES) {
      toast.error(`Fayl ölçüsü ${MAX_DOC_SIZE_MB}MB-dan böyük ola bilməz`);
      return;
    }

    setDocUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-verification.${ext}`;

      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });

      if (storageError) {
        toast.error(`Fayl yükləmə xətası: ${storageError.message}`);
        return;
      }

      const { data: pub } = supabase.storage
        .from("documents")
        .getPublicUrl(path);

      const { error: dbError } = await supabase
        .from("verificationRequests")
        .insert({
          userId,
          documentUrl: pub.publicUrl,
          status: "pending",
        });

      if (dbError) {
        toast.error(dbError.message);
      } else {
        setDocUploaded(true);
        setVerificationStatus("pending");
        toast.success("Sənəd yükləndi! Tezliklə yoxlanılacaq.");
      }
    } finally {
      setDocUploading(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">{t("parametrler.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("parametrler.subtitle")}</p>
      </div>

      {/* Account Info */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          {t("parametrler.account.title")}
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("parametrler.account.name")}</Label>
            <Input value={userName} readOnly className="bg-muted/40" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("parametrler.account.email")}</Label>
            <Input value={userEmail} readOnly className="bg-muted/40" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("parametrler.account.role")}</Label>
            <Input
              value={userRole === "professional" ? t("dash.role.professional") : t("dash.role.client")}
              readOnly
              className="bg-muted/40"
            />
          </div>
        </div>
      </section>

      {/* Account Type / Role */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-heading font-semibold mb-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Hesab növü
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Peşəkar memardan müştəriyə keçin və ya əksinə
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { value: "professional", label: "Peşəkar", desc: "Xidmət göstərirəm" },
            { value: "client", label: "Müştəri", desc: "Xidmət axtarıram" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPendingRole(opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                pendingRole === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className={`font-semibold text-sm ${pendingRole === opt.value ? "text-primary" : ""}`}>{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
        <Button
          onClick={handleRoleChange}
          disabled={changingRole || pendingRole === userRole}
          className="w-full"
        >
          {changingRole ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Dəyişdirilir...</> : "Yadda saxla"}
        </Button>
      </section>

      {/* Profile Visibility */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-heading font-semibold mb-1 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Profil görünürlüğü
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Profilinizin digər istifadəçilərə görünüb-görünməyəcəyini idarə edin
        </p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
          <div>
            <p className="text-sm font-medium">{isPublic ? "Profil açıqdır" : "Profil gizlidir"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPublic ? "Hər kəs profilinizi görə bilər" : "Profiliniz axtarışda və siyahıda görünmür"}
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={handleVisibilityChange}
            disabled={changingVisibility}
          />
        </div>
      </section>

      {/* Change Email */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-heading font-semibold mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          Email dəyiş
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Yeni emailə keçid üçün təsdiq linki göndəriləcək
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Cari email</Label>
            <Input value={userEmail} readOnly className="bg-muted/40" />
          </div>
          <div className="space-y-1.5">
            <Label>Yeni email</Label>
            <Input
              type="email"
              placeholder="yeni@email.com"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setEmailChangeSuccess(false); }}
              disabled={changingEmail}
            />
          </div>
          {emailChangeSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              Yeni emailə təsdiq linki göndərildi
            </div>
          )}
          <Button
            onClick={handleEmailChange}
            className="w-full"
            disabled={changingEmail || !newEmail.trim()}
          >
            {changingEmail ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Göndərilir...</>
            ) : "Dəyiş"}
          </Button>
        </div>
      </section>

      {/* Document Verification — only for professionals */}
      {userRole === "professional" && (
        <section className="bg-white rounded-2xl border border-border p-6 mb-4">
          <h2 className="font-heading font-semibold mb-1 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            Sənəd Yoxlaması
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Hesabınızı təsdiqləmək üçün memarlıq lisenziyasını və ya diplomu yükləyin
          </p>

          {/* Status badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Cari status:</span>
            {verificationStatus === "verified" ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                <Check className="w-3 h-3" />
                Təsdiqləndi
              </Badge>
            ) : verificationStatus === "pending" ? (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Yoxlanılır...
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Yoxlanılmamış
              </Badge>
            )}
          </div>

          {/* Upload — hide if already verified */}
          {verificationStatus !== "verified" && (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Memarlıq lisenziyası və ya diplomu yükləyin
              </p>

              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleDocumentUpload}
                disabled={docUploading}
              />

              {docUploaded || verificationStatus === "pending" ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Yükləndi! Yoxlanılır...
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => docInputRef.current?.click()}
                  disabled={docUploading}
                >
                  {docUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {docUploading ? "Yüklənir..." : "Sənədi Yüklə"}
                </Button>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Qəbul olunan formatlar: PDF, JPG, PNG · Maksimum {MAX_DOC_SIZE_MB}MB
              </p>
            </>
          )}

          {verificationStatus === "verified" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              Sənədiniz yoxlanılıb və hesabınız təsdiqlənib.
            </div>
          )}
        </section>
      )}

      {/* Password Change */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          {t("parametrler.password.title")}
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("parametrler.password.current")}</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("parametrler.password.new")}</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("parametrler.password.confirm")}</Label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={
                  confirmPassword && confirmPassword !== newPassword ? "border-destructive pr-10"
                  : confirmPassword && confirmPassword === newPassword ? "border-emerald-500 pr-10"
                  : "pr-10"
                }
              />
              {confirmPassword && confirmPassword === newPassword && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-destructive">{t("parametrler.password.mismatch")}</p>
            )}
          </div>
          <Button onClick={handlePasswordChange} className="w-full" disabled={changingPw}>
            {changingPw ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("parametrler.password.checking")}</>
            ) : t("parametrler.password.update")}
          </Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          {t("parametrler.notifs.title")}
        </h2>
        <div className="space-y-4">
          {[
            {
              key: "email",
              label: t("parametrler.notifs.email"),
              desc: t("parametrler.notifs.email.desc"),
              value: emailNotifs,
              onChange: (v: boolean) => { setEmailNotifs(v); saveNotifPrefs("email", v); },
            },
            {
              key: "message",
              label: t("parametrler.notifs.message"),
              desc: t("parametrler.notifs.message.desc"),
              value: messageNotifs,
              onChange: (v: boolean) => { setMessageNotifs(v); saveNotifPrefs("message", v); },
            },
            {
              key: "proposal",
              label: t("parametrler.notifs.proposal"),
              desc: t("parametrler.notifs.proposal.desc"),
              value: proposalNotifs,
              onChange: (v: boolean) => { setProposalNotifs(v); saveNotifPrefs("proposal", v); },
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={item.value} onCheckedChange={item.onChange} />
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-2xl border border-destructive/20 p-6">
        <h2 className="font-heading font-semibold mb-4 text-destructive flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          {t("parametrler.danger.title")}
        </h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            <LogOut className="w-4 h-4" />
            {t("parametrler.signOut")}
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4" />
            Hesabı sil
          </Button>
        </div>
      </section>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-destructive/30 shadow-lg w-full max-w-md p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmEmail(""); }}
              disabled={deleting}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-destructive">Hesabı Sil</h3>
                <p className="text-xs text-muted-foreground">Bu əməliyyat geri qaytarıla bilməz</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 mb-5">
              <p className="text-sm text-destructive">
                Hesabınızı silməklə bütün məlumatlarınız, mesajlarınız və layihələriniz həmişəlik silinəcək.
              </p>
            </div>

            <div className="space-y-1.5 mb-5">
              <Label className="text-sm">
                Təsdiqləmək üçün emailinizi daxil edin:{" "}
                <span className="font-medium text-foreground">{userEmail}</span>
              </Label>
              <Input
                type="email"
                placeholder={userEmail}
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                disabled={deleting}
                className={
                  deleteConfirmEmail && deleteConfirmEmail.toLowerCase() !== userEmail.toLowerCase()
                    ? "border-destructive"
                    : deleteConfirmEmail && deleteConfirmEmail.toLowerCase() === userEmail.toLowerCase()
                    ? "border-emerald-500"
                    : ""
                }
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmEmail(""); }}
                disabled={deleting}
              >
                Ləğv et
              </Button>
              <Button
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white gap-2"
                onClick={handleDeleteAccount}
                disabled={
                  deleting ||
                  deleteConfirmEmail.trim().toLowerCase() !== userEmail.toLowerCase()
                }
              >
                {deleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Silinir...</>
                ) : (
                  <><Trash2 className="w-4 h-4" />Hesabı Sil</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
