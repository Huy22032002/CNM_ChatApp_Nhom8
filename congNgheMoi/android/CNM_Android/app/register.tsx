import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const api_url = 'https://your-api.com';

export default function RegisterScreen() {
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
      await axios.post(`${api_url}/auth/register`, data);
      alert('Đăng ký thành công! Hãy đăng nhập.');
      router.replace('/login');
    } catch (err) {
      alert('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#66bb6a', '#43a047']} style={styles.gradient}>
      <Card style={styles.card}>
        <Card.Title title="Tạo tài khoản" subtitle="Đăng ký để bắt đầu sử dụng" />
        <Card.Content>
          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email không được để trống' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Email"
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
            Đăng ký
          </Button>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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
    color: '#1b5e20',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
