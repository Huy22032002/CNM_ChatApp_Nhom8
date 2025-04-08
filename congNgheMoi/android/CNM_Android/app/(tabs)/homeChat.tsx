import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput as RNTextInput } from 'react-native';
import { Text, Avatar, Card, TouchableRipple, useTheme } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { Tabs } from 'react-native-collapsible-tab-view';

const DUMMY_FRIENDS = [
  { id: '1', name: 'Nguyễn Văn A', message: 'Hello!', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Trần Thị B', message: 'Hẹn gặp lại nhé!', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Phạm C', message: 'Ok rồi đó.', avatar: 'https://i.pravatar.cc/150?img=3' },
];

const DUMMY_GROUPS = [
  { id: 'g1', name: 'Lớp 12A1', message: 'Chuẩn bị offline nha', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 'g2', name: 'Gia đình', message: 'Ai ăn cơm chưa?', avatar: 'https://i.pravatar.cc/150?img=5' },
];

export default function HomeChatScreen() {
  const { user } = useLocalSearchParams();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const filteredFriends = DUMMY_FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = DUMMY_GROUPS.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <TouchableRipple onPress={() => console.log('Chọn: ', item.name)}>
      <Card style={styles.chatItem}>
        <Card.Content style={styles.row}>
          <Avatar.Image source={{ uri: item.avatar }} size={50} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableRipple>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.header}>Xin chào, {user} 👋</Text>

      <View style={styles.searchBox}>
        <RNTextInput
          placeholder="Tìm kiếm bạn bè, nhóm..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Tabs.Container
        renderTabBar={(props) => (
          <Tabs.TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.colors.primary }}
            style={{ backgroundColor: theme.colors.surface }}
          />
        )}
        headerHeight={0}
      >
        <Tabs.Tab name="Bạn bè">
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        </Tabs.Tab>

        <Tabs.Tab name="Nhóm">
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchBox: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchInput: {
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  chatItem: {
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#555',
  },
});
