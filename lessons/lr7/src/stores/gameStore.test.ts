import { describe, it, expect, beforeEach } from 'vitest';
import { GameStore } from './gameStore';

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  describe('initialization', () => {
    it('starts with correct default state', () => {
      expect(store.gameStatus).toBe('idle');
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.essayAnswer).toBe('');
      expect(store.questions).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
      expect(store.score).toBe(0);
    });
  });

  describe('setEssayAnswer', () => {
    it('updates essay answer', () => {
      store.setEssayAnswer('My answer');
      expect(store.essayAnswer).toBe('My answer');
    });

    it('can clear essay answer', () => {
      store.setEssayAnswer('Text');
      store.setEssayAnswer('');
      expect(store.essayAnswer).toBe('');
    });
  });

  describe('startGame', () => {
    it('starts game with questions', () => {
      const questions = [
        { id: '1', question: 'Q1', options: ['A', 'B'], difficulty: 'easy' as const },
        { id: '2', question: 'Q2', options: ['C', 'D'], difficulty: 'medium' as const },
      ] as any[];
      
      store.startGame(questions);
      
      expect(store.gameStatus).toBe('playing');
      expect(store.questions.length).toBe(2);
      expect(store.currentQuestionIndex).toBe(0);
    });

    it('resets score and answers', () => {
      store.score = 100;
      store.answeredQuestions = [{ questionId: '1', isCorrect: true, selectedAnswers: [0] }];
      
      store.startGame([]);
      
      expect(store.score).toBe(0);
      expect(store.answeredQuestions).toEqual([]);
    });
  });

  describe('selectAnswer', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: ['A', 'B'], correctAnswer: 0, difficulty: 'easy' as const, maxPoints: 5 },
        { id: '2', type: 'multiple-select', question: 'Q2', options: ['C', 'D'], correctAnswer: 1, difficulty: 'medium' as const, maxPoints: 10 },
      ];
      store.gameStatus = 'playing';
      store.currentQuestionIndex = 0;
    });

    it('adds answer to selection', () => {
      store.selectAnswer(0);
      expect(store.selectedAnswers).toEqual([0]);
    });

    it('removes answer if already selected', () => {
      store.selectedAnswers = [0, 1, 2];
      store.selectAnswer(1);
      expect(store.selectedAnswers).toEqual([0, 2]);
    });

    it('does nothing when not playing', () => {
      store.gameStatus = 'idle';
      store.selectAnswer(0);
      expect(store.selectedAnswers).toEqual([]);
    });
  });

  describe('nextQuestion', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], correctAnswer: 0, difficulty: 'easy' as const, maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', options: [], correctAnswer: -1, difficulty: 'medium' as const, maxPoints: 10 },
      ];
      store.currentQuestionIndex = 0;
      store.gameStatus = 'playing';
    });

    it('increments question index', () => {
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(1);
    });

    it('clears selected answers', () => {
      store.selectedAnswers = [0, 1];
      store.nextQuestion();
      expect(store.selectedAnswers).toEqual([]);
    });

    it('clears essay answer', () => {
      store.essayAnswer = 'Some text';
      store.nextQuestion();
      expect(store.essayAnswer).toBe('');
    });

    it('returns false on last question', () => {
      store.currentQuestionIndex = 1;
      const result = store.nextQuestion();
      expect(result).toBe(false);
    });

    it('returns true when not last question', () => {
      store.currentQuestionIndex = 0;
      const result = store.nextQuestion();
      expect(result).toBe(true);
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], correctAnswer: 0, difficulty: 'easy' as const, maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', options: [], correctAnswer: -1, difficulty: 'medium' as const, maxPoints: 10 },
        { id: '3', type: 'multiple-select', question: 'Q3', options: [], correctAnswer: 2, difficulty: 'hard' as const, maxPoints: 15 },
      ];
    });

    it('currentQuestion returns correct question', () => {
      store.currentQuestionIndex = 1;
      expect(store.currentQuestion?.id).toBe('2');
    });

    it('currentQuestion returns undefined for invalid index', () => {
      store.currentQuestionIndex = 99;
      expect(store.currentQuestion).toBeNull();
    });

    it('isLastQuestion returns true for last question', () => {
      store.currentQuestionIndex = 2;
      expect(store.isLastQuestion).toBe(true);
    });

    it('isLastQuestion returns false for non-last question', () => {
      store.currentQuestionIndex = 0;
      expect(store.isLastQuestion).toBe(false);
    });

    it('progress calculates correctly', () => {
      store.currentQuestionIndex = 0;
      expect(store.progress).toBeCloseTo(33.33, 1);
    });
  });

  describe('finishGame', () => {
    it('sets game status to finished', () => {
      store.gameStatus = 'playing';
      store.finishGame();
      expect(store.gameStatus).toBe('finished');
    });
  });

  describe('resetGame', () => {
    it('resets all state', () => {
      store.gameStatus = 'finished';
      store.questions = [{ id: '1', question: 'Q1', options: [], correctAnswer: 0, difficulty: 'easy' as const }] as any;
      store.currentQuestionIndex = 5;
      store.score = 100;
      store.selectedAnswers = [0, 1];
      store.answeredQuestions = [{ questionId: '1', isCorrect: true, selectedAnswers: [0] }];
      store.essayAnswer = 'test';

      store.resetGame();

      expect(store.gameStatus).toBe('idle');
      expect(store.questions).toEqual([]);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.score).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
      expect(store.essayAnswer).toBe('');
    });
  });
});
