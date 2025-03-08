import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import i18n from '@/translations/i18n';
import { logout } from '../../redux/authSlice';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthState } from '../../redux/authSlice';

export const PersonalSettings = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { language } = useSelector((state: any) => state.settings);
  const user = useSelector((state: any) => state.auth.user);

  if (language === 'English') i18n.locale = 'en';
  else if (language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function handleLogout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    dispatch(logout());
    dispatch(setAuthState({ token: '', user: null }));
    router.replace('/(tabs)/');
  }

  function handleChangePassword() {
    setShowPasswordFields(!showPasswordFields);
  }

  const handleUpdatePassword = async () => {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    try {
      const response = await fetch('https://agribot-backend-abck.onrender.com/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      Alert.alert('Success', 'Password changed successfully');
      setNewPassword('');
    } catch (error : any) {
      Alert.alert('Error', error.message);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>{i18n.t('personal.personalSettings')}</Text>

      {/* Change Password Button */}
      <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
        <Ionicons name="key-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>{i18n.t('personal.changePassword')}</Text>
      </TouchableOpacity>

      {/* Password Fields */}
      {showPasswordFields && (
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('personal.newPassword')}
            placeholderTextColor="#888"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('personal.confirmNewPassword')}
            placeholderTextColor="#888"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
            <Text style={styles.updateButtonText}>{i18n.t('personal.updatePassword')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>{i18n.t('personal.logout')}</Text>
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
  passwordContainer: {
    marginTop: 10,
  },
  input: {
    backgroundColor: "#333",
    color: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  updateButton: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PersonalSettings;
