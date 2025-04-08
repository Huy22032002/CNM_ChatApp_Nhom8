import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Searchbar, Avatar, Button, Divider } from 'react-native-paper';

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
  const [tab, setTab] = useState('friends'); // friends | groups

  const filteredData = DATA[tab].filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Text style={styles.header}>Xin chào, {user || 'User'} 👋</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
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
});
