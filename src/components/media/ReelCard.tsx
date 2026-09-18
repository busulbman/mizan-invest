import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useEventListener } from 'expo';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer, type VideoPlayer } from 'expo-video';

import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { LocalVideos } from '@/constants/images';
import { Reel } from '@/constants/reelsData';
import { getPartnerById, getPropertyById } from '@/constants/mockData';
import { cityNameKey, countryNameKey } from '@/constants/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  height: number;
  topInset: number;
  bottomInset: number;
  muted: boolean;
  onToggleMute: () => void;
}

const LONG_PRESS_DELAY = 280;

/**
 * PLAYER LIFETIME
 *
 * `useVideoPlayer` releases its native shared object when the component
 * unmounts. Any JavaScript write after that point throws
 * `NativeSharedObjectNotFoundException: Unable to find the native shared
 * object associated with given JavaScript object`, which surfaces as a red
 * Render Error rather than a caught failure.
 *
 * Two things used to reach a released player:
 *   1. an unmount cleanup that wrote `player.playbackRate = 1` — it ran during
 *      the very teardown that disposes the player
 *   2. `longPressTimer` firing `startSpeedPlayback` after the card scrolled
 *      out of the window and unmounted
 *
 * The feed makes both easy to hit: the FlatList uses `removeClippedSubviews`
 * with `windowSize={3}`, so a fast swipe unmounts cards while their timers and
 * effects are still in flight.
 *
 * The rule this component now follows: NOTHING touches the player after
 * unmount, and the player is never written to in a cleanup. `withPlayer` is
 * the single gate — it checks the mounted flag first, so the ordinary case is
 * prevented rather than caught.
 */


export function ReelCard({ reel, isActive, height, topInset, bottomInset, muted, onToggleMute }: ReelCardProps) {
  const { t } = useLanguage();
  const { typography, colors } = useTheme();
  const property = getPropertyById(reel.propertyId);
  const partner = getPartnerById(reel.partnerId);
  const { width } = useWindowDimensions();

  const [pausedByUser, setPausedByUser] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [ended, setEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const wasActive = useRef(false);
  const isMountedRef = useRef(true);

  const player = useVideoPlayer(LocalVideos[reel.videoKey], (instance) => {
    instance.loop = false;
    instance.muted = true;
    instance.timeUpdateEventInterval = 0.25;
  });

  /**
   * The only way this component touches the native player.
   *
   * The mounted check is the actual fix: after unmount the native object is
   * gone and the call is skipped entirely. The try/catch is not the fix — it
   * only covers the narrow window where native teardown completes between the
   * check and the call, which JavaScript cannot observe.
   */
  const withPlayer = useCallback(
    (action: (instance: VideoPlayer) => void) => {
      if (!isMountedRef.current) return;
      try {
        action(player);
      } catch {
        // Player already released by native teardown; nothing left to act on.
      }
    },
    [player]
  );

  /** Reads a value off the player, falling back when it is gone. */
  const readPlayer = useCallback(
    <T,>(read: (instance: VideoPlayer) => T, fallback: T): T => {
      if (!isMountedRef.current) return fallback;
      try {
        return read(player);
      } catch {
        return fallback;
      }
    },
    [player]
  );

  // Mount flag + timer teardown. The player is deliberately NOT touched here.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      hideTimer.current = null;
      longPressTimer.current = null;
    };
  }, []);

  // Native events can land during teardown, so each handler checks the flag
  // before touching React state or reading back off the player.
  useEventListener(player, 'statusChange', ({ status }) => {
    if (!isMountedRef.current) return;
    if (status === 'readyToPlay' || status === 'error') setIsVideoReady(true);
  });

  useEventListener(player, 'timeUpdate', ({ currentTime: nextTime }) => {
    if (!isMountedRef.current) return;
    setCurrentTime(nextTime);
    const nextDuration = readPlayer((instance) => instance.duration, 0);
    if (nextDuration > 0) setDuration(nextDuration);
  });
  useEventListener(player, 'playingChange', ({ isPlaying: nextPlaying }) => {
    if (!isMountedRef.current) return;
    setIsPlaying(nextPlaying);
  });
  useEventListener(player, 'playToEnd', () => {
    if (!isMountedRef.current) return;
    setEnded(true);
    setPausedByUser(true);
    setControlsVisible(true);
  });

  useEffect(() => {
    withPlayer((instance) => {
      instance.muted = muted;
    });
  }, [muted, withPlayer]);

  useEffect(() => {
    withPlayer((instance) => {
      if (isActive && !pausedByUser && !ended) {
        instance.play();
      } else {
        instance.pause();
      }
    });
  }, [ended, isActive, pausedByUser, withPlayer]);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      withPlayer((instance) => {
        instance.currentTime = 0;
        instance.playbackRate = 1;
      });
      setCurrentTime(0);
      setPausedByUser(false);
      setEnded(false);
    }

    if (!isActive) {
      // An inactive card resets its own rate while it is still mounted, which
      // is why the unmount cleanup no longer needs to.
      withPlayer((instance) => {
        instance.playbackRate = 1;
      });
      setIsSpeeding(false);
    }

    wasActive.current = isActive;
  }, [isActive, withPlayer]);

  useEffect(() => {
    if (!controlsVisible || !isPlaying) return;
    hideTimer.current = setTimeout(() => {
      if (isMountedRef.current) setControlsVisible(false);
    }, 5000);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = null;
    };
  }, [controlsVisible, isPlaying]);

  const togglePlayback = () => {
    if (ended) {
      withPlayer((instance) => {
        instance.currentTime = 0;
        instance.play();
      });
      setCurrentTime(0);
      setEnded(false);
      setPausedByUser(false);
    } else if (isPlaying) {
      setPausedByUser(true);
      withPlayer((instance) => instance.pause());
    } else {
      setPausedByUser(false);
      withPlayer((instance) => instance.play());
    }
    setControlsVisible(true);
  };

  const seekTo = (time: number) => {
    const total = duration || readPlayer((instance) => instance.duration, 0) || 0;
    const next = Math.max(0, Math.min(total, time));
    withPlayer((instance) => {
      instance.currentTime = next;
    });
    setCurrentTime(next);
    if (ended) setEnded(false);
  };

  const seekFromTouch = (locationX: number) => {
    if (!trackWidth || !duration) return;
    seekTo((Math.max(0, Math.min(trackWidth, locationX)) / trackWidth) * duration);
  };

  const stopSpeedPlayback = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;

    if (didLongPress.current) {
      withPlayer((instance) => {
        instance.playbackRate = 1;
      });
      setIsSpeeding(false);
    }
  }, [withPlayer]);

  // Runs from a timer, so it can be reached after the card unmounts mid-swipe.
  const startSpeedPlayback = useCallback(() => {
    if (!isMountedRef.current) return;
    didLongPress.current = true;
    withPlayer((instance) => {
      instance.playbackRate = 2;
      if (ended) instance.currentTime = 0;
      instance.play();
    });
    if (ended) {
      setCurrentTime(0);
      setEnded(false);
    }
    setPausedByUser(false);
    setControlsVisible(true);
    setIsSpeeding(true);
  }, [ended, withPlayer]);

  const handleVideoPressIn = (locationX: number) => {
    didLongPress.current = false;
    if (locationX < width * 0.58) return;

    longPressTimer.current = setTimeout(startSpeedPlayback, LONG_PRESS_DELAY);
  };

  const handleVideoPressOut = () => {
    stopSpeedPlayback();
  };

  const handleVideoPress = () => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }

    togglePlayback();
  };

  const openInstagram = async () => {
    if (!reel.instagramUrl) return;
    try {
      const url = new URL(reel.instagramUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'www.instagram.com') return;
      if (await Linking.canOpenURL(reel.instagramUrl)) await Linking.openURL(reel.instagramUrl);
    } catch {
      // The static demo URL is validated above; a malformed URL simply does nothing.
    }
  };

  const share = async () => {
    try {
      await Share.share({ message: `${reel.title} — Mizan Invest` });
    } catch {
      // The OS share sheet may be unavailable in an emulator.
    }
  };

  return (
    <View style={[styles.page, { height }]}> 
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <LinearGradient
        colors={['rgba(0,0,0,0.42)', 'transparent', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.32, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Pressable
        style={StyleSheet.absoluteFill}
        onPressIn={(event) => handleVideoPressIn(event.nativeEvent.locationX)}
        onPressOut={handleVideoPressOut}
        onPress={handleVideoPress}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? t('pauseVideo') : t('playVideo')}
      />

      {isActive && !isVideoReady && <ReelVideoSkeleton />}

      {controlsVisible && (
        <>
          <Pressable
            onPress={togglePlayback}
            style={[styles.playControl, { top: height / 2 - 24 }]}
            accessibilityLabel={isPlaying ? t('pauseVideo') : t('playVideo')}
          >
            <AppIcon name={ended ? 'replay' : isPlaying ? 'pause' : 'play'} size="md" color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={onToggleMute}
            style={[styles.soundControl, { top: topInset + 14 }]}
            accessibilityLabel={muted ? t('soundOn') : t('soundOff')}
          >
            <AppIcon name={muted ? 'volumeOff' : 'volumeOn'} size="md" color="#FFFFFF" />
          </Pressable>
          {isSpeeding && (
            <View style={[styles.speedBadge, { top: topInset + 66 }]} pointerEvents="none">
              <Text style={styles.speedText}>2x</Text>
            </View>
          )}
          <View style={[styles.progressControl, { bottom: bottomInset + 8 }]}>
            <View
              style={styles.trackTouch}
              onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(event) => seekFromTouch(event.nativeEvent.locationX)}
              onResponderMove={(event) => seekFromTouch(event.nativeEvent.locationX)}
              onResponderRelease={(event) => seekFromTouch(event.nativeEvent.locationX)}
              accessibilityRole="adjustable"
              accessibilityLabel="Позиция видео"
            >
              <View style={styles.track}>
                <View style={[styles.trackFill, { width: `${duration ? (currentTime / duration) * 100 : 0}%` }]} />
                <View style={[styles.thumb, { left: `${duration ? (currentTime / duration) * 100 : 0}%` }]} />
              </View>
            </View>
          </View>
        </>
      )}

      <View style={[styles.actionRail, { bottom: bottomInset + 152 }]} pointerEvents="box-none">
        <View style={styles.favoriteAction}>
          <FavoriteButton propertyId={reel.propertyId} variant="glass" size={48} />
          <Text style={[typography.tiny, styles.likeCount]} numberOfLines={1}>{reel.likeCount}</Text>
        </View>
        <Pressable onPress={share} style={styles.railAction} accessibilityLabel={t('share')}>
          <AppIcon name="share" size="lg" color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.copy, { bottom: bottomInset + 44 }]} pointerEvents="box-none">
        {partner && (
          <View style={styles.partnerRow}>
            <AppIcon name="verified" size="xs" color={colors.accent} />
            <Text style={[typography.captionBold, styles.partner]} numberOfLines={1}>{partner.name}</Text>
          </View>
        )}
        <Text style={[typography.h3, styles.title]} numberOfLines={2} ellipsizeMode="tail">{reel.title}</Text>
        <View style={styles.metaRow}>
          <Text style={[typography.caption, styles.meta]} numberOfLines={1}>
            {t(cityNameKey(reel.cityId))}{property ? `, ${t(countryNameKey(property.countryCode))}` : ''}
          </Text>
          <Text style={[typography.tiny, styles.metaDate]} numberOfLines={1}>{reel.publishedAt}</Text>
        </View>
        <Text style={[typography.caption, styles.caption]} numberOfLines={2} ellipsizeMode="tail">{reel.caption}</Text>
        <View style={styles.ctas}>
          <Button
            title="Смотреть объект"
            onPress={() => router.push(`/(main)/property/${reel.propertyId}`)}
            variant="gold"
            size={reel.instagramUrl ? 'sm' : 'md'}
            iconRight={reel.instagramUrl ? undefined : 'arrowForward'}
            fullWidth={false}
            style={reel.instagramUrl ? styles.ctaPrimaryButton : undefined}
          />
          {reel.instagramUrl && (
            <Button
              title="Смотреть продолжение"
              onPress={openInstagram}
              variant="glass"
              size="sm"
              fullWidth={false}
              style={styles.ctaSecondaryButton}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', backgroundColor: '#05090F' },
  playControl: {
    position: 'absolute',
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,9,15,0.52)',
  },
  soundControl: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,9,15,0.46)',
  },
  speedBadge: {
    position: 'absolute',
    right: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(5,9,15,0.66)',
  },
  speedText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  progressControl: { position: 'absolute', left: 16, right: 16 },
  trackTouch: { alignSelf: 'stretch', height: 20, justifyContent: 'center' },
  track: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  trackFill: { height: '100%', borderRadius: 2, backgroundColor: '#E0BE86' },
  thumb: { position: 'absolute', top: -3, width: 9, height: 9, marginLeft: -4.5, borderRadius: 4.5, backgroundColor: '#FFFFFF' },
  actionRail: { position: 'absolute', right: 12, alignItems: 'center', gap: 14 },
  favoriteAction: { alignItems: 'center', gap: 2 },
  likeCount: { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  railAction: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  copy: { position: 'absolute', left: 16, right: 76, gap: 5 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  partner: { flexShrink: 1, color: '#FFFFFF' },
  title: { color: '#FFFFFF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  meta: { color: 'rgba(255,255,255,0.78)' },
  metaDate: { flexShrink: 1, color: 'rgba(255,255,255,0.68)' },
  caption: { color: 'rgba(255,255,255,0.78)' },
  ctas: { flexDirection: 'row', flexWrap: 'nowrap', gap: 8, marginTop: 6, marginRight: -60, alignItems: 'stretch' },
  ctaPrimaryButton: { flex: 0.9, minWidth: 0 },
  ctaSecondaryButton: { flex: 1.1, minWidth: 0 },
  reelSkeleton: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 2, backgroundColor: '#05090F' },
  reelSkeletonVideo: { flex: 1, backgroundColor: '#111C2B' },
  reelSkeletonCopy: { position: 'absolute', left: 16, right: 88, bottom: 58, gap: 9 },
  reelSkeletonLine: { height: 15, borderRadius: 8, backgroundColor: '#1B2A41' },
  reelSkeletonLineShort: { width: '42%' },
  reelSkeletonLineMedium: { width: '68%' },
  reelSkeletonProgress: { position: 'absolute', left: 16, right: 16, bottom: 16, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)' },
});

function ReelVideoSkeleton() {
  return (
    <View pointerEvents="none" style={styles.reelSkeleton} accessibilityLabel="Видео загружается">
      <View style={styles.reelSkeletonVideo} />
      <View style={styles.reelSkeletonCopy}>
        <View style={[styles.reelSkeletonLine, styles.reelSkeletonLineShort]} />
        <View style={styles.reelSkeletonLine} />
        <View style={[styles.reelSkeletonLine, styles.reelSkeletonLineMedium]} />
      </View>
      <View style={styles.reelSkeletonProgress} />
    </View>
  );
}

export default ReelCard;
