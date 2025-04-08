import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      await axios.post(`${process.env.API_URL}/auth/register`, { email, phone, username, password });
      alert('Đăng ký thành công!');
      navigation.navigate('login');
    } catch (err) {
      alert('Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/register.png')} style={styles.logo} />
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        left={<TextInput.Icon name="account" />}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        left={<TextInput.Icon name="email" />}
        style={styles.input}
      />
      <TextInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        left={<TextInput.Icon name="phone" />}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        left={<TextInput.Icon name="lock" />}
        right={
          <TextInput.Icon
            name={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        style={styles.input}
      />
      <Button mode="contained" onPress={onRegister} loading={loading} style={styles.button}>
        Đăng ký
      </Button>

      <Text style={styles.link} onPress={() => navigation.navigate('login')}>
        Đã có tài khoản? Đăng nhập
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  input: { marginBottom: 12 },
  button: { marginVertical: 12, borderRadius: 10 },
  link: { textAlign: 'center', marginTop: 16, color: '#0066cc' },
});
