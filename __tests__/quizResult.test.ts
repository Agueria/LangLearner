import {
  calculateQuizPercentage,
  parseResultCount,
} from '../src/utils/quizResult';

describe('quiz result utils', () => {
  it('parses numeric route params', () => {
    expect(parseResultCount('7')).toBe(7);
  });

  it('falls back to zero for invalid route params', () => {
    expect(parseResultCount('abc')).toBe(0);
    expect(parseResultCount(['1'])).toBe(0);
    expect(parseResultCount(undefined)).toBe(0);
  });

  it('calculates rounded quiz percentage', () => {
    expect(calculateQuizPercentage(2, 3)).toBe(67);
  });

  it('returns zero percentage for empty quizzes', () => {
    expect(calculateQuizPercentage(0, 0)).toBe(0);
  });
});
