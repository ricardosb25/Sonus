import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTab } from '../../domain/models';
import { useI18n } from '../i18n';
import { useThemedStyles } from '../styles/styles';

const tabs: Array<{ id: AppTab; labelKey: Parameters<ReturnType<typeof useI18n>>[0] }> = [
  { id: 'download', labelKey: 'tabs.search' },
  { id: 'downloads', labelKey: 'tabs.downloads' },
  { id: 'library', labelKey: 'tabs.library' },
  { id: 'playlists', labelKey: 'tabs.playlists' },
];

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomTabs({ activeTab, onChange }: Props) {
  const styles = useThemedStyles();
  const insets = useSafeAreaInsets();
  const t = useI18n();

  return (
    <View style={[styles.tabs, { paddingBottom: Math.max(10, insets.bottom + 8) }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabButton, activeTab === tab.id && styles.tabActive]}
          onPress={() => onChange(tab.id)}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
            {t(tab.labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
