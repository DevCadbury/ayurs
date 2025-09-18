import { createApp } from "../src/index";

// Reuse the Express app across invocations
const app = createApp();

export const config = {
  api: {
    bodyParser: false,
  },
};

// Export an Express-compatible handler for Vercel
export default function handler(req: any, res: any) {
  return app(req, res);
}

