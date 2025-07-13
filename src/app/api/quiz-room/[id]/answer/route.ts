import { NextRequest, NextResponse } from "next/server";
import { saveQuizAnswer } from "@/lib/db-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, questionId, answer, sessionId } = await request.json();
    if (!userId || !questionId || answer === undefined || !sessionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const { id } = await params;
    await saveQuizAnswer({
      roomId: id,
      sessionId,
      questionId,
      userId,
      answer,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving quiz answer:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}