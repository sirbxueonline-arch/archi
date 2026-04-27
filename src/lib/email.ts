// Email notification utilities using Resend
// Rules: no SVG (Gmail strips it), no flexbox, no border-radius on <td>, table layout only

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "ArchiLink <noreply@archilink.az>";
const LOGO_URL = "https://archilink.az/logoemail.png";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="az">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body, table, td { margin:0; padding:0; box-sizing:border-box; }
    body { background-color:#f0f0f0; font-family:Arial,sans-serif; }
    img { border:0; display:block; }
    a { text-decoration:none; }
  </style>
</head>
<body bgcolor="#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0f0f0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#ffffff" style="padding:16px 48px;border-radius:16px 16px 0 0;border-bottom:1px solid #f0f0f0;">
              <img src="${LOGO_URL}" alt="ArchiLink" width="280" height="auto" style="width:280px;height:auto;max-width:280px;" />
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td height="4" style="background:#6ee7a0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td bgcolor="#ffffff" style="padding:48px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td bgcolor="#1a1a1a" style="padding:28px 48px;border-radius:0 0 16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <a href="https://archilink.az" style="color:#6b7280;font-size:12px;margin:0 8px;">Ana Səhifə</a>
                    <a href="https://archilink.az/yardim" style="color:#6b7280;font-size:12px;margin:0 8px;">Yardım</a>
                    <a href="https://archilink.az/elaqe" style="color:#6b7280;font-size:12px;margin:0 8px;">Əlaqə</a>
                    <a href="https://archilink.az/gizlilik" style="color:#6b7280;font-size:12px;margin:0 8px;">Məxfilik</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:12px;color:#4b5563;line-height:1.6;">
                    <a href="mailto:info@archilink.az" style="color:#6ee7a0;">info@archilink.az</a>
                    &nbsp;|&nbsp;
                    <a href="tel:+994991106600" style="color:#6b7280;">+994 99 110 66 00</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;font-size:12px;color:#4b5563;">
                    &copy; 2026 <span style="color:#6ee7a0;font-weight:bold;">ArchiLink</span>. Bütün hüquqlar qorunur. &nbsp;&middot;&nbsp; Bakı, Azərbaycan
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, text: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0 0 32px;">
        <a href="${href}" style="display:inline-block;background-color:#6ee7a0;color:#0d2018;font-size:15px;font-weight:bold;padding:16px 40px;border-radius:10px;">${text} &rarr;</a>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="1" bgcolor="#f3f4f6" style="font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td height="32" style="font-size:0;">&nbsp;</td></tr>
  </table>`;
}

function steps(items: { heading: string; desc: string }[]): string {
  const rows = items.map((item, i) => `
    <tr>
      <td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="36" valign="top">
              <p style="margin:0;font-size:20px;font-weight:bold;color:#6ee7a0;font-family:Arial,sans-serif;">${i + 1}.</p>
            </td>
            <td valign="top">
              <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#111111;font-family:Arial,sans-serif;">${item.heading}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;font-family:Arial,sans-serif;">${item.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

// ─── New Message ──────────────────────────────────────────────────────────────

export async function sendNewMessageEmail(
  to: string,
  senderName: string,
  preview: string,
  conversationId: string,
  receiverName?: string,
) {
  if (!RESEND_API_KEY) return;
  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  const body = `
    <p style="margin:0 0 12px;font-size:22px;font-weight:bold;color:#111111;text-align:center;font-family:Arial,sans-serif;">Yeni mesajınız var</p>
    <p style="margin:0 0 36px;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      Salam <strong style="color:#111;">${receiverName ?? "istifadəçi"}</strong>,
      <strong style="color:#111;">${senderName}</strong> sizə mesaj göndərdi.
    </p>
    ${divider()}
    <!-- Message preview -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td width="4" bgcolor="#6ee7a0" style="border-radius:3px;">&nbsp;</td>
        <td bgcolor="#f9fafb" style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#111111;font-family:Arial,sans-serif;">${senderName}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;font-style:italic;font-family:Arial,sans-serif;">${preview}</p>
        </td>
      </tr>
    </table>
    ${ctaButton(`https://archilink.az/panel/mesajlar/${conversationId}`, "Söhbətə keç")}
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      Bu emaili almaq istəmirsinizsə, bildiriş parametrlərinizi dəyişə bilərsiniz.
    </p>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${senderName} sizə mesaj göndərdi — ArchiLink`,
    html: emailWrapper(body),
  });
}

// ─── New Proposal ─────────────────────────────────────────────────────────────

export async function sendNewProposalEmail(
  to: string,
  professionalName: string,
  projectTitle: string,
  projectId: string,
  clientName?: string,
  budget?: string,
  duration?: string,
) {
  if (!RESEND_API_KEY) return;
  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  const body = `
    <p style="margin:0 0 12px;font-size:22px;font-weight:bold;color:#111111;text-align:center;font-family:Arial,sans-serif;">Yeni təklif aldınız</p>
    <p style="margin:0 0 36px;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      Salam <strong style="color:#111;">${clientName ?? "istifadəçi"}</strong>,
      <strong style="color:#111;">${professionalName}</strong> layihənizə təklif göndərdi.
    </p>
    ${divider()}
    <!-- Proposal card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="border-radius:12px;margin-bottom:32px;border:1px solid #eeeeee;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#6ee7a0;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Layihə</p>
          <p style="margin:0 0 16px;font-size:16px;font-weight:bold;color:#111111;font-family:Arial,sans-serif;">${projectTitle}</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="top" style="padding-right:20px;">
                <p style="margin:0 0 2px;font-size:11px;font-weight:bold;color:#374151;font-family:Arial,sans-serif;">PEŞƏKAR</p>
                <p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">${professionalName}</p>
              </td>
              ${budget ? `<td valign="top" style="padding-right:20px;"><p style="margin:0 0 2px;font-size:11px;font-weight:bold;color:#374151;font-family:Arial,sans-serif;">BÜDCƏ</p><p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">${budget}</p></td>` : ""}
              ${duration ? `<td valign="top"><p style="margin:0 0 2px;font-size:11px;font-weight:bold;color:#374151;font-family:Arial,sans-serif;">MÜDDƏT</p><p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">${duration}</p></td>` : ""}
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton(`https://archilink.az/panel/layihelerim/${projectId}`, "Təklifi incələ")}
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      Layihənizə bir neçə peşəkar müraciət edə bilər. Portfolioları yoxlayın və ən uyğununu seçin.
    </p>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${professionalName} layihənizə təklif göndərdi — ArchiLink`,
    html: emailWrapper(body),
  });
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  name: string,
  role: "professional" | "client",
) {
  if (!RESEND_API_KEY) return;
  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  const isPro = role === "professional";

  const proBody = `
    <p style="margin:0 0 12px;font-size:22px;font-weight:bold;color:#111111;text-align:center;font-family:Arial,sans-serif;">Xoş gəldiniz, ${name}!</p>
    <p style="margin:0 0 36px;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      ArchiLink peşəkar şəbəkəsinə qoşulduğunuz üçün təşəkkür edirik.<br/>Yüzlərlə müştəri sizi gözləyir.
    </p>
    ${divider()}
    <!-- 0% banner -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1a1a1a" style="border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6;font-family:Arial,sans-serif;">
            ArchiLink platformasında <strong style="color:#6ee7a0;">0% komissiya</strong> ilə işləyirsiniz — qazandığınız hər qəpik sizindir.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:12px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Başlamaq üçün</p>
    ${steps([
      { heading: "Profilinizi tamamlayın", desc: "İxtisas, təcrübə və əlaqə məlumatlarınızı əlavə edin." },
      { heading: "Portfolio yükləyin", desc: "Əvvəlki işlərinizi paylaşın, müştərilərə özünüzü tanıdın." },
      { heading: "Layihələrə müraciət edin", desc: "Bazar bölməsindəki açıq layihələrə təklif göndərin." },
    ])}
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="20">&nbsp;</td></tr></table>
    ${ctaButton("https://archilink.az/panel/profil", "Profili tamamla")}
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      Kömək lazımdırsa, <a href="https://archilink.az/yardim" style="color:#6ee7a0;">Yardım Mərkəzimizə</a> müraciət edin.
    </p>`;

  const clientBody = `
    <p style="margin:0 0 12px;font-size:22px;font-weight:bold;color:#111111;text-align:center;font-family:Arial,sans-serif;">Xoş gəldiniz, ${name}!</p>
    <p style="margin:0 0 36px;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      ArchiLink ailəsinə qoşulduğunuz üçün təşəkkür edirik.<br/>Azərbaycanın ən yaxşı memarları sizi gözləyir.
    </p>
    ${divider()}
    <!-- Stats -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="border-radius:12px;margin-bottom:28px;">
      <tr>
        <td align="center" style="padding:20px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding:0 20px;">
                <p style="margin:0 0 2px;font-size:22px;font-weight:bold;color:#111111;font-family:Arial,sans-serif;">500+</p>
                <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">Aktiv memar</p>
              </td>
              <td align="center" style="padding:0 20px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <p style="margin:0 0 2px;font-size:22px;font-weight:bold;color:#111111;font-family:Arial,sans-serif;">1,200+</p>
                <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">Tamamlanmış layihə</p>
              </td>
              <td align="center" style="padding:0 20px;">
                <p style="margin:0 0 2px;font-size:22px;font-weight:bold;color:#111111;font-family:Arial,sans-serif;">0%</p>
                <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">Komissiya</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:12px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Növbəti addımlar</p>
    ${steps([
      { heading: "Layihənizi elan edin", desc: "Büdcə, yer və kateqoriya daxil edərək layihənizi yükləyin." },
      { heading: "Memarları incələyin", desc: "Portfolioları, reytinqləri və əvvəlki işləri nəzərdən keçirin." },
      { heading: "Təklif alın və seçin", desc: "Peşəkarlardan gələn təklifləri müqayisə edin, ən uyğununu seçin." },
    ])}
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="20">&nbsp;</td></tr></table>
    ${ctaButton("https://archilink.az/bazar/yeni", "Layihə elan et")}
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
      Kömək lazımdırsa, <a href="https://archilink.az/yardim" style="color:#6ee7a0;">Yardım Mərkəzimizə</a> müraciət edin.
    </p>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: isPro
      ? `ArchiLink peşəkar memarlıq şəbəkəsinə xoş gəldiniz, ${name}!`
      : `ArchiLink-ə xoş gəldiniz, ${name}!`,
    html: emailWrapper(isPro ? proBody : clientBody),
  });
}

// ─── Weekly Digest ────────────────────────────────────────────────────────────

interface DigestProfessional {
  name: string;
  specialization: string | null;
  city: string | null;
  username: string;
  avatarImage: string | null;
}

interface DigestProject {
  title: string;
  category: string;
  city: string | null;
  id: string;
}

export async function sendWeeklyDigestToClient(
  to: string,
  clientName: string,
  newProfessionals: DigestProfessional[],
  openProjects: DigestProject[],
) {
  if (!RESEND_API_KEY) return;
  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  const proRows = newProfessionals.slice(0, 3).map((p) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="40" valign="middle" style="padding-right:12px;">
              <div style="width:40px;height:40px;border-radius:10px;background:#e8f5e9;display:table;text-align:center;vertical-align:middle;">
                <span style="font-size:16px;font-weight:bold;color:#6ee7a0;display:table-cell;vertical-align:middle;">${(p.name?.[0] ?? "A").toUpperCase()}</span>
              </div>
            </td>
            <td valign="middle">
              <p style="margin:0 0 2px;font-size:13px;font-weight:bold;color:#111;font-family:Arial,sans-serif;">${p.name}</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">${p.specialization ?? "Memar"}${p.city ? ` · ${p.city}` : ""}</p>
            </td>
            <td valign="middle" align="right">
              <a href="https://archilink.az/memarlar/${p.username}" style="font-size:12px;color:#6ee7a0;font-family:Arial,sans-serif;text-decoration:none;">Bax →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const projectRows = openProjects.slice(0, 3).map((p) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0 0 2px;font-size:13px;font-weight:bold;color:#111;font-family:Arial,sans-serif;">${p.title}</p>
        <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">${p.category}${p.city ? ` · ${p.city}` : ""}</p>
      </td>
    </tr>`).join("");

  const body = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#111111;text-align:center;font-family:Arial,sans-serif;">Həftəlik Xülasə</p>
    <p style="margin:0 0 32px;font-size:15px;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">
      Salam <strong style="color:#111;">${clientName}</strong>, bu həftə platformada yeniliklər var!
    </p>
    ${divider()}
    ${newProfessionals.length > 0 ? `
    <p style="margin:0 0 12px;font-size:12px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Yeni Memarlar</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">${proRows}</table>
    ` : ""}
    ${openProjects.length > 0 ? `
    <p style="margin:0 0 12px;font-size:12px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Açıq Layihələr</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">${projectRows}</table>
    ` : ""}
    ${ctaButton("https://archilink.az/memarlar", "Memarlara bax")}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `ArchiLink — Həftəlik Xülasə`,
    html: emailWrapper(body),
  });
}

export async function sendWeeklyDigestToProfessional(
  to: string,
  professionalName: string,
  newProjects: DigestProject[],
  profileViews: number,
) {
  if (!RESEND_API_KEY) return;
  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  const projectRows = newProjects.slice(0, 5).map((p) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td valign="middle">
              <p style="margin:0 0 2px;font-size:13px;font-weight:bold;color:#111;font-family:Arial,sans-serif;">${p.title}</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">${p.category}${p.city ? ` · ${p.city}` : ""}</p>
            </td>
            <td valign="middle" align="right">
              <a href="https://archilink.az/bazar/${p.id}" style="font-size:12px;color:#6ee7a0;font-family:Arial,sans-serif;">Müraciət et →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const body = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#111111;text-align:center;font-family:Arial,sans-serif;">Həftəlik Hesabat</p>
    <p style="margin:0 0 32px;font-size:15px;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">
      Salam <strong style="color:#111;">${professionalName}</strong>, bu həftə profilinizə ${profileViews} baxış oldu!
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="border-radius:12px;margin-bottom:28px;">
      <tr>
        <td align="center" style="padding:20px;">
          <p style="margin:0 0 4px;font-size:32px;font-weight:bold;color:#6ee7a0;font-family:Arial,sans-serif;">${profileViews}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">Bu həftəki profil baxışı</p>
        </td>
      </tr>
    </table>
    ${newProjects.length > 0 ? `
    <p style="margin:0 0 12px;font-size:12px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Sizin üçün Yeni Layihələr</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">${projectRows}</table>
    ` : ""}
    ${ctaButton("https://archilink.az/bazar", "Bazar bölməsinə keç")}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `ArchiLink — Həftəlik Hesabat`,
    html: emailWrapper(body),
  });
}
