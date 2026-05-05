export type DeckFormErrors = {
  title?: string;
};

export type CardFormErrors = {
  word?: string;
  meaning?: string;
};

type ValidationMessages = {
  meaningRequired: string;
  titleRequired: string;
  titleTooLong: string;
  wordRequired: string;
  wordTooLong: string;
};

export const validateDeckForm = (
  title: string,
  messages: ValidationMessages
): DeckFormErrors => {
  const errors: DeckFormErrors = {};
  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    errors.title = messages.titleRequired;
  } else if (trimmedTitle.length > 50) {
    errors.title = messages.titleTooLong;
  }

  return errors;
};

export const validateCardForm = (
  word: string,
  meaning: string,
  messages: ValidationMessages
): CardFormErrors => {
  const errors: CardFormErrors = {};
  const trimmedWord = word.trim();
  const trimmedMeaning = meaning.trim();

  if (trimmedWord.length === 0) {
    errors.word = messages.wordRequired;
  } else if (trimmedWord.length > 100) {
    errors.word = messages.wordTooLong;
  }

  if (trimmedMeaning.length === 0) {
    errors.meaning = messages.meaningRequired;
  }

  return errors;
};
