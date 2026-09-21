// Task App-23: one-time animated intro shown right after the native splash
// hides — the native splash (app.json/expo-splash-screen) can only show a
// static image, so the "Smart Route AI" text fade-in has to happen here, in
// JS, instead. Renders the SAME plain background the native splash used
// (../../assets/splash/splash-background.png) underneath, then crossfades in
// a second image that already has the title + tagline baked in — using two
// designed images instead of a live <Text> node keeps the exact typography/
// layout the designer made, with zero risk of it drifting from the mockup.
//
// This is a plain mount-time overlay (see _layout.tsx), not a route: it has
// no navigation history entry, so it can never be revisited via back
// navigation and is never shown a second time in the same app session.
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

// Tuned so fade-in delay + fade-in duration + hold stays well under the
// task's ~3-4s total-startup budget once combined with JS/font boot time.
const FADE_IN_DELAY_MS = 250;
const FADE_IN_DURATION_MS = 700;
const HOLD_AFTER_FADE_MS = 1200;
const TOTAL_MS = FADE_IN_DELAY_MS + FADE_IN_DURATION_MS + HOLD_AFTER_FADE_MS;

interface SplashIntroProps {
  onFinish: () => void;
}

export default function SplashIntro({ onFinish }: SplashIntroProps) {
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(textOpacity, {
      toValue: 1,
      duration: FADE_IN_DURATION_MS,
      delay: FADE_IN_DELAY_MS,
      useNativeDriver: true,
    });
    animation.start();

    const timer = setTimeout(onFinish, TOTAL_MS);
    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [onFinish, textOpacity]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={require("@/assets/splash/splash-background.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Animated.Image
        source={require("@/assets/splash/splash-background-with-text.png")}
        style={[StyleSheet.absoluteFill, { opacity: textOpacity }]}
        resizeMode="cover"
      />
    </View>
  );
}
