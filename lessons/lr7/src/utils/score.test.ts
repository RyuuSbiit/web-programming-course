import { describe, it, expect } from 'vitest';
import { calculateTotalScore, getCorrectAnswersCount, calculateAccuracy } from './score';

describe('score utils', () => {
  describe('calculateTotalScore', () => {
    it('calculates total score from answers', () => {
      const answers = [
        { questionId: '1', pointsEarned: 5, isCorrect: true, selectedAnswers: [0] },
        { questionId: '2', pointsEarned: 3, isCorrect: true, selectedAnswers: [1] },
      ];
      expect(calculateTotalScore(answers)).toBe(8);
    });

    it('returns 0 for empty array', () => {
      expect(calculateTotalScore([])).toBe(0);
    });

    it('handles answers without pointsEarned', () => {
      const answers = [
        { questionId: '1', isCorrect: false, selectedAnswers: [0] },
      ];
      expect(calculateTotalScore(answers)).toBe(0);
    });

    it('ignores negative points', () => {
      const answers = [
        { questionId: '1', pointsEarned: -2, isCorrect: false, selectedAnswers: [0] },
        { questionId: '2', pointsEarned: 5, isCorrect: true, selectedAnswers: [1] },
      ];
      expect(calculateTotalScore(answers)).toBe(3);
    });
  });

  describe('getCorrectAnswersCount', () => {
    it('counts correct answers', () => {
      const answers = [
        { questionId: '1', isCorrect: true, selectedAnswers: [0] },
        { questionId: '2', isCorrect: false, selectedAnswers: [1] },
        { questionId: '3', isCorrect: true, selectedAnswers: [2] },
      ];
      expect(getCorrectAnswersCount(answers)).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(getCorrectAnswersCount([])).toBe(0);
    });

    it('returns 0 when all answers are wrong', () => {
      const answers = [
        { questionId: '1', isCorrect: false, selectedAnswers: [0] },
        { questionId: '2', isCorrect: false, selectedAnswers: [1] },
      ];
      expect(getCorrectAnswersCount(answers)).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('calculates percentage of correct answers', () => {
      const answers = [
        { questionId: '1', isCorrect: true, selectedAnswers: [0] },
        { questionId: '2', isCorrect: true, selectedAnswers: [1] },
        { questionId: '3', isCorrect: false, selectedAnswers: [2] },
        { questionId: '4', isCorrect: true, selectedAnswers: [3] },
      ];
      expect(calculateAccuracy(answers)).toBe(75);
    });

    it('returns 0 for empty array', () => {
      expect(calculateAccuracy([])).toBe(0);
    });

    it('returns 100 when all correct', () => {
      const answers = [
        { questionId: '1', isCorrect: true, selectedAnswers: [0] },
        { questionId: '2', isCorrect: true, selectedAnswers: [1] },
      ];
      expect(calculateAccuracy(answers)).toBe(100);
    });
  });
});
