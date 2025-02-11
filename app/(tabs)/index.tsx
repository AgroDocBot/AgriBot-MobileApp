import React, { useRef, useEffect } from 'react';
import { Animated, ImageBackground, StyleSheet, TextInput, View, Text, Button, Dimensions, Easing, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedView } from '@/components/ThemedView';
import { AnimatedBlurViewMethods } from 'react-native-animated-blur-view';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setAuthState } from '@/redux/authSlice';
import { useSelector } from 'react-redux';
import Home from '@/components/home/HomeScreen';

export default function HomeScreen() {

  const [isSignup, setIsSignup] = useState(false); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const [isLogged, setIsLogged] = useState<boolean>(false);

  const slideAnimHeader = useRef(new Animated.Value(-500)).current;
  const slideAnimForm = useRef(new Animated.Value(500)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    Animated.timing(slideAnimHeader, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnimForm, {
      toValue: 0,
      duration: 750,
      useNativeDriver: true,
    }).start();

    Animated.timing(blurAnim, {
      toValue: 100,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleSubmit = async () => {
    const url = isSignup
      ? 'https://agribot-backend-abck.onrender.com/auth/register'
      : 'https://agribot-backend-abck.onrender.com/auth/login';

    const body = isSignup
      ? { username, email, password }
      : { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
      },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        if (isSignup) {
          Alert.alert('Success', 'Account created successfully!');
          setIsSignup(false);
        } else {
          Alert.alert('Success', 'Logged in successfully!');
          console.log('Token:', data.accessToken);
          setIsLogged(true);
          dispatch(setAuthState({ token: data.accessToken, user: data.user }));
          console.log("User: "+user);
        }
      } else {
        Alert.alert('Error', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to connect to the server.');
    }
  };

  if(isLogged) return (<Home></Home>)
  else 
  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('@/assets/images/jed-owen-ajZibDGpPew-unsplash.jpg')}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <Animated.View style={[styles.blurContainer, { opacity: blurAnim.interpolate({ inputRange: [0, 100], outputRange: [0, 1] }) }]}>
            <BlurView intensity={3} style={styles.blurEffect}>
              <Text style={styles.headerText}>AgriBot - the smart solution for plant disease monitoring</Text>
            </BlurView>
          </Animated.View>
          <View style={styles.triangle} />
        </ImageBackground>
      </View>

      <Animated.View style={[styles.formContainer, { transform: [{ translateX: slideAnimForm }] }]}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />
        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable style={styles.login_btn} onPress={handleSubmit}>
          <Text style={styles.btn_text}>{isSignup ? 'Sign Up' : 'Login'}</Text>
        </Pressable>
        <Pressable onPress={() => setIsSignup(!isSignup)}>
          <Text style={styles.switchText}>
            {isSignup ? 'Already have an account? Log In' : "No account? Sign Up"}
          </Text>
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222c2e',

  },
  headerContainer: {
    height: screenHeight * 0.6, 
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  imageBackground: {
    flex: 1,
    position: 'absolute', 
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: screenWidth, 
    borderLeftColor: 'transparent',
    borderBottomWidth: 90, 
    borderBottomColor: '#222c2e', 
    borderRightWidth: screenWidth * 0.35, 
    borderRightColor: 'transparent',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#222c2e', 
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
    color : 'white'
  },
  login_btn: {
    backgroundColor: '#5cb85c',
    borderRadius : 10,
    height : 50,
    display : 'flex',
    justifyContent : 'center',
    alignContent : 'center' 
  },
  btn_text : {
    textAlign : 'center',
    color : 'white',
    fontSize : 20
  },
    switchText: {
    textAlign: 'center',
    color: '#5cb85c',
    marginTop: 20,
    fontSize: 16,
  },
});
