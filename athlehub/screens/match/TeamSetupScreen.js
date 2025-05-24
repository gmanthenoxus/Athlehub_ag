import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

export default function TeamSetupScreen({ route, navigation }) {
  const { sport } = route.params;
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');

  const handleContinue = () => {
    if (!teamA.trim() || !teamB.trim()) {
      Alert.alert('Error', 'Please enter names for both teams');
      return;
    }

    navigation.navigate('ScoreInput', {
      sport,
      teamA: teamA.trim(),
      teamB: teamB.trim(),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Team Setup</Text>
        <Text style={styles.sportName}>
          <Ionicons 
            name="trophy-outline" 
            size={18} 
            color="#4361ee" 
          /> {sport.name}
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Enter Team Names</Text>
        
        <View style={styles.teamSection}>
          <Text style={styles.teamLabel}>Team A</Text>
          <Input
            placeholder="Enter team name"
            value={teamA}
            onChangeText={setTeamA}
            leftIcon={
              <Ionicons name="people-outline" size={24} color="gray" />
            }
            containerStyle={styles.inputContainer}
          />
        </View>
        
        <View style={styles.vsContainer}>
          <View style={styles.divider} />
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.divider} />
        </View>
        
        <View style={styles.teamSection}>
          <Text style={styles.teamLabel}>Team B</Text>
          <Input
            placeholder="Enter team name"
            value={teamB}
            onChangeText={setTeamB}
            leftIcon={
              <Ionicons name="people-outline" size={24} color="gray" />
            }
            containerStyle={styles.inputContainer}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Continue to Score"
            onPress={handleContinue}
            buttonStyle={styles.continueButton}
            icon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                style={{ marginLeft: 10 }}
              />
            }
            iconRight
          />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
  },
  teamSection: {
    marginBottom: 20,
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginHorizontal: 15,
  },
  buttonContainer: {
    marginTop: 30,
  },
  continueButton: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    padding: 15,
  },
});
