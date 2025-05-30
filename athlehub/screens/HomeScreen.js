import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text, Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleStartMatch = () => {
    navigation.navigate('MatchCreation', { screen: 'SelectSport' });
  };

  const handleViewHistory = () => {
    navigation.navigate('Matches');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h2 style={styles.welcomeText}>
          Welcome, {user?.email?.split('@')[0] || 'Athlete'}!
        </Text>
        <Text style={styles.subtitle}>
          Track your matches and celebrate your wins
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <Card containerStyle={styles.card}>
          <Card.Title>Start a New Match</Card.Title>
          <Card.Divider />
          <View style={styles.cardContent}>
            <Ionicons name="add-circle" size={60} color="#4361ee" />
            <Text style={styles.cardText}>
              Log a new match by selecting a sport, entering teams, and recording the score.
            </Text>
          </View>
          <Button
            title="Start Match"
            buttonStyle={styles.button}
            onPress={handleStartMatch}
            icon={
              <Ionicons
                name="play"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
          />
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>View Match History</Card.Title>
          <Card.Divider />
          <View style={styles.cardContent}>
            <Ionicons name="list" size={60} color="#4361ee" />
            <Text style={styles.cardText}>
              See all your previously logged matches and track your progress over time.
            </Text>
          </View>
          <Button
            title="View History"
            buttonStyle={styles.button}
            onPress={handleViewHistory}
            icon={
              <Ionicons
                name="time"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
          />
        </Card>

        {/* V3 Quick Actions */}
        <Card containerStyle={styles.card}>
          <Card.Title>Compete & Track Progress</Card.Title>
          <Card.Divider />
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('TournamentList')}
            >
              <Ionicons name="trophy-outline" size={32} color="#007AFF" />
              <Text style={styles.quickActionText}>Tournaments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Ionicons name="podium-outline" size={32} color="#007AFF" />
              <Text style={styles.quickActionText}>Leaderboards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('PlayerProfile')}
            >
              <Ionicons name="medal-outline" size={32} color="#007AFF" />
              <Text style={styles.quickActionText}>My Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  welcomeText: {
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    padding: 10,
  },
  card: {
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#666',
  },
  button: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    marginTop: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
