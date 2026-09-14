/**
 * ============================================
 * REMOTE IMAGE
 * ============================================
 *
 * Every photo in the app renders through this component.
 *
 * Two things it guarantees that a bare <Image> does not:
 * 1. A themed placeholder tint shows while the photo downloads, so a
 *    card never flashes a white or transparent hole on a dark screen.
 * 2. A broken URL falls back to the branded placeholder image instead of
 *    leaving an empty box — the gallery requirement.
 *
 * Built on expo-image for its memory/disk cache and cross-fade.
 */

import { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';

import { Images } from '@/constants/images';
import { useTheme } from '@/context/ThemeContext';

export interface RemoteImageProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  /** Overrides the default property placeholder */
  fallbackUri?: string;
  /** Cross-fade duration in ms */
  transition?: number;
  /** Rounds the loading tint to match the image's own corners */
  borderRadius?: number;
}

export function RemoteImage({
  uri,
  style,
  contentFit = 'cover',
  fallbackUri = Images.placeholders.property,
  transition = 220,
  borderRadius,
}: RemoteImageProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  // A failed fallback would loop forever, so only swap the source once.
  const source = failed ? fallbackUri : uri;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceAlt },
        borderRadius !== undefined && { borderRadius, overflow: 'hidden' },
        style,
      ]}
    >
      <Image
        source={{ uri: source }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        transition={transition}
        cachePolicy="memory-disk"
        onError={() => {
          if (!failed) setFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default RemoteImage;
