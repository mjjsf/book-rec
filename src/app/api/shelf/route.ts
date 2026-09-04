import { NextResponse } from "next/server";
import { z } from "zod";
import { getBook } from "@/lib/catalog";
import type { Shelf } from "@/lib/types";

/**
 * A process-local shelf store. A prototype does not need a database, but the
 * mutation still goes through a real endpoint so the client is not the only
 * place the state lives.
 */
const shelves = new Map<string, Shelf>();

const BodySchema = z.object({
  bookId: z.string().min(1),
  shelf: z.enum(["want-to-read", "currently-reading", "read"]).nullable(),
});

export function GET() {
  return NextResponse.json({ shelves: Object.fromEntries(shelves) });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!getBook(parsed.data.bookId)) {
    return NextResponse.json({ error: "Unknown book." }, { status: 404 });
  }

  if (parsed.data.shelf === null) shelves.delete(parsed.data.bookId);
  else shelves.set(parsed.data.bookId, parsed.data.shelf);

  return NextResponse.json({ shelves: Object.fromEntries(shelves) });
}
