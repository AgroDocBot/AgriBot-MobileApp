import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { AccountHeader } from '@/components/account/AccountHeader';
import { SettingsSection } from '@/components/account/SettingsSection';
import { AppStats } from '@/components/account/AppStats';
import { PersonalSettings } from '@/components/account/PersonalSettings';

export default function TabAccount() {
  return (
    <ScrollView style={styles.viewStyle}>
    <ThemedView style={styles.main}>
      <AccountHeader/>
      <SettingsSection/>
      <AppStats/>
      <PersonalSettings/>
    </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#222c2e',
    height: '100%',
    padding: 20,
  },
  viewStyle: {
    backgroundColor: '#222c2e',
  }
});
