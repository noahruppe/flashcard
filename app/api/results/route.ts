import { prisma } from "@/prisma/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { cardId, isCorrect, userAnswer } = await request.json();

    if (!cardId || isCorrect === undefined || !userAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.quizResult.create({
      data: {
        cardId,
        isCorrect,
        userAnswer,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz result:", error);
    return NextResponse.json(
      { error: "Failed to save quiz result" },
      { status: 500 }
    );
  }
}
