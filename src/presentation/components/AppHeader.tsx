import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { AppThemeMode } from '../../domain/settings';
import { useThemedStyles } from '../styles/styles';

type Props = {
  themeMode: AppThemeMode;
  offlineCount: number;
  onOpenPlayer: () => void;
  onOpenSettings: () => void;
};

const logoByTheme = {
  dark: require('../../../assets/sonus-in-app-logo-dark.png'),
  light: require('../../../assets/sonus-in-app-logo.png'),
} as const;

export function AppHeader({ themeMode, offlineCount, onOpenPlayer, onOpenSettings }: Props) {
  const styles = useThemedStyles();

  return (
    <View style={styles.header}>
      <View>
        <Image
          source={logoByTheme[themeMode]}
          style={styles.brandLogo}
          resizeMode="contain"
          accessibilityLabel="Sonus"
        />
        <Text style={styles.subtitle}>{offlineCount} musicas offline</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.playerButton} onPress={onOpenSettings}>
          <Text style={styles.playerButtonText}>Config</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playerButton} onPress={onOpenPlayer}>
          <Text style={styles.playerButtonText}>Player</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
