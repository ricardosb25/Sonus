import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AppTab } from '../../domain/models';
import { useThemedStyles } from '../styles/styles';

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'download', label: 'Buscar' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'library', label: 'Biblioteca' },
  { id: 'playlists', label: 'Playlists' },
];

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomTabs({ activeTab, onChange }: Props) {
  const styles = useThemedStyles();

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabButton, activeTab === tab.id && styles.tabActive]}
          onPress={() => onChange(tab.id)}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
