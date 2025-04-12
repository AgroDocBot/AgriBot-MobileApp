import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';

const width = Dimensions.get("window").width;

const SIZE = 0.65*width;
const STICK_SIZE = 60 / 150 * SIZE;

const JoystickControl = ({ onMove }: { onMove: (dir: string) => void }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;

        const maxRadius = (SIZE - STICK_SIZE) / 2;
        let clampedX = Math.max(-maxRadius, Math.min(dx, maxRadius));
        let clampedY = Math.max(-maxRadius, Math.min(dy, maxRadius));

        pan.setValue({ x: clampedX, y: clampedY });

        // Normalize to range [-1, 1]
        const normX = clampedX / maxRadius;
        const normY = clampedY / maxRadius;

        const direction = getDirection(normX, normY);
        onMove(direction);
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        onMove('stop');
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.joystickBase}>
        <Animated.View
          style={[styles.stick, { transform: pan.getTranslateTransform() }]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const getDirection = (x: number, y: number): string => {
  if (y < -0.5) return 'go_forward';
  if (y > 0.5) return 'go_backward';
  if (x < -0.5) return 'go_left';
  if (x > 0.5) return 'go_left';
  return 'stop';
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30
  },
  joystickBase: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stick: {
    width: STICK_SIZE,
    height: STICK_SIZE,
    borderRadius: STICK_SIZE / 2,
    backgroundColor: '#5cb85c',
    position: 'absolute',
  },
});

export default JoystickControl;
