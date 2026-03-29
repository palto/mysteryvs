import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS round_results (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      host TEXT,
      completed_at TIMESTAMPTZ NOT NULL,
      participant_times JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

const RoundResultSchema = z.object({
  name: z.string(),
  host: z.string().nullable(),
  completedAt: z.number(),
  participantTimes: z.record(z.string(), z.number()),
});

export async function GET() {
  await ensureTable();

  const rows = await sql`
    SELECT * FROM round_results ORDER BY completed_at DESC LIMIT 100
  `;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const parsed = RoundResultSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const { name, host, completedAt, participantTimes } = parsed.data;

  await ensureTable();

  const [row] = await sql`
    INSERT INTO round_results (name, host, completed_at, participant_times)
    VALUES (
      ${name},
      ${host},
      ${new Date(completedAt).toISOString()},
      ${JSON.stringify(participantTimes)}
    )
    RETURNING *
  `;

  return NextResponse.json(row, { status: 201 });
}
