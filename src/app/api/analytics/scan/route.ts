import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  restaurantId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const payload = schema.safeParse(await request.json().catch(() => ({})));
  const userAgent = request.headers.get("user-agent");
  await db.scanEvent.create({
    data: {
      userAgent,
      restaurantId: payload.success ? payload.data.restaurantId : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}
