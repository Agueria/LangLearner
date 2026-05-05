import { validateCardForm, validateDeckForm } from '../src/utils/validation';

const messages = {
  meaningRequired: 'Meaning is required.',
  titleRequired: 'Title is required.',
  titleTooLong: 'Title must be 50 characters or fewer.',
  wordRequired: 'Word is required.',
  wordTooLong: 'Word must be 100 characters or fewer.',
};

describe('validation utils', () => {
  it('requires a deck title', () => {
    expect(validateDeckForm('   ', messages)).toEqual({
      title: messages.titleRequired,
    });
  });

  it('rejects long deck titles', () => {
    expect(validateDeckForm('a'.repeat(51), messages)).toEqual({
      title: messages.titleTooLong,
    });
  });

  it('accepts a valid deck title', () => {
    expect(validateDeckForm('Travel', messages)).toEqual({});
  });

  it('requires card word and meaning', () => {
    expect(validateCardForm('', '', messages)).toEqual({
      meaning: messages.meaningRequired,
      word: messages.wordRequired,
    });
  });

  it('rejects long card words', () => {
    expect(validateCardForm('a'.repeat(101), 'meaning', messages)).toEqual({
      word: messages.wordTooLong,
    });
  });

  it('accepts a valid card', () => {
    expect(validateCardForm('hello', 'merhaba', messages)).toEqual({});
  });
});
