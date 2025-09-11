import React from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetwork } from "../../contexts/NetworkContext";

export const NetworkStatusBar: React.FC = () => {
  const { isConnected, isPoorConnection } = useNetwork();
  const [slideAnim] = React.useState(new Animated.Value(-50));
  const [isHidden, setIsHidden] = React.useState(false);
  const [isRestored, setIsRestored] = React.useState(false);

  React.useEffect(() => {
    if (!isConnected || isPoorConnection) {
      setIsHidden(false);
      setIsRestored(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setIsRestored(true);
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsHidden(true);
        });
      }, 2000);
    }
  }, [isConnected, isPoorConnection]);

  if (isConnected && !isPoorConnection && isHidden) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: isRestored ? "#4CAF50" : "#ff4444",
        },
      ]}
    >
      <SafeAreaView>
        <Text style={styles.text}>
          {!isConnected
            ? "Mất kết nối"
            : isPoorConnection
            ? "Kết nối không ổn định"
            : "Đã kết nối lại"}
        </Text>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
