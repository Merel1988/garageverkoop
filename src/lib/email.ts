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

  const subject = "Bevestig je aanmelding voor de garageverkoop";
  const html = `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; color: #222; max-width: 560px;">
      <h2 style="color: #8a4b0c;">Hoi ${escapeHtml(name)},</h2>
      <p>Bedankt voor je aanmelding voor de garageverkoop in Sambeek!</p>
      <p>Bevestig hieronder je aanmelding, dan komt jouw huis op de kaart te staan:</p>
      <p>
        <a href="${confirmUrl}"
           style="display:inline-block;background:#8a4b0c;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Bevestig mijn aanmelding
        </a>
      </p>
      <p style="color:#555;font-size:14px;">
        Werkt de knop niet? Kopieer deze link in je browser:<br>
        <a href="${confirmUrl}">${confirmUrl}</a>
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#555;font-size:14px;">
        Wil je je toch afmelden? Dat kan op elk moment via deze link:<br>
        <a href="${unsubscribeUrl}">${unsubscribeUrl}</a>
      </p>
      <p style="color:#999;font-size:12px;">Garageverkoop Sambeek</p>
    </div>
  `;

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
