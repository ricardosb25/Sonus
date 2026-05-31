import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '../styles/styles';

type Props = {
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
};

export function ActionButton({ label, onPress, active, danger }: Props) {
  const styles = useThemedStyles();

  return (
    <TouchableOpacity
      style={[styles.action, active && styles.actionActive, danger && styles.actionDanger]}
      onPress={onPress}
    >
      <Text style={[styles.actionText, active && styles.actionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
