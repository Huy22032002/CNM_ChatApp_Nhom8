import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from 'react-native-paper';
import ConversationApi from '../api/conversationApi';

const GroupInfoScreen = ({ route }) => {
  const navigation = useNavigation();
  const { conversation_id, groupName: initialGroupName, participants: initialParticipants } = route.params || {};
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);
  
  // States
  const [groupName, setGroupName] = useState(initialGroupName || '');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [participants, setParticipants] = useState(initialParticipants || []);
  const [participantsDetail, setParticipantsDetail] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  
  // Fetch group details, participants and friends
  useEffect(() => {
    fetchGroupDetails();
    fetchParticipantsDetail();
    fetchFriends();
  }, [conversation_id]);
  
  const fetchGroupDetails = async () => {
    try {
      const response = await ConversationApi.fetchConversationsByConverId(conversation_id, accessToken);
      if (response) {
        setGroupName(response.group_name || '');
        setGroupAvatar(response.group_avatar || null);
        setParticipants(response.participants || []);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };
  
  const fetchParticipantsDetail = async () => {
    try {
      // Assuming you have an API to get user details for each participant
      // For now, we'll use mock data
      const details = await Promise.all(
        participants.map(async (id) => {
          try {
            const userData = await ConversationApi.getUserById(id, accessToken);
            return userData || { user_id: id, fullname: 'Unknown User', avatar_url: null };
          } catch (error) {
            return { user_id: id, fullname: 'Unknown User', avatar_url: null };
          }
        })
      );
      setParticipantsDetail(details);
    } catch (error) {
      console.error('Error fetching participant details:', error);
    }
  };
  
  const fetchFriends = async () => {
    try {
      // Assuming there's an API to get user's friends
      const response = await ConversationApi.getFriends(user.id, accessToken);
      // Filter out users who are already in the group
      const filteredFriends = response.filter(
        friend => !participants.includes(friend.user_id)
      );
      setFriends(filteredFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  };
  
  // Handlers
  const handleSelectAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions to change group avatar');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      setGroupAvatar(result.assets[0].uri);
      handleUpdateGroupAvatar(result.assets[0]);
    }
  };
  
  const handleUpdateGroupName = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }
    
    try {
      await ConversationApi.updateConversation(
        conversation_id,
        { group_name: groupName },
        accessToken
      );
      setIsEditingName(false);
      Alert.alert('Success', 'Group name has been updated');
    } catch (error) {
      console.error('Error updating group name:', error);
      Alert.alert('Error', 'Failed to update group name');
    }
  };
  
  const handleUpdateGroupAvatar = async (imageAsset) => {
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversation_id);
      formData.append('avatar', {
        uri: imageAsset.uri,
        name: 'group-avatar.jpg',
        type: 'image/jpeg',
      });
      
      await ConversationApi.updateConversationAvatar(formData, accessToken);
      Alert.alert('Success', 'Group avatar has been updated');
    } catch (error) {
      console.error('Error updating group avatar:', error);
      Alert.alert('Error', 'Failed to update group avatar');
    }
  };
  
  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) {
      setShowAddMemberModal(false);
      return;
    }
    
    try {
      await ConversationApi.addParticipants(
        conversation_id,
        selectedFriends.map(friend => friend.user_id),
        accessToken
      );
      
      // Update participants list
      const newParticipants = [...participants, ...selectedFriends.map(f => f.user_id)];
      setParticipants(newParticipants);
      
      // Update participants detail
      const newParticipantsDetail = [...participantsDetail, ...selectedFriends];
      setParticipantsDetail(newParticipantsDetail);
      
      setSelectedFriends([]);
      setShowAddMemberModal(false);
      fetchFriends(); // Refresh friends list
      
      Alert.alert('Success', 'Members added to the group');
    } catch (error) {
      console.error('Error adding members:', error);
      Alert.alert('Error', 'Failed to add members to the group');
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    if (memberId === user.id) {
      handleLeaveGroup();
      return;
    }
    
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await ConversationApi.removeParticipant(
                conversation_id,
                memberId,
                accessToken
              );
              
              // Update participants list
              const newParticipants = participants.filter(id => id !== memberId);
              setParticipants(newParticipants);
              
              // Update participants detail
              const newParticipantsDetail = participantsDetail.filter(
                p => p.user_id !== memberId
              );
              setParticipantsDetail(newParticipantsDetail);
              
              Alert.alert('Success', 'Member removed from the group');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member from the group');
            }
          },
        },
      ]
    );
  };
  
  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await ConversationApi.leaveConversation(
                conversation_id,
                user.id,
                accessToken
              );
              Alert.alert('Success', 'You have left the group');
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave the group');
            }
          },
        },
      ]
    );
  };
  
  const toggleFriendSelection = (friend) => {
    const isSelected = selectedFriends.some(f => f.user_id === friend.user_id);
    
    if (isSelected) {
      setSelectedFriends(selectedFriends.filter(f => f.user_id !== friend.user_id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };
  
  // Render functions
  const renderParticipant = ({ item }) => {
    const isCurrentUser = item.user_id === user.id;
    
    return (
      <View style={styles.participantItem}>
        <Image
          source={
            item.avatar_url
              ? { uri: item.avatar_url }
              : require('../assets/default-avatar.png')
          }
          style={styles.participantAvatar}
        />
        <Text style={styles.participantName}>
          {item.fullname} {isCurrentUser ? '(You)' : ''}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveMember(item.user_id)}
        >
          <Icon name="close-circle" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderFriendItem = ({ item }) => {
    const isSelected = selectedFriends.some(f => f.user_id === item.user_id);
    
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item)}
      >
        <Image
          source={
            item.avatar_url
              ? { uri: item.avatar_url }
              : require('../assets/default-avatar.png')
          }
          style={styles.friendAvatar}
        />
        <Text style={styles.friendName}>{item.fullname}</Text>
        {isSelected && (
          <Icon name="check-circle" size={24} color="#4CAF50" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Info</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Group avatar and name */}
        <View style={styles.groupInfoSection}>
          <TouchableOpacity onPress={handleSelectAvatar}>
            {groupAvatar ? (
              <Image source={{ uri: groupAvatar }} style={styles.groupAvatar} />
            ) : (
              <View style={styles.groupAvatarPlaceholder}>
                <Icon name="camera-plus" size={40} color="#6200ea" />
              </View>
            )}
          </TouchableOpacity>
          
          {isEditingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => setIsEditingName(false)}
                >
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton]}
                  onPress={handleUpdateGroupName}
                >
                  <Text style={styles.editButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.groupNameContainer}>
              <Text style={styles.groupName}>{groupName}</Text>
              <TouchableOpacity
                onPress={() => setIsEditingName(true)}
                style={styles.editNameButton}
              >
                <Icon name="pencil" size={20} color="#6200ea" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Members section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Members ({participantsDetail.length})
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMemberModal(true)}
            >
              <Icon name="account-plus" size={24} color="#6200ea" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={participantsDetail}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.user_id.toString()}
            scrollEnabled={false}
          />
        </View>
        
        {/* Leave group button */}
        <TouchableOpacity
          style={styles.leaveGroupButton}
          onPress={handleLeaveGroup}
        >
          <Icon name="exit-to-app" size={24} color="#fff" />
          <Text style={styles.leaveGroupText}>Leave Group</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Add members modal */}
      <Modal
        visible={showAddMemberModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Members</Text>
              <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {friends.length > 0 ? (
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.user_id.toString()}
                style={styles.friendsList}
              />
            ) : (
              <View style={styles.noFriendsContainer}>
                <Text style={styles.noFriendsText}>No friends available to add</Text>
              </View>
            )}
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.addMembersButton,
                  selectedFriends.length === 0 && styles.disabledButton,
                ]}
                onPress={handleAddMembers}
                disabled={selectedFriends.length === 0}
              >
                <Text style={styles.addMembersButtonText}>
                  Add {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    height: 60,
    backgroundColor: '#6200ea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  groupInfoSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  groupAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  editNameButton: {
    marginLeft: 10,
    padding: 5,
  },
  editNameContainer: {
    width: '80%',
    marginTop: 10,
  },
  nameInput: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#6200ea',
    paddingVertical: 5,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#6200ea',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#6200ea',
    marginLeft: 5,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  participantName: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  removeButton: {
    padding: 5,
  },
  leaveGroupButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    marginVertical: 20,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  leaveGroupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendsList: {
    maxHeight: 300,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendName: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  addMembersButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
  },
  addMembersButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noFriendsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noFriendsText: {
    fontSize: 16,
    color: '#757575',
  },
});

export default GroupInfoScreen;