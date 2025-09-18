import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { messages = [], system = "" } = body as {
      messages: Array<{ role: string; content: string }>;
      system?: string;
    };

    const model = "models/gemini-2.0-flash";

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> =
      [];
    if (system) {
      contents.push({ role: "user", parts: [{ text: `SYSTEM:\n${system}` }] });
    }
    for (const m of messages) {
      contents.push({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      });
    }

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
        }),
        // 30s timeout
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Gemini API error:", text);
      return NextResponse.json(
        { error: `Gemini error: ${text}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ text });
  } catch (e: unknown) {
    console.error("/api/ai/chat error:", e);
    return NextResponse.json(
      { error: (e as Error)?.message || "Failed to call Gemini" },
      { status: 500 }
    );
  }
}
