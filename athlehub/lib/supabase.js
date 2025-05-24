import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://thpzyyeannuzsegrhnwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHp5eWVhbm51enNlZ3JobndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDA3MTcsImV4cCI6MjA2MzQ3NjcxN30.Viy_WN6woTTgKKtoIfKxNlukNh_k0M7MeLxUgSauk3o';

// Custom Supabase client that only uses REST API (no WebSocket/realtime)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  // Auth methods
  auth = {
    signUp: async ({ email, password }) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/signup`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
          return { data: null, error: data };
        }

        if (data.user) {
          await AsyncStorage.setItem('supabase_user', JSON.stringify(data.user));
          await AsyncStorage.setItem('supabase_session', JSON.stringify(data.session));
        }

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    signInWithPassword: async ({ email, password }) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
          return { data: null, error: data };
        }

        if (data.user) {
          await AsyncStorage.setItem('supabase_user', JSON.stringify(data.user));
          await AsyncStorage.setItem('supabase_session', JSON.stringify(data));
        }

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    signOut: async () => {
      try {
        await AsyncStorage.removeItem('supabase_user');
        await AsyncStorage.removeItem('supabase_session');
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    getSession: async () => {
      try {
        const sessionData = await AsyncStorage.getItem('supabase_session');
        const session = sessionData ? JSON.parse(sessionData) : null;
        return { data: { session }, error: null };
      } catch (error) {
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

  // Database methods
  from(table) {
    return new SupabaseTable(this.url, this.headers, table);
  }
}

class SupabaseTable {
  constructor(url, headers, table) {
    this.url = url;
    this.headers = headers;
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
          const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
            method: 'POST',
            headers: this.headers,
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

  upsert(data) {
    return {
      then: async (resolve, reject) => {
        try {
          const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
            method: 'POST',
            headers: {
              ...this.headers,
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
          const queryString = [this.query, ...this.filters].filter(Boolean).join('&');
          const response = await fetch(`${this.url}/rest/v1/${this.table}?${queryString}`, {
            headers: this.headers
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

  then(resolve, reject) {
    const queryString = [this.query, ...this.filters].filter(Boolean).join('&');

    fetch(`${this.url}/rest/v1/${this.table}?${queryString}`, {
      headers: this.headers
    })
    .then(response => response.json())
    .then(result => {
      if (Array.isArray(result)) {
        resolve({ data: result, error: null });
      } else {
        resolve({ data: null, error: result });
      }
    })
    .catch(error => {
      resolve({ data: null, error });
    });
  }
}

export const supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);
