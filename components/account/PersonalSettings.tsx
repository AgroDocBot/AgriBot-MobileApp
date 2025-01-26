import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';

export const PersonalSettings = () => {

  const { language, controlStyle, unitsSystem } = useSelector((state: any) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{i18n.t('personal.personalSettings')}</Text>

      <TouchableOpacity style={styles.settingItem}>
        <Ionicons name="key-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>{i18n.t('personal.changePassword')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
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
});
