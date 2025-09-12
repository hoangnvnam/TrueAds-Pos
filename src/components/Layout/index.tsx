import React from "react";
import { View, ViewStyle } from "react-native";
import { styles } from "./styles";
interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  layout?: React.ComponentType<any>;
  back?: boolean;
}

export function Layout({
  children,
  style,
  layout: LayoutComponent,
  back,
}: LayoutProps) {
  if (LayoutComponent) {
    return (
      <LayoutComponent style={style} back={back}>
        {children}
      </LayoutComponent>
    );
  }

  return <View style={[styles.container, style]}>{children}</View>;
}
