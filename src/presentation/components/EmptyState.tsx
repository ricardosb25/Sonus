import React from 'react';
import { Text } from 'react-native';
import { useThemedStyles } from '../styles/styles';

export function EmptyState({ text }: { text: string }) {
  const styles = useThemedStyles();

  return <Text style={styles.empty}>{text}</Text>;
}
