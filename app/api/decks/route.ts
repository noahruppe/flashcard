import { prisma } from "@/prisma/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const decks = await prisma.deck.findMany({
      include: {
        cards: true,
      },
    });
    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return NextResponse.json(
      { error: "Failed to fetch decks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Deck name is required" },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.create({
      data: {
        name,
      },
      include: {
        cards: true,
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error("Error creating deck:", error);
    return NextResponse.json(
      { error: "Failed to create deck" },
      { status: 500 }
    );
  }
}
