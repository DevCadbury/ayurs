import nodemailer from "nodemailer";

type MailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  if (!host || !user || !pass) {
    // Dev fallback: log-only transport
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    } as any);
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail({ to, subject, text, html }: MailInput) {
  const from = process.env.EMAIL_FROM || "AyurSutra <no-reply@ayursutra.local>";
  const t = getTransporter();
  try {
    const info = await t.sendMail({ from, to, subject, text, html });
    if ((t as any).options?.streamTransport) {
      console.log("[DEV MAIL]", {
        to,
        subject,
        preview: info.message?.toString?.().slice(0, 500),
      });
    }
  } catch (e) {
    console.warn("Failed to send email:", e);
  }
}

export function buildPreEmail(params: {
  patientName?: string;
  therapyName: string;
  therapistName?: string;
  startTimeISO: string;
  durationMinutes?: number;
}) {
  const {
    patientName,
    therapyName,
    therapistName,
    startTimeISO,
    durationMinutes,
  } = params;
  const when = new Date(startTimeISO).toLocaleString();
  const subject = `Reminder: ${therapyName} on ${when}`;
  const text = `Hello ${
    patientName || "Patient"
  },\n\nThis is a reminder for your upcoming ${therapyName} session.\nWhen: ${when}\nTherapist: ${
    therapistName || "Therapist"
  }\nDuration: ${
    durationMinutes || 60
  } minutes\n\nPreparation:\n• Have a light meal 2 hours before.\n• Avoid caffeine/alcohol.\n• Wear loose clothing and carry a towel.\n• Arrive 15 minutes early for check-in.\n\nSee you soon!\nAyurSutra Clinic`;
  const html = `<p>Hello ${patientName || "Patient"},</p>
  <p>This is a reminder for your upcoming <b>${therapyName}</b> session.</p>
  <ul>
    <li><b>When:</b> ${when}</li>
    <li><b>Therapist:</b> ${therapistName || "Therapist"}</li>
    <li><b>Duration:</b> ${durationMinutes || 60} minutes</li>
  </ul>
  <p><b>Preparation:</b></p>
  <ul>
    <li>Have a light meal 2 hours before.</li>
    <li>Avoid caffeine/alcohol.</li>
    <li>Wear loose clothing and carry a towel.</li>
    <li>Arrive 15 minutes early for check-in.</li>
  </ul>
  <p>See you soon!<br/>AyurSutra Clinic</p>`;
  return { subject, text, html };
}

export function buildPostEmail(params: {
  patientName?: string;
  therapyName: string;
}) {
  const { patientName, therapyName } = params;
  const subject = `Post-care guidance: ${therapyName}`;
  const text = `Hello ${
    patientName || "Patient"
  },\n\nThanks for completing your ${therapyName} session.\nPost-care:\n• Rest 2–3 hours, hydrate with warm water.\n• Avoid cold drinks and heavy/oily/spicy foods for 24 hours.\n• Consider gentle yoga, breathing, or meditation if recommended.\n\nWe value your feedback! Please share your experience to help us improve.\n\nWishing you good health,\nAyurSutra Clinic`;
  const html = `<p>Hello ${patientName || "Patient"},</p>
  <p>Thanks for completing your <b>${therapyName}</b> session.</p>
  <p><b>Post-care:</b></p>
  <ul>
    <li>Rest 2–3 hours, hydrate with warm water.</li>
    <li>Avoid cold drinks and heavy/oily/spicy foods for 24 hours.</li>
    <li>Consider gentle yoga, breathing, or meditation if recommended.</li>
  </ul>
  <p>We value your feedback! Please share your experience to help us improve.</p>
  <p>Wishing you good health,<br/>AyurSutra Clinic</p>`;
  return { subject, text, html };
}

export function buildFeedbackEmail(params: {
  patientName?: string;
  doctorName?: string;
  feedbackLink: string;
}) {
  const { patientName, doctorName, feedbackLink } = params;
  const subject = `We'd love your feedback${
    doctorName ? ` for your session with ${doctorName}` : ""
  }`;
  const text = `Hello ${
    patientName || "Patient"
  },\n\nWe value your experience. Could you please share quick feedback${
    doctorName ? ` about your session with ${doctorName}` : ""
  }?\n\nFeedback link: ${feedbackLink}\n\nThank you,\nAyurSutra Clinic`;
  const html = `<p>Hello ${patientName || "Patient"},</p>
  <p>We value your experience. Could you please share quick feedback$${
    doctorName ? ` about your session with <b>${doctorName}</b>` : ""
  }?</p>
  <p><a href="${feedbackLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 14px;background:#0ea5e9;color:#ffffff;text-decoration:none;border-radius:6px">Give Feedback</a></p>
  <p>If the button doesn't work, copy and paste this link:<br/>
  <a href="${feedbackLink}">${feedbackLink}</a></p>
  <p>Thank you,<br/>AyurSutra Clinic</p>`;
  return { subject, text, html };
}
