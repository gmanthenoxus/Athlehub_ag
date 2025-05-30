import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const TournamentListScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'open'

  useEffect(() => {
    loadTournaments();
  }, [filter]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      
      // For V3 demo, we'll show mock tournaments since our custom client doesn't support complex queries
      const mockTournaments = [
        {
          id: '1',
          name: 'Summer Basketball Championship',
          description: 'Annual summer basketball tournament',
          sport_name: 'Basketball',
          tournament_type: 'knockout',
          max_teams: 16,
          team_size: 5,
          status: 'registration',
          created_by: user.id,
          created_at: new Date().toISOString(),
          teams_registered: 8,
        },
        {
          id: '2',
          name: 'Friday Night Football',
          description: 'Weekly football matches',
          sport_name: 'Football',
          tournament_type: 'round_robin',
          max_teams: 8,
          team_size: 11,
          status: 'in_progress',
          created_by: 'other-user',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          teams_registered: 6,
        },
        {
          id: '3',
          name: 'Badminton Doubles League',
          description: 'Competitive doubles tournament',
          sport_name: 'Badminton',
          tournament_type: 'knockout',
          max_teams: 12,
          team_size: 2,
          status: 'completed',
          created_by: 'other-user',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          teams_registered: 12,
        }
      ];

      // Filter tournaments based on selected filter
      let filteredTournaments = mockTournaments;
      if (filter === 'my') {
        filteredTournaments = mockTournaments.filter(t => t.created_by === user.id);
      } else if (filter === 'open') {
        filteredTournaments = mockTournaments.filter(t => t.status === 'registration');
      }

      setTournaments(filteredTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      setTournaments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#8E8E93';
      case 'registration': return '#007AFF';
      case 'in_progress': return '#FF9500';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'registration': return 'Open for Registration';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getTournamentTypeText = (type) => {
    switch (type) {
      case 'knockout': return 'Knockout';
      case 'round_robin': return 'Round Robin';
      case 'swiss': return 'Swiss System';
      default: return type;
    }
  };

  const renderTournament = ({ item }) => (
    <TouchableOpacity 
      style={styles.tournamentCard}
      onPress={() => navigation.navigate('TournamentDetail', { tournament: item })}
    >
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentName}>{item.name}</Text>
          <Text style={styles.sportName}>{item.sport_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      <View style={styles.tournamentDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="trophy-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{getTournamentTypeText(item.tournament_type)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            {item.teams_registered}/{item.max_teams} teams
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.team_size}v{item.team_size}</Text>
        </View>
      </View>

      <View style={styles.tournamentFooter}>
        <Text style={styles.createdDate}>
          Created {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.created_by === user.id && (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerText}>Your Tournament</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const FilterTabs = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, filter === 'open' && styles.activeFilterTab]}
        onPress={() => setFilter('open')}
      >
        <Text style={[styles.filterText, filter === 'open' && styles.activeFilterText]}>
          Open
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, filter === 'my' && styles.activeFilterTab]}
        onPress={() => setFilter('my')}
      >
        <Text style={[styles.filterText, filter === 'my' && styles.activeFilterText]}>
          My Tournaments
        </Text>
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
        <Text style={styles.headerTitle}>Tournaments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateTournament')}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <FilterTabs />

      {/* Tournament List */}
      <FlatList
        data={tournaments}
        renderItem={renderTournament}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#E5E5EA" />
            <Text style={styles.emptyTitle}>No Tournaments Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'my' 
                ? "You haven't created any tournaments yet"
                : filter === 'open'
                ? "No tournaments are currently open for registration"
                : "No tournaments available"
              }
            </Text>
            {filter !== 'open' && (
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateTournament')}
              >
                <Text style={styles.createButtonText}>Create Tournament</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  tournamentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  sportName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  tournamentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  ownerBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ownerText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TournamentListScreen;
