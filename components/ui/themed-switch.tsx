import { Platform, Switch, type SwitchProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

type ThemedSwitchProps = Omit<
  SwitchProps,
  "trackColor" | "thumbColor" | "ios_backgroundColor"
>;

export function ThemedSwitch(props: ThemedSwitchProps) {
  const activeTrack = useThemeColor({}, "surfaceContainerHighest");
  const inactiveTrack = useThemeColor(
    { dark: "#000000", light: "#cccccc" },
    "surfaceContainerHigh",
  );
  const thumb = useThemeColor(
    { light: "#ffffff", dark: "#ffffff" },
    "onPrimary",
  );

  return (
    <Switch
      {...props}
      trackColor={{ false: inactiveTrack, true: activeTrack }}
      thumbColor={thumb}
      ios_backgroundColor={inactiveTrack}
      {...(Platform.OS === "web" ? { activeThumbColor: thumb } : {})}
    />
  );
}
