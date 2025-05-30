import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationService from '../../services/locationService';

const LocationSelector = ({ 
  sport, 
  selectedLocation, 
  onLocationSelect, 
  placeholder = "Search for a court or field..." 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPopularLocations();
  }, [sport]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, sport]);

  const loadPopularLocations = async () => {
    try {
      const popular = await LocationService.getPopularLocations(5);
      const sportSpecific = LocationService.getLocationsBySport(sport.name);
      
      // Combine popular and sport-specific locations
      const combined = [...popular, ...sportSpecific.slice(0, 3)];
      const unique = combined.filter((location, index, self) => 
        index === self.findIndex(l => l.id === location.id)
      );
      
      setPopularLocations(unique.slice(0, 5));
    } catch (error) {
      console.error('Error loading popular locations:', error);
    }
  };

  const performSearch = () => {
    setIsLoading(true);
    try {
      const results = LocationService.searchLocations(searchQuery, sport.name);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    setIsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddNewLocation = () => {
    // For now, create a mock location
    const newLocation = {
      id: `new_${Date.now()}`,
      name: searchQuery,
      sport: sport.name,
      city: 'Unknown',
      state: 'Unknown',
      type: 'outdoor',
      isNew: true,
    };
    
    handleLocationSelect(newLocation);
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIcon}>
        <Ionicons 
          name={LocationService.getLocationTypeIcon(item)} 
          size={24} 
          color="#007AFF" 
        />
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDetails}>
          {item.city}, {item.state} • {item.type}
          {item.matchCount && ` • ${item.matchCount} matches`}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const displayText = selectedLocation 
    ? LocationService.formatLocationName(selectedLocation)
    : placeholder;

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Ionicons name="location-outline" size={20} color="#8E8E93" />
          <Text style={[
            styles.selectorText,
            !selectedLocation && styles.placeholderText
          ]}>
            {displayText}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#C7C7CC" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courts, fields, or venues..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {/* Results */}
          <FlatList
            style={styles.resultsList}
            data={searchQuery.length >= 2 ? searchResults : popularLocations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLocationItem}
            ListHeaderComponent={() => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {searchQuery.length >= 2 ? 'Search Results' : `Popular ${sport.name} Locations`}
                </Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                {searchQuery.length >= 2 ? (
                  <>
                    <Ionicons name="location-outline" size={48} color="#C7C7CC" />
                    <Text style={styles.emptyTitle}>No locations found</Text>
                    <Text style={styles.emptySubtitle}>
                      Can't find "{searchQuery}"? You can add it as a new location.
                    </Text>
                    <TouchableOpacity
                      style={styles.addLocationButton}
                      onPress={handleAddNewLocation}
                    >
                      <Ionicons name="add" size={20} color="white" />
                      <Text style={styles.addLocationText}>Add "{searchQuery}"</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Ionicons name="location-outline" size={48} color="#C7C7CC" />
                    <Text style={styles.emptyTitle}>No popular locations yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Start typing to search for courts and fields
                    </Text>
                  </>
                )}
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
    flex: 1,
  },
  placeholderText: {
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  resultsList: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  locationDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default LocationSelector;
