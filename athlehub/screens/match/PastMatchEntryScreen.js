import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const PastMatchEntryScreen = ({ navigation, route }) => {
  const { match, sport, config, players } = route.params;

  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [playerStats, setPlayerStats] = useState({});
  const [saving, setSaving] = useState(false);

  const updatePlayerStat = (playerId, statName, value) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statName]: parseInt(value) || 0
      }
    }));
  };

  const getStatFields = () => {
    switch (sport.name.toLowerCase()) {
      case 'basketball':
        return [
          { key: 'points', label: 'Points' },
          { key: 'assists', label: 'Assists' },
          { key: 'rebounds', label: 'Rebounds' }
        ];
      case 'football':
        return [
          { key: 'goals', label: 'Goals' },
          { key: 'assists', label: 'Assists' },
          { key: 'saves', label: 'Saves' }
        ];
      case 'badminton':
      case 'table tennis':
        return [
          { key: 'points', label: 'Points Won' },
          { key: 'aces', label: 'Aces' },
          { key: 'faults', label: 'Faults' }
        ];
      case 'volleyball':
        return [
          { key: 'points', label: 'Points' },
          { key: 'spikes', label: 'Spikes' },
          { key: 'digs', label: 'Digs' }
        ];
      default:
        return [{ key: 'points', label: 'Points' }];
    }
  };

  const saveMatch = async () => {
    if (!teamAScore || !teamBScore) {
      Alert.alert('Error', 'Please enter scores for both teams');
      return;
    }

    try {
      setSaving(true);

      // For V2 demo, we'll create a new match record with final scores
      // This ensures compatibility with our current custom Supabase client
      const matchData = {
        user_id: match.user_id,
        sport_id: match.sport_id,
        team_a_name: match.team_a_name,
        team_b_name: match.team_b_name,
        team_a_score: parseInt(teamAScore),
        team_b_score: parseInt(teamBScore),
        match_date: new Date(matchDate).toISOString(),
      };

      const { error: matchError } = await supabase
        .from('matches')
        .insert([matchData]);

      if (matchError) throw matchError;

      Alert.alert(
        'Success',
        'Match saved successfully!',
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('Main', { screen: 'Matches' }),
          },
          {
            text: 'Home',
            onPress: () => navigation.navigate('Main', { screen: 'Home' }),
            style: 'cancel',
          },
        ]
      );

    } catch (error) {
      console.error('Error saving match:', error);
      Alert.alert('Error', 'Failed to save match. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const PlayerStatsSection = ({ title, teamPlayers, teamColor }) => (
    <View style={styles.teamStatsSection}>
      <View style={[styles.teamHeader, { backgroundColor: teamColor }]}>
        <Text style={styles.teamTitle}>{title}</Text>
      </View>

      {teamPlayers.map((player) => (
        <View key={player.id} style={styles.playerStatsCard}>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.statsInputs}>
            {getStatFields().map((field) => (
              <View key={field.key} style={styles.statInput}>
                <Text style={styles.statLabel}>{field.label}</Text>
                <TextInput
                  style={styles.statTextInput}
                  value={playerStats[player.id]?.[field.key]?.toString() || ''}
                  onChangeText={(value) => updatePlayerStat(player.id, field.key, value)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Past Match</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Details</Text>

          <View style={styles.matchInfoCard}>
            <Text style={styles.matchInfoText}>
              {sport.name} • {config.matchType} • {config.competitiveMode ? 'Competitive' : 'Casual'}
            </Text>
          </View>
        </View>

        {/* Date Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Date</Text>
          <TextInput
            style={styles.dateInput}
            value={matchDate}
            onChangeText={setMatchDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Score Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Score</Text>

          <View style={styles.scoreInputContainer}>
            <View style={styles.teamScoreInput}>
              <Text style={styles.teamScoreLabel}>{match.team_a_name}</Text>
              <TextInput
                style={styles.scoreInput}
                value={teamAScore}
                onChangeText={setTeamAScore}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <Text style={styles.vsText}>VS</Text>

            <View style={styles.teamScoreInput}>
              <Text style={styles.teamScoreLabel}>{match.team_b_name}</Text>
              <TextInput
                style={styles.scoreInput}
                value={teamBScore}
                onChangeText={setTeamBScore}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        </View>

        {/* Player Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Stats (Optional)</Text>

          <PlayerStatsSection
            title={match.team_a_name}
            teamPlayers={players.teamA}
            teamColor="#007AFF"
          />

          <PlayerStatsSection
            title={match.team_b_name}
            teamPlayers={players.teamB}
            teamColor="#FF3B30"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveMatch}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Match'}
          </Text>
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1C1C1E',
  },
  matchInfoCard: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  matchInfoText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamScoreInput: {
    flex: 1,
    alignItems: 'center',
  },
  teamScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  scoreInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 80,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginHorizontal: 20,
  },
  teamStatsSection: {
    marginBottom: 20,
  },
  teamHeader: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  playerStatsCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  statsInputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statInput: {
    flex: 1,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statTextInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  saveContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default PastMatchEntryScreen;
