/**
 * ============================================
 * REELS
 * ============================================
 *
 * Full-screen vertical video feed.
 *
 * Paging is snapped to an exact page height (screen minus the tab bar),
 * so a swipe always lands on one reel — the behaviour people expect from
 * a reels feed, and the reason this is a FlatList with `pagingEnabled`
 * rather than a scrollable list of video cards.
 *
 * Only the visible reel plays. `onViewableItemsChanged` publishes the
 * active index and every other card pauses itself, so scrolling away
 * stops both the picture and the sound.
 *
 * Mute is feed-level, not per reel: toggling the speaker on one reel
 * keeps that choice as you scroll, which is how the platform feeds
 * behave.
 */

import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, StatusBar, Text, View, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ReelCard } from '@/components/media';
import { Reel, reels } from '@/constants/reelsData';
import { useLanguage } from '@/context/LanguageContext';
import { useTabReselect } from '@/context/TabRefreshContext';
import { makeStyles } from '@/context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.select({ ios: 86, default: 64 }) ?? 64;

export default function ReelsScreen() {
  const styles = useStyles();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [focused, setFocused] = useState(true);
  const listRef = useRef<FlatList<Reel>>(null);

  const pageHeight = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

  useTabReselect('reels', useCallback(() => {
    setActiveIndex(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []));

  // Leaving the tab must stop playback, not just hide it
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index !== null && first?.index !== undefined) {
        setActiveIndex(first.index);
      }
    }
  ).current;

  const renderItem = useCallback(
    ({ item, index }: { item: Reel; index: number }) => (
      <ReelCard
        reel={item}
        isActive={focused && index === activeIndex}
        height={pageHeight}
        topInset={insets.top}
        bottomInset={0}
        muted={muted}
        onToggleMute={() => setMuted((current) => !current)}
      />
    ),
    [activeIndex, focused, pageHeight, insets.top, muted]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        ref={listRef}
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={pageHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: pageHeight,
          offset: pageHeight * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        // Keeps neighbours mounted so the next swipe starts instantly,
        // without decoding the whole feed at once
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews
      />

      {/* Feed title, floating over the video */}
      <View style={[styles.titleBar, { top: insets.top + 14 }]} pointerEvents="none">
        <Text style={styles.titleText} numberOfLines={1}>
          {t('reels')}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  titleBar: {
    position: 'absolute',
    left: t.spacing.screenHorizontal,
  },
  titleText: {
    ...t.typography.h4,
    color: '#FFFFFF',
    // Legible over any frame of the video underneath
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
}));
