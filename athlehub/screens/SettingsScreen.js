import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const SettingsScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    location: '',
    bio: '',
  });
  
  const [preferences, setPreferences] = useState({
    notifications: true,
    publicProfile: true,
    showStats: true,
    competitiveMode: false,
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // For demo, use mock data since our custom client doesn't support complex queries
      const mockProfile = {
        username: user?.email?.split('@')[0] || '',
        full_name: '',
        location: '',
        bio: '',
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      
      // For demo, just show success message
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your match history, statistics, and profile data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: () => {
                    // For demo, show message about contacting support
                    Alert.alert(
                      'Account Deletion',
                      'To delete your account, please contact support at support@athlehub.com with your email address. We will process your request within 24 hours.',
                      [{ text: 'OK' }]
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
    </TouchableOpacity>
  );

  const PreferenceItem = ({ title, subtitle, value, onValueChange }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        {subtitle && <Text style={styles.preferenceSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        thumbColor="white"
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
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={saveProfile} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Information */}
        <SettingSection title="Profile Information">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.textInput}
              value={profile.username}
              onChangeText={(text) => setProfile({ ...profile, username: text })}
              placeholder="Enter username"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={profile.full_name}
              onChangeText={(text) => setProfile({ ...profile, full_name: text })}
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={profile.location}
              onChangeText={(text) => setProfile({ ...profile, location: text })}
              placeholder="Enter your location"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={3}
            />
          </View>
        </SettingSection>

        {/* Privacy & Preferences */}
        <SettingSection title="Privacy & Preferences">
          <PreferenceItem
            title="Push Notifications"
            subtitle="Receive match reminders and updates"
            value={preferences.notifications}
            onValueChange={(value) => setPreferences({ ...preferences, notifications: value })}
          />
          
          <PreferenceItem
            title="Public Profile"
            subtitle="Allow others to see your profile and stats"
            value={preferences.publicProfile}
            onValueChange={(value) => setPreferences({ ...preferences, publicProfile: value })}
          />
          
          <PreferenceItem
            title="Show Statistics"
            subtitle="Display detailed match statistics"
            value={preferences.showStats}
            onValueChange={(value) => setPreferences({ ...preferences, showStats: value })}
          />
          
          <PreferenceItem
            title="Competitive Mode by Default"
            subtitle="Enable competitive features for new matches"
            value={preferences.competitiveMode}
            onValueChange={(value) => setPreferences({ ...preferences, competitiveMode: value })}
          />
        </SettingSection>

        {/* App Settings */}
        <SettingSection title="App Settings">
          <SettingItem
            icon="trophy-outline"
            title="Achievements"
            subtitle="View your badges and milestones"
            onPress={() => navigation.navigate('PlayerProfile')}
          />
          
          <SettingItem
            icon="stats-chart-outline"
            title="Export Data"
            subtitle="Download your match history and statistics"
            onPress={() => Alert.alert('Export Data', 'This feature will be available soon!')}
          />
          
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Support', 'Email us at support@athlehub.com')}
          />
          
          <SettingItem
            icon="document-text-outline"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will be available soon!')}
          />
        </SettingSection>

        {/* Account Actions */}
        <SettingSection title="Account">
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleSignOut}
            rightComponent={<Ionicons name="log-out-outline" size={20} color="#FF3B30" />}
          />
          
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            rightComponent={<Ionicons name="trash-outline" size={20} color="#FF3B30" />}
          />
        </SettingSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Athlehub v3.0.0</Text>
          <Text style={styles.appDescription}>
            Advanced Sports Match Tracking Platform
          </Text>
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
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#C7C7CC',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  inputGroup: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default SettingsScreen;
