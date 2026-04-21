import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { generateProfessionalReport } from '../utils/reportGenerator';

export interface ClassPrediction {
  class_index: number;
  class_label: string;
  confidence: number;
}

export interface PredictionResult {
  predicted_class: string;
  class_index: number;
  confidence: number;
  all_predictions: ClassPrediction[];
  explainability_maps?: Record<string, string>;
  inference_time_ms: number;
  model_type: string;
  image_info: {
    width: number;
    height: number;
    format: string;
  };
}

interface PredictionResultsProps {
  result: PredictionResult;
  originalImageUri: string | null;
}

export function PredictionResults({ result, originalImageUri }: PredictionResultsProps) {
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const confidencePercent = Math.round(result.confidence * 100);
  const modelDisplayName = result.model_type.toUpperCase();

  const handleExportPDF = async () => {
    if (originalImageUri) {
      await generateProfessionalReport(result, originalImageUri);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* ── Main Result Card ── */}
      <View style={styles.card}>
        <View style={styles.resultRow}>
          <View style={styles.checkIconContainer}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <View style={styles.resultTextBlock}>
            <Text style={styles.predictionLabel}>PREDICTION</Text>
            <Text style={styles.predictedClass}>{result.predicted_class}</Text>
            <Text style={styles.classIndex}>
              Class Index:{' '}
              <Text style={styles.classIndexValue}>{result.class_index}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* ── Confidence Score Card ── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CONFIDENCE SCORE</Text>
        <View style={styles.confidenceHeader}>
          <Text style={styles.rawConfidence}>Probability: {result.confidence.toFixed(4)}</Text>
        </View>

        {/* Segmented arc gauge (premium look) */}
        <SegmentedGauge percent={confidencePercent} />
      </View>

      {/* ── Export Report Button ── */}
      <TouchableOpacity 
        style={styles.exportPdfButton} 
        onPress={handleExportPDF}
        activeOpacity={0.8}
      >
        <Text style={styles.exportPdfText}>📄  Export Professional PDF Report</Text>
      </TouchableOpacity>

      {/* ── Visual Explanations (XAI Maps) ── */}
      {result.explainability_maps && Object.keys(result.explainability_maps).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>VISUAL EXPLANATIONS (XAI MAPS)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.xaiScroll}>
            {Object.entries(result.explainability_maps).map(([mapName, b64Str]) => (
              <View key={mapName} style={styles.xaiItem}>
                <View style={styles.xaiHeader}>
                  <Text style={styles.xaiName}>{mapName}</Text>
                </View>
                <View style={styles.xaiImageWrapper}>
                  <Image
                    source={{ uri: b64Str }}
                    style={styles.xaiImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── All Class Probabilities (Collapsible Box) ── */}
      {result.all_predictions && result.all_predictions.length > 0 && (
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.collapsibleHeader} 
            onPress={() => setShowAllPredictions(!showAllPredictions)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLabel}>ALL CLASS PROBABILITIES</Text>
            <Text style={styles.collapseToggle}>
              {showAllPredictions ? 'Hide ▲' : 'Show All ▼'}
            </Text>
          </TouchableOpacity>
          
          {showAllPredictions && (
            <View style={styles.allPredsList}>
              {result.all_predictions.map((pred, idx) => {
                const predPercent = (pred.confidence * 100).toFixed(1);
                const isTop = idx === 0;
                return (
                  <View key={pred.class_index} style={styles.predRow}>
                    <View style={styles.predInfo}>
                      <Text style={styles.predIdx}>{idx + 1}.</Text>
                      <Text
                        style={[styles.predLabel, isTop && styles.predLabelTop]}
                        numberOfLines={1}
                      >
                        {pred.class_label}
                      </Text>
                    </View>
                    <View style={styles.predRight}>
                      <View style={styles.miniTrack}>
                        <View
                          style={[
                            styles.miniFill,
                            { width: `${pred.confidence * 100}%` as any },
                            isTop && styles.miniFillTop,
                          ]}
                        />
                      </View>
                      <Text style={[styles.predValue, isTop && styles.predValueTop]}>
                        {predPercent}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── Performance Metrics Card ── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>PERFORMANCE METRICS</Text>
        <View style={styles.metricsGrid}>
          <MetricCell label="Inference Time" value={`${result.inference_time_ms.toFixed(2)}ms`} />
          <MetricCell label="Model" value={modelDisplayName} />
          <MetricCell
            label="Image Size"
            value={`${result.image_info.width}×${result.image_info.height}`}
            mono
          />
          <MetricCell label="Format" value={result.image_info.format} />
        </View>
      </View>
    </View>
  );
}

// ── Segmented arc gauge (no native deps) ────────────────────────────────────
const SEGMENT_COUNT = 20;

function SegmentedGauge({ percent }: { percent: number }) {
  const filled = Math.round((percent / 100) * SEGMENT_COUNT);
  return (
    <View style={gaugeStyles.container}>
      <View style={gaugeStyles.segmentsRow}>
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              gaugeStyles.segment,
              i < filled ? gaugeStyles.segmentFilled : gaugeStyles.segmentEmpty,
              i === 0 && gaugeStyles.segmentFirst,
              i === SEGMENT_COUNT - 1 && gaugeStyles.segmentLast,
            ]}
          />
        ))}
      </View>
      <Text style={gaugeStyles.centerLabel}>{percent}%</Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16, gap: 8 },
  segmentsRow: {
    flexDirection: 'row',
    height: 14,
    width: '100%',
    gap: 3,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: '100%',
    borderRadius: 3,
  },
  segmentFirst: { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  segmentLast: { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
  segmentFilled: { backgroundColor: '#6366f1' },
  segmentEmpty: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  centerLabel: {
    fontSize: 28,
    fontWeight: '800',
    color: '#818cf8',
  },
});

// ── Metric cell ──────────────────────────────────────────────────────────────
function MetricCell({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={metricStyles.cell}>
      <Text style={metricStyles.label}>{label}</Text>
      <Text
        style={[metricStyles.value, mono && metricStyles.mono]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  cell: {
    width: '48%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(51,65,85,0.5)',
    borderWidth: 1,
    borderColor: '#475569',
    margin: '1%',
  },
  label: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  value: { fontSize: 14, fontWeight: '700', color: '#a5b4fc' },
  mono: { fontFamily: 'monospace', fontSize: 12 },
});

// ── Root styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
  },
  resultRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(22,163,74,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: { fontSize: 22, color: '#4ade80' },
  resultTextBlock: { flex: 1, gap: 4 },
  predictionLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#94a3b8',
    fontWeight: '600',
  },
  predictedClass: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    flexWrap: 'wrap',
  },
  classIndex: { fontSize: 12, color: '#94a3b8' },
  classIndexValue: { color: '#a5b4fc', fontFamily: 'monospace' },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  confidenceNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#818cf8',
  },
  rawConfidence: {
    fontSize: 11,
    color: '#64748b',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 999,
  },
  xaiScroll: { gap: 12, paddingRight: 16 },
  xaiItem: {
    width: 160,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  xaiHeader: {
    padding: 6,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  xaiName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#cbd5e1',
    textAlign: 'center',
  },
  xaiImageWrapper: {
    width: 160,
    height: 160,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xaiImage: {
    width: 140,
    height: 140,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  collapseToggle: {
    fontSize: 12,
    color: '#818cf8',
    fontWeight: '700',
  },
  allPredsList: { 
    gap: 10, 
    marginTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#334155', 
    paddingTop: 16 
  },
  predRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  predInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  predIdx: { fontSize: 10, color: '#64748b', width: 14, textAlign: 'right' },
  predLabel: { fontSize: 12, color: '#cbd5e1' },
  predLabelTop: { color: '#a5b4fc', fontWeight: '700' },
  predRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    backgroundColor: '#475569',
  },
  miniFillTop: { backgroundColor: '#6366f1' },
  predValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#94a3b8',
    width: 40,
    textAlign: 'right',
  },
  predValueTop: { color: '#818cf8', fontWeight: '600' },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exportPdfButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  exportPdfText: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
