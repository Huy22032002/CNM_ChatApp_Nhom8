import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const api_url = 'https://your-api.com';

export default function LoginScreen() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await axios.post(`${api_url}/auth/login`, data);
      const user = res.data.user || data.email;
      router.replace({ pathname: '/homeChat', params: { user } });
    } catch (err) {
      alert('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#2196f3', '#21cbf3']} style={styles.gradient}>
      <Card style={styles.card}>
        <Card.Title title="Chào mừng bạn!" subtitle="Đăng nhập để tiếp tục" />
        <Card.Content>
          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email không được để trống' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Email"
                placeholder="you@example.com"
                left={<TextInput.Icon icon="email" />}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.email}
                style={styles.input}
              />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Mật khẩu không được để trống' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Mật khẩu"
                placeholder="••••••••"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={isPasswordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  />
                }
                secureTextEntry={!isPasswordVisible}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.password}
                style={styles.input}
              />
            )}
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

          <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.button}>
            Đăng nhập
          </Button>

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { padding: 16, borderRadius: 12 },
  input: { marginBottom: 10 },
  button: { marginTop: 12 },
  error: { color: 'red', fontSize: 12, marginBottom: 6 },
  link: {
    marginTop: 14,
    color: '#1976d2',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
