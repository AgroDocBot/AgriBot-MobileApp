import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const PersonalSettings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Personal Settings</Text>

      <TouchableOpacity style={styles.settingItem}>
        <Ionicons name="key-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Ionicons name="log-out-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#222c2e",
    borderRadius: 8,
    marginTop: 10,
  },
  header: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#555",
  },
  settingText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 15,
  },
});
