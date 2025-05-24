import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card, Divider } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MatchHistoryScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchMatches = async () => {
    try {
      setLoading(true);

      if (!user) {
        setMatches([]);
        return;
      }

      // First fetch all sports to create a lookup map
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('*');

      if (sportsError) throw sportsError;

      // Create a sports lookup map
      const sportsMap = {};
      (sportsData || []).forEach(sport => {
        sportsMap[sport.id] = sport;
      });

      // Fetch matches for the current user
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user.id)
        .order('match_date', { ascending: false });

      if (matchesError) throw matchesError;

      // Combine matches with sport information
      const matchesWithSports = (matchesData || []).map(match => ({
        ...match,
        sports: sportsMap[match.sport_id] || { name: 'Unknown Sport', icon: 'trophy' }
      }));

      setMatches(matchesWithSports);
    } catch (error) {
      console.error('Error fetching matches:', error.message || error);
      // Fallback to empty array on error
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMatchItem = ({ item }) => (
    <Card containerStyle={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.sportInfo}>
          <Ionicons
            name={getSportIcon(item.sports?.name)}
            size={24}
            color="#4361ee"
          />
          <Text style={styles.sportName}>{item.sports?.name}</Text>
        </View>
        <Text style={styles.matchDate}>{formatDate(item.match_date)}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.scoreContainer}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{item.team_a_name}</Text>
          <Text style={styles.score}>{item.team_a_score}</Text>
        </View>

        <Text style={styles.versus}>vs</Text>

        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{item.team_b_name}</Text>
          <Text style={styles.score}>{item.team_b_score}</Text>
        </View>
      </View>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Match History</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No matches recorded yet</Text>
          <Text style={styles.emptySubtext}>
            Your match history will appear here once you start logging matches
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  matchCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4361ee',
  },
  matchDate: {
    color: '#888',
    fontSize: 14,
  },
  divider: {
    marginVertical: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    textAlign: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  versus: {
    fontSize: 14,
    color: '#888',
    marginHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});
