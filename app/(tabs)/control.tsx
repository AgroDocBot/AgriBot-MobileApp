import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { ConnectScreen } from '@/components/control/ConnectToDevice';
import RobotControl from '@/components/control/Controller';
import { Dimensions } from 'react-native';

export default function TabControl() {

  const [isConnectedToBot, setConnectedToBot] = useState(false);

  function setSetConnectedToBot() { 
    setConnectedToBot(true);
  }

  
  return (
    <ThemedView style={styles.main}>
      {!isConnectedToBot ? 
        <ConnectScreen setConnectedState={setSetConnectedToBot}/>
        :
        <RobotControl key={isConnectedToBot ? "connected" : "disconnected"} isConnected={isConnectedToBot} />
      }
    </ThemedView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  main : {
    backgroundColor : '#222c2e',
    height : screenHeight *0.95,
  }
});
