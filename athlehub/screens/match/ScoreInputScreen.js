import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ScoreInputScreen({ route, navigation }) {
  const { sport, teamA, teamB } = route.params;
  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleSaveMatch = async () => {
    // Validate scores
    if (!teamAScore.trim() || !teamBScore.trim()) {
      Alert.alert('Error', 'Please enter scores for both teams');
      return;
    }

    const scoreA = parseInt(teamAScore);
    const scoreB = parseInt(teamBScore);

    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      Alert.alert('Error', 'Please enter valid scores (positive numbers)');
      return;
    }

    try {
      setSaving(true);

      // Save match to database
      const { error } = await supabase
        .from('matches')
        .insert([
          {
            user_id: user.id,
            sport_id: sport.id,
            team_a_name: teamA,
            team_b_name: teamB,
            team_a_score: scoreA,
            team_b_score: scoreB,
            match_date: new Date(),
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Match saved successfully!',
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('Matches'),
          },
          {
            text: 'Home',
            onPress: () => navigation.navigate('Home'),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save match');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Enter Final Score</Text>
        <Text style={styles.sportName}>
          <Ionicons
            name="trophy-outline"
            size={18}
            color="#4361ee"
          /> {sport.name}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.teamsContainer}>
          <View style={styles.teamSection}>
            <Text style={styles.teamName}>{teamA}</Text>
            <Input
              placeholder="Score"
              value={teamAScore}
              onChangeText={setTeamAScore}
              keyboardType="number-pad"
              containerStyle={styles.scoreInput}
              inputStyle={styles.scoreInputText}
            />
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.teamSection}>
            <Text style={styles.teamName}>{teamB}</Text>
            <Input
              placeholder="Score"
              value={teamBScore}
              onChangeText={setTeamBScore}
              keyboardType="number-pad"
              containerStyle={styles.scoreInput}
              inputStyle={styles.scoreInputText}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {saving ? (
            <ActivityIndicator size="large" color="#4361ee" />
          ) : (
            <Button
              title="Save Match"
              onPress={handleSaveMatch}
              buttonStyle={styles.saveButton}
              icon={
                <Ionicons
                  name="save-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
              }
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    color: '#333',
    marginBottom: 5,
  },
  sportName: {
    fontSize: 16,
    color: '#4361ee',
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  teamSection: {
    flex: 2,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoreInput: {
    width: 100,
  },
  scoreInputText: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  vsText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
    width: '100%',
  },
});
