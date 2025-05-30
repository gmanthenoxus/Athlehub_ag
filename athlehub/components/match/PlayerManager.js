import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationService from '../../services/locationService';

const PlayerManager = ({
  teamAPlayers = [],
  teamBPlayers = [],
  onPlayersChange,
  maxPlayersPerTeam = 5,
  competitiveMode = false,
  suggestedPlayers = [],
  location = null
}) => {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('team_a');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  useEffect(() => {
    loadLocationSuggestions();
  }, [location]);

  const loadLocationSuggestions = async () => {
    if (location && location.id) {
      try {
        const suggestions = await LocationService.getSuggestedPlayersForLocation(location.id);
        setLocationSuggestions(suggestions);
      } catch (error) {
        console.error('Error loading location suggestions:', error);
      }
    }
  };

  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    if (competitiveMode && !newPlayerNumber.trim()) {
      Alert.alert('Error', 'Player number is required in competitive mode');
      return;
    }

    const currentTeamPlayers = newPlayerTeam === 'team_a' ? teamAPlayers : teamBPlayers;

    if (currentTeamPlayers.length >= maxPlayersPerTeam) {
      Alert.alert('Error', `Maximum ${maxPlayersPerTeam} players per team`);
      return;
    }

    // Check for duplicate jersey numbers in competitive mode (only within the same team)
    if (competitiveMode && newPlayerNumber) {
      const currentTeamPlayers = newPlayerTeam === 'team_a' ? teamAPlayers : teamBPlayers;
      const numberExists = currentTeamPlayers.some(p => p.jerseyNumber === newPlayerNumber);
      if (numberExists) {
        Alert.alert('Error', 'This jersey number is already taken by a teammate');
        return;
      }
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      jerseyNumber: competitiveMode ? newPlayerNumber : null,
      isSubstitute: false,
    };

    if (newPlayerTeam === 'team_a') {
      onPlayersChange([...teamAPlayers, newPlayer], teamBPlayers);
    } else {
      onPlayersChange(teamAPlayers, [...teamBPlayers, newPlayer]);
    }

    setNewPlayerName('');
    setNewPlayerNumber('');
    setShowAddPlayer(false);
  };

  const removePlayer = (playerId, team) => {
    if (team === 'team_a') {
      onPlayersChange(
        teamAPlayers.filter(p => p.id !== playerId),
        teamBPlayers
      );
    } else {
      onPlayersChange(
        teamAPlayers,
        teamBPlayers.filter(p => p.id !== playerId)
      );
    }
  };

  const addSuggestedPlayer = (suggestedPlayer, team) => {
    const currentTeamPlayers = team === 'team_a' ? teamAPlayers : teamBPlayers;

    if (currentTeamPlayers.length >= maxPlayersPerTeam) {
      Alert.alert('Error', `Maximum ${maxPlayersPerTeam} players per team`);
      return;
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: suggestedPlayer.name,
      jerseyNumber: null,
      isSubstitute: false,
    };

    if (team === 'team_a') {
      onPlayersChange([...teamAPlayers, newPlayer], teamBPlayers);
    } else {
      onPlayersChange(teamAPlayers, [...teamBPlayers, newPlayer]);
    }
  };

  const PlayerCard = ({ player, team, onRemove }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        {competitiveMode && player.jerseyNumber && (
          <Text style={styles.playerNumber}>#{player.jerseyNumber}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onRemove(player.id, team)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const TeamSection = ({ title, players, team, teamColor }) => (
    <View style={styles.teamSection}>
      <View style={[styles.teamHeader, { backgroundColor: teamColor }]}>
        <Text style={styles.teamTitle}>{title}</Text>
        <Text style={styles.playerCount}>
          {players.length}/{maxPlayersPerTeam}
        </Text>
      </View>

      <View style={styles.playersContainer}>
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            team={team}
            onRemove={removePlayer}
          />
        ))}

        {players.length < maxPlayersPerTeam && (
          <TouchableOpacity
            style={styles.addPlayerButton}
            onPress={() => {
              setNewPlayerTeam(team);
              setShowAddPlayer(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addPlayerText}>Add Player</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Location-based Suggested Players */}
      {locationSuggestions.length > 0 && players.length < maxPlayersPerTeam && (
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>
            Players at {location?.name || 'this location'}:
          </Text>
          <View style={styles.suggestedPlayers}>
            {locationSuggestions.slice(0, 3).map((suggested, index) => (
              <TouchableOpacity
                key={`location-${index}`}
                style={styles.suggestedPlayer}
                onPress={() => addSuggestedPlayer(suggested, team)}
              >
                <Text style={styles.suggestedPlayerName}>{suggested.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* General Suggested Players */}
      {suggestedPlayers.length > 0 && players.length < maxPlayersPerTeam && (
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>Recent Players:</Text>
          <View style={styles.suggestedPlayers}>
            {suggestedPlayers.slice(0, 3).map((suggested) => (
              <TouchableOpacity
                key={suggested.id || suggested.name}
                style={styles.suggestedPlayer}
                onPress={() => addSuggestedPlayer(suggested, team)}
              >
                <Text style={styles.suggestedPlayerName}>{suggested.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Players</Text>

      <TeamSection
        title="Team A"
        players={teamAPlayers}
        team="team_a"
        teamColor="#007AFF"
      />

      <TeamSection
        title="Team B"
        players={teamBPlayers}
        team="team_b"
        teamColor="#FF3B30"
      />

      {/* Add Player Modal */}
      <Modal
        visible={showAddPlayer}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddPlayer(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Player</Text>
            <TouchableOpacity onPress={addPlayer}>
              <Text style={styles.saveButton}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Player Name</Text>
            <TextInput
              style={styles.textInput}
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder="Enter player name"
              autoFocus
            />

            {competitiveMode && (
              <>
                <Text style={styles.inputLabel}>Jersey Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPlayerNumber}
                  onChangeText={setNewPlayerNumber}
                  placeholder="Enter jersey number"
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={styles.inputLabel}>Team</Text>
            <View style={styles.teamSelector}>
              <TouchableOpacity
                style={[
                  styles.teamOption,
                  newPlayerTeam === 'team_a' && styles.selectedTeam
                ]}
                onPress={() => setNewPlayerTeam('team_a')}
              >
                <Text style={[
                  styles.teamOptionText,
                  newPlayerTeam === 'team_a' && styles.selectedTeamText
                ]}>
                  Team A
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.teamOption,
                  newPlayerTeam === 'team_b' && styles.selectedTeam
                ]}
                onPress={() => setNewPlayerTeam('team_b')}
              >
                <Text style={[
                  styles.teamOptionText,
                  newPlayerTeam === 'team_b' && styles.selectedTeamText
                ]}>
                  Team B
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  teamSection: {
    marginBottom: 24,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  playerCount: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  playersContainer: {
    gap: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  playerNumber: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addPlayerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  suggestedSection: {
    marginTop: 12,
  },
  suggestedTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  suggestedPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedPlayer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  suggestedPlayerName: {
    fontSize: 14,
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    color: '#8E8E93',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  teamSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  teamOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTeam: {
    backgroundColor: '#007AFF',
  },
  teamOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  selectedTeamText: {
    color: 'white',
  },
});

export default PlayerManager;
