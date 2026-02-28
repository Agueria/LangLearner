export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  cardCount: number;
}

export interface Card {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
}
