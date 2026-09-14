import { useCallback, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, Badge } from '@/components/ui';
import { IconName } from '@/constants/icons';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { useTabReselect } from '@/context/TabRefreshContext';

const TOOLS: { icon: IconName; title: string; description: string }[] = [
  { icon: 'create', title: 'Пост для социальных сетей', description: 'Текст и структура публикации' },
  { icon: 'images', title: 'Instagram Story', description: 'Серия сторис для объекта' },
  { icon: 'image', title: 'Улучшение фото объекта', description: 'Подготовка изображения к публикации' },
  { icon: 'video', title: 'Обложка для видео', description: 'Ключевой кадр для Reels' },
  { icon: 'listings', title: 'PDF-брошюра', description: 'Материалы для презентации объекта' },
  { icon: 'message', title: 'Маркетинговый текст', description: 'Описание и рекламные варианты' },
];

export default function AiStudioScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  useTabReselect('ai-studio', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <AppIcon name="ai" size="xl" color={colors.accent} />
          </View>
          <View style={styles.heroCopy}>
            <Badge label="Скоро" tone="accent" small />
            <Text style={styles.title} numberOfLines={1}>Mizan AI Studio</Text>
            <Text style={styles.subtitle} numberOfLines={3}>
              Инструменты искусственного интеллекта для маркетинга недвижимости
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle} numberOfLines={1}>Будущие инструменты</Text>
        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <View key={tool.title} style={styles.card} accessibilityState={{ disabled: true }}>
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <AppIcon name={tool.icon} size="md" color={colors.accent} />
                </View>
                <Badge label="Скоро" tone="neutral" small />
              </View>
              <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{tool.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2} ellipsizeMode="tail">
                {tool.description}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { paddingHorizontal: t.spacing.screenHorizontal },
  hero: {
    flexDirection: 'row',
    gap: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.borderRadius.xxl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: t.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.accentOverlay.light,
    flexShrink: 0,
  },
  heroCopy: { flex: 1, minWidth: 0, gap: 5 },
  title: { ...t.typography.h3, color: t.colors.text },
  subtitle: { ...t.typography.caption, color: t.colors.textSecondary },
  sectionTitle: {
    ...t.typography.label,
    color: t.colors.textSecondary,
    marginTop: t.spacing.xl,
    marginBottom: t.spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.smd },
  card: {
    width: (t.metrics.screenWidth - t.spacing.screenHorizontal * 2 - t.spacing.smd) / 2,
    minHeight: 156,
    padding: t.spacing.smd,
    borderRadius: t.borderRadius.xl,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    opacity: 0.78,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: t.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceAlt,
  },
  cardTitle: { ...t.typography.captionBold, color: t.colors.text, marginTop: t.spacing.smd },
  cardDescription: { ...t.typography.tiny, color: t.colors.textSecondary, marginTop: 3 },
}));
