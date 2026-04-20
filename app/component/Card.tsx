"use client";

import { useState } from "react";
import styles from "./style.module.css";

export type CardType = {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
};

type Props = {
  card: CardType;
  onAnswered?: (isCorrect: boolean) => void;
};

export default function Card({ card, onAnswered }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = async (answer: string) => {
    if (submitted) return;

    setSelected(answer);
    const isCorrect = answer === card.correctAnswer;
    setSubmitted(true);

    // Save result to database
    try {
      await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          isCorrect,
          userAnswer: answer,
        }),
      });
    } catch (error) {
      console.error("Failed to save result:", error);
    }

    if (onAnswered) {
      onAnswered(isCorrect);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.question}>{card.question}</h2>

      <div className={styles.answersContainer}>
        {card.answers.map((ans) => {
          let className = styles.answerButton;

          if (submitted) {
            if (ans === card.correctAnswer) {
              className += ` ${styles.correct}`;
            } else if (ans === selected && selected !== card.correctAnswer) {
              className += ` ${styles.wrong}`;
            }
          }

          return (
            <button
              key={ans}
              onClick={() => handleSelect(ans)}
              className={className}
              disabled={submitted}
            >
              {ans}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={selected === card.correctAnswer ? styles.feedbackCorrect : styles.feedbackWrong}>
          {selected === card.correctAnswer
            ? "✓ Correct!"
            : `✗ Wrong. The correct answer is: ${card.correctAnswer}`}
        </div>
      )}
    </div>
  );
}