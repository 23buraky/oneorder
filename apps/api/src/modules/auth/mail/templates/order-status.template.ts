import { renderEmailLayout } from "./layout.template";

type OrderStatus = "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

const COPY: Record<OrderStatus, { preview: string; heading: string; body: string }> = {
  PENDING: {
    preview: "We hebben je bestelling ontvangen.",
    heading: "Bedankt voor je bestelling!",
    body: "We hebben je bestelling ontvangen en geven ze zo snel mogelijk door aan de keuken.",
  },
  ACCEPTED: {
    preview: "Je bestelling is bevestigd.",
    heading: "Je bestelling is bevestigd",
    body: "De keuken heeft je bestelling geaccepteerd en start binnenkort met de bereiding.",
  },
  PREPARING: {
    preview: "Je bestelling wordt bereid.",
    heading: "Je bestelling wordt bereid",
    body: "Onze keuken is nu bezig met je bestelling.",
  },
  READY: {
    preview: "Je bestelling is klaar.",
    heading: "Je bestelling is klaar",
    body: "Je bestelling is klaar. Bij afhaal kan je ze nu komen ophalen; bij levering vertrekt ze zo naar jou.",
  },
  OUT_FOR_DELIVERY: {
    preview: "Je bestelling is onderweg.",
    heading: "Je bestelling is onderweg",
    body: "Onze bezorger is onderweg met je bestelling.",
  },
  DELIVERED: {
    preview: "Je bestelling is geleverd. Eet smakelijk!",
    heading: "Eet smakelijk!",
    body: "Je bestelling is geleverd. Bedankt om voor ONE ORDER te kiezen — tot de volgende keer!",
  },
  CANCELLED: {
    preview: "Je bestelling is geannuleerd.",
    heading: "Je bestelling is geannuleerd",
    body: "Je bestelling is geannuleerd. Neem contact met ons op als dit onverwacht is.",
  },
};

export function renderOrderStatusTemplate(opts: {
  orderNumber: string;
  status: OrderStatus;
  estimatedMinutes?: number | null;
  appUrl: string;
}): string {
  const copy = COPY[opts.status];
  const etaLine = opts.estimatedMinutes
    ? `<p style="margin:12px 0 0 0;">Geschatte tijd: ongeveer ${opts.estimatedMinutes} minuten.</p>`
    : "";

  return renderEmailLayout({
    previewText: copy.preview,
    heading: copy.heading,
    bodyHtml: `
      <p style="margin:0 0 4px 0;">Bestelling <strong>${opts.orderNumber}</strong></p>
      <p style="margin:0;">${copy.body}</p>
      ${etaLine}
    `,
    ctaLabel: "Bekijk je bestelling",
    ctaUrl: `${opts.appUrl}/checkout/success/${opts.orderNumber}`,
  });
}
