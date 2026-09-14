/**
 * ============================================
 * VIDEO MODAL
 * ============================================
 *
 * Full-screen player for the property tour, opened from the video card
 * on the detail screen.
 *
 * Every control does real work — play/pause, mute/unmute and close are
 * wired to the player, not to a placeholder alert. The source is a
 * bundled MP4, so the tour plays with no network.
 *
 * The player is released when the modal closes (`visible` drives
 * play/pause) so audio never keeps running behind the detail screen.
 */

import { useEffect, useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';

import { AppIcon } from '@/components/ui/AppIcon';
import { LocalVideos, LocalVideoKey } from '@/constants/images';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export interface VideoModalProps {
  visible: boolean;
  onClose: () => void;
  /** Which bundled clip to play */
  videoKey: LocalVideoKey;
  title: string;
  subtitle?: string;
}

export function VideoModal({ visible, onClose, videoKey, title, subtitle }: VideoModalProps) {
  const { t } = useLanguage();
  const { typography } = useTheme();
  const insets = useSafeAreaInsets();

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  const player = useVideoPlayer(LocalVideos[videoKey], (instance) => {
    instance.loop = true;
    instance.muted = false;
  });

  // Start on open, stop on close — otherwise audio continues underneath
  useEffect(() => {
    if (visible) {
      player.play();
      setPlaying(true);
    } else {
      player.pause();
    }
  }, [visible, player]);

  const togglePlayback = () => {
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const next = !muted;
    player.muted = next;
    setMuted(next);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      supportedOrientations={['portrait']}
    >
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />

        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />

        {/* Tapping the video area toggles playback */}
        <Pressable
          style={styles.tapLayer}
          onPress={togglePlayback}
          accessibilityRole="button"
          accessibilityLabel={playing ? t('pauseVideo') : t('playVideo')}
        >
          {!playing && (
            <View style={styles.playBadge}>
              <AppIcon name="play" size="xl" color="#FFFFFF" />
            </View>
          )}
        </Pressable>

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('close')}
            style={styles.circleButton}
          >
            <AppIcon name="close" size="md" color="#FFFFFF" />
          </Pressable>

          <View style={styles.titleColumn}>
            <Text style={[typography.bodyBold, styles.title]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[typography.caption, styles.subtitle]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          <Pressable
            onPress={toggleMute}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={muted ? t('soundOff') : t('soundOn')}
            style={styles.circleButton}
          >
            <AppIcon name={muted ? 'volumeOff' : 'volumeOn'} size="md" color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Bottom controls */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={togglePlayback}
            accessibilityRole="button"
            accessibilityLabel={playing ? t('pauseVideo') : t('playVideo')}
            style={styles.controlPill}
          >
            <AppIcon name={playing ? 'pause' : 'play'} size="sm" color="#FFFFFF" />
            <Text style={[typography.captionBold, styles.controlText]}>
              {playing ? t('pauseVideo') : t('playVideo')}
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleMute}
            accessibilityRole="button"
            accessibilityLabel={muted ? t('soundOff') : t('soundOn')}
            style={styles.controlPill}
          >
            <AppIcon name={muted ? 'volumeOff' : 'volumeOn'} size="sm" color="#FFFFFF" />
            <Text style={[typography.captionBold, styles.controlText]}>
              {muted ? t('soundOff') : t('soundOn')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tapLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  controlText: {
    color: '#FFFFFF',
  },
});

export default VideoModal;
