import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  Alert,
  Image,
  Modal,
  Button,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';


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
  const { userId, accessToken } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('friends');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const filteredData = DATA[tab].filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Lỗi khi fetch user');
      setUserInfo(data);
    } catch (error) {
      console.error('Lỗi khi fetch user:', error.message);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, []);
  
  const changePassword = async () => {
    try {
      const id = userId;
      if (!id) {
        Alert.alert('Lỗi', 'Không tìm thấy ID người dùng');
        return;
      }
      if (!oldPassword || !password || !confirmPassword) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
      }
  
      if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
        return;
      }
  
      try {
        // Gọi check mật khẩu cũ
        const res = await axios.post(
          "http://10.0.2.2:3000/api/users/checkMatchPassword",
          {
            username: userInfo?.username,
            password: oldPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        if (res.status !== 200) {
          Alert.alert('Lỗi', 'Mật khẩu cũ không chính xác!');
          return;
        }
        
      } catch (error) {
        if (error.response?.status === 401) {
          Alert.alert('Lỗi', 'Mật khẩu cũ không chính xác!');
          return;
        } else {
          Alert.alert('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại!');
          return;
        }
      }

  
    
        
        await axios.post(`http://10.0.2.2:3000/api/users/updatePassword/`, 
          {
            id: userInfo?.id,
            password: password,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
  
        Alert.alert('Thành công', 'Đã đổi mật khẩu thành công');
        setShowChangePassword(false);
        setOldPassword('');
        setPassword('');
        setConfirmPassword('');
      
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        Alert.alert('Lỗi', err.response.data.message || 'Mật khẩu cũ không chính xác!');
      } else {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đổi mật khẩu');
      }
      console.error(err);
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

        const response = await fetch(`http://10.0.2.2:8080/api/users/${userId}/avatar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (response.ok) {
          Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
          fetchUser(userId);
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
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMsg}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Xin chào, {userInfo?.username || 'User'} 👋</Text>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Image
            source={userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : require('../assets/default-avatar.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => { setMenuVisible(false); setShowChangePassword(true); }}>
            <Text style={styles.menuItem}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMenuVisible(false); pickImageAndUpload(); }}>
            <Text style={styles.menuItem}>Đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        placeholder="Tìm kiếm"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'friends' && styles.activeTab]}
          onPress={() => setTab('friends')}
        >
          <Text style={tab === 'friends' ? styles.activeTabText : styles.tabText}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'groups' && styles.activeTab]}
          onPress={() => setTab('groups')}
        >
          <Text style={tab === 'groups' ? styles.activeTabText : styles.tabText}>Nhóm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 60 }}
      />

      <Modal visible={showChangePassword} transparent animationType="slide">
        <View style={styles.modalView}>
          <Text style={{ marginBottom: 10 }}>Mật khẩu cũ:</Text>
          <TextInput
            placeholder="Mật khẩu cũ"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
            style={styles.input}
          />
          <Text style={{ marginBottom: 10 }}>Mật khẩu mới:</Text>
          <TextInput
            placeholder="Mật khẩu mới"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <Text style={{ marginBottom: 10 }}>Xác nhận mật khẩu mới:</Text>
          <TextInput
            placeholder="Xác nhận mật khẩu mới"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <Button title="Xác nhận" onPress={changePassword} />
          <Button title="Huỷ" color="gray" onPress={() => setShowChangePassword(false)} />
        </View>
      </Modal>
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
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  menu: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    position: 'absolute',
    right: 16,
    top: 70,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  activeTab: {
    backgroundColor: '#0066cc',
  },
  tabText: {
    color: '#0066cc',
  },
  activeTabText: {
    color: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  modalView: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    marginTop: '40%',
    borderRadius: 8,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
});
