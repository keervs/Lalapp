import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

export default function Splash() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start(() => {
      router.replace("/signin"); // go to home
    });
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "65%"],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require("../_assets/splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.union}>LBSITW COLLEGE UNION 2025–26</Text>
      <Text style={styles.title}>LALAPP</Text>

      <View style={styles.loader}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6DDE0",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  union: {
    fontSize: 12,
    color: "#555",
    letterSpacing: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 18,
  },
  loader: {
    width: "60%",
    height: 4,
    backgroundColor: "#d3d3d3",
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#555",
  },
});
