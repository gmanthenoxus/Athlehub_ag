import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { useAuth } from '../../contexts/AuthContext';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text h1 style={styles.title}>Athlehub</Text>
          <Text style={styles.subtitle}>Track your matches, celebrate your wins</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder="Email"
            leftIcon={{ type: 'ionicon', name: 'mail-outline' }}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Password"
            leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            buttonStyle={styles.button}
          />
          <Button
            title="Don't have an account? Sign Up"
            type="clear"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#4361ee',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#4361ee',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
});
