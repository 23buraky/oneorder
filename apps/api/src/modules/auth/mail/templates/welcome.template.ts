import { renderEmailLayout } from "./layout.template";

export function renderWelcomeTemplate(opts: { firstName: string; appUrl: string }): string {
  return renderEmailLayout({
    previewText: "Je account is geactiveerd — tijd om te bestellen.",
    heading: `Je account is klaar, ${opts.firstName}!`,
    bodyHtml: `
      <p style="margin:0 0 12px 0;">
        Je e-mailadres is bevestigd. Ontdek het menu, verzamel loyaliteitspunten bij elke
        bestelling en bewaar je favoriete gerechten voor volgende keer.
      </p>
    `,
    ctaLabel: "Bekijk het menu",
    ctaUrl: `${opts.appUrl}/menu`,
  });
}
