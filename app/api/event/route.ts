import { NextResponse } from "next/server";
import { EVENT_NAMES } from "@/lib/events";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { event?: string; at?: string };
    if (body.event && (EVENT_NAMES as readonly string[]).includes(body.event)) {
      // Ölçüm yalnızca tıklama olayıdır; tamamlanmış görüşme veya müşteri sayısı değildir.
      console.info(JSON.stringify({ type: "cta_click", event: body.event, at: body.at ?? null }));
    }
  } catch {
    /* geçersiz gövde yoksayılır */
  }
  return new NextResponse(null, { status: 204 });
}
