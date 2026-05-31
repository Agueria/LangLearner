export type DeckFormErrors = {
  title?: string;
};

export type CardFormErrors = {
  word?: string;
  meaning?: string;
};

// Validation mesajlari parametre olarak alinir. Bu sayede validation fonksiyonlari
// i18n bagimliligi olmadan test edilebilir, ekran ise secili dile uygun mesaj
// enjekte eder.
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

  // Baslik bos olamaz ve UI maxLength olsa bile reducer/test seviyesinde de
  // 50 karakter siniri korunur.
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

  // Kart icin hem kelime hem anlam zorunlu. Bosluklardan olusan inputlar da
  // trimlendigi icin gecersiz sayilir.
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
