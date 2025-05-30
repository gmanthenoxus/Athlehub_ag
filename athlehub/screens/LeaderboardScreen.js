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

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('points');

  const sports = [
    { id: 'all', name: 'All Sports', icon: 'trophy' },
    { id: 'basketball', name: 'Basketball', icon: 'basketball' },
    { id: 'football', name: 'Football', icon: 'football' },
    { id: 'badminton', name: 'Badminton', icon: 'tennisball' },
    { id: 'table-tennis', name: 'Table Tennis', icon: 'tennisball' },
    { id: 'volleyball', name: 'Volleyball', icon: 'tennisball' },
  ];

  const categories = [
    { id: 'points', name: 'Points', icon: 'star' },
    { id: 'wins', name: 'Wins', icon: 'trophy' },
    { id: 'matches', name: 'Matches Played', icon: 'calendar' },
    { id: 'assists', name: 'Assists', icon: 'people' },
  ];

  useEffect(() => {
    loadLeaderboards();
  }, [selectedSport, selectedCategory]);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);
      
      // Mock leaderboard data for V3 demo
      const mockLeaderboards = [
        {
          id: '1',
          player_name: 'Alex Johnson',
          stat_value: 1247,
          matches_played: 45,
          wins: 32,
          sport: 'Basketball',
          rank: 1,
          avatar: null,
          recent_form: [true, true, false, true, true], // W/L for last 5 matches
        },
        {
          id: '2',
          player_name: 'Sarah Chen',
          stat_value: 1156,
          matches_played: 38,
          wins: 28,
          sport: 'Basketball',
          rank: 2,
          avatar: null,
          recent_form: [true, true, true, false, true],
        },
        {
          id: '3',
          player_name: 'Mike Rodriguez',
          stat_value: 1089,
          matches_played: 42,
          wins: 25,
          sport: 'Football',
          rank: 3,
          avatar: null,
          recent_form: [false, true, true, true, false],
        },
        {
          id: '4',
          player_name: 'Emma Wilson',
          stat_value: 987,
          matches_played: 35,
          wins: 24,
          sport: 'Badminton',
          rank: 4,
          avatar: null,
          recent_form: [true, false, true, true, true],
        },
        {
          id: '5',
          player_name: 'David Kim',
          stat_value: 923,
          matches_played: 40,
          wins: 22,
          sport: 'Table Tennis',
          rank: 5,
          avatar: null,
          recent_form: [true, true, false, false, true],
        },
      ];

      // Filter by sport if not 'all'
      let filteredData = mockLeaderboards;
      if (selectedSport !== 'all') {
        filteredData = mockLeaderboards.filter(player => 
          player.sport.toLowerCase().replace(' ', '-') === selectedSport
        );
      }

      setLeaderboards(filteredData);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      setLeaderboards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboards();
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#8E8E93';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'medal-outline';
      default: return null;
    }
  };

  const renderRecentForm = (form) => (
    <View style={styles.recentForm}>
      {form.map((win, index) => (
        <View
          key={index}
          style={[
            styles.formDot,
            { backgroundColor: win ? '#34C759' : '#FF3B30' }
          ]}
        />
      ))}
    </View>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <TouchableOpacity style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        {item.rank <= 3 && getRankIcon(item.rank) ? (
          <Ionicons 
            name={getRankIcon(item.rank)} 
            size={24} 
            color={getRankColor(item.rank)} 
          />
        ) : (
          <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
            {item.rank}
          </Text>
        )}
      </View>

      <View style={styles.playerInfo}>
        <View style={styles.playerHeader}>
          <Text style={styles.playerName}>{item.player_name}</Text>
          <Text style={styles.sportBadge}>{item.sport}</Text>
        </View>
        
        <View style={styles.playerStats}>
          <Text style={styles.statValue}>
            {item.stat_value.toLocaleString()} {selectedCategory}
          </Text>
          <Text style={styles.statDetail}>
            {item.wins}W-{item.matches_played - item.wins}L ({item.matches_played} matches)
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {renderRecentForm(item.recent_form)}
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  const SportFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Sport</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={sports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedSport === item.id && styles.activeFilterChip
            ]}
            onPress={() => setSelectedSport(item.id)}
          >
            <Ionicons 
              name={item.icon} 
              size={16} 
              color={selectedSport === item.id ? 'white' : '#8E8E93'} 
            />
            <Text style={[
              styles.filterChipText,
              selectedSport === item.id && styles.activeFilterChipText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const CategoryFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Category</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === item.id && styles.activeFilterChip
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Ionicons 
              name={item.icon} 
              size={16} 
              color={selectedCategory === item.id ? 'white' : '#8E8E93'} 
            />
            <Text style={[
              styles.filterChipText,
              selectedCategory === item.id && styles.activeFilterChipText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboards</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters */}
      <SportFilter />
      <CategoryFilter />

      {/* Leaderboard List */}
      <FlatList
        data={leaderboards}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#E5E5EA" />
            <Text style={styles.emptyTitle}>No Rankings Yet</Text>
            <Text style={styles.emptyText}>
              Play some matches to see rankings appear here!
            </Text>
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
  filterSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 4,
  },
  activeFilterChipText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  sportBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  statDetail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  recentForm: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  formDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
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
  },
});

export default LeaderboardScreen;
