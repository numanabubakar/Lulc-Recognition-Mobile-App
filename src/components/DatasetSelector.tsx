import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';

export type DatasetType = 'eurosat' | 'mlrsnet' | 'patternnet';

interface DatasetSelectorProps {
  selectedDataset: DatasetType;
  onDatasetChange: (dataset: DatasetType) => void;
}

const datasets: {
  id: DatasetType;
  name: string;
  classes: number;
  description: string;
}[] = [
  {
    id: 'eurosat',
    name: 'EuroSAT',
    classes: 10,
    description: 'European satellite imagery',
  },
  {
    id: 'mlrsnet',
    name: 'MLRSNet',
    classes: 46,
    description: 'Multi-spectral remote sensing',
  },
  {
    id: 'patternnet',
    name: 'PatternNet',
    classes: 38,
    description: 'High-resolution benchmark',
  },
];

export function DatasetSelector({
  selectedDataset,
  onDatasetChange,
}: DatasetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = datasets.find(d => d.id === selectedDataset) || datasets[0];

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>BENCHMARK DATASET</Text>

      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.triggerInfo}>
          <Text style={styles.selectedName}>{selected.name}</Text>
          <Text style={styles.selectedMeta}>{selected.classes} classes</Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.selectedDesc}>{selected.description}</Text>

      {/* Selector Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Dataset</Text>
            </View>
            <View style={styles.optionsList}>
              {datasets.map(dataset => {
                const isSelected = dataset.id === selectedDataset;
                return (
                  <TouchableOpacity
                    key={dataset.id}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => {
                      onDatasetChange(dataset.id);
                      setIsOpen(false);
                    }}
                  >
                    <View style={styles.optionBase}>
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                        {dataset.name}
                      </Text>
                      {isSelected && <Text style={styles.check}>✓</Text>}
                    </View>
                    <Text style={styles.optionDesc}>
                      {dataset.classes} classes • {dataset.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  triggerInfo: { flex: 1 },
  selectedName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectedMeta: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 2,
  },
  chevron: { color: '#64748b', fontSize: 12 },
  selectedDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    paddingHorizontal: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  optionsList: { gap: 12 },
  option: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  optionBase: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  optionTextSelected: { color: '#818cf8' },
  check: { color: '#818cf8', fontSize: 18, fontWeight: 'bold' },
  optionDesc: {
    fontSize: 12,
    color: '#64748b',
  },
});
