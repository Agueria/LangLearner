// Deck, kullanicinin calistigi kelime koleksiyonudur.
// cardCount UI'da hizli gosterim icin tutulur; kart ekleme/silmede deckSlice
// bunu otomatik gunceller.
export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  cardCount: number;
}

// Card, bir kelime ve anlamini temsil eder.
// deckId sayesinde tek card array'i icinden secili destenin kartlari filtrelenir.
export interface Card {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  createdAt: string;
}

// User, Firebase Auth'tan gelen public kimlik bilgisidir.
// Tokenlar bu interface'e konmaz; AuthSession icindeki tokens alaninda kalir.
export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export type AuthTokens = {
  // expiresAt absolute timestamp olarak saklanir; refresh gerekip gerekmedigi
  // Date.now() ile hizli kontrol edilir.
  expiresAt: number;
  idToken: string;
  refreshToken: string;
};

export type AuthSession = {
  tokens: AuthTokens;
  user: User;
};
