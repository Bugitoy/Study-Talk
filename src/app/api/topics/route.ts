import { NextResponse } from "next/server";
import { getTopics } from "@/lib/db-utils";

export async function GET() {
  try {
    const topics = await getTopics();
    return NextResponse.json(
      topics.map(({ title, description, backgroundImage }) => ({
        title,
        description,
        backgroundImage,
      })),
    );
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 },
    );
  }
}