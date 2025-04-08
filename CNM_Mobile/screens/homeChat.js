import React, { useState, useEffect } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import {
  Text, Searchbar, Avatar, Button, Divider, Menu, Modal, Portal, TextInput
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const DATA = {
  friends: [
    { id: '1', name: 'Huy', message: 'Hình ảnh nè!', avatar: require('../assets/user1.png') },
    { id: '2', name: 'Hoàng', message: 'Đã gọi cho con rồi nha', avatar: require('../assets/user2.png') },
    { id: '3', name: 'Hải', message: 'Gửi hình hôm qua', avatar: require('../assets/user3.png') },
  ],
  groups: [
    { id: '101', name: '111 Lê Đức Thọ - 1', message: 'Thanh Vy: Hình ảnh nè!', avatar: require('../assets/group1.png') },
    { id: '102', name: 'Le and Friends English Club', message: 'Chị Hằng: Ảnh đẹp nè!', avatar: require('../assets/group2.png') },
  ]
};

export default function HomeChat({ route }) {
  const { user } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('friends');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const filteredData = DATA[tab].filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchUser = async (username) => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/api/users/${username}`);
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Lỗi khi fetch user:', error.message);
    }
  };

  useEffect(() => {
    if (user) fetchUser(user);
  }, [user]);

  const changePassword = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/api/users/${user}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password }),
      });

      if (response.ok) {
        Alert.alert('Thành công', 'Đã đổi mật khẩu!');
        setShowChangePassword(false);
        setPassword('');
      } else {
        throw new Error('Thất bại');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
    }
  };

  const pickImageAndUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();
        formData.append('avatar', {
          uri: localUri,
          name: filename,
          type,
        });

        const response = await fetch(`http://10.0.2.2:8080/api/users/${user}/avatar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (response.ok) {
          Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
          fetchUser(user); // Reload avatar mới
        } else {
          throw new Error('Lỗi khi upload');
        }
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải ảnh');
      console.error(err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem}>
      <Avatar.Image source={item.avatar} size={48} />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMsg}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Xin chào, {userInfo?.fullName || user || 'User'} 👋</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              {userInfo?.avatarUrl ? (
                <Avatar.Image source={{ uri: userInfo.avatarUrl }} size={40} />
              ) : (
                <Avatar.Icon icon="account" size={40} />
              )}
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setShowChangePassword(true);
            }}
            title="Đổi mật khẩu"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              pickImageAndUpload();
            }}
            title="Đổi ảnh đại diện"
          />
        </Menu>
      </View>

      <Searchbar
        placeholder="Tìm kiếm"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.tabContainer}>
        <Button mode={tab === 'friends' ? 'contained' : 'outlined'} onPress={() => setTab('friends')}>
          Bạn bè
        </Button>
        <Button mode={tab === 'groups' ? 'contained' : 'outlined'} onPress={() => setTab('groups')}>
          Nhóm
        </Button>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={{ paddingBottom: 60 }}
      />

      {/* Modal: Đổi mật khẩu */}
      <Portal>
        <Modal visible={showChangePassword} onDismiss={() => setShowChangePassword(false)} contentContainerStyle={styles.modal}>
          <Text style={{ marginBottom: 10 }}>Nhập mật khẩu mới:</Text>
          <TextInput
            secureTextEntry
            label="Mật khẩu mới"
            value={password}
            onChangeText={setPassword}
          />
          <Button mode="contained" style={{ marginTop: 10 }} onPress={changePassword}>
            Xác nhận
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: { fontSize: 20, fontWeight: 'bold' },
  searchBar: { marginBottom: 12, borderRadius: 30 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  chatContent: {
    marginLeft: 12,
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatMsg: {
    fontSize: 14,
    color: 'gray',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});
