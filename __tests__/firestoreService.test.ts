import type { AuthSession, Card, Deck } from '../src/constants/types';
import {
  deleteCloudCard,
  fetchCloudVocabulary,
  upsertCloudDeck,
} from '../src/services/firestoreService';

jest.mock('../src/constants/config', () => ({
  FIREBASE_PROJECT_ID: 'project-1',
}));

const mockedFetch = jest.fn();

const session: AuthSession = {
  tokens: {
    expiresAt: 4102444800000,
    idToken: 'id-token',
    refreshToken: 'refresh-token',
  },
  user: {
    email: 'student@example.com',
    id: 'user-1',
  },
};

const deck: Deck = {
  cardCount: 99,
  coverImage: undefined,
  createdAt: '2026-05-31T10:00:00.000Z',
  description: 'Travel words',
  id: 'deck 1',
  title: 'Travel',
};

const card: Card = {
  createdAt: '2026-05-31T11:00:00.000Z',
  deckId: 'deck 1',
  id: 'card 1',
  meaning: 'ev',
  word: 'house',
};

const jsonResponse = (body: unknown, status = 200) => ({
  json: async () => body,
  ok: status >= 200 && status < 300,
  status,
});

describe('firestore service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  it('upserts a deck with auth headers and Firestore typed fields', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({ name: 'deck-doc' }));

    await upsertCloudDeck(session, deck);

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://firestore.googleapis.com/v1/projects/project-1/databases/(default)/documents/users/user-1/decks/deck%201',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer id-token',
          'Content-Type': 'application/json',
        }),
      })
    );

    const requestBody = JSON.parse(mockedFetch.mock.calls[0][1].body as string);
    expect(requestBody).toEqual({
      fields: {
        cardCount: { integerValue: '99' },
        coverImage: { stringValue: '' },
        createdAt: { stringValue: deck.createdAt },
        description: { stringValue: 'Travel words' },
        title: { stringValue: 'Travel' },
      },
    });
  });

  it('fetches decks and cards, then recalculates deck card counts from cards', async () => {
    mockedFetch
      .mockResolvedValueOnce(
        jsonResponse({
          documents: [
            {
              fields: {
                cardCount: { integerValue: '99' },
                coverImage: { stringValue: '' },
                createdAt: { stringValue: deck.createdAt },
                description: { stringValue: deck.description },
                title: { stringValue: deck.title },
              },
              name: 'projects/project-1/databases/(default)/documents/users/user-1/decks/deck%201',
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          documents: [
            {
              fields: {
                createdAt: { stringValue: card.createdAt },
                deckId: { stringValue: card.deckId },
                meaning: { stringValue: card.meaning },
                word: { stringValue: card.word },
              },
              name: 'projects/project-1/databases/(default)/documents/users/user-1/decks/deck%201/cards/card%201',
            },
          ],
        })
      );

    await expect(fetchCloudVocabulary(session)).resolves.toEqual({
      cards: [{ ...card, id: 'card 1' }],
      decks: [{ ...deck, cardCount: 1, coverImage: undefined, id: 'deck 1' }],
    });
  });

  it('returns an empty vocabulary when the user has no cloud documents yet', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({}, 404));

    await expect(fetchCloudVocabulary(session)).resolves.toEqual({
      cards: [],
      decks: [],
    });
  });

  it('deletes a card using the encoded deck and card document path', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({}));

    await deleteCloudCard(session, 'deck 1', 'card 1');

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://firestore.googleapis.com/v1/projects/project-1/databases/(default)/documents/users/user-1/decks/deck%201/cards/card%201',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws a user-facing sync error when Firestore rejects a request', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({ error: 'denied' }, 403));

    await expect(upsertCloudDeck(session, deck)).rejects.toThrow(
      'Cloud sync failed. Please try again.'
    );
  });
});
