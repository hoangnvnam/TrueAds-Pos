import React from "react";
import { StyleProp, TextStyle } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIconStyles } from "./styles";

export type IconType =
  | "material"
  | "material-community"
  | "fontawesome"
  | "ionicons"
  | "feather"
  | "antdesign";

export interface IconProps {
  name: string;
  type?: IconType;
  size?: number;
  color?: string | null | undefined | false;
  style?: StyleProp<TextStyle>;
}

export function Icon({
  name,
  type = "material",
  size = 24,
  color,
  style,
}: IconProps) {
  const { styles, theme } = useIconStyles();

  const IconComponent = {
    material: MaterialIcons,
    "material-community": MaterialCommunityIcons,
    fontawesome: FontAwesome,
    ionicons: Ionicons,
    feather: Feather,
    antdesign: AntDesign,
  }[type];

  return (
    <IconComponent
      name={name}
      size={size}
      color={color || theme.colors.icon}
      style={[styles.icon, style]}
    />
  );
}
