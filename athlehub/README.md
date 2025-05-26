# Athlehub - Advanced Sports Match Tracking Platform

Athlehub is a comprehensive mobile application for tracking sports matches with advanced features including real-time match tracking, detailed player statistics, and multiple match modes. Now featuring Version 2.0 with enhanced capabilities!

## 🚀 Features

### Version 2.0 - Enhanced Match Tracking & Player Stats
- **🔴 Real-Time Match Mode**: Live match tracking with timer, live scoring, and real-time stat updates
- **📝 Past Match Logging**: Form-style interface for entering completed matches
- **👥 Player Management**: Individual player tracking with auto-suggestions based on location history
- **📊 Detailed Statistics**: Sport-specific player stats (points, assists, rebounds, goals, saves, etc.)
- **🏆 Competitive Mode**: Strict rules enforcement with jersey numbers and advanced tracking
- **⚙️ Match Configuration**: Customizable match types (Single, Set-Based, Tournament), team sizes, and scoring systems
- **🎯 Multi-Sport Support**: Enhanced configurations for Basketball, Football, Badminton, Table Tennis, Volleyball
- **📍 Location Tracking**: Court/field management with player suggestions per location
- **🔄 Dual Match Modes**: Choose between real-time tracking or past match entry

### Version 1.0 - Core Features (Still Available)
- **User Authentication**: Sign up and login with email/password
- **Match Logging**: Record matches for various sports
- **Match History**: View all previously logged matches
- **User Profile**: Basic profile management

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Authentication, Database)
- **State Management**: React Context API
- **UI Components**: React Native Elements

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in the Supabase SQL editor
   - Copy your Supabase URL and anon key

3. Configure Supabase:
   - The Supabase credentials are already configured in `lib/supabase.js`
   - If you want to use your own Supabase project, replace the URL and anon key

### Running the App

```bash
npm start
```

Then, scan the QR code with the Expo Go app on your mobile device or use an emulator.

## Project Structure

```
athlehub/
├── App.js                  # Main application entry point
├── components/             # Reusable UI components
│   └── match/              # Match-related components
│       ├── SportConfig.js  # Sport configuration component
│       └── PlayerManager.js # Player management component
├── contexts/               # React Context providers
│   └── AuthContext.js      # Authentication context
├── lib/                    # Utility libraries
│   └── supabase.js         # Enhanced Supabase client with custom REST implementation
├── navigation/             # Navigation configuration
│   └── index.js            # Main navigation setup with V2 screens
├── screens/                # Application screens
│   ├── auth/               # Authentication screens
│   │   ├── SignInScreen.js
│   │   └── SignUpScreen.js
│   ├── match/              # Match creation and tracking screens
│   │   ├── SelectSportScreen.js      # Sport selection (V1)
│   │   ├── TeamSetupScreen.js        # Team setup (V1)
│   │   ├── ScoreInputScreen.js       # Score input (V1)
│   │   ├── EnhancedMatchSetupScreen.js # V2 Enhanced setup flow
│   │   ├── LiveMatchScreen.js        # V2 Real-time match tracking
│   │   └── PastMatchEntryScreen.js   # V2 Past match logging
│   ├── HomeScreen.js       # Home screen
│   ├── MatchHistoryScreen.js # Enhanced match history with player stats
│   └── ProfileScreen.js    # User profile screen
└── supabase/               # Supabase configuration
    ├── schema.sql          # V2 Enhanced database schema
    ├── v2_migration.sql    # Migration script for V1 to V2
    └── performance_optimizations.sql # Performance improvements
```

## Current Status

🚀 **Version 2.0 - Enhanced Sports Tracking Platform** - Now with advanced match tracking and player statistics!

### V2 Features Working:
- ✅ Enhanced match setup flow with sport-specific configurations
- ✅ Real-time match tracking with live timer and scoring
- ✅ Past match entry with detailed player statistics
- ✅ Player management with auto-suggestions
- ✅ Competitive mode with jersey number tracking
- ✅ Multiple match types (Single, Set-Based, Tournament)
- ✅ Sport-specific stat tracking (Basketball, Football, Badminton, Table Tennis, Volleyball)
- ✅ Location-based player suggestions

### V1 Features (Still Working):
- ✅ User authentication (sign up/login)
- ✅ Real-time database integration
- ✅ Match logging with persistent storage
- ✅ Match history with real data
- ✅ User profiles with database storage
- ✅ All navigation flows working

### Database Setup:
The app is currently connected to a pre-configured Supabase database with:
- Enhanced database schema supporting V2 features
- User profiles, players, locations, match participants, and player stats tables
- Sports table with enhanced configurations (team sizes, match durations, set support)
- Matches table with V2 fields (match types, competitive mode, status tracking)
- Row Level Security (RLS) enabled with optimized policies
- Performance optimizations (indexes and optimized RLS policies)

### Database Migration:
To upgrade existing V1 database to V2:
1. Run the SQL from `supabase/v2_migration.sql` in the Supabase SQL editor
2. This adds all new tables and columns needed for V2 features

### Database Performance Optimizations:
To apply performance improvements to your Supabase database:
1. Run the SQL from `supabase/performance_optimizations.sql` in the Supabase SQL editor
2. This adds indexes for foreign keys and optimizes RLS policies for better performance

## Version 2.0 Architecture

### Match Flow Options:
1. **Enhanced Setup Flow**: Sport selection → Configuration → Match mode → Player management → Review
2. **Real-Time Mode**: Live match with timer, live scoring, and real-time stat tracking
3. **Past Entry Mode**: Form-based entry for completed matches with player stats

### Player Management:
- Individual player tracking across matches
- Location-based player suggestions
- Jersey number management in competitive mode
- Automatic match count updates

### Statistics Tracking:
- **Basketball**: Points, Assists, Rebounds, Steals, Blocks, Field Goals, Free Throws
- **Football**: Goals, Assists, Saves, Cards
- **Racket Sports**: Points, Aces, Faults, Winners
- **Volleyball**: Points, Spikes, Digs, Serve Aces

## Next Steps (V3 Roadmap)

- **Advanced Analytics**: Player efficiency ratings, performance trends, shot heatmaps
- **Tournament Management**: Full bracket system with group stages and knockouts
- **Social Features**: Friends, team formation, match sharing, comments
- **Gamification**: Achievements, leaderboards, player rankings
- **Enhanced Real-Time**: Spectator mode, live streaming integration
- **Mobile Optimizations**: Offline mode, push notifications, background sync
