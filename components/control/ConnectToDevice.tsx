import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Text } from 'react-native-reanimated/lib/typescript/Animated';
import { Dimensions } from 'react-native';

export function ConnectScreen({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <ThemedView>
        <Pressable style={styles.connect_btn}>
          <TabBarIcon name={'wifi'} color={"white"} />     
        </Pressable>
        <Text>Connect</Text>
      </ThemedView>
    </ThemedView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
  connect_btn : {
    width : 100,
    height : 100,
    borderRadius : 25,
    backgroundColor : "#5cb85c",
    display : 'flex',
    flexDirection : 'column',
    justifyContent : 'center',
    alignItems : 'center'
  },
  container : {
    display : 'flex',
    flexDirection : 'column',
    justifyContent : 'center',
    alignItems : 'center'
  },
  main : {
    
  }
});
