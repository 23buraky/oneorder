import { renderEmailLayout } from "./layout.template";

export function renderVerifyEmailTemplate(opts: { firstName: string; verifyUrl: string }): string {
  return renderEmailLayout({
    previewText: "Bevestig je e-mailadres om te starten met bestellen bij ONE ORDER.",
    heading: `Hoi ${opts.firstName}, welkom bij ONE ORDER!`,
    bodyHtml: `
      <p style="margin:0 0 12px 0;">
        Bevestig je e-mailadres om je account te activeren. Deze link is 24 uur geldig.
      </p>
      <p style="margin:0;">
        Heb je geen account aangemaakt? Dan kun je deze e-mail gerust negeren.
      </p>
    `,
    ctaLabel: "E-mailadres bevestigen",
    ctaUrl: opts.verifyUrl,
  });
}
