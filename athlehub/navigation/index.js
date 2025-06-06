import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';
import MatchHistoryScreen from '../screens/MatchHistoryScreen';
import ProfileScreen from '../screens/PlayerProfileScreen';

// Match Creation Flow Screens
import SelectSportScreen from '../screens/match/SelectSportScreen';
import TeamSetupScreen from '../screens/match/TeamSetupScreen';
import ScoreInputScreen from '../screens/match/ScoreInputScreen';
import EnhancedMatchSetupScreen from '../screens/match/EnhancedMatchSetupScreen';
import MatchRulesConfigScreen from '../screens/match/MatchRulesConfigScreen';
import LiveMatchScreen from '../screens/match/LiveMatchScreen';
import PastMatchEntryScreen from '../screens/match/PastMatchEntryScreen';

// V3 Tournament Screens
import CreateTournamentScreen from '../screens/tournament/CreateTournamentScreen';
import TournamentListScreen from '../screens/tournament/TournamentListScreen';

// V3 Feature Screens
import LeaderboardScreen from '../screens/LeaderboardScreen';
import PlayerProfileScreen from '../screens/PlayerProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

// Match Creation Flow Navigator
const MatchCreationNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="SelectSport"
      component={SelectSportScreen}
      options={{ title: 'Select Sport' }}
    />
    <Stack.Screen
      name="EnhancedMatchSetup"
      component={EnhancedMatchSetupScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="LiveMatch"
      component={LiveMatchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PastMatchEntry"
      component={PastMatchEntryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TeamSetup"
      component={TeamSetupScreen}
      options={{ title: 'Team Setup' }}
    />
    <Stack.Screen
      name="ScoreInput"
      component={ScoreInputScreen}
      options={{ title: 'Enter Score' }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Matches') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4361ee',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Matches" component={MatchHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="MatchCreation" component={MatchCreationNavigator} />

    {/* Enhanced Match Setup Screens */}
    <Stack.Screen name="EnhancedMatchSetup" component={EnhancedMatchSetupScreen} />
    <Stack.Screen name="MatchRulesConfig" component={MatchRulesConfigScreen} />
    <Stack.Screen name="LiveMatch" component={LiveMatchScreen} />
    <Stack.Screen name="PastMatchEntry" component={PastMatchEntryScreen} />

    {/* V3 Tournament Screens */}
    <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
    <Stack.Screen name="TournamentList" component={TournamentListScreen} />

    {/* V3 Feature Screens */}
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Root Navigator
export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
