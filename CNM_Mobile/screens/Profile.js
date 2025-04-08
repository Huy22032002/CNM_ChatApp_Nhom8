import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Avatar, Button } from "react-native-paper";

export default function Profile({ route, navigation }) {
  const { userInfo } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userInfo?.avatarUrl ? (
        <Avatar.Image size={100} source={{ uri: userInfo.avatarUrl }} />
      ) : (
        <Avatar.Icon size={100} icon="account" />
      )}
      <Text style={styles.name}>{userInfo?.fullName || "Chưa có tên"}</Text>
      <Text style={styles.info}>Username: {userInfo?.username}</Text>
      <Text style={styles.info}>
        Email: {userInfo?.email || "Chưa có email"}
      </Text>
      <Text style={styles.info}>
        SĐT: {userInfo?.phoneNumber || "Chưa có số điện thoại"}
      </Text>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        Quay lại
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    marginTop: 6,
  },
  button: {
    marginTop: 30,
    width: "80%",
    borderRadius: 8,
  },
});
