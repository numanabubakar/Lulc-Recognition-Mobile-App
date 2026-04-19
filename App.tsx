import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatasetSelector, type DatasetType } from './src/components/DatasetSelector';
import { ImageUploadZone } from './src/components/ImageUploadZone';
import { NeuralNetworkLoader } from './src/components/NeuralNetworkLoader';
import { PredictionResults, type PredictionResult } from './src/components/PredictionResults';
import { TechnicalSpecs } from './src/components/TechnicalSpecs';
import { AppSettings } from './src/components/AppSettings';
import { LottieSplashScreen } from './src/components/LottieSplashScreen';

import { LulcService } from './src/services/lulcService';

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <Dashboard />
    </SafeAreaProvider>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard() {
  const insets = useSafeAreaInsets();

  const [selectedDataset, setSelectedDataset] = useState<DatasetType>('eurosat');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // 4.5 seconds for the lottie animation
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <LottieSplashScreen />;
  }

  const handleImageSelected = (
    uri: string,
    name: string,
    type: string,
    previewUri: string,
    width?: number,
    height?: number,
  ) => {
    setImageUri(uri);
    setImageName(name);
    setImageMime(type);
    setPreview(previewUri);
    setImgWidth(width || 0);
    setImgHeight(height || 0);
    setResult(null);
    setError(null);
  };

  const handlePredict = async () => {
    if (!imageUri || !imageName || !imageMime) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await LulcService.predict(
        imageUri,
        selectedDataset,
        imgWidth,
        imgHeight,
      );
      
      // Adapt result for PredictionResults if needed (it already matches LulcPredictionResponse mostly)
      const formattedResult: PredictionResult = {
        ...data,
        model_type: selectedDataset,
        inference_time_ms: data.inference_time_ms || 0,
        image_info: data.image_info || { width: imgWidth, height: imgHeight, format: 'JPEG' },
        class_index: data.class_index || 0,
        all_predictions: data.all_predictions || [],
      };

      setResult(formattedResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setImageUri(null);
    setImageName(null);
    setImageMime(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.brainIconWrap}>
            <Text style={styles.brainIcon}>🧠</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>LULC Recognition</Text>
            <Text style={styles.appSubtitle}>
              Deep Learning Land Use & Land Cover Classification System
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setSettingsVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Upload Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>IMAGE INPUT</Text>
          <ImageUploadZone
            onImageSelected={handleImageSelected}
            disabled={isLoading}
          />
        </View>

        {/* Dataset Selector (Only shown after image is selected) */}
        {preview && (
          <DatasetSelector
            selectedDataset={selectedDataset}
            onDatasetChange={setSelectedDataset}
          />
        )}

        {/* Run Inference Button */}
        {preview && !result && (
          <TouchableOpacity
            style={[styles.inferButton, isLoading && styles.inferButtonDisabled]}
            onPress={handlePredict}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.inferButtonText}>
              {isLoading ? 'Processing...' : '⚡  Run Inference'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Loading */}
        {isLoading && (
          <View style={styles.card}>
            <NeuralNetworkLoader />
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {/* Prediction Results */}
        {result && !isLoading && (
          <>
            <PredictionResults result={result} />

            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Text style={styles.clearButtonText}>🔄  Upload Another Image</Text>
            </TouchableOpacity>

            <TechnicalSpecs />
          </>
        )}

        {/* Getting Started (shown when no image selected) */}
        {!preview && (
          <View style={styles.gettingStarted}>
            <Text style={styles.gsTitle}>Getting Started</Text>
            <View style={styles.gsGrid}>
              <GsStep
                num="1"
                title="Select Dataset"
                desc="Choose EuroSAT, MLRSNet, or PatternNet benchmark."
              />
              <GsStep
                num="2"
                title="Upload Image"
                desc="Tap the upload zone to pick a JPEG or PNG satellite image."
              />
              <GsStep
                num="3"
                title="Get Prediction"
                desc='Tap "Run Inference" to classify land use/cover.'
              />
            </View>
          </View>
        )}
      </ScrollView>

      <AppSettings
        isOpen={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

// ─── Getting Started Step card ────────────────────────────────────────────────
function GsStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <View style={gsStyles.card}>
      <View style={gsStyles.numBadge}>
        <Text style={gsStyles.numText}>{num}</Text>
      </View>
      <Text style={gsStyles.title}>{title}</Text>
      <Text style={gsStyles.desc}>{desc}</Text>
    </View>
  );
}

const gsStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    gap: 6,
  },
  numBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 12, fontWeight: '800', color: '#818cf8' },
  title: { fontSize: 13, fontWeight: '700', color: '#818cf8' },
  desc: { fontSize: 12, color: '#94a3b8', lineHeight: 18 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },

  // Header
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b', // slate-800
    backgroundColor: 'rgba(2,6,23,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brainIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainIcon: { fontSize: 20 },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#64748b', // slate-500
    marginTop: 2,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
  settingsIcon: {
    fontSize: 18,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: '#0f172a', // slate-900
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b', // slate-800
    padding: 16,
  },
  cardLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 12,
  },

  // Infer button
  inferButton: {
    backgroundColor: '#4f46e5', // indigo-600
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  inferButtonDisabled: {
    backgroundColor: '#334155', // slate-700
  },
  inferButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Error
  errorCard: {
    backgroundColor: 'rgba(127,29,29,0.2)', // red-900/20
    borderWidth: 1,
    borderColor: 'rgba(185,28,28,0.5)', // red-700/50
    borderRadius: 10,
    padding: 14,
  },
  errorText: {
    color: '#fca5a5', // red-300
    fontSize: 13,
  },

  // Clear button
  clearButton: {
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Getting Started
  gettingStarted: {
    marginTop: 8,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  gsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
  },
});
