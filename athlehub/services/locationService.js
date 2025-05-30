// Location-based services for Athlehub
import { supabase } from '../lib/supabase';

// Static court data (CSV-based for initial implementation)
const STATIC_COURTS = [
  // Basketball Courts
  { id: 1, name: 'Central Park Basketball Court', sport: 'Basketball', city: 'New York', state: 'NY', type: 'outdoor' },
  { id: 2, name: 'Madison Square Garden Practice Court', sport: 'Basketball', city: 'New York', state: 'NY', type: 'indoor' },
  { id: 3, name: 'Venice Beach Basketball Court', sport: 'Basketball', city: 'Los Angeles', state: 'CA', type: 'outdoor' },
  { id: 4, name: 'Staples Center Practice Facility', sport: 'Basketball', city: 'Los Angeles', state: 'CA', type: 'indoor' },

  // Football Fields
  { id: 5, name: 'Central Park Great Lawn', sport: 'Football', city: 'New York', state: 'NY', type: 'outdoor' },
  { id: 6, name: 'Yankee Stadium Practice Field', sport: 'Football', city: 'New York', state: 'NY', type: 'outdoor' },
  { id: 7, name: 'Griffith Park Soccer Field', sport: 'Football', city: 'Los Angeles', state: 'CA', type: 'outdoor' },
  { id: 8, name: 'Rose Bowl Practice Field', sport: 'Football', city: 'Pasadena', state: 'CA', type: 'outdoor' },

  // Tennis/Badminton Courts
  { id: 9, name: 'Central Park Tennis Center', sport: 'Badminton', city: 'New York', state: 'NY', type: 'outdoor' },
  { id: 10, name: 'USTA Billie Jean King National Tennis Center', sport: 'Badminton', city: 'Queens', state: 'NY', type: 'indoor' },
  { id: 11, name: 'UCLA Tennis Center', sport: 'Badminton', city: 'Los Angeles', state: 'CA', type: 'outdoor' },

  // Table Tennis
  { id: 12, name: 'Manhattan Table Tennis Club', sport: 'Table Tennis', city: 'New York', state: 'NY', type: 'indoor' },
  { id: 13, name: 'LA Table Tennis Club', sport: 'Table Tennis', city: 'Los Angeles', state: 'CA', type: 'indoor' },

  // Volleyball Courts
  { id: 14, name: 'Manhattan Beach Volleyball Courts', sport: 'Volleyball', city: 'Manhattan Beach', state: 'CA', type: 'outdoor' },
  { id: 15, name: 'Coney Island Volleyball Courts', sport: 'Volleyball', city: 'Brooklyn', state: 'NY', type: 'outdoor' },
];

class LocationService {
  // Search for courts/fields by name or location
  static searchLocations(query, sport = null) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    return STATIC_COURTS.filter(court => {
      const matchesName = court.name.toLowerCase().includes(searchTerm);
      const matchesCity = court.city.toLowerCase().includes(searchTerm);
      const matchesSport = !sport || court.sport.toLowerCase() === sport.toLowerCase();

      return (matchesName || matchesCity) && matchesSport;
    });
  }

  // Get all locations for a specific sport
  static getLocationsBySport(sport) {
    return STATIC_COURTS.filter(court =>
      court.sport.toLowerCase() === sport.toLowerCase()
    );
  }

  // Get location by ID
  static getLocationById(id) {
    return STATIC_COURTS.find(court => court.id === id);
  }

  // Get suggested players for a location (based on match history)
  static async getSuggestedPlayersForLocation(locationId) {
    try {
      // For now, return mock data since our current Supabase client has limited query support
      // In the future, this will query the database for players who have played at this location

      // Mock data based on location
      const mockSuggestions = {
        1: [{ name: 'Mike Johnson', frequency: 5 }, { name: 'Sarah Chen', frequency: 3 }],
        2: [{ name: 'Alex Rodriguez', frequency: 4 }, { name: 'Emma Wilson', frequency: 2 }],
        3: [{ name: 'Chris Brown', frequency: 6 }, { name: 'Lisa Garcia', frequency: 4 }],
        4: [{ name: 'David Kim', frequency: 3 }, { name: 'Maria Lopez', frequency: 2 }],
        5: [{ name: 'Tom Anderson', frequency: 5 }, { name: 'Jessica Taylor', frequency: 3 }],
      };

      return mockSuggestions[locationId] || [];
    } catch (error) {
      console.error('Error getting suggested players:', error);
      return [];
    }
  }

  // Get location statistics
  static async getLocationStats(locationId) {
    try {
      // For now, return mock data since our current Supabase client has limited query support
      // In the future, this will query the database for actual match statistics

      const mockStats = {
        1: { totalMatches: 15, activePlayers: 8, mostPlayedSport: 1 },
        2: { totalMatches: 22, activePlayers: 12, mostPlayedSport: 1 },
        3: { totalMatches: 18, activePlayers: 10, mostPlayedSport: 1 },
        4: { totalMatches: 12, activePlayers: 6, mostPlayedSport: 1 },
        5: { totalMatches: 25, activePlayers: 15, mostPlayedSport: 2 },
      };

      return mockStats[locationId] || {
        totalMatches: 0,
        activePlayers: 0,
        mostPlayedSport: null,
      };
    } catch (error) {
      console.error('Error getting location stats:', error);
      return {
        totalMatches: 0,
        activePlayers: 0,
        mostPlayedSport: null,
      };
    }
  }

  // Add a new location (for future implementation)
  static async addNewLocation(locationData) {
    // This would add to a database table in the future
    // For now, we'll just return a mock response
    return {
      success: true,
      message: 'Location submitted for review',
      id: Date.now(), // Mock ID
    };
  }

  // Get popular locations (most matches played)
  static async getPopularLocations(limit = 10) {
    try {
      // For now, return mock popular locations since our current Supabase client has limited query support
      // In the future, this will query the database for actual match counts per location

      const popularLocationIds = [1, 3, 5, 2, 4]; // Mock popular order
      const popularLocations = popularLocationIds
        .slice(0, limit)
        .map(id => {
          const location = this.getLocationById(id);
          return {
            ...location,
            matchCount: Math.floor(Math.random() * 20) + 5, // Mock match count
          };
        })
        .filter(location => location.id);

      return popularLocations;
    } catch (error) {
      console.error('Error getting popular locations:', error);
      return [];
    }
  }

  // Get nearby locations (mock implementation for now)
  static getNearbyLocations(userLocation, radius = 10) {
    // This would use geolocation in a real implementation
    // For now, return a subset of locations
    return STATIC_COURTS.slice(0, 5);
  }

  // Format location for display
  static formatLocationName(location) {
    if (!location) return 'Unknown Location';
    return `${location.name}, ${location.city}, ${location.state}`;
  }

  // Get location type icon
  static getLocationTypeIcon(location) {
    if (!location) return 'location-outline';

    switch (location.sport.toLowerCase()) {
      case 'basketball':
        return 'basketball-outline';
      case 'football':
        return 'football-outline';
      case 'badminton':
      case 'table tennis':
        return 'tennisball-outline';
      case 'volleyball':
        return 'american-football-outline';
      default:
        return 'location-outline';
    }
  }
}

export default LocationService;
