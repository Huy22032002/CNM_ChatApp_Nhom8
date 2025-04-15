import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { API_URL } from "../api/apiConfig";


export default function LoginScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();


  const onLogin = async () => {
    try {
      if (!username || !password) {
        alert("Vui lòng nhập tài khoản và mật khẩu!");
        return;
      }

      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      if (res.status !== 200) {
        alert("Đăng nhập thất bại. Vui lòng thử lại!");
        return;
      }
      console.log(res.data);
      dispatch(
        setUser({
          user: res.data.user,
          accessToken: res.data.accessToken,
        })
      );

      navigation.navigate("homeChat");
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Sai tài khoản hoặc mật khẩu!");
      } else {
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      <TextInput
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.togglePassword}>
            {showPassword ? "🙈" : "👁️"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate("register")}>
        Chưa có tài khoản? Đăng ký
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingRight: 10,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  togglePassword: {
    fontSize: 18,
    paddingHorizontal: 8,
    color: "#555",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    marginTop: 16,
    color: "#0066cc",
    textDecorationLine: "underline",
  },
});
