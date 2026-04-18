import { Resend } from "resend";

type ConfirmationEmailArgs = {
  to: string;
  name: string;
  confirmUrl: string;
  unsubscribeUrl: string;
};

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

function getFrom(): string {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set");
  return from;
}

export async function sendConfirmationEmail({
  to,
  name,
  confirmUrl,
  unsubscribeUrl,
}: ConfirmationEmailArgs) {
  const resend = getResend();

  const subject = "Bevestig je aanmelding voor de garageverkoop Sambeek";
  const html = buildConfirmationHtml({
    name,
    confirmUrl,
    unsubscribeUrl,
  });

  const text = [
    `Hoi ${name},`,
    ``,
    `Bedankt voor je aanmelding voor de garageverkoop in Sambeek!`,
    ``,
    `Bevestig je aanmelding via deze link zodat jouw huis op de kaart komt:`,
    confirmUrl,
    ``,
    `Wil je je afmelden? Dat kan altijd via:`,
    unsubscribeUrl,
    ``,
    `Garageverkoop Sambeek`,
  ].join("\n");

  await resend.emails.send({
    from: getFrom(),
    to,
    subject,
    html,
    text,
  });
}

function buildConfirmationHtml({
  name,
  confirmUrl,
  unsubscribeUrl,
}: {
  name: string;
  confirmUrl: string;
  unsubscribeUrl: string;
}): string {
  const safeName = escapeHtml(name);
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Bevestig je aanmelding</title>
  </head>
  <body style="margin:0;padding:0;background:#fdfbf3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#12213a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf3;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 2px 10px rgba(11,45,92,0.08);overflow:hidden;">
            <tr>
              <td style="background:#123e7a;padding:24px 28px;color:#ffffff;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:20px;font-weight:700;">
                      Garageverkoop <span style="color:#ffd558;">Sambeek</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:4px;background:#f9c22e;"></td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <h1 style="margin:0 0 12px 0;font-size:22px;color:#123e7a;">Hoi ${safeName},</h1>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.55;">
                  Bedankt voor je aanmelding voor de garageverkoop in Sambeek! Nog één klik en je huis staat op de kaart.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 28px 24px 28px;">
                <a href="${confirmUrl}"
                   style="display:inline-block;background:#123e7a;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 26px;border-radius:999px;font-size:16px;box-shadow:0 2px 6px rgba(18,62,122,0.25);">
                  Bevestig mijn aanmelding
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px 28px;">
                <p style="margin:0 0 8px 0;font-size:13px;color:#4a5565;">
                  Werkt de knop niet? Kopieer deze link in je browser:
                </p>
                <p style="margin:0;font-size:13px;word-break:break-all;">
                  <a href="${confirmUrl}" style="color:#123e7a;">${confirmUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px 28px;">
                <div style="border-top:1px solid #eef2f8;padding-top:18px;font-size:13px;color:#4a5565;line-height:1.5;">
                  Van gedachten veranderd? Afmelden kan altijd via
                  <a href="${unsubscribeUrl}" style="color:#123e7a;">deze link</a>.
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f7f4ea;padding:16px 28px;font-size:12px;color:#6b7280;text-align:center;">
                Garageverkoop Sambeek · Je ontvangt deze mail omdat je je huis hebt aangemeld.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
