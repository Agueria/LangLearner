import type { AuthSession, Card, Deck } from '../src/constants/types';
import {
  deleteCloudCard,
  fetchCloudVocabulary,
  upsertCloudDeck,
} from '../src/services/firestoreService';

jest.mock('../src/constants/config', () => ({
  // Firestore REST base URL project id ile kurulur. Testte gercek project id
  // kullanmadan endpoint path'inin dogru uretilmesini kontrol ediyoruz.
  FIREBASE_PROJECT_ID: 'project-1',
}));

const mockedFetch = jest.fn();

const session: AuthSession = {
  // Bu session, Firebase Auth'tan gelen idToken'in Firestore security rules'ta
  // request.auth.uid uretmek icin kullanildigi client durumunu temsil eder.
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
  // cardCount bilerek 99. fetchCloudVocabulary testinde Firestore'dan gelen
  // stale sayi yerine kart listesinden 1 hesaplanmasini bekliyoruz.
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
  // Minimal fetch Response mock'u. Servis sadece ok/status/json alanlarini
  // kullandigi icin testlerde bu sade obje yeterli.
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
    // Firestore REST API normal JSON yerine typed wrapper ister. Bu assertion,
    // stringValue/integerValue formatinin bozulmasini engeller.
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
    // Ilk response deck collection, ikinci response o deck'in cards
    // subcollection'idir. Servis Promise.all ile her deck icin kartlari okur.
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
              // REST API document name'i encode edilmis path segmentleriyle gelir.
              // Servis hydrate ederken bunlari "deck 1" / "card 1" haline decode etmeli.
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
    // Yeni kullanicinin Firestore'da henuz users/{uid}/decks path'i olmayabilir.
    // 404 burada hata degil, bos vocabulary anlamina gelir.
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
      // Bosluklu id'ler URL segmentinde encode edilmelidir; aksi halde REST
      // path yanlis bolunur ve yanlis dokumana istek gidebilir.
      'https://firestore.googleapis.com/v1/projects/project-1/databases/(default)/documents/users/user-1/decks/deck%201/cards/card%201',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws a user-facing sync error when Firestore rejects a request', async () => {
    // Firestore'dan gelen teknik hata metnini UI'a tasimiyoruz. Cloud sync
    // ekrani tek, anlasilir bir mesaj gostersin diye servis generic hata atar.
    mockedFetch.mockResolvedValue(jsonResponse({ error: 'denied' }, 403));

    await expect(upsertCloudDeck(session, deck)).rejects.toThrow(
      'Cloud sync failed. Please try again.'
    );
  });
});
