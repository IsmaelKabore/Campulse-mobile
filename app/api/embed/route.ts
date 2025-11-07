// app/api/embed/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";       // ensures Node runtime (works on Vercel)
export const dynamic = "force-dynamic";

type Req = { texts: string[] };

export async function POST(req: Request) {
  try {
    const { texts } = (await req.json()) as Req;
    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "texts[] required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    // OpenAI embeddings: cheap/fast, 1536 dims
    const r = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: texts, // [query, ...postTexts]
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: t || "embed failed" }, { status: 500 });
    }

    const data = await r.json();
    const vectors = (data.data || []).map((d: any) => d.embedding as number[]);
    return NextResponse.json({ vectors });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server error" }, { status: 500 });
  }
}
