/** Remote Supabase-backed property detail. */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StatusBar, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FavoriteButton } from '@/components/cards/FavoriteButton';
import {
  BottomCTA,
  ImageGallery,
  RemoteDescriptionSection,
  RemoteFeaturesSection,
  RemoteHighlightsSection,
  RemoteInvestmentMetrics,
  RemoteKeyFigures,
  RemoteLocationSection,
  RemotePartnerSection,
  RemotePropertyHeader,
  RemoteVideoSection,
} from '@/components/property';
import { AppIcon, Button, IconButton } from '@/components/ui';
import { AppConfig } from '@/constants/config';
import { useLanguage } from '@/context/LanguageContext';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { getPropertyById, RemoteProperty } from '@/lib/properties';

type DetailStatus = 'loading' | 'ready' | 'not-found' | 'error';

export default function PropertyDetailScreen() {
  const styles = useStyles();
  const { language, t, isReady: isLanguageReady } = useLanguage();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [property, setProperty] = useState<RemoteProperty | null>(null);
  const [status, setStatus] = useState<DetailStatus>('loading');

  const loadProperty = useCallback(async () => {
    if (!id) {
      setProperty(null);
      setStatus('not-found');
      return;
    }

    setStatus('loading');
    try {
      const nextProperty = await getPropertyById(id, language);
      setProperty(nextProperty);
      setStatus(nextProperty ? 'ready' : 'not-found');
    } catch (error) {
      console.error('[property-detail] Failed to load property', error);
      setProperty(null);
      setStatus('error');
    }
  }, [id, language]);

  useEffect(() => {
    if (!isLanguageReady) return;

    let active = true;
    const load = async () => {
      if (!id) {
        if (active) {
          setProperty(null);
          setStatus('not-found');
        }
        return;
      }

      setStatus('loading');
      try {
        const nextProperty = await getPropertyById(id, language);
        if (!active) return;
        setProperty(nextProperty);
        setStatus(nextProperty ? 'ready' : 'not-found');
      } catch (error) {
        console.error('[property-detail] Failed to load property', error);
        if (!active) return;
        setProperty(null);
        setStatus('error');
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id, isLanguageReady, language]);

  if (!isLanguageReady || status === 'loading') {
    return <DetailState icon="time" title={t('loading')} loading />;
  }

  if (status === 'error') {
    return <DetailState icon="error" title={t('networkError')} actionTitle={t('tryAgain')} onAction={loadProperty} />;
  }

  if (status === 'not-found' || !property) {
    return (
      <DetailState
        icon="warning"
        title={t('propertyNotFound')}
        actionTitle={t('back')}
        onAction={() => router.replace('/(main)/explore')}
      />
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: property.title,
        message: `${property.title} — ${AppConfig.links.website}`,
      });
    } catch {
      Alert.alert(t('share'), t('demoActionBody'));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View entering={FadeIn.delay(150)} style={[styles.topControls, { top: insets.top + 10 }]}>
        <IconButton icon="back" onPress={() => router.back()} accessibilityLabel={t('back')} variant="glass" size={44} />
        <View style={styles.topActions}>
          <IconButton icon="share" onPress={handleShare} accessibilityLabel={t('share')} variant="glass" size={44} />
          <FavoriteButton propertyId={property.id} variant="glass" size={44} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <ImageGallery images={property.images} verified={property.verified} />
        <Animated.View entering={FadeInDown.delay(80)}>
          <RemotePropertyHeader property={property} />
        </Animated.View>
        <RemoteKeyFigures property={property} />
        <RemoteInvestmentMetrics property={property} />
        <RemoteDescriptionSection description={property.description} />
        <RemoteHighlightsSection highlights={property.highlights} />
        <RemoteFeaturesSection property={property} />
        <RemoteVideoSection property={property} />
        <RemoteLocationSection property={property} />
        <RemotePartnerSection property={property} />
      </ScrollView>

      <BottomCTA
        propertyId={property.id}
        propertyReferenceCode={property.referenceCode}
        preferredLanguage={language}
      />
    </View>
  );
}

function DetailState({
  icon,
  title,
  loading = false,
  actionTitle,
  onAction,
}: {
  icon: 'time' | 'error' | 'warning';
  title: string;
  loading?: boolean;
  actionTitle?: string;
  onAction?: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.stateContainer}>
      {loading ? <ActivityIndicator color={colors.accent} size="large" /> : <AppIcon name={icon} size="xl" color={colors.textMuted} />}
      <Text style={styles.stateText}>{title}</Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="secondary" size="md" fullWidth={false} />
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  topControls: {
    position: 'absolute',
    left: t.spacing.screenHorizontal,
    right: t.spacing.screenHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  topActions: { flexDirection: 'row', gap: t.spacing.sm },
  content: { paddingBottom: 170 },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.screenHorizontal,
    backgroundColor: t.colors.background,
  },
  stateText: { ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center' },
}));
