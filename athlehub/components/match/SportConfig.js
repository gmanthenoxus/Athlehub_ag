import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationSelector from './LocationSelector';

const SportConfig = ({ sport, onConfigChange, config = {} }) => {
  if (!sport) return null;

  const sportConfigs = {
    basketball: {
      matchTypes: [
        { id: 'single', name: 'Single Game', description: 'One game to final score' },
        { id: 'tournament', name: 'Tournament', description: 'Multiple games bracket' }
      ],
      teamSizes: [
        { id: '1v1', name: '1v1', players: 1 },
        { id: '2v2', name: '2v2', players: 2 },
        { id: '3v3', name: '3v3', players: 3 },
        { id: '5v5', name: '5v5', players: 5 }
      ],
      scoringSystems: [
        { id: 'standard', name: '2s & 3s', description: 'Standard NBA/FIBA scoring' },
        { id: 'streetball', name: '1s & 2s', description: 'Streetball scoring system' }
      ]
    },
    football: {
      matchTypes: [
        { id: 'single', name: 'Single Match', description: 'One match to final score' },
        { id: 'tournament', name: 'Tournament', description: 'Multiple matches bracket' }
      ],
      teamSizes: [
        { id: '1v1', name: '1v1', players: 1 },
        { id: '5v5', name: '5v5', players: 5 },
        { id: '7v7', name: '7v7', players: 7 },
        { id: '11v11', name: '11v11', players: 11 }
      ],
      scoringSystems: [
        { id: 'standard', name: 'Goals', description: 'Standard goal scoring' }
      ]
    },
    badminton: {
      matchTypes: [
        { id: 'single', name: 'Single Game', description: 'One game to final score' },
        { id: 'set_based', name: 'Set Match', description: 'Best of 3 or 5 sets' },
        { id: 'tournament', name: 'Tournament', description: 'Multiple matches bracket' }
      ],
      teamSizes: [
        { id: '1v1', name: 'Singles', players: 1 },
        { id: '2v2', name: 'Doubles', players: 2 }
      ],
      scoringSystems: [
        { id: 'standard', name: 'Rally Scoring', description: 'Standard badminton scoring' }
      ]
    },
    'table-tennis': {
      matchTypes: [
        { id: 'single', name: 'Single Game', description: 'One game to final score' },
        { id: 'set_based', name: 'Set Match', description: 'Best of 3 or 5 sets' },
        { id: 'tournament', name: 'Tournament', description: 'Multiple matches bracket' }
      ],
      teamSizes: [
        { id: '1v1', name: 'Singles', players: 1 },
        { id: '2v2', name: 'Doubles', players: 2 }
      ],
      scoringSystems: [
        { id: 'standard', name: 'Rally Scoring', description: 'Standard table tennis scoring' }
      ]
    },
    volleyball: {
      matchTypes: [
        { id: 'single', name: 'Single Game', description: 'One game to final score' },
        { id: 'set_based', name: 'Set Match', description: 'Best of 3 or 5 sets' },
        { id: 'tournament', name: 'Tournament', description: 'Multiple matches bracket' }
      ],
      teamSizes: [
        { id: '6v6', name: '6v6', players: 6 }
      ],
      scoringSystems: [
        { id: 'standard', name: 'Rally Scoring', description: 'Standard volleyball scoring' }
      ]
    }
  };

  const currentConfig = sportConfigs[sport.icon] || sportConfigs.basketball;

  const ConfigSection = ({ title, options, selectedValue, onSelect, keyName }) => (
    <View style={styles.configSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionButton,
            selectedValue === option.id && styles.selectedOption
          ]}
          onPress={() => onConfigChange({ ...config, [keyName]: option.id })}
        >
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionTitle,
              selectedValue === option.id && styles.selectedText
            ]}>
              {option.name}
            </Text>
            {option.description && (
              <Text style={[
                styles.optionDescription,
                selectedValue === option.id && styles.selectedText
              ]}>
                {option.description}
              </Text>
            )}
          </View>
          {selectedValue === option.id && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configure {sport.name} Match</Text>

      <ConfigSection
        title="Match Type"
        options={currentConfig.matchTypes}
        selectedValue={config.matchType}
        onSelect={(value) => onConfigChange({ ...config, matchType: value })}
        keyName="matchType"
      />

      <ConfigSection
        title="Team Size"
        options={currentConfig.teamSizes}
        selectedValue={config.teamSize}
        onSelect={(value) => onConfigChange({ ...config, teamSize: value })}
        keyName="teamSize"
      />

      <ConfigSection
        title="Scoring System"
        options={currentConfig.scoringSystems}
        selectedValue={config.scoringSystem}
        onSelect={(value) => onConfigChange({ ...config, scoringSystem: value })}
        keyName="scoringSystem"
      />

      {/* Location Selection */}
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        <LocationSelector
          sport={sport}
          selectedLocation={config.location}
          onLocationSelect={(location) => onConfigChange({ ...config, location })}
          placeholder={`Search for ${sport.name.toLowerCase()} courts...`}
        />
      </View>

      {/* Competitive Mode Toggle */}
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Match Mode</Text>
        <TouchableOpacity
          style={[
            styles.optionButton,
            config.competitiveMode && styles.selectedOption
          ]}
          onPress={() => onConfigChange({
            ...config,
            competitiveMode: !config.competitiveMode
          })}
        >
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionTitle,
              config.competitiveMode && styles.selectedText
            ]}>
              Competitive Mode
            </Text>
            <Text style={[
              styles.optionDescription,
              config.competitiveMode && styles.selectedText
            ]}>
              Strict rules, player numbers required, stats tracked
            </Text>
          </View>
          <Ionicons
            name={config.competitiveMode ? "toggle" : "toggle-outline"}
            size={24}
            color={config.competitiveMode ? "#007AFF" : "#8E8E93"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  configSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  selectedText: {
    color: '#007AFF',
  },
});

export default SportConfig;
