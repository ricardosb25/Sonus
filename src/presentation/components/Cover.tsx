import React from 'react';
import { Image, Text, View } from 'react-native';
import { useThemedStyles } from '../styles/styles';

export function Cover({ uri }: { uri?: string }) {
  const styles = useThemedStyles();

  if (uri) return <Image source={{ uri }} style={styles.cover} />;

  return (
    <View style={styles.coverFallback}>
      <Text style={styles.coverText}>S</Text>
    </View>
  );
}
