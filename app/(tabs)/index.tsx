import React, { useRef, useEffect } from 'react';
import { Animated, ImageBackground, StyleSheet, TextInput, View, Text, Button, Dimensions, Easing } from 'react-native';
import { BlurView } from 'expo-blur';

export default function HomeScreen() {
  const slideAnimHeader = useRef(new Animated.Value(-500)).current;
  const slideAnimForm = useRef(new Animated.Value(500)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate header sliding in
    Animated.timing(slideAnimHeader, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Animate bottom form sliding in
    Animated.timing(slideAnimForm, {
      toValue: 0,
      duration: 1200,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Animate blurring effect
    Animated.timing(blurAnim, {
      toValue: 100,
      duration: 2000, // Slow blur animation
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.headerContainer, { transform: [{ translateX: slideAnimHeader }] }]}>
        <ImageBackground
          source={require('@/assets/images/jed-owen-ajZibDGpPew-unsplash.jpg')} // Replace with your image path
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <Animated.View style={[styles.blurContainer, { opacity: blurAnim.interpolate({ inputRange: [0, 100], outputRange: [0, 1] }) }]}>
            <BlurView intensity={20} style={styles.blurEffect}>
              <Text style={styles.headerText}>Welcome to My App!</Text>
            </BlurView>
          </Animated.View>
        </ImageBackground>
      </Animated.View>

      {/* Triangle to simulate tilted bottom border */}
      <View style={styles.triangle} />

      {/* Colored bottom section */}
      <Animated.View style={[styles.formContainer, { transform: [{ translateX: slideAnimForm }] }]}>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry />
        <Button title="Login" onPress={() => {}} />
      </Animated.View>
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    height: screenHeight * 0.4, // 2/5 of the screen height
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurEffect: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: screenWidth, // Full width of the screen
    borderLeftColor: 'transparent',
    borderBottomWidth: 50, // Adjust the height of the triangle
    borderBottomColor: '#eaeaea', // Same color as the bottom section or background
    borderRightWidth: screenWidth * 0.7, // Adjust to create 30°/60° angles
    borderRightColor: 'transparent',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#eaeaea', // Colored section to contrast the triangle
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});
