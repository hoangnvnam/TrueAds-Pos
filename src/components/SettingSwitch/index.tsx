import React from "react";
import { Switch, Text, View } from "react-native";
import { useSettingSwitchStyles } from "./styles";
interface SettingSwitchProps {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SettingSwitch = ({
  title,
  value,
  onValueChange,
}: SettingSwitchProps) => {
  const { styles } = useSettingSwitchStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: styles.switch.false,
        }}
        ios_backgroundColor={styles.switch.false}
      />
    </View>
  );
};
