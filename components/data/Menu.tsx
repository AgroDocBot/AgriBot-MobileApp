import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MenuProps } from '@/constants/types/PropsInterfaces';
import { Dimensions } from 'react-native';

export default function Menu({ activeTab, setActiveTab } : MenuProps) {
  const tabs = ['fields', 'measurements', 'diseases'];
  const { language, controlStyle, unitsSystem } = useSelector((state: RootState) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';
  
  return (
    <View style={styles.menu}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
        >
          <Text style={styles.tabText}>{i18n.t(`menu.${tab}`).toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tab: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    minWidth: 0.25*screenWidth,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#666',
  },
  tabText: {
    color: '#fff',
  },
});
