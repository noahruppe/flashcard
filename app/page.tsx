"use client";

import { useEffect, useState } from "react";
import Card, { CardType } from "./component/Card";
import FlashcardForm from "./component/FlashcardForm";

type Deck = {
  id: string;
  name: string;
  cards: CardType[];
};

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/decks");
      if (!response.ok) throw new Error("Failed to fetch decks");
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error("Error fetching decks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async () => {
    if (!newDeckName.trim()) return;

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeckName }),
      });

      if (!response.ok) throw new Error("Failed to create deck");
      const newDeck = await response.json();
      setDecks([...decks, newDeck]);
      setNewDeckName("");
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  const selectDeck = async (deck: Deck) => {
    try {
      const response = await fetch(`/api/decks/${deck.id}`);
      if (!response.ok) throw new Error("Failed to fetch deck");
      const deckData = await response.json();
      
      // Parse answers from JSON strings
      const cardsWithParsedAnswers = deckData.cards.map((card: any) => ({
        ...card,
        answers: typeof card.answers === 'string' ? JSON.parse(card.answers) : card.answers,
      }));
      
      setSelectedDeck({
        ...deckData,
        cards: cardsWithParsedAnswers,
      });
      setScore({ correct: 0, total: 0 });
      setCurrentCardIndex(0);
    } catch (error) {
      console.error("Error selecting deck:", error);
    }
  };

  const handleCardAnswered = (isCorrect: boolean) => {
    setScore({
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    });

    // Move to next card after a delay
    setTimeout(() => {
      if (selectedDeck && currentCardIndex < selectedDeck.cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      }
    }, 2000);
  };

  const handleCardAdded = async () => {
    if (selectedDeck) {
      await selectDeck(selectedDeck); // Refresh the deck
    }
    setShowForm(false);
  };

  if (loading) {
    return <div style={styles.container}>Loading decks...</div>;
  }

  if (selectedDeck) {
    if (selectedDeck.cards.length === 0) {
      return (
        <div style={styles.container}>
          <button
            style={styles.backButton}
            onClick={() => setSelectedDeck(null)}
          >
            ← Back to Decks
          </button>
          <h1 style={styles.title}>{selectedDeck.name}</h1>
          <p>No cards in this deck yet.</p>
          <button
            style={styles.primaryButton}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add Card"}
          </button>
          {showForm && (
            <FlashcardForm
              deckId={selectedDeck.id}
              onCardAdded={handleCardAdded}
            />
          )}
        </div>
      );
    }

    const currentCard = selectedDeck.cards[currentCardIndex];

    return (
      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => setSelectedDeck(null)}
        >
          ← Back to Decks
        </button>
        <h1 style={styles.title}>{selectedDeck.name}</h1>
        <div style={styles.scoreBoard}>
          <span>
            Score: {score.correct}/{score.total}
          </span>
          <span>
            Card {currentCardIndex + 1}/{selectedDeck.cards.length}
          </span>
        </div>

        {currentCard && (
          <Card
            key={currentCard.id}
            card={currentCard}
            onAnswered={handleCardAnswered}
          />
        )}

        <button
          style={styles.addCardButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Card"}
        </button>

        {showForm && (
          <FlashcardForm
            deckId={selectedDeck.id}
            onCardAdded={handleCardAdded}
          />
        )}

        {currentCardIndex === selectedDeck.cards.length - 1 &&
          score.total > 0 && (
            <div style={styles.completionMessage}>
              <p>Quiz Complete!</p>
              <p>
                You got {score.correct} out of {score.total} correct (
                {Math.round((score.correct / score.total) * 100)}%)
              </p>
            </div>
          )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Flashcard App</h1>

      <div style={styles.newDeckSection}>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="New deck name..."
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") createDeck();
            }}
          />
          <button style={styles.primaryButton} onClick={createDeck}>
            Create Deck
          </button>
        </div>
      </div>

      <div style={styles.decksGrid}>
        {decks.length === 0 ? (
          <p>No decks yet. Create one to get started!</p>
        ) : (
          decks.map((deck) => (
            <div
              key={deck.id}
              style={styles.deckCard}
              onClick={() => selectDeck(deck)}
            >
              <h3 style={styles.deckName}>{deck.name}</h3>
              <p style={styles.cardCount}>{deck.cards.length} cards</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "#1f2937",
  },
  backButton: {
    padding: "8px 16px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "16px",
  },
  newDeckSection: {
    marginBottom: "24px",
  },
  inputGroup: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
  },
  primaryButton: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  addCardButton: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  decksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "16px",
  },
  deckCard: {
    background: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  deckName: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#1f2937",
  },
  cardCount: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  scoreBoard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "#f0f9ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "600",
  },
  completionMessage: {
    marginTop: "24px",
    padding: "16px",
    background: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: "6px",
    textAlign: "center",
    color: "#065f46",
  },
};