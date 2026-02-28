// Deck represents a vocabulary collection the user studies.
export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  cardCount: number;
}

// Card represents a word and its meaning within a deck.
export interface Card {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  createdAt: string;
}

// User captures profile data and identity.
export interface User {
  id: string;
  email: string;
  displayName?: string;
}
