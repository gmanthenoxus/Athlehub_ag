import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LiveMatchScreen = ({ navigation, route }) => {
  const { match, sport, config, players } = route.params;
  
  const [gameTime, setGameTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setGameTime(time => time + 1);
      }, 1000);
    } else if (!isRunning && gameTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setGameTime(0);
    setIsRunning(false);
  };

  const addScore = (team, points = 1) => {
    if (team === 'A') {
      setTeamAScore(prev => prev + points);
    } else {
      setTeamBScore(prev => prev + points);
    }
  };

  const subtractScore = (team, points = 1) => {
    if (team === 'A') {
      setTeamAScore(prev => Math.max(0, prev - points));
    } else {
      setTeamBScore(prev => Math.max(0, prev - points));
    }
  };

  const endMatch = () => {
    Alert.alert(
      'End Match',
      'Are you sure you want to end this match?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Match', 
          style: 'destructive',
          onPress: () => {
            // TODO: Save final scores and navigate to match summary
            navigation.navigate('Main', { screen: 'Matches' });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sport.name} - Live Match</Text>
        <TouchableOpacity onPress={endMatch}>
          <Text style={styles.endButton}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Game Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(gameTime)}</Text>
        <View style={styles.timerControls}>
          <TouchableOpacity style={styles.timerButton} onPress={toggleTimer}>
            <Ionicons 
              name={isRunning ? "pause" : "play"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        {/* Team A */}
        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{match.team_a_name}</Text>
          <Text style={styles.score}>{teamAScore}</Text>
          <View style={styles.scoreControls}>
            <TouchableOpacity 
              style={styles.scoreButton} 
              onPress={() => addScore('A', 1)}
            >
              <Text style={styles.scoreButtonText}>+1</Text>
            </TouchableOpacity>
            {sport.name === 'Basketball' && (
              <>
                <TouchableOpacity 
                  style={styles.scoreButton} 
                  onPress={() => addScore('A', 2)}
                >
                  <Text style={styles.scoreButtonText}>+2</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.scoreButton} 
                  onPress={() => addScore('A', 3)}
                >
                  <Text style={styles.scoreButtonText}>+3</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={[styles.scoreButton, styles.subtractButton]} 
              onPress={() => subtractScore('A', 1)}
            >
              <Text style={styles.scoreButtonText}>-1</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Team B */}
        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{match.team_b_name}</Text>
          <Text style={styles.score}>{teamBScore}</Text>
          <View style={styles.scoreControls}>
            <TouchableOpacity 
              style={styles.scoreButton} 
              onPress={() => addScore('B', 1)}
            >
              <Text style={styles.scoreButtonText}>+1</Text>
            </TouchableOpacity>
            {sport.name === 'Basketball' && (
              <>
                <TouchableOpacity 
                  style={styles.scoreButton} 
                  onPress={() => addScore('B', 2)}
                >
                  <Text style={styles.scoreButtonText}>+2</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.scoreButton} 
                  onPress={() => addScore('B', 3)}
                >
                  <Text style={styles.scoreButtonText}>+3</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={[styles.scoreButton, styles.subtractButton]} 
              onPress={() => subtractScore('B', 1)}
            >
              <Text style={styles.scoreButtonText}>-1</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Player Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <Text style={styles.comingSoon}>
          Player stat tracking coming soon...
        </Text>
      </View>

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <Text style={styles.matchInfoText}>
          Mode: {config.competitiveMode ? 'Competitive' : 'Casual'}
        </Text>
        <Text style={styles.matchInfoText}>
          Type: {config.matchType}
        </Text>
        <Text style={styles.matchInfoText}>
          Players: {players.teamA.length} vs {players.teamB.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  endButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2C2C2E',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  timerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  scoreControls: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  scoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  subtractButton: {
    backgroundColor: '#FF3B30',
  },
  scoreButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  vsContainer: {
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#2C2C2E',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  comingSoon: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  matchInfo: {
    padding: 20,
    backgroundColor: '#2C2C2E',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  matchInfoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
});

export default LiveMatchScreen;
