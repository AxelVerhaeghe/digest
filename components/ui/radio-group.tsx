import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type RadioGroupOption<T extends string> = {
  label: string;
  value: T;
};

type RadioGroupProps<T extends string> = {
  label: string;
  options: RadioGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: RadioGroupProps<T>) {
  const selectedColor = useThemeColor({}, "primary");
  const unselectedColor = useThemeColor({}, "onSurface");
  const borderColor = useThemeColor({}, "outlineVariant");
  const labelColor = useThemeColor({}, "onSurfaceVariant");

  return (
    <View style={styles.container} role="radiogroup" aria-label={label}>
      <ThemedText type="label" style={[styles.label, { color: labelColor }]}>
        {label}
      </ThemedText>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={styles.optionRow}
            role="radio"
            aria-checked={selected}
          >
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected ? selectedColor : borderColor,
                },
              ]}
            >
              {selected && (
                <View
                  style={[styles.radioFill, { backgroundColor: selectedColor }]}
                />
              )}
            </View>
            <ThemedText
              style={{ color: selected ? selectedColor : unselectedColor }}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
