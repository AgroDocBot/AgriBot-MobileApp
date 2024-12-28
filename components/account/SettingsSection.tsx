import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage, toggleControlStyle, toggleUnitsSystem } from '../../redux/settingsSlice';

export const SettingsSection = () => {
  const dispatch = useDispatch();
  const { language, controlStyle, units } = useSelector((state: any) => state.settings);

  const [languageDropdown, setLanguageDropdown] = useState<boolean>(false);
  const [controlStyleDropdown, setControlStyleDropdown] = useState<boolean>(false);
  const [unitsDropdown, setUnitsDropDown] = useState<boolean>(false);

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.header}>General Settings</Text>
      {/* Language Setting */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setLanguageDropdown(!languageDropdown)}>
        <Ionicons name={languageDropdown ? "chevron-down-outline" : "chevron-forward-outline" } size={24} color="#FFF" style={ {marginRight : 20} }/>
        <Ionicons name="language-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>Language: {language}</Text>
      </TouchableOpacity>
      {languageDropdown && (
        <View style={styles.dropdown}>
          {['English', 'German', 'Bulgarian'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.dropdownItem}
              onPress={() => {
                dispatch(setLanguage(lang));
                setLanguageDropdown(false);
              }}>
              <Text style={[styles.dropdownText, lang === language && styles.selectedText]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Control Style Setting */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setControlStyleDropdown(!controlStyleDropdown)}>
        <Ionicons name={controlStyleDropdown ? "chevron-down-outline" : "chevron-forward-outline" } size={24} color="#FFF" style={ {marginRight : 20} }/>
        <Ionicons name="game-controller-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>
          Control Style: {controlStyle === 'keypad' ? 'Keypad' : 'Wheel'}
        </Text>
      </TouchableOpacity>
      {controlStyleDropdown && (
        <View style={styles.dropdown}>
          {['Keypad', 'Wheel'].map((style) => (
            <TouchableOpacity
              key={style}
              style={styles.dropdownItem}
              onPress={() => {
                dispatch(toggleControlStyle());
                setControlStyleDropdown(false);
              }}>
              <Text style={[styles.dropdownText, style === controlStyle && styles.selectedText]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Measurement Units */}
      <TouchableOpacity style={styles.settingItem}
          onPress={() => setUnitsDropDown(!unitsDropdown)}>
        <Ionicons name={unitsDropdown ? "chevron-down-outline" : "chevron-forward-outline" } size={24} color="#FFF" style={ {marginRight : 20} }/>
        <Ionicons name="speedometer-outline" size={24} color="#FFF" />
        <Text style={styles.settingText}>Measurement Units: Metric</Text>
      </TouchableOpacity>
      {unitsDropdown && (
        <View style={styles.dropdown}>
          {['Metric', 'Imperial'].map((unit) => (
            <TouchableOpacity
              key={unit}
              style={styles.dropdownItem}
              onPress={() => {
                dispatch(toggleUnitsSystem());
                setUnitsDropDown(false);
              }}>
              <Text style={[styles.dropdownText, unit === controlStyle && styles.selectedText]}>
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    marginTop: 15,
    backgroundColor: '#222c2e',
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
  dropdown: {
    padding: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  dropdownText: {
    color: '#FFF',
    fontSize: 14,
  },
  selectedText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  header: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
