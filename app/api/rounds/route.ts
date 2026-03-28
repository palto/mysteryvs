import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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

  const rows = await sql`
    SELECT * FROM round_results ORDER BY completed_at DESC
  `;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, host, completedAt, participantTimes } = body as {
    name: string;
    host: string | null;
    completedAt: number;
    participantTimes: Record<string, number>;
  };

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
