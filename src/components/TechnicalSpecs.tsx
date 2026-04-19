import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const specs = [
  {
    label: 'Architecture',
    value: 'AMFRNet',
    details: 'Convolutional Neural Network with interpretability features',
  },
  {
    label: 'Parameters',
    value: '~365K',
    details: 'Total trainable parameters in the model',
  },
  {
    label: 'FLOPs',
    value: '~106M',
    details: 'Floating point operations per inference',
  },
  {
    label: 'Input Size',
    value: '224×224',
    details: 'Standard remote sensing image resolution',
  },
  {
    label: 'Normalization',
    value: 'ImageNet',
    details: 'RGB normalization (μ=[0.485, 0.456, 0.406], σ=[0.229, 0.224, 0.225])',
  },
];

export function TechnicalSpecs() {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>TECHNICAL SPECIFICATIONS</Text>
      <View style={styles.grid}>
        {specs.map(spec => (
          <View key={spec.label} style={styles.specCard}>
            <Text style={styles.specLabel} numberOfLines={1}>{spec.label}</Text>
            <Text style={styles.specValue} numberOfLines={1}>{spec.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specCard: {
    flex: 1,
    minWidth: '30%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: '#334155',
  },
  specLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a5b4fc',
  },
});
