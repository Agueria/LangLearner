// Card UI for a single deck in the list.
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, type Deck } from '../constants';
import { useThemeColors } from '../hooks';

type DeckCardProps = {
  deck: Deck;
  onPress: () => void;
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    elevation: 3,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  coverImage: {
    borderRadius: 12,
    flex: 1,
  },
  description: {
    color: COLORS.subtleText,
    fontSize: 14,
    marginBottom: 6,
  },
  info: {
    flex: 1,
  },
  media: {
    aspectRatio: 1,
    marginRight: 12,
    width: '22%',
  },
  meta: {
    color: COLORS.mutedTextAlt,
    fontSize: 12,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: COLORS.secondarySurface,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
});

export const DeckCard = memo(({ deck, onPress }: DeckCardProps) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const initial = deck.title.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: colors.surface, shadowColor: colors.shadow },
      ]}
      onPress={onPress}
    >
      <View style={styles.media}>
        {deck.coverImage ? (
          <Image
            source={{ uri: deck.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: colors.secondarySurface },
            ]}
          >
            <Text style={[styles.placeholderText, { color: colors.primary }]}>
              {initial || '?'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]}>
          {deck.title}
        </Text>
        {deck.description.length > 0 && (
          <Text style={[styles.description, { color: colors.subtleText }]}>
            {deck.description}
          </Text>
        )}
        <Text style={[styles.meta, { color: colors.mutedTextAlt }]}>
          {t('decks.cards', { count: deck.cardCount })}
        </Text>
      </View>
    </Pressable>
  );
});
