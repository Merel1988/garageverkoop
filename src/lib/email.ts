import { Resend } from "resend";
import { eventDate, eventTimeRange, formatEventDate } from "./event";

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

  const date = eventDate();
  const time = eventTimeRange();
  const when = [
    date ? formatEventDate(date) : null,
    time ? `van ${time}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const subject = "Bevestig je aanmelding voor de garageverkoop Sambeek";
  const html = buildConfirmationHtml({
    name,
    confirmUrl,
    unsubscribeUrl,
    when,
  });

  const text = [
    `Hoi ${name},`,
    ``,
    `Bedankt voor je aanmelding voor de garageverkoop in Sambeek!`,
    when ? `Wanneer: ${when}.` : null,
    ``,
    `Bevestig je aanmelding zodat je huis op de kaart komt:`,
    confirmUrl,
    ``,
    `Van gedachten veranderd? Je kunt je op elk moment afmelden — ook nadat je bevestigd hebt. Bewaar deze link goed:`,
    unsubscribeUrl,
    ``,
    `Garageverkoop Sambeek`,
  ]
    .filter((line) => line !== null)
    .join("\n");

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
  when,
}: {
  name: string;
  confirmUrl: string;
  unsubscribeUrl: string;
  when: string;
}): string {
  const safeName = escapeHtml(name);
  const safeWhen = escapeHtml(when);
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Bevestig je aanmelding</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf7ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0b1a36;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7ec;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:#092955;padding:24px 28px;color:#ffffff;">
                <div style="font-size:20px;font-weight:700;">
                  Garageverkoop <span style="color:#ffd558;">Sambeek</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="height:4px;background:#f9c22e;"></td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px 28px;">
                <h1 style="margin:0 0 12px 0;font-size:24px;color:#092955;letter-spacing:-0.01em;">Hoi ${safeName},</h1>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.55;">
                  Bedankt voor je aanmelding voor de garageverkoop in Sambeek! Nog één klik en je huis staat op de kaart.
                </p>
                ${
                  when
                    ? `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.5;color:#0b1a36;"><strong>Wanneer:</strong> ${safeWhen}.</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 28px 24px 28px;">
                <a href="${confirmUrl}"
                   style="display:inline-block;background:#0f3a70;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:16px;">
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
                  <a href="${confirmUrl}" style="color:#0f3a70;">${confirmUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff3c4;border-radius:16px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <div style="font-size:15px;font-weight:700;color:#092955;margin-bottom:6px;">
                        Toch niet meer meedoen?
                      </div>
                      <div style="font-size:14px;line-height:1.55;color:#0b1a36;">
                        Geen probleem. Gebruik op elk moment — ook nadat je bevestigd hebt — deze persoonlijke afmeldlink:
                      </div>
                      <div style="margin-top:12px;">
                        <a href="${unsubscribeUrl}"
                           style="display:inline-block;background:#ffffff;color:#092955;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:999px;font-size:14px;">
                          Afmelden
                        </a>
                      </div>
                      <div style="margin-top:12px;font-size:12px;color:#4a5565;word-break:break-all;">
                        Bewaar deze link goed. Directe URL:<br/>
                        <a href="${unsubscribeUrl}" style="color:#0f3a70;">${unsubscribeUrl}</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#f3efe3;padding:16px 28px;font-size:12px;color:#6b7280;text-align:center;">
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
