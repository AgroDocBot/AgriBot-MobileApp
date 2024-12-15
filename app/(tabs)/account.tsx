import React, { useState } from 'react';
import { StyleSheet, Image, Platform, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';

export default function TabAccount() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const toggleSettings = () => setIsCollapsed(!isCollapsed);

  return (
    <ThemedView style={styles.main}>
      <View style={styles.headerContainer}>
        <Image source={{uri: 'https://example.com/user-avatar.png'}} style={styles.avatar} />
        <View style={styles.titleContainer}>
          <Text style={styles.userName}>Name Surname</Text>
          <Text style={styles.userRole}>Guest</Text>
        </View>
      </View>

      <Collapsible title="Settings" isCollapsed={isCollapsed} onToggle={toggleSettings}>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="settings" size={24} color="#FFF" />
            <Text style={styles.settingText}>Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="log-out" size={24} color="#FFF" />
            <Text style={styles.settingText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>
    </ThemedView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#222c2e',
    height: screenHeight * 0.95,
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#808080',
    fontSize: 14,
  },
  settingsContainer: {
    marginTop: 15,
    backgroundColor : '#222c2e'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#555',
  },
  settingText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 15,
  },
  collapsibleStyle : {
    backgroundColor: '#222c2e'
  }
});
