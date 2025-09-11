import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useLoading } from "~/contexts/LoadingContext";

export const Loading = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#F1673A" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loading: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
});
