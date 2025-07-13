import { NextResponse } from "next/server";
import { createQuizSession } from "@/lib/db-utils";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const sessionId = await createQuizSession(id);
    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Error creating quiz session:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}