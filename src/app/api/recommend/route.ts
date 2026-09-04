import { NextResponse } from "next/server";
import { z } from "zod";
import { getRecommender } from "@/lib/recommender";

const BodySchema = z.object({
  prompt: z.string().max(2000),
  useHistory: z.boolean(),
  previousTurns: z
    .array(
      z.object({
        prompt: z.string().max(2000),
        bookIds: z.array(z.string().min(1)).max(12),
      }),
    )
    .max(20)
    .default([]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await getRecommender().recommend({
    prompt: parsed.data.prompt,
    useHistory: parsed.data.useHistory,
    previousTurns: parsed.data.previousTurns,
  });

  return NextResponse.json(result);
}
