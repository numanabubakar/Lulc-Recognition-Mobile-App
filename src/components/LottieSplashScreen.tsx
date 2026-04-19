import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export function LottieSplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../satellite_moon_astronaut.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>LULC Recognition</Text>
          <Text style={styles.subtitle}> AMFRNet Architecture</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Developed By{"\n"}Khadijah Shabbir & Numan Abubakar
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
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
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569', // slate-500
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
});
