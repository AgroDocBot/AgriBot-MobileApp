import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TextInput, ScrollView } from 'react-native';
import Menu from '@/components/data/Menu';
import CardList from '@/components/data/CardList';
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function DataScreen() {
  const [activeTab, setActiveTab] = useState<"fields" | "measurements" | "diseases">('fields');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initialization of chosen language pack
  const { language, controlStyle, unitsSystem } = useSelector((state: RootState) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  return (
    <View style={styles.main}>
      <Menu activeTab={activeTab} setActiveTab={setActiveTab} />
      <TextInput
        style={styles.searchBar}
        placeholder={i18n.t("menu.search")}
        placeholderTextColor="#ccc"
        value={searchQuery}
        onChangeText={setSearchQuery}
        keyboardType="default"
      />
      <ScrollView>
        <CardList activeTab={activeTab} searchQuery={searchQuery} />
      </ScrollView>
    </View>
  );
}

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#222c2e',
    height: screenHeight * 0.95,
    padding: 20,
  },
  searchBar: {
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});
