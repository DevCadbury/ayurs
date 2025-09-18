import "dotenv/config";
import { sendMail } from "../src/utils/mailer";

async function main() {
  const to = process.argv[2] || "";
  if (!to) {
    console.error("Usage: ts-node scripts/send-test-email.ts <recipient>");
    process.exit(1);
  }
  await sendMail({
    to,
    subject: "AyurSutra SMTP test",
    text: "This is a test email from AyurSutra backend SMTP configuration.",
    html: "<p>This is a <b>test email</b> from AyurSutra backend SMTP configuration.</p>",
  });
  console.log("Test email queued to:", to);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
