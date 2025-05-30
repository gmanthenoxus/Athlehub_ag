import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';

const CreateTournamentScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const [tournamentName, setTournamentName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [tournamentType, setTournamentType] = useState('knockout');
  const [maxTeams, setMaxTeams] = useState('8');
  const [teamSize, setTeamSize] = useState('2');
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      // For now, use hardcoded sports since our custom client doesn't support complex queries
      const defaultSports = [
        { id: 1, name: 'Basketball', icon: 'basketball' },
        { id: 2, name: 'Football', icon: 'football' },
        { id: 3, name: 'Badminton', icon: 'badminton' },
        { id: 4, name: 'Table Tennis', icon: 'table-tennis' },
        { id: 5, name: 'Volleyball', icon: 'volleyball' }
      ];
      setSports(defaultSports);
      setSelectedSport(defaultSports[0]);
    } catch (error) {
      console.error('Error loading sports:', error);
    }
  };

  const createTournament = async () => {
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    if (!selectedSport) {
      Alert.alert('Error', 'Please select a sport');
      return;
    }

    try {
      setLoading(true);

      const tournamentData = {
        name: tournamentName.trim(),
        description: description.trim(),
        sport_id: selectedSport.id,
        created_by: user.id,
        tournament_type: tournamentType,
        max_teams: parseInt(maxTeams),
        team_size: parseInt(teamSize),
        competitive_mode: true,
        status: 'draft',
      };

      // For V3 demo, we'll create a simplified tournament record
      const { error } = await supabase
        .from('tournaments')
        .insert([tournamentData]);

      if (error) throw error;

      Alert.alert(
        'Tournament Created!',
        `${tournamentName} has been created successfully.`,
        [
          {
            text: 'View Tournaments',
            onPress: () => navigation.navigate('TournamentList'),
          },
          {
            text: 'Create Another',
            onPress: () => {
              setTournamentName('');
              setDescription('');
              setMaxTeams('8');
              setTeamSize('2');
            },
            style: 'cancel',
          },
        ]
      );

    } catch (error) {
      console.error('Error creating tournament:', error);
      Alert.alert('Error', 'Failed to create tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SportSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sport</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsContainer}>
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportCard,
              selectedSport?.id === sport.id && styles.selectedSportCard
            ]}
            onPress={() => setSelectedSport(sport)}
          >
            <Ionicons 
              name={sport.icon} 
              size={32} 
              color={selectedSport?.id === sport.id ? '#007AFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.sportName,
              selectedSport?.id === sport.id && styles.selectedSportName
            ]}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const TournamentTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tournament Type</Text>
      
      <TouchableOpacity
        style={[
          styles.optionCard,
          tournamentType === 'knockout' && styles.selectedOption
        ]}
        onPress={() => setTournamentType('knockout')}
      >
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionTitle,
            tournamentType === 'knockout' && styles.selectedText
          ]}>
            Knockout Tournament
          </Text>
          <Text style={[
            styles.optionDescription,
            tournamentType === 'knockout' && styles.selectedText
          ]}>
            Single elimination - lose and you're out
          </Text>
        </View>
        {tournamentType === 'knockout' && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.optionCard,
          tournamentType === 'round_robin' && styles.selectedOption
        ]}
        onPress={() => setTournamentType('round_robin')}
      >
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionTitle,
            tournamentType === 'round_robin' && styles.selectedText
          ]}>
            Round Robin
          </Text>
          <Text style={[
            styles.optionDescription,
            tournamentType === 'round_robin' && styles.selectedText
          ]}>
            Everyone plays everyone - most wins wins
          </Text>
        </View>
        {tournamentType === 'round_robin' && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Tournament</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tournament Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournament Name</Text>
          <TextInput
            style={styles.textInput}
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Enter tournament name"
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your tournament..."
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Sport Selection */}
        <SportSelector />

        {/* Tournament Type */}
        <TournamentTypeSelector />

        {/* Tournament Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournament Settings</Text>
          
          <View style={styles.settingsRow}>
            <Text style={styles.settingLabel}>Maximum Teams</Text>
            <TextInput
              style={styles.numberInput}
              value={maxTeams}
              onChangeText={setMaxTeams}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.settingLabel}>Players per Team</Text>
            <TextInput
              style={styles.numberInput}
              value={teamSize}
              onChangeText={setTeamSize}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>

        {/* Tournament Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Tournament Preview</Text>
          <Text style={styles.infoText}>
            • {maxTeams} teams maximum
          </Text>
          <Text style={styles.infoText}>
            • {teamSize} players per team
          </Text>
          <Text style={styles.infoText}>
            • {tournamentType === 'knockout' ? 'Single elimination' : 'Round robin'} format
          </Text>
          <Text style={styles.infoText}>
            • Competitive mode enabled
          </Text>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.createContainer}>
        <TouchableOpacity 
          style={[
            styles.createButton,
            (!tournamentName.trim() || loading) && styles.createButtonDisabled
          ]} 
          onPress={createTournament}
          disabled={!tournamentName.trim() || loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Tournament'}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sportsContainer: {
    flexDirection: 'row',
  },
  sportCard: {
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    minWidth: 80,
  },
  selectedSportCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  sportName: {
    fontSize: 12,
    marginTop: 8,
    color: '#8E8E93',
    textAlign: 'center',
  },
  selectedSportName: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
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
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 60,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#F2F2F7',
    margin: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  createContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default CreateTournamentScreen;
