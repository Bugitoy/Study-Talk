import { NextResponse } from "next/server";
import { updateQuizRoomQuestions } from "@/lib/db-utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { questions } = body;
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid questions" }, { status: 400 });
    }
    await updateQuizRoomQuestions(id, questions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating quiz room questions:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}