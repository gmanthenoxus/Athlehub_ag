import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function SelectSportScreen({ navigation }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name');

      if (error) throw error;

      setSports(data || []);
    } catch (error) {
      console.error('Error fetching sports:', error.message);
      // Fallback to default sports if database query fails
      const fallbackSports = [
        { id: 1, name: 'Basketball' },
        { id: 2, name: 'Football' },
        { id: 3, name: 'Badminton' },
        { id: 4, name: 'Table Tennis' },
        { id: 5, name: 'Volleyball' }
      ];
      setSports(fallbackSports);
    } finally {
      setLoading(false);
    }
  };

  const getSportIcon = (sportName) => {
    switch (sportName?.toLowerCase()) {
      case 'basketball':
        return 'basketball-outline';
      case 'football':
        return 'football-outline';
      case 'badminton':
        return 'tennisball-outline';
      case 'table tennis':
        return 'tennisball-outline';
      case 'volleyball':
        return 'baseball-outline';
      default:
        return 'trophy-outline';
    }
  };

  const handleSelectSport = (sport) => {
    // Navigate to enhanced match setup for V2 features
    navigation.navigate('EnhancedMatchSetup', { sport });
  };

  const renderSportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sportCard}
      onPress={() => handleSelectSport(item)}
    >
      <Card containerStyle={styles.card}>
        <View style={styles.sportContent}>
          <Ionicons
            name={getSportIcon(item.name)}
            size={40}
            color="#4361ee"
          />
          <Text style={styles.sportName}>{item.name}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Select a Sport</Text>
        <Text style={styles.headerSubtitle}>
          Choose the sport you want to log a match for
        </Text>
      </View>

      <FlatList
        data={sports}
        renderItem={renderSportItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
  },
  sportCard: {
    flex: 1,
    margin: 5,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sportContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  sportName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});
