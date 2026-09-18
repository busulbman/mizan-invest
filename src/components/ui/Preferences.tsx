/**
 * ============================================
 * PREFERENCE PICKERS
 * ============================================
 *
 * Language, currency and appearance all present the same way: a control
 * that opens a bottom sheet of single-choice options. Keeping the three
 * in one file means they cannot drift apart visually.
 *
 * Each picker renders in one of three shapes:
 *   compact — header pill, for light screens (Home)
 *   glass   — header pill over photography (Welcome)
 *   row     — full-width settings row (Settings screen)
 */

import { useState } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { AppIcon } from './AppIcon';
import { BottomSheet, SheetOption } from './BottomSheet';
import { IconName } from '@/constants/icons';
import { CURRENCY_ORDER, currencies } from '@/constants/currency';
import { LANGUAGE_ORDER, Language, languageCodes, languageNames } from '@/constants/translations';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThemePreference, makeStyles, useTheme } from '@/context/ThemeContext';
import { MARKET_OPTIONS } from '@/constants/markets';
import { useMarket } from '@/context/MarketContext';

export type PickerVariant = 'compact' | 'glass' | 'row';

// ============================================
// SHARED TRIGGER
// ============================================

interface TriggerProps {
  variant: PickerVariant;
  icon: IconName;
  /** Row label, e.g. "Language" */
  label: string;
  /** Current selection, shown on the right of a row or inside a pill */
  value: string;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

function Trigger({
  variant,
  icon,
  label,
  value,
  onPress,
  accessibilityLabel,
  style,
}: TriggerProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  if (variant === 'row') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      >
        <View style={styles.rowIcon}>
          <AppIcon name={icon} size="md" color={colors.accent} />
        </View>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
        <AppIcon name="chevronDown" size="sm" color={colors.textMuted} />
      </Pressable>
    );
  }

  if (variant === 'glass') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.glassPill, pressed && styles.pressed, style]}
      >
        <BlurView intensity={26} tint="dark" style={styles.glassPillInner}>
          <AppIcon name={icon} size="sm" color={colors.onDark} />
          <Text style={styles.glassPillText}>{value}</Text>
        </BlurView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed, style]}
    >
      <AppIcon name={icon} size="sm" color={colors.text} />
      <Text style={styles.pillText}>{value}</Text>
    </Pressable>
  );
}

// ============================================
// LANGUAGE
// ============================================

export function LanguagePicker({
  variant = 'compact',
  style,
}: {
  variant?: PickerVariant;
  style?: StyleProp<ViewStyle>;
}) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const select = (next: Language) => {
    setLanguage(next);
    setOpen(false);
  };

  return (
    <>
      <Trigger
        variant={variant}
        icon="globe"
        label={t('language')}
        value={variant === 'row' ? languageNames[language] : languageCodes[language]}
        onPress={() => setOpen(true)}
        accessibilityLabel={t('selectLanguage')}
        style={style}
      />

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t('selectLanguage')}>
        {LANGUAGE_ORDER.map((lang) => (
          <SheetOption
            key={lang}
            label={languageNames[lang]}
            hint={languageCodes[lang]}
            active={lang === language}
            onPress={() => select(lang)}
          />
        ))}
      </BottomSheet>
    </>
  );
}

// ============================================
// CURRENCY
// ============================================

export function CurrencyPicker({
  variant = 'compact',
  style,
}: {
  variant?: PickerVariant;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  const { t } = useLanguage();
  const { currency, setCurrency, rate } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Trigger
        variant={variant}
        icon="wallet"
        label={t('currency')}
        value={currency}
        onPress={() => setOpen(true)}
        accessibilityLabel={t('selectCurrency')}
        style={style}
      />

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('selectCurrency')}
        // The demo-rate disclaimer lives here so it is impossible to
        // mistake the fixed rates for live market data.
        subtitle={`${t('demoExchangeRate')} · ${rate}`}
      >
        {CURRENCY_ORDER.map((code) => (
          <SheetOption
            key={code}
            label={`${currencies[code].symbol}  ${code}`}
            active={code === currency}
            onPress={() => {
              setCurrency(code);
              setOpen(false);
            }}
          />
        ))}
        <Text style={styles.note}>{t('demoRateNote')}</Text>
      </BottomSheet>
    </>
  );
}

// ============================================
// APPEARANCE
// ============================================

export function AppearancePicker({
  variant = 'row',
  style,
}: {
  variant?: PickerVariant;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useLanguage();
  const { preference, setPreference, isDark } = useTheme();
  const [open, setOpen] = useState(false);

  const labels: Record<ThemePreference, string> = {
    light: t('themeLight'),
    dark: t('themeDark'),
    system: t('themeSystem'),
  };

  return (
    <>
      <Trigger
        variant={variant}
        icon={isDark ? 'star' : 'settings'}
        label={t('appearance')}
        value={labels[preference]}
        onPress={() => setOpen(true)}
        accessibilityLabel={t('selectAppearance')}
        style={style}
      />

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t('selectAppearance')}>
        {(['light', 'dark', 'system'] as ThemePreference[]).map((option) => (
          <SheetOption
            key={option}
            label={labels[option]}
            active={option === preference}
            onPress={() => {
              setPreference(option);
              setOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </>
  );
}

// ============================================
// INVESTMENT MARKET
// ============================================

export function MarketPicker({
  variant = 'row',
  style,
}: {
  variant?: PickerVariant;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useLanguage();
  const { selectedMarket, setSelectedMarket } = useMarket();
  const [open, setOpen] = useState(false);

  const selected = MARKET_OPTIONS.find((option) => option.code === selectedMarket) ?? MARKET_OPTIONS[2];

  return (
    <>
      <Trigger
        variant={variant}
        icon="globe"
        label={t('investmentMarket')}
        value={t(selected.countryKey)}
        onPress={() => setOpen(true)}
        accessibilityLabel={t('selectInvestmentMarket')}
        style={style}
      />

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t('selectInvestmentMarket')}>
        {MARKET_OPTIONS.map((option) => (
          <SheetOption
            key={option.code ?? 'all'}
            label={t(option.countryKey)}
            hint={t(option.detailsKey)}
            active={selectedMarket === option.code}
            onPress={() => {
              setSelectedMarket(option.code);
              setOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </>
  );
}

const useStyles = makeStyles((t) => ({
  // Header pill on a light surface
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: t.metrics.minTouch,
    paddingHorizontal: 12,
    borderRadius: t.borderRadius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  pillText: {
    ...t.typography.captionBold,
    color: t.colors.text,
  },

  // Header pill over photography
  glassPill: {
    height: t.metrics.minTouch,
    borderRadius: t.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.colors.overlay.medium,
  },
  glassPillInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  glassPillText: {
    ...t.typography.captionBold,
    color: t.colors.onDark,
  },

  // Settings row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.smd,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: t.spacing.cardPadding,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: t.borderRadius.md,
    backgroundColor: t.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    ...t.typography.body,
    color: t.colors.text,
  },
  rowValue: {
    flexShrink: 1,
    maxWidth: '45%',
    ...t.typography.caption,
    color: t.colors.textSecondary,
    textAlign: 'right',
  },

  pressed: {
    opacity: 0.7,
  },

  note: {
    ...t.typography.caption,
    color: t.colors.textMuted,
    paddingHorizontal: t.spacing.smd,
    paddingTop: t.spacing.sm,
  },
}));
