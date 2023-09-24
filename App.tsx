import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Slider = () => {
  const offsetY = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const wrapperHeight = useSharedValue(0);
  const onLeft = useSharedValue(false);
  const topValue = useSharedValue(0);
  const bottomValue = useSharedValue(0);
  const opacityValue = useSharedValue(0);

  const onLayout = (event) => {
    width.value = event.nativeEvent.layout.width;
    height.value = event.nativeEvent.layout.height;
  };

  const getWrapperHeight = (event) => {
    wrapperHeight.value = event.nativeEvent.layout.height;
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const translationY = event.translationY;
      if (
        onLeft.value &&
        Math.abs(translationY) <= wrapperHeight.value / 2 - 28
      ) {
        opacityValue.value = Math.abs(translationY) / 100;
        offsetY.value = translationY;
      }

      if (Math.abs(translationY) <= wrapperHeight.value / 2) {
        if (translationY < 0) {
          if (wrapperHeight.value + translationY * 2.5 < 0) {
            bottomValue.value = 0;
          } else {
            bottomValue.value = wrapperHeight.value + translationY * 2.5;
          }
          topValue.value = 0;
        } else {
          if (wrapperHeight.value - translationY * 2.5 < 0) {
            topValue.value = 0;
          } else {
            topValue.value = wrapperHeight.value - translationY * 2.5;
          }
          bottomValue.value = 0;
        }
      }
    })
    .onEnd(() => {
      offsetY.value = withSpring(0, {
        mass: 11,
        damping: 10,
        stiffness: 100,
        overshootClamping: true,
      });
      opacityValue.value = 0;
      onLeft.value = true;
      topValue.value = 0;
      bottomValue.value = 0;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  const gradientStyles = useAnimatedStyle(() => ({
    opacity: interpolate(opacityValue.value, [0, 1], [0, 1], {
      extrapolateRight: Extrapolation.CLAMP,
      extrapolateLeft: Extrapolation.EXTEND,
    }),
    bottom: interpolate(bottomValue.value, [0, 1], [0, 1]),
    top: interpolate(topValue.value, [0, 1], [0, 1]),
  }));

  return (
    <View onLayout={getWrapperHeight} style={styles.sliderTrack}>
      <AnimatedLinearGradient
        colors={["#4A90E2", "#F76D57"]}
        start={[0, 0]}
        end={[1, 1]}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 999,
          },
          gradientStyles,
        ]}
      />
      <View onLayout={onLayout} style={styles.wrapper}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.ball, animatedStyles]} />
        </GestureDetector>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Slider />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "black",
  },
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    backgroundColor: "#292524",
    height: "40%",
    borderRadius: 999,
    paddingHorizontal: 8,
  },
  ball: {
    borderRadius: 999,
    backgroundColor: "white",
    padding: 22,
  },
});
