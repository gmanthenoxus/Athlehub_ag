import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, Avatar, Input } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        throw error;
      }

      setProfile(data);
      setUsername(data?.username || '');
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      // Set default values if profile doesn't exist
      setProfile(null);
      setUsername('');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);

      if (!user) return;

      const updates = {
        id: user.id,
        username,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      fetchProfile();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Your Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <Avatar
          size="xlarge"
          rounded
          icon={{ name: 'person', type: 'ionicon' }}
          containerStyle={styles.avatar}
        />

        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.formContainer}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter a username"
            leftIcon={<Ionicons name="person-outline" size={24} color="gray" />}
          />

          <Button
            title="Update Profile"
            onPress={updateProfile}
            loading={updating}
            buttonStyle={styles.updateButton}
            icon={
              <Ionicons
                name="save-outline"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
          />
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Account Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={24} color="#4361ee" />
              <Text style={styles.statLabel}>Member Since</Text>
              <Text style={styles.statValue}>
                {new Date(user?.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={24} color="#4361ee" />
              <Text style={styles.statLabel}>Matches Logged</Text>
              <Text style={styles.statValue}>Coming Soon</Text>
            </View>
          </View>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          buttonStyle={styles.signOutButton}
          icon={
            <Ionicons
              name="log-out-outline"
              size={20}
              color="white"
              style={{ marginRight: 10 }}
            />
          }
        />
      </View>
    </ScrollView>
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
  },
  profileContainer: {
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#4361ee',
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  updateButton: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    marginTop: 10,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 5,
  },
  signOutButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: '100%',
  },
});
