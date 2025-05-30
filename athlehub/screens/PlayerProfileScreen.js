import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const PlayerProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const [playerStats, setPlayerStats] = useState({});
  const [badges, setBadges] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      // Mock player data for V3 demo
      const mockStats = {
        totalMatches: 47,
        totalWins: 32,
        totalLosses: 15,
        winRate: 68,
        totalPoints: 1247,
        totalAssists: 89,
        favoriteSpot: 'Downtown Court',
        joinDate: '2024-01-15',
        currentStreak: 3,
        longestStreak: 7,
      };

      const mockBadges = [
        {
          id: '1',
          name: 'First Match',
          description: 'Played your first match',
          icon: 'play-circle',
          earned_at: '2024-01-15',
          badge_type: 'milestone',
        },
        {
          id: '2',
          name: '10 Matches',
          description: 'Played 10 matches',
          icon: 'trophy',
          earned_at: '2024-02-01',
          badge_type: 'milestone',
        },
        {
          id: '3',
          name: 'High Scorer',
          description: 'Scored 50+ points in a basketball match',
          icon: 'basketball',
          earned_at: '2024-03-15',
          badge_type: 'performance',
        },
        {
          id: '4',
          name: 'Winning Streak',
          description: 'Won 5 matches in a row',
          icon: 'flame',
          earned_at: '2024-04-10',
          badge_type: 'achievement',
        },
      ];

      const mockRecentMatches = [
        { id: '1', sport: 'Basketball', result: 'W', score: '21-18', date: '2024-05-20' },
        { id: '2', sport: 'Football', result: 'W', score: '3-1', date: '2024-05-18' },
        { id: '3', sport: 'Basketball', result: 'L', score: '15-21', date: '2024-05-15' },
        { id: '4', sport: 'Badminton', result: 'W', score: '21-16', date: '2024-05-12' },
        { id: '5', sport: 'Basketball', result: 'W', score: '25-20', date: '2024-05-10' },
      ];

      setPlayerStats(mockStats);
      setBadges(mockBadges);
      setRecentMatches(mockRecentMatches);
    } catch (error) {
      console.error('Error loading player data:', error);
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'milestone': return '#007AFF';
      case 'achievement': return '#FF9500';
      case 'performance': return '#34C759';
      case 'tournament': return '#AF52DE';
      default: return '#8E8E93';
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = '#007AFF' }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const BadgeItem = ({ badge }) => (
    <View style={styles.badgeItem}>
      <View style={[styles.badgeIcon, { backgroundColor: getBadgeColor(badge.badge_type) }]}>
        <Ionicons name={badge.icon} size={20} color="white" />
      </View>
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
        <Text style={styles.badgeDate}>
          Earned {new Date(badge.earned_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const RecentMatchItem = ({ match }) => (
    <View style={styles.matchItem}>
      <View style={[
        styles.resultBadge,
        { backgroundColor: match.result === 'W' ? '#34C759' : '#FF3B30' }
      ]}>
        <Text style={styles.resultText}>{match.result}</Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchSport}>{match.sport}</Text>
        <Text style={styles.matchScore}>{match.score}</Text>
      </View>
      <Text style={styles.matchDate}>
        {new Date(match.date).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Player Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Player Info */}
        <View style={styles.playerSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#E5E5EA" />
          </View>
          <Text style={styles.playerName}>{user?.email?.split('@')[0] || 'Player'}</Text>
          <Text style={styles.playerEmail}>{user?.email}</Text>
          <Text style={styles.joinDate}>
            Member since {new Date(playerStats.joinDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <View style={styles.quickStatsRow}>
            <StatCard
              title="Matches"
              value={playerStats.totalMatches}
              icon="calendar-outline"
              color="#007AFF"
            />
            <StatCard
              title="Win Rate"
              value={`${playerStats.winRate}%`}
              subtitle={`${playerStats.totalWins}W-${playerStats.totalLosses}L`}
              icon="trophy-outline"
              color="#34C759"
            />
          </View>
          <View style={styles.quickStatsRow}>
            <StatCard
              title="Current Streak"
              value={playerStats.currentStreak}
              subtitle={`Best: ${playerStats.longestStreak}`}
              icon="flame-outline"
              color="#FF9500"
            />
            <StatCard
              title="Total Points"
              value={playerStats.totalPoints?.toLocaleString()}
              icon="star-outline"
              color="#AF52DE"
            />
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges & Achievements</Text>
            <Text style={styles.badgeCount}>{badges.length}</Text>
          </View>
          
          {badges.length > 0 ? (
            badges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))
          ) : (
            <View style={styles.emptyBadges}>
              <Ionicons name="medal-outline" size={48} color="#E5E5EA" />
              <Text style={styles.emptyText}>No badges earned yet</Text>
              <Text style={styles.emptySubtext}>Play matches to earn your first badge!</Text>
            </View>
          )}
        </View>

        {/* Recent Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Matches' })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentMatches.slice(0, 5).map((match) => (
            <RecentMatchItem key={match.id} match={match} />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Ionicons name="trophy-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>View Leaderboards</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('TournamentList')}
          >
            <Ionicons name="people-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Join Tournament</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  playerSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  playerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  playerEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  quickStatsSection: {
    padding: 16,
  },
  quickStatsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statTitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#8E8E93',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  badgeCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  badgeDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptyBadges: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  matchInfo: {
    flex: 1,
  },
  matchSport: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  matchScore: {
    fontSize: 14,
    color: '#8E8E93',
  },
  matchDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  actionSection: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default PlayerProfileScreen;
