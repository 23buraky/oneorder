// Shared HTML shell for all transactional emails. Kept as a single inline-styled
// table-based layout for maximum compatibility across email clients (Outlook,
// Gmail app, etc. still choke on modern CSS/flexbox in emails).
export function renderEmailLayout(opts: {
  previewText: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const { previewText, heading, bodyHtml, ctaLabel, ctaUrl } = opts;

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
      <tr>
        <td align="center" style="padding: 32px 0 8px 0;">
          <a href="${ctaUrl}" target="_blank"
             style="background-color:#D4AF37;color:#0B0B0C;text-decoration:none;
                    font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;
                    padding:14px 32px;border-radius:6px;display:inline-block;letter-spacing:0.3px;">
            ${ctaLabel}
          </a>
        </td>
      </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ONE ORDER</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F5;">
  <span style="display:none;font-size:1px;color:#F4F4F5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${previewText}
  </span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td align="center" style="background-color:#0B0B0C;padding:28px 24px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:2px;">
                ONE ORDER
              </span>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#D4AF37;letter-spacing:1.5px;margin-top:4px;text-transform:uppercase;">
                One kitchen. Endless choices.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0 0 16px 0;font-size:20px;color:#0B0B0C;">${heading}</h1>
              <div style="font-size:14px;line-height:22px;color:#3F3F46;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="padding:32px 32px 28px 32px;">
              <hr style="border:none;border-top:1px solid #E4E4E7;margin:0 0 20px 0;" />
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#A1A1AA;margin:0;line-height:18px;">
                ONE ORDER · Antwerpen, België<br />
                Je ontvangt deze e-mail omdat dit adres gekoppeld is aan een ONE ORDER account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
