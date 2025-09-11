import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "~/hooks/useTheme";

export type SkeletonShape = "rectangle" | "circle" | "rounded";
export type SkeletonType = "text" | "avatar" | "card" | "image" | "custom";

// Define interface for props
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  highlightColor?: string;
  shimmerColor?: string;
  speed?: number;
  borderRadius?: number;
  style?: any;
  shape?: SkeletonShape;
  type?: SkeletonType;
  shimmerWidth?: number;
}

// Component Skeleton
const Skeleton: React.FC<SkeletonProps> = ({
  width = 200,
  height = 20,
  backgroundColor,
  highlightColor,
  shimmerColor,
  speed = 1800,
  borderRadius,
  style,
  shape = "rectangle",
  type = "text",
  shimmerWidth = 80,
}) => {
  const theme = useTheme();

  const bgColor = backgroundColor || "#E8E8E8";
  const sColor = shimmerColor || "#f2f2f21f";

  let finalBorderRadius = borderRadius;
  if (!borderRadius) {
    if (shape === "circle") {
      finalBorderRadius = 9999;
    } else if (shape === "rounded") {
      finalBorderRadius = 8;
    } else if (type === "avatar") {
      finalBorderRadius = 9999;
    } else if (type === "card") {
      finalBorderRadius = 12;
    } else {
      finalBorderRadius = 4;
    }
  }

  const shimmerValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmerValue.value,
            [0, 1],
            [
              -shimmerWidth,
              typeof width === "number" ? width + shimmerWidth : 300,
            ]
          ),
        },
      ],
    };
  });

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, {
        duration: speed,
        easing: Easing.ease,
      }),
      -1,
      false
    );

    return () => {
      shimmerValue.value = 0;
    };
  }, [speed, shimmerValue]);

  const dimensionStyle = {};
  if (type === "avatar") {
    Object.assign(dimensionStyle, { width: width || 50, height: height || 50 });
  } else if (type === "card") {
    Object.assign(dimensionStyle, {
      width: width || "100%",
      height: height || 120,
    });
  } else if (type === "image") {
    Object.assign(dimensionStyle, {
      width: width || "100%",
      height: height || 200,
    });
  }

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: bgColor,
          borderRadius: finalBorderRadius,
        },
        dimensionStyle,
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={["transparent", sColor, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0.3, 0.5, 0.7]}
          style={[styles.gradient, { width: shimmerWidth }]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    marginVertical: 4,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  gradient: {
    height: "100%",
  },
});

export default Skeleton;
