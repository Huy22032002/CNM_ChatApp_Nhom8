import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      console.log(process.env.API_URL);
      if (!username || !password) {
        alert('Vui lòng nhập tài khoản và mật khẩu!');
        return;
      }
      setLoading(true);
      const res = await axios.post(`${process.env.API_URL}/auth/login`, { username, password });
      navigation.navigate('homeChat', { user: res.data.user.name });
    } catch (err) {
      console.error(err);
      alert('Sai tài khoản hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <TextInput
        label="username"
        value={username}
        onChangeText={setUsername}
        left={<TextInput.Icon name="email" />}
        style={styles.input}
      />
      <TextInput
        label="Mật khẩu"
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
      <Button mode="contained" loading={loading} onPress={onLogin} style={styles.button}>
        Đăng nhập
      </Button>

      <Text style={styles.link} onPress={() => navigation.navigate('register')}>
        Chưa có tài khoản? Đăng ký
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
