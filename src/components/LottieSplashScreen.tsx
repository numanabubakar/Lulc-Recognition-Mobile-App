import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export function LottieSplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={{ uri: 'https://lottie.host/76d75605-e45c-428a-8611-655a68735593/fS5E2UvR71.json' }}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>LULC AI</Text>
        <Text style={styles.subtitle}>Deep Learning Recognition System</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    width: width * 0.8,
    height: width * 0.8,
  },
  animation: {
    flex: 1,
  },
  textContainer: {
    marginTop: -20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
