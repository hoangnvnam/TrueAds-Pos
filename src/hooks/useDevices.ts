import { useEffect } from "react";
import { useState } from "react";
import { Dimensions, Platform } from "react-native";

export const useDevices = () => {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
      setIsAndroid(Platform.OS === "android");

  }, []);

  return { isAndroid };
};
