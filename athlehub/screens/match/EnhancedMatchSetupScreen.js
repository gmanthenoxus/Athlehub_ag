import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SportConfig from '../../components/match/SportConfig';
import PlayerManager from '../../components/match/PlayerManager';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const EnhancedMatchSetupScreen = ({ navigation, route }) => {
  const { sport, initialConfig, startAtStep, teamAName: initialTeamAName, teamBName: initialTeamBName } = route.params;
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(startAtStep || 0);
  const [matchConfig, setMatchConfig] = useState(initialConfig || {
    matchType: 'single',
    teamSize: '5v5',
    scoringSystem: 'standard',
    competitiveMode: false,
    matchMode: 'real_time', // or 'past_entry'
  });

  const [teamAName, setTeamAName] = useState(initialTeamAName || 'Team A');
  const [teamBName, setTeamBName] = useState(initialTeamBName || 'Team B');
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [suggestedPlayers, setSuggestedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: 'Sport Config', component: 'config' },
    { title: 'Match Mode', component: 'mode' },
    { title: 'Teams & Players', component: 'players' },
    { title: 'Review', component: 'review' },
  ];

  useEffect(() => {
    loadSuggestedPlayers();
  }, []);

  const loadSuggestedPlayers = async () => {
    try {
      // Load players that have been used before
      // Note: Our custom client doesn't support complex queries yet
      // For now, we'll just set empty array - this will be enhanced in future updates
      setSuggestedPlayers([]);
    } catch (error) {
      console.error('Error loading suggested players:', error);
    }
  };

  const getMaxPlayersPerTeam = () => {
    const teamSizeConfig = matchConfig.teamSize;
    if (teamSizeConfig.includes('v')) {
      return parseInt(teamSizeConfig.split('v')[0]);
    }
    return 5; // default
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Sport Config
        return matchConfig.matchType && matchConfig.teamSize && matchConfig.scoringSystem;
      case 1: // Match Mode
        return true; // Always valid
      case 2: // Teams & Players
        const minPlayers = 1;
        return teamAPlayers.length >= minPlayers && teamBPlayers.length >= minPlayers;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      Alert.alert('Incomplete', 'Please complete all required fields before continuing.');
      return;
    }

    // After Match Mode step, navigate to Rules Configuration
    if (currentStep === 1) {
      navigation.navigate('MatchRulesConfig', {
        sport,
        matchConfig,
        teamAName,
        teamBName,
        returnTo: 'EnhancedMatchSetup',
        nextStep: 2, // Continue to Players step
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      startMatch();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const startMatch = async () => {
    try {
      setLoading(true);

      // For V2 demo, we'll create a simplified match using V1 approach
      // This ensures compatibility with our current custom Supabase client
      const matchData = {
        user_id: user.id,
        sport_id: sport.id,
        team_a_name: teamAName,
        team_b_name: teamBName,
        team_a_score: 0,
        team_b_score: 0,
        match_date: new Date().toISOString(),
      };

      const { data: matchResult, error: matchError } = await supabase
        .from('matches')
        .insert([matchData]);

      if (matchError) throw matchError;

      // Create a mock match object for navigation
      const match = {
        id: Date.now().toString(), // Temporary ID for demo
        ...matchData,
        created_at: new Date().toISOString(),
      };

      // Navigate to appropriate screen based on match mode
      if (matchConfig.matchMode === 'real_time') {
        navigation.navigate('LiveMatch', {
          match,
          sport,
          config: matchConfig,
          players: { teamA: teamAPlayers, teamB: teamBPlayers }
        });
      } else {
        navigation.navigate('PastMatchEntry', {
          match,
          sport,
          config: matchConfig,
          players: { teamA: teamAPlayers, teamB: teamBPlayers }
        });
      }

    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'Failed to create match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <SportConfig
            sport={sport}
            config={matchConfig}
            onConfigChange={setMatchConfig}
          />
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose Match Mode</Text>

            <TouchableOpacity
              style={[
                styles.modeOption,
                matchConfig.matchMode === 'real_time' && styles.selectedMode
              ]}
              onPress={() => setMatchConfig({ ...matchConfig, matchMode: 'real_time' })}
            >
              <Ionicons name="play-circle" size={32} color="#007AFF" />
              <View style={styles.modeContent}>
                <Text style={styles.modeTitle}>Real-Time Match</Text>
                <Text style={styles.modeDescription}>
                  Track the match live with timer, live stats, and real-time scoring
                </Text>
              </View>
              {matchConfig.matchMode === 'real_time' && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeOption,
                matchConfig.matchMode === 'past_entry' && styles.selectedMode
              ]}
              onPress={() => setMatchConfig({ ...matchConfig, matchMode: 'past_entry' })}
            >
              <Ionicons name="document-text" size={32} color="#FF9500" />
              <View style={styles.modeContent}>
                <Text style={styles.modeTitle}>Log Past Match</Text>
                <Text style={styles.modeDescription}>
                  Enter final scores and stats for a match that already happened
                </Text>
              </View>
              {matchConfig.matchMode === 'past_entry' && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <PlayerManager
            teamAPlayers={teamAPlayers}
            teamBPlayers={teamBPlayers}
            onPlayersChange={(teamA, teamB) => {
              setTeamAPlayers(teamA);
              setTeamBPlayers(teamB);
            }}
            maxPlayersPerTeam={getMaxPlayersPerTeam()}
            competitiveMode={matchConfig.competitiveMode}
            suggestedPlayers={suggestedPlayers}
            location={matchConfig.location}
          />
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review Match Setup</Text>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Sport:</Text>
              <Text style={styles.reviewValue}>{sport.name}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Match Type:</Text>
              <Text style={styles.reviewValue}>{matchConfig.matchType}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Team Size:</Text>
              <Text style={styles.reviewValue}>{matchConfig.teamSize}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Mode:</Text>
              <Text style={styles.reviewValue}>
                {matchConfig.matchMode === 'real_time' ? 'Real-Time Match' : 'Log Past Match'}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Competitive Mode:</Text>
              <Text style={styles.reviewValue}>
                {matchConfig.competitiveMode ? 'Yes' : 'No'}
              </Text>
            </View>

            {matchConfig.location && (
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Location:</Text>
                <Text style={styles.reviewValue}>
                  {matchConfig.location.name}
                </Text>
              </View>
            )}

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Team A Players:</Text>
              <Text style={styles.reviewValue}>
                {teamAPlayers.map(p => p.name).join(', ')}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Team B Players:</Text>
              <Text style={styles.reviewValue}>
                {teamBPlayers.map(p => p.name).join(', ')}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={previousStep}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup Match</Text>
        <Text style={styles.stepIndicator}>{currentStep + 1} of {steps.length}</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive
            ]}>
              <Text style={[
                styles.progressNumber,
                index <= currentStep && styles.progressNumberActive
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.progressLabel,
              index === currentStep && styles.progressLabelActive
            ]}>
              {step.title}
            </Text>
          </View>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            !validateCurrentStep() && styles.fabDisabled
          ]}
          onPress={nextStep}
          disabled={loading || !validateCurrentStep()}
        >
          <Text style={styles.fabText}>
            {currentStep === steps.length - 1 ? 'Start Match' : 'Continue'}
          </Text>
          <Ionicons
            name={currentStep === steps.length - 1 ? 'play' : 'arrow-forward'}
            size={20}
            color="white"
          />
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
  stepIndicator: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  progressNumberActive: {
    color: 'white',
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedMode: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  modeContent: {
    flex: 1,
    marginLeft: 16,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  reviewSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'right',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0.1,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});

export default EnhancedMatchSetupScreen;
