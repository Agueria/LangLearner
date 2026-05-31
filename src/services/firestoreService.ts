import { FIREBASE_PROJECT_ID } from '../constants/config';
import type { AuthSession, Card, Deck } from '../constants/types';

// Firestore REST API tipi SDK'daki object yapisindan farklidir:
// her alan stringValue/integerValue gibi typed wrapper icinde gonderilir.
// Bu dosya app modelimiz ile Firestore document modeli arasindaki ceviriyi yapar.
type FirestoreValue = {
  integerValue?: string;
  stringValue?: string;
};

type FirestoreDocument = {
  fields?: Record<string, FirestoreValue>;
  name: string;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

export type CloudVocabulary = {
  cards: Card[];
  decks: Deck[];
};

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

const encodeSegment = (segment: string) => encodeURIComponent(segment);

const authHeaders = (session: AuthSession) => ({
  // Firestore security rules request.auth.uid bilgisini bu idToken ile bilir.
  // Bu token olmadan kullaniciya ozel users/{uid} path'leri yazilamaz.
  Authorization: `Bearer ${session.tokens.idToken}`,
  'Content-Type': 'application/json',
});

const userDecksPath = (userId: string) =>
  // Veri modeli: users/{userId}/decks/{deckId}/cards/{cardId}
  // Her kullanicinin desteleri kendi user document path'i altinda izole edilir.
  `${FIRESTORE_BASE_URL}/users/${encodeSegment(userId)}/decks`;

const deckPath = (userId: string, deckId: string) =>
  `${userDecksPath(userId)}/${encodeSegment(deckId)}`;

const cardsPath = (userId: string, deckId: string) =>
  `${deckPath(userId, deckId)}/cards`;

const cardPath = (userId: string, deckId: string, cardId: string) =>
  `${cardsPath(userId, deckId)}/${encodeSegment(cardId)}`;

const stringField = (value = ''): FirestoreValue => ({ stringValue: value });

const integerField = (value: number): FirestoreValue => ({
  integerValue: String(value),
});

const extractId = (documentName: string) => {
  const [id = ''] = documentName.split('/').slice(-1);
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

const getString = (
  fields: Record<string, FirestoreValue> | undefined,
  key: string
) => fields?.[key]?.stringValue ?? '';

const getInteger = (
  fields: Record<string, FirestoreValue> | undefined,
  key: string
) => Number(fields?.[key]?.integerValue ?? 0);

const deckToDocument = (deck: Deck) => ({
  // App'teki Deck modelini Firestore REST formatina cevirir.
  // undefined coverImage Firestore'a bos string olarak gider.
  fields: {
    cardCount: integerField(deck.cardCount),
    coverImage: stringField(deck.coverImage),
    createdAt: stringField(deck.createdAt),
    description: stringField(deck.description),
    title: stringField(deck.title),
  },
});

const cardToDocument = (card: Card) => ({
  // Card dokumani deck subcollection altinda saklanir ama deckId alanini da
  // tutuyoruz. Bu local hydrate ve debug anlatimini kolaylastirir.
  fields: {
    createdAt: stringField(card.createdAt),
    deckId: stringField(card.deckId),
    meaning: stringField(card.meaning),
    word: stringField(card.word),
  },
});

const documentToDeck = (document: FirestoreDocument): Deck => {
  // Firestore document name'i tam path olarak gelir. extractId ile en sondaki
  // deck id'sini aliyoruz.
  const { fields } = document;
  const coverImage = getString(fields, 'coverImage');

  return {
    cardCount: getInteger(fields, 'cardCount'),
    coverImage: coverImage || undefined,
    createdAt: getString(fields, 'createdAt'),
    description: getString(fields, 'description'),
    id: extractId(document.name),
    title: getString(fields, 'title'),
  };
};

const documentToCard = (
  document: FirestoreDocument,
  fallbackDeckId: string
): Card => {
  const { fields } = document;

  return {
    createdAt: getString(fields, 'createdAt'),
    deckId: getString(fields, 'deckId') || fallbackDeckId,
    id: extractId(document.name),
    meaning: getString(fields, 'meaning'),
    word: getString(fields, 'word'),
  };
};

const requestFirestore = async (
  session: AuthSession,
  url: string,
  init?: RequestInit
) => {
  // Firestore'a giden butun istekler bu helper'dan geciyor. Ortak auth header,
  // 404 toleransi ve user-friendly hata burada merkezi sekilde uygulanir.
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(session),
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 404) {
    // Liste veya dokuman yoksa bunu fatal hata saymiyoruz. Yeni kullanicinin
    // cloud verisi bos olabilir.
    return null;
  }

  if (!response.ok) {
    throw new Error('Cloud sync failed. Please try again.');
  }

  return response;
};

export const upsertCloudDeck = async (session: AuthSession, deck: Deck) => {
  // PATCH, dokuman varsa gunceller yoksa olusturur. Bu nedenle create/update
  // icin tek fonksiyon yeterlidir.
  await requestFirestore(session, deckPath(session.user.id, deck.id), {
    body: JSON.stringify(deckToDocument(deck)),
    method: 'PATCH',
  });
};

export const deleteCloudDeck = async (session: AuthSession, deckId: string) => {
  await requestFirestore(session, deckPath(session.user.id, deckId), {
    method: 'DELETE',
  });
};

export const upsertCloudCard = async (session: AuthSession, card: Card) => {
  await requestFirestore(
    session,
    cardPath(session.user.id, card.deckId, card.id),
    {
      body: JSON.stringify(cardToDocument(card)),
      method: 'PATCH',
    }
  );
};

export const deleteCloudCard = async (
  session: AuthSession,
  deckId: string,
  cardId: string
) => {
  await requestFirestore(session, cardPath(session.user.id, deckId, cardId), {
    method: 'DELETE',
  });
};

export const fetchCloudVocabulary = async (
  session: AuthSession
): Promise<CloudVocabulary> => {
  // Once deck listesi cekilir. Sonra her deck icin kart subcollection'i
  // paralel okunur. Sonucta local Redux'a hydrate edilecek tek vocabulary
  // objesi dondurulur.
  const decksResponse = await requestFirestore(
    session,
    userDecksPath(session.user.id),
    { method: 'GET' }
  );

  if (!decksResponse) {
    return { cards: [], decks: [] };
  }

  const deckData = (await decksResponse.json()) as FirestoreListResponse;
  const decks = deckData.documents?.map(documentToDeck) ?? [];

  const cardsByDeck = await Promise.all(
    decks.map(async (deck) => {
      const cardsResponse = await requestFirestore(
        session,
        cardsPath(session.user.id, deck.id),
        { method: 'GET' }
      );

      if (!cardsResponse) {
        return [];
      }

      const cardData = (await cardsResponse.json()) as FirestoreListResponse;
      return (
        cardData.documents?.map((document) =>
          documentToCard(document, deck.id)
        ) ?? []
      );
    })
  );

  const cards = cardsByDeck.flat();

  return {
    cards,
    // cardCount Firestore'daki deck field'ina guvenmek yerine kartlardan
    // yeniden hesaplanir. Boylece eski veya elle bozulmus cloud sayisi UI'yi
    // yaniltmaz.
    decks: decks.map((deck) => ({
      ...deck,
      cardCount: cards.filter((card) => card.deckId === deck.id).length,
    })),
  };
};
