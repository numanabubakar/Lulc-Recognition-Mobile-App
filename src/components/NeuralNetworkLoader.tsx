import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';

const NUM_DOTS = 5;
const ORBIT_NODES = 4;
const ORBIT_RADIUS = 36;

export function NeuralNetworkLoader() {
  // Center pulse
  const centerPulse = useRef(new Animated.Value(0.6)).current;

  // Orbiting rotation for the group
  const rotation = useRef(new Animated.Value(0)).current;

  // Bouncing dots
  const dotAnims = useRef(
    Array.from({ length: NUM_DOTS }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Center node pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(centerPulse, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();

    // Orbit rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ).start();

    // Staggered bouncing dots
    dotAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ).start();
    });
  }, [centerPulse, rotation, dotAnims]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      {/* Neural Network Animation */}
      <View style={styles.orbitContainer}>
        {/* Center node */}
        <Animated.View
          style={[styles.centerNode, { opacity: centerPulse, transform: [{ scale: centerPulse }] }]}
        />

        {/* Orbiting ring (rotates as a group) */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.orbitRing,
            { transform: [{ rotate: spin }] },
          ]}
        >
          {Array.from({ length: ORBIT_NODES }).map((_, i) => {
            const angle = (i * 90 * Math.PI) / 180;
            const x = Math.cos(angle) * ORBIT_RADIUS;
            const y = Math.sin(angle) * ORBIT_RADIUS;
            return (
              <View
                key={i}
                style={[
                  styles.orbitNode,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                    ],
                  },
                ]}
              />
            );
          })}
        </Animated.View>
      </View>

      {/* Status text */}
      <View style={styles.textBlock}>
        <Text style={styles.titleText}>Processing Image</Text>
        <Text style={styles.subtitleText}>Running neural network inference...</Text>
      </View>

      {/* Bouncing dots */}
      <View style={styles.dotsRow}>
        {dotAnims.map((anim, i) => {
          const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] });
          const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ scale }], opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 40,
  },
  orbitContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1', // indigo-500
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  orbitRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitNode: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#818cf8', // indigo-400
    shadowColor: '#818cf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  textBlock: { alignItems: 'center', gap: 4 },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  subtitleText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
});
