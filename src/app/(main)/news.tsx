import { useCallback, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, RemoteImage } from '@/components/ui';
import { Images } from '@/constants/images';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { useTabReselect } from '@/context/TabRefreshContext';

const FILTERS = ['Все', 'Глобальный рынок', 'Саудовская Аравия', 'Турция', 'Дубай', 'Тренды'];
const STORIES = [
  { title: 'Глобальный рынок: спрос на премиальную недвижимость растёт', area: 'Глобальный рынок', image: Images.properties.residence1 },
  { title: 'Саудовская Аравия: новые районы для долгосрочных инвестиций', area: 'Саудовская Аравия', image: Images.properties.madinah1 },
  { title: 'Турция: устойчивый интерес к объектам у моря', area: 'Турция', image: Images.properties.villa2 },
  { title: 'Дубай: проекты с доходностью и гибкими условиями оплаты', area: 'Дубай', image: Images.properties.penthouse1 },
];

export default function NewsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  useTabReselect('news', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} numberOfLines={1}>Новости</Text>
        <Text style={styles.subtitle} numberOfLines={2}>Рынки, регионы и инвестиционные тренды</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((filter, index) => (
            <View key={filter} style={[styles.filter, index === 0 && styles.filterActive]}>
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]} numberOfLines={1}>{filter}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle} numberOfLines={1}>Главное</Text>
        {STORIES.map((story, index) => (
          <View key={story.title} style={styles.story}>
            <RemoteImage uri={story.image} style={styles.storyImage} />
            <View style={styles.storyBody}>
              <View style={styles.storyMeta}>
                <AppIcon name="news" size="xs" color={colors.accent} />
                <Text style={styles.storyArea} numberOfLines={1}>{story.area}</Text>
              </View>
              <Text style={styles.storyTitle} numberOfLines={2} ellipsizeMode="tail">{story.title}</Text>
              <Text style={styles.storyTime} numberOfLines={1}>Обзор рынка · сегодня</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal },
  title: { ...t.typography.h2, color: t.colors.text },
  subtitle: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 3 },
  filters: { gap: t.spacing.sm, paddingVertical: t.spacing.lg, paddingRight: t.spacing.screenHorizontal },
  filter: {
    height: 38,
    paddingHorizontal: t.spacing.smd,
    justifyContent: 'center',
    borderRadius: t.borderRadius.full,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  filterActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
  filterText: { ...t.typography.tiny, color: t.colors.textSecondary },
  filterTextActive: { color: t.colors.onPrimary },
  sectionTitle: { ...t.typography.label, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
  story: {
    flexDirection: 'row',
    gap: t.spacing.smd,
    padding: t.spacing.smd,
    marginBottom: t.spacing.sm,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  storyImage: { width: 96, height: 96, borderRadius: t.borderRadius.md, flexShrink: 0 },
  storyBody: { flex: 1, minWidth: 0, justifyContent: 'center' },
  storyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storyArea: { flexShrink: 1, ...t.typography.tiny, color: t.colors.accent },
  storyTitle: { ...t.typography.captionBold, color: t.colors.text, marginTop: 5 },
  storyTime: { ...t.typography.tiny, color: t.colors.textMuted, marginTop: 5 },
}));
