"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mailer_1 = require("../src/utils/mailer");
async function main() {
    const to = process.argv[2] || "";
    if (!to) {
        console.error("Usage: ts-node scripts/send-test-email.ts <recipient>");
        process.exit(1);
    }
    await (0, mailer_1.sendMail)({
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
//# sourceMappingURL=send-test-email.js.map