# Athlehub - Sports Match Logging App

Athlehub is a mobile application that allows users to log and track their sports matches. This is the MVP (Minimum Viable Product) version that includes core match logging functionality.

## Features

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
├── contexts/               # React Context providers
│   └── AuthContext.js      # Authentication context
├── lib/                    # Utility libraries
│   └── supabase.js         # Supabase client configuration
├── navigation/             # Navigation configuration
│   └── index.js            # Main navigation setup
├── screens/                # Application screens
│   ├── auth/               # Authentication screens
│   │   ├── SignInScreen.js
│   │   └── SignUpScreen.js
│   ├── match/              # Match creation flow screens
│   │   ├── SelectSportScreen.js
│   │   ├── TeamSetupScreen.js
│   │   └── ScoreInputScreen.js
│   ├── HomeScreen.js       # Home screen
│   ├── MatchHistoryScreen.js # Match history screen
│   └── ProfileScreen.js    # User profile screen
└── supabase/               # Supabase configuration
    └── schema.sql          # Database schema
```

## Current Status

✅ **Fully Functional MVP** - The app is now running with full Supabase integration!

### Features Working:
- ✅ User authentication (sign up/login)
- ✅ Real-time database integration
- ✅ Match logging with persistent storage
- ✅ Match history with real data
- ✅ User profiles with database storage
- ✅ All navigation flows working

### Database Setup:
The app is currently connected to a pre-configured Supabase database with:
- User profiles table
- Sports table (pre-populated with 5 sports)
- Matches table with proper relationships
- Row Level Security (RLS) enabled

## Next Steps (Future Enhancements)

- Add ability to edit and delete matches
- Implement player management
- Add match statistics and analytics
- Support for more sports
- Social features (friends, sharing matches)
- Push notifications
