"use client";

import { useState } from "react";

type Props = {
  deckId: string;
  onCardAdded: () => void;
};

export default function FlashcardForm({ deckId, onCardAdded }: Props) {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!question.trim()) {
      setError("Question is required");
      return;
    }

    if (correctIndex === null) {
      setError("Please select the correct answer");
      return;
    }

    if (answers.some((ans) => !ans.trim())) {
      setError("All answers must be filled");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answers,
          correctAnswer: answers[correctIndex],
          deckId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create card");
      }

      // Reset form
      setQuestion("");
      setAnswers(["", "", "", ""]);
      setCorrectIndex(null);
      onCardAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Question</label>
        <input
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
      </div>

      <div style={styles.answersSection}>
        <label style={styles.label}>Answers</label>
        {answers.map((ans, i) => (
          <div key={i} style={styles.answerRow}>
            <input
              placeholder={`Answer ${i + 1}`}
              value={ans}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[i] = e.target.value;
                setAnswers(newAnswers);
              }}
              style={styles.input}
              disabled={loading}
            />
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                disabled={loading}
              />
              Correct
            </label>
          </div>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? "Creating..." : "Create Card"}
      </button>
    </form>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "20px",
    marginTop: "20px",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  answersSection: {
    marginBottom: "16px",
  },
  answerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "12px",
    padding: "8px 12px",
    background: "#fee2e2",
    borderRadius: "6px",
  },
};