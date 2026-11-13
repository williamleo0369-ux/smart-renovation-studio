import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";

export default function IndexScreen() {
  const { isReady, isLoggedIn } = useAuth();

  if (!isReady) {
    return <View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View>;
  }

  return <Redirect href={isLoggedIn ? "/(tabs)/(home)" : "/login"} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background },
});
