# LangLearner

LangLearner is an Expo + React Native mobile app for building vocabulary decks, adding word cards, translating words with Gemini, and studying with a quiz flow.

## Features

- Create, edit, and delete local vocabulary decks.
- Add, edit, and delete cards inside each deck.
- Persist decks and cards on-device with Redux Persist and AsyncStorage.
- Auto-translate card meanings through the Gemini REST API.
- Add deck cover photos from the device gallery.
- Study cards with a quiz flow, animated card reveal, swipe gestures, scoring, and result summary.
- Show offline status with NetInfo.
- Schedule a local daily study reminder with Expo Notifications.
- Provide haptic feedback for quiz and settings actions.
- Switch the app language between English and Turkish.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- Expo Router
- Redux Toolkit
- redux-persist + AsyncStorage
- react-native-gesture-handler
- react-native-reanimated
- expo-image-picker
- expo-notifications
- expo-haptics
- i18next + react-i18next
- Jest + jest-expo

## Setup

Install dependencies:

```sh
npm ci
```

Create a `.env` file:

```sh
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

Start the app:

```sh
npm start
```

Run on Android or iOS:

```sh
npm run android
npm run ios
```

## Quality Checks

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
```

Current local verification:

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm test -- --runInBand` passes with 17 tests.

## Project Structure

- `app/`: Expo Router routes, tabs, deck detail, quiz, and result screens.
- `src/components/`: reusable modal, card, row, and banner UI.
- `src/hooks/`: Redux-facing hooks, quiz state, image picker, network status, and settings.
- `src/store/`: Redux store and persisted slices.
- `src/services/`: Gemini translation, haptics, and local notification services.
- `src/localization/`: English and Turkish i18n resources.
- `src/utils/`: testable validation and quiz result helpers.
- `__tests__/`: reducer, validation, quiz result, and notification service tests.

## Notes

Firebase, Authentication, cloud offline sync, and EAS Build are intentionally deferred because they require external project/account setup. The app currently focuses on local persistence and Expo Go-compatible features.
