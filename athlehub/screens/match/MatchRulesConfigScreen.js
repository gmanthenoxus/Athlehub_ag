import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MatchRulesConfigScreen = ({ navigation, route }) => {
  const { sport, matchConfig, teamAName, teamBName, returnTo, nextStep } = route.params;

  // Check if this is for a past match (simplified flow)
  const isPastMatch = matchConfig.matchMode === 'past_entry';

  const [rulesConfig, setRulesConfig] = useState({
    // Timing Configuration
    matchDuration: 'standard', // 'standard', 'custom', 'unlimited'
    customDuration: 60, // minutes
    useGameClock: true,

    // Scoring Configuration
    scoringSystem: 'standard', // 'standard', 'streetball', 'custom'

    // Basketball specific
    shotClockEnabled: false,
    shotClockDuration: 24,
    quartersOrHalves: 'quarters', // 'quarters', 'halves'

    // Football specific
    extraTimeEnabled: false,
    penaltyShootoutEnabled: false,

    // Racket sports specific
    setsConfiguration: 'best_of_3', // 'best_of_3', 'best_of_5'
    pointsPerSet: 21,

    // General Rules
    timeoutsEnabled: true,
    timeoutsPerTeam: 2,
    substitutionsEnabled: true,
    maxSubstitutions: 'unlimited', // 'unlimited', '3', '5'

    // Competitive Features
    foulTrackingEnabled: matchConfig.competitiveMode,
    cardSystemEnabled: matchConfig.competitiveMode,
    overtimeEnabled: true,

    // Statistics Tracking
    statTrackingIntensity: matchConfig.competitiveMode ? 'intermediate' : 'basic',
    // 'basic', 'intermediate', 'advanced', 'professional'
  });

  useEffect(() => {
    // Set sport-specific defaults
    setSportSpecificDefaults();
  }, [sport]);

  const setSportSpecificDefaults = () => {
    const defaults = getSportDefaults(sport.name);
    setRulesConfig(prev => ({ ...prev, ...defaults }));
  };

  const getSportDefaults = (sportName) => {
    switch (sportName.toLowerCase()) {
      case 'basketball':
        return {
          matchDuration: 'standard',
          customDuration: 40, // 4x10 min quarters
          scoringSystem: 'standard', // 2s & 3s
          shotClockEnabled: matchConfig.competitiveMode,
          shotClockDuration: 24,
          quartersOrHalves: 'quarters',
          timeoutsPerTeam: 2,
          maxSubstitutions: 'unlimited',
        };

      case 'football':
        return {
          matchDuration: 'standard',
          customDuration: 90, // 2x45 min halves
          extraTimeEnabled: false,
          penaltyShootoutEnabled: false,
          timeoutsPerTeam: 0,
          maxSubstitutions: matchConfig.competitiveMode ? '5' : 'unlimited',
        };

      case 'badminton':
        return {
          setsConfiguration: 'best_of_3',
          pointsPerSet: 21,
          timeoutsPerTeam: 0,
          maxSubstitutions: 'unlimited',
        };

      case 'table tennis':
        return {
          setsConfiguration: 'best_of_5',
          pointsPerSet: 11,
          timeoutsPerTeam: 1,
          maxSubstitutions: 'unlimited',
        };

      case 'volleyball':
        return {
          setsConfiguration: 'best_of_5',
          pointsPerSet: 25,
          timeoutsPerTeam: 2,
          maxSubstitutions: matchConfig.competitiveMode ? '6' : 'unlimited',
        };

      default:
        return {};
    }
  };

  const getStatTrackingDescription = (intensity) => {
    switch (intensity) {
      case 'basic':
        return 'Essential stats only (points, goals, basic match data)';
      case 'intermediate':
        return 'Key gameplay stats (assists, rebounds, shots, etc.)';
      case 'advanced':
        return 'Detailed efficiency metrics and calculated percentages';
      case 'professional':
        return 'Comprehensive analytics with advanced performance metrics';
      default:
        return '';
    }
  };

  const proceedToPlayerSetup = () => {
    const finalConfig = {
      ...matchConfig,
      rules: rulesConfig,
    };

    if (returnTo === 'EnhancedMatchSetup') {
      // Return to the enhanced setup flow with updated config
      navigation.navigate('EnhancedMatchSetup', {
        sport,
        initialConfig: finalConfig,
        teamAName,
        teamBName,
        startAtStep: nextStep || 2,
      });
    } else {
      // Direct navigation to player setup (fallback)
      navigation.navigate('PlayerSetup', {
        sport,
        matchConfig: finalConfig,
        teamAName,
        teamBName,
      });
    }
  };

  const ConfigSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ConfigOption = ({ title, subtitle, value, onValueChange, type = 'switch' }) => (
    <View style={styles.configOption}>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor="white"
        />
      )}
    </View>
  );

  const SelectionOption = ({ title, options, selectedValue, onSelect }) => (
    <View style={styles.selectionSection}>
      <Text style={styles.selectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              selectedValue === option.value && styles.selectedOptionButton
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.optionButtonText,
              selectedValue === option.value && styles.selectedOptionButtonText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBasketballConfig = () => (
    <>
      <SelectionOption
        title="Game Format"
        options={[
          { value: 'quarters', label: '4 Quarters' },
          { value: 'halves', label: '2 Halves' },
        ]}
        selectedValue={rulesConfig.quartersOrHalves}
        onSelect={(value) => setRulesConfig(prev => ({ ...prev, quartersOrHalves: value }))}
      />

      <SelectionOption
        title="Scoring System"
        options={[
          { value: 'standard', label: '2s & 3s' },
          { value: 'streetball', label: '1s & 2s' },
        ]}
        selectedValue={rulesConfig.scoringSystem}
        onSelect={(value) => setRulesConfig(prev => ({ ...prev, scoringSystem: value }))}
      />

      {matchConfig.competitiveMode && (
        <ConfigOption
          title="Shot Clock"
          subtitle={`${rulesConfig.shotClockDuration} seconds per possession`}
          value={rulesConfig.shotClockEnabled}
          onValueChange={(value) => setRulesConfig(prev => ({ ...prev, shotClockEnabled: value }))}
        />
      )}
    </>
  );

  const renderFootballConfig = () => (
    <>
      {matchConfig.competitiveMode && (
        <>
          <ConfigOption
            title="Extra Time"
            subtitle="30 minutes additional time if tied"
            value={rulesConfig.extraTimeEnabled}
            onValueChange={(value) => setRulesConfig(prev => ({ ...prev, extraTimeEnabled: value }))}
          />

          <ConfigOption
            title="Penalty Shootout"
            subtitle="Decide winner if still tied after extra time"
            value={rulesConfig.penaltyShootoutEnabled}
            onValueChange={(value) => setRulesConfig(prev => ({ ...prev, penaltyShootoutEnabled: value }))}
          />
        </>
      )}

      <SelectionOption
        title="Substitutions"
        options={[
          { value: 'unlimited', label: 'Unlimited' },
          { value: '3', label: '3 per team' },
          { value: '5', label: '5 per team' },
        ]}
        selectedValue={rulesConfig.maxSubstitutions}
        onSelect={(value) => setRulesConfig(prev => ({ ...prev, maxSubstitutions: value }))}
      />
    </>
  );

  const renderRacketSportsConfig = () => (
    <>
      <SelectionOption
        title="Match Format"
        options={[
          { value: 'best_of_3', label: 'Best of 3 Sets' },
          { value: 'best_of_5', label: 'Best of 5 Sets' },
        ]}
        selectedValue={rulesConfig.setsConfiguration}
        onSelect={(value) => setRulesConfig(prev => ({ ...prev, setsConfiguration: value }))}
      />

      <SelectionOption
        title="Points per Set"
        options={[
          { value: 11, label: '11 Points' },
          { value: 15, label: '15 Points' },
          { value: 21, label: '21 Points' },
        ]}
        selectedValue={rulesConfig.pointsPerSet}
        onSelect={(value) => setRulesConfig(prev => ({ ...prev, pointsPerSet: value }))}
      />
    </>
  );

  const renderVolleyballConfig = () => (
    <>
      <SelectionOption
        title="Match Format"
        options={[
          { value: 'best_of_3', label: 'Best of 3 Sets' },
          { value: 'best_of_5', label: 'Best of 5 Sets' },
        ]}
        selectedValue={rulesConfig.setsConfiguration}
        onSelect={(value) => setRulesConfig(prev => ({ ...prev, setsConfiguration: value }))}
      />

      <SelectionOption
        title="Points per Set"
        options={[
          { value: 21, label: '21 Points' },
          { value: 25, label: '25 Points' },
        ]}
        selectedValue={rulesConfig.pointsPerSet}
        onSelect={(value) => setRulesConfig(prev => ({ ...prev, pointsPerSet: value }))}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Rules</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isPastMatch ? (
          // Simplified configuration for past matches
          <>
            <ConfigSection title="Match Statistics">
              <Text style={styles.sectionDescription}>
                Configure how detailed you want the statistics tracking for this past match.
              </Text>

              <SelectionOption
                title="Statistics Detail Level"
                options={[
                  { value: 'basic', label: 'Basic' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
                selectedValue={rulesConfig.statTrackingIntensity}
                onSelect={(value) => setRulesConfig(prev => ({ ...prev, statTrackingIntensity: value }))}
              />

              <View style={styles.intensityDescription}>
                <Text style={styles.intensityText}>
                  {getStatTrackingDescription(rulesConfig.statTrackingIntensity)}
                </Text>
              </View>
            </ConfigSection>

            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>What You'll Track</Text>
              <Text style={styles.summaryText}>
                • Final scores and match result
              </Text>
              <Text style={styles.summaryText}>
                • {rulesConfig.statTrackingIntensity} level player statistics
              </Text>
              <Text style={styles.summaryText}>
                • Match date and duration
              </Text>
            </View>
          </>
        ) : (
          // Full configuration for real-time matches
          <>
            {/* Sport-Specific Configuration */}
            <ConfigSection title={`${sport.name} Configuration`}>
              {sport.name.toLowerCase() === 'basketball' && renderBasketballConfig()}
              {sport.name.toLowerCase() === 'football' && renderFootballConfig()}
              {(sport.name.toLowerCase() === 'badminton' || sport.name.toLowerCase() === 'table tennis') && renderRacketSportsConfig()}
              {sport.name.toLowerCase() === 'volleyball' && renderVolleyballConfig()}
            </ConfigSection>

            {/* General Rules */}
            <ConfigSection title="General Rules">
              <ConfigOption
                title="Game Timer"
                subtitle="Track match duration with live timer"
                value={rulesConfig.useGameClock}
                onValueChange={(value) => setRulesConfig(prev => ({ ...prev, useGameClock: value }))}
              />

              {rulesConfig.timeoutsPerTeam > 0 && (
                <ConfigOption
                  title="Timeouts"
                  subtitle={`${rulesConfig.timeoutsPerTeam} per team`}
                  value={rulesConfig.timeoutsEnabled}
                  onValueChange={(value) => setRulesConfig(prev => ({ ...prev, timeoutsEnabled: value }))}
                />
              )}

              <ConfigOption
                title="Overtime"
                subtitle="Additional time if match is tied"
                value={rulesConfig.overtimeEnabled}
                onValueChange={(value) => setRulesConfig(prev => ({ ...prev, overtimeEnabled: value }))}
              />
            </ConfigSection>

            {/* Statistics Tracking */}
            <ConfigSection title="Statistics Tracking">
              <SelectionOption
                title="Tracking Intensity"
                options={[
                  { value: 'basic', label: 'Basic' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                  { value: 'professional', label: 'Professional' },
                ]}
                selectedValue={rulesConfig.statTrackingIntensity}
                onSelect={(value) => setRulesConfig(prev => ({ ...prev, statTrackingIntensity: value }))}
              />

              <View style={styles.intensityDescription}>
                <Text style={styles.intensityText}>
                  {getStatTrackingDescription(rulesConfig.statTrackingIntensity)}
                </Text>
              </View>
            </ConfigSection>

            {/* Competitive Features */}
            {matchConfig.competitiveMode && (
              <ConfigSection title="Competitive Features">
                <ConfigOption
                  title="Foul Tracking"
                  subtitle="Track personal and team fouls"
                  value={rulesConfig.foulTrackingEnabled}
                  onValueChange={(value) => setRulesConfig(prev => ({ ...prev, foulTrackingEnabled: value }))}
                />

                {(sport.name.toLowerCase() === 'football') && (
                  <ConfigOption
                    title="Card System"
                    subtitle="Yellow and red card enforcement"
                    value={rulesConfig.cardSystemEnabled}
                    onValueChange={(value) => setRulesConfig(prev => ({ ...prev, cardSystemEnabled: value }))}
                  />
                )}
              </ConfigSection>
            )}

            {/* Configuration Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Configuration Summary</Text>
              <Text style={styles.summaryText}>
                • {matchConfig.competitiveMode ? 'Competitive' : 'Casual'} mode
              </Text>
              <Text style={styles.summaryText}>
                • {rulesConfig.statTrackingIntensity} statistics tracking
              </Text>
              <Text style={styles.summaryText}>
                • {rulesConfig.useGameClock ? 'Timed' : 'Untimed'} match
              </Text>
              {sport.name.toLowerCase() === 'basketball' && (
                <Text style={styles.summaryText}>
                  • {rulesConfig.scoringSystem === 'standard' ? '2s & 3s' : '1s & 2s'} scoring
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.continueContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={proceedToPlayerSetup}>
          <Text style={styles.continueButtonText}>Continue to Player Setup</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1C1C1E',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  configOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  selectionSection: {
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOptionButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  selectedOptionButtonText: {
    color: '#007AFF',
  },
  intensityDescription: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  intensityText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#F2F2F7',
    margin: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  summaryText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  continueContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});

export default MatchRulesConfigScreen;
