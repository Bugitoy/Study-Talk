import { NextRequest, NextResponse } from "next/server";
import { getUserInfoOptimized } from "@/lib/db-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const userInfo = await getUserInfoOptimized(userId);

    if (!userInfo) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const response = NextResponse.json(userInfo);
    response.headers.set('Cache-Control', 'private, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 },
    );
  }
} 