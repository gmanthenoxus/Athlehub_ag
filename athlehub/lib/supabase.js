import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://thpzyyeannuzsegrhnwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHp5eWVhbm51enNlZ3JobndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDA3MTcsImV4cCI6MjA2MzQ3NjcxN30.Viy9WN6woTTgKKtoIfKxNlukNh_k0M7MeLxUgSauk3o';

// Custom Supabase client that only uses REST API (no WebSocket/realtime)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.accessToken = null;
    this.memoryToken = null; // Backup in-memory token for Android issues
  }

  async getHeaders() {
    const headers = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // Always try to get the latest access token from storage
    try {
      const storedToken = await AsyncStorage.getItem('supabase_access_token');
      if (storedToken) {
        this.accessToken = storedToken;
        console.log('Retrieved token from storage:', storedToken.substring(0, 20) + '...');
      } else {
        console.log('No token found in storage');
      }
    } catch (error) {
      console.warn('Failed to get access token from storage:', error);
    }

    // Use access token if available, otherwise fall back to anon key
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('Using access token for request:', this.accessToken.substring(0, 20) + '...');
    } else {
      headers['Authorization'] = `Bearer ${this.key}`;
      console.log('Using anon key for request');
    }

    return headers;
  }

  // Auth methods
  auth = {
    signUp: async ({ email, password }) => {
      try {
        const headers = await this.getHeaders();
        const response = await fetch(`${this.url}/auth/v1/signup`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
          return { data: null, error: data };
        }

        if (data.user && data.session) {
          this.accessToken = data.session.access_token;
          await AsyncStorage.setItem('supabase_user', JSON.stringify(data.user));
          await AsyncStorage.setItem('supabase_session', JSON.stringify(data.session));
          await AsyncStorage.setItem('supabase_access_token', data.session.access_token);
        }

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    signInWithPassword: async ({ email, password }) => {
      try {
        const headers = await this.getHeaders();
        console.log('Sign in headers:', headers);

        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        console.log('Sign in response status:', response.status);
        console.log('Sign in response data:', data);

        if (!response.ok) {
          return { data: null, error: data };
        }

        if (data.user && data.access_token) {
          console.log('Setting access token:', data.access_token.substring(0, 20) + '...');
          this.accessToken = data.access_token;
          this.memoryToken = data.access_token; // Store in memory as backup

          try {
            await AsyncStorage.setItem('supabase_user', JSON.stringify(data.user));
            await AsyncStorage.setItem('supabase_session', JSON.stringify(data));
            await AsyncStorage.setItem('supabase_access_token', data.access_token);
            console.log('Successfully stored access token in AsyncStorage and memory');

            // Verify it was stored
            const storedToken = await AsyncStorage.getItem('supabase_access_token');
            console.log('Verification - stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'none');
          } catch (storageError) {
            console.error('Error storing access token:', storageError);
          }
        }

        return { data, error: null };
      } catch (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
      }
    },

    signOut: async () => {
      try {
        this.accessToken = null;
        await AsyncStorage.removeItem('supabase_user');
        await AsyncStorage.removeItem('supabase_session');
        await AsyncStorage.removeItem('supabase_access_token');
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    getSession: async () => {
      try {
        const sessionData = await AsyncStorage.getItem('supabase_session');
        const accessToken = await AsyncStorage.getItem('supabase_access_token');

        console.log('Getting session - stored token:', accessToken ? accessToken.substring(0, 20) + '...' : 'none');

        if (accessToken) {
          this.accessToken = accessToken;
          console.log('Set access token from storage');
        } else if (this.memoryToken) {
          this.accessToken = this.memoryToken;
          console.log('Set access token from memory backup');
        } else {
          console.log('No access token found in storage or memory');
        }

        const session = sessionData ? JSON.parse(sessionData) : null;
        return { data: { session }, error: null };
      } catch (error) {
        console.error('Error getting session:', error);

        // Fallback to memory token
        if (this.memoryToken) {
          this.accessToken = this.memoryToken;
          console.log('Using memory token as fallback in getSession');
        }

        return { data: { session: null }, error };
      }
    },

    onAuthStateChange: (callback) => {
      // Simple implementation - in a real app you'd want more sophisticated state management
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  // Method to ensure we have the latest access token
  async ensureAccessToken() {
    try {
      console.log('Ensuring access token...');

      // First try to get from AsyncStorage
      const storedToken = await AsyncStorage.getItem('supabase_access_token');
      console.log('Retrieved token for ensure:', storedToken ? storedToken.substring(0, 20) + '...' : 'none');

      if (storedToken) {
        this.accessToken = storedToken;
        console.log('Ensured access token is set from storage');
        return true;
      }

      // Fallback to memory token (for Android AsyncStorage issues)
      if (this.memoryToken) {
        this.accessToken = this.memoryToken;
        console.log('Ensured access token is set from memory backup');
        return true;
      }

      console.log('No access token available in ensureAccessToken');
      return false;
    } catch (error) {
      console.error('Error ensuring access token:', error);

      // Last resort - try memory token
      if (this.memoryToken) {
        this.accessToken = this.memoryToken;
        console.log('Using memory token as last resort');
        return true;
      }

      return false;
    }
  }

  // Database methods
  from(table) {
    return new SupabaseTable(this.url, this, table);
  }
}

class SupabaseTable {
  constructor(url, client, table) {
    this.url = url;
    this.client = client;
    this.table = table;
    this.query = '';
    this.filters = [];
  }

  select(columns = '*') {
    this.query = `select=${columns}`;
    return this;
  }

  insert(data) {
    return {
      then: async (resolve, reject) => {
        try {
          // Ensure we have the latest access token
          await this.client.ensureAccessToken();

          const headers = await this.client.getHeaders();
          console.log('Inserting data into', this.table, ':', data);
          console.log('Using headers:', headers);

          const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
          });

          const result = await response.json();
          console.log('Insert response status:', response.status);
          console.log('Insert response:', result);

          if (!response.ok) {
            console.error('Insert failed:', result);
            resolve({ data: null, error: result });
          } else {
            console.log('Insert successful:', result);
            resolve({ data: result, error: null });
          }
        } catch (error) {
          console.error('Insert error:', error);
          resolve({ data: null, error });
        }
      }
    };
  }

  upsert(data) {
    return {
      then: async (resolve, reject) => {
        try {
          const headers = await this.client.getHeaders();
          const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
            method: 'POST',
            headers: {
              ...headers,
              'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(data)
          });

          const result = await response.json();

          if (!response.ok) {
            resolve({ data: null, error: result });
          } else {
            resolve({ data: result, error: null });
          }
        } catch (error) {
          resolve({ data: null, error });
        }
      }
    };
  }

  eq(column, value) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  limit(count) {
    this.filters.push(`limit=${count}`);
    return this;
  }

  not(column, operator, value) {
    this.filters.push(`${column}=not.${operator}.${value}`);
    return this;
  }

  order(column, options = {}) {
    const direction = options.ascending === false ? 'desc' : 'asc';
    this.filters.push(`order=${column}.${direction}`);
    return this;
  }

  single() {
    this.filters.push('limit=1');
    return {
      then: async (resolve, reject) => {
        try {
          const headers = await this.client.getHeaders();
          const queryString = [this.query, ...this.filters].filter(Boolean).join('&');
          const response = await fetch(`${this.url}/rest/v1/${this.table}?${queryString}`, {
            headers
          });

          const result = await response.json();

          if (!response.ok) {
            resolve({ data: null, error: result });
          } else {
            const data = Array.isArray(result) ? result[0] : result;
            resolve({ data, error: null });
          }
        } catch (error) {
          resolve({ data: null, error });
        }
      }
    };
  }

  async then(resolve, reject) {
    try {
      const headers = await this.client.getHeaders();
      const queryString = [this.query, ...this.filters].filter(Boolean).join('&');

      const response = await fetch(`${this.url}/rest/v1/${this.table}?${queryString}`, {
        headers
      });

      const result = await response.json();

      if (!response.ok) {
        resolve({ data: null, error: result });
      } else if (Array.isArray(result)) {
        resolve({ data: result, error: null });
      } else {
        resolve({ data: null, error: result });
      }
    } catch (error) {
      resolve({ data: null, error });
    }
  }
}

export const supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);
