export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  minLength?: number;
  maxLength?: number;
  maxPoints?: number;
}

export interface Answer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  pointsEarned?: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';
