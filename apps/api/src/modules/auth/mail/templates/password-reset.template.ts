import { renderEmailLayout } from "./layout.template";

export function renderPasswordResetTemplate(opts: { firstName: string; resetUrl: string }): string {
  return renderEmailLayout({
    previewText: "Stel een nieuw wachtwoord in voor je ONE ORDER account.",
    heading: `Wachtwoord resetten, ${opts.firstName}`,
    bodyHtml: `
      <p style="margin:0 0 12px 0;">
        We ontvingen een verzoek om je wachtwoord opnieuw in te stellen. Deze link is
        1 uur geldig.
      </p>
      <p style="margin:0;">
        Heb je dit niet aangevraagd? Negeer deze e-mail dan — je wachtwoord blijft ongewijzigd.
      </p>
    `,
    ctaLabel: "Nieuw wachtwoord instellen",
    ctaUrl: opts.resetUrl,
  });
}
