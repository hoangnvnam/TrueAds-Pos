import { Button, Text } from '@react-navigation/elements';
import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

export function NotFound() {
  return (
    <View style={styles.container}>
      <Text>404</Text>
      <Button screen="HomeTabs">Go to Home</Button>
    </View>
  );
}
