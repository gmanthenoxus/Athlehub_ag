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

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, username);
      if (error) throw error;
      Alert.alert(
        'Success', 
        'Registration successful! Please check your email to confirm your account.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to sign up');
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
          <Text h1 style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Athlehub to track your sports matches</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder="Username"
            leftIcon={{ type: 'ionicon', name: 'person-outline' }}
            onChangeText={setUsername}
            value={username}
            autoCapitalize="none"
          />
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
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            buttonStyle={styles.button}
          />
          <Button
            title="Already have an account? Sign In"
            type="clear"
            onPress={() => navigation.navigate('SignIn')}
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
